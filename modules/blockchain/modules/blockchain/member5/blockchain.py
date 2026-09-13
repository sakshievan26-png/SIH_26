"""Optional real EVM connector. Signing key stays in server environment."""
import json
from datetime import datetime, timezone
from .audit_trail import ZERO, digest_hex

# Minimal ABI for the exact supplied contract; Solidity artifact not needed to call it.
def function(name, inputs, outputs, mutability='view'):
    return dict(type='function', name=name, stateMutability=mutability,
                inputs=[dict(name=n, type=t) for n,t in inputs],
                outputs=[dict(name='', type=t) for t in outputs])

ABI = [function('count', [], ['uint256']),
       function('head', [], ['bytes32']),
       function('hashes', [('sequence','uint256')], ['bytes32']),
       function('writers', [('writer','address')], ['bool']),
       function('anchor', [('sequence','uint256'), ('previous','bytes32'),
                           ('digest','bytes32')], [], 'nonpayable'),
       {'type': 'event', 'name': 'Anchored', 'anonymous': False, 'inputs': [
           {'name': 'sequence', 'type': 'uint256', 'indexed': True},
           {'name': 'digest', 'type': 'bytes32', 'indexed': False},
           {'name': 'writer', 'type': 'address', 'indexed': True}]}]


class EVMAnchor:
    def __init__(self, rpc_url, contract_address, chain_id, private_key=None,
                 confirmations=1, deployment_block=0, provider=None):
        from web3 import Web3
        if confirmations < 1:
            raise ValueError('confirmations must be >= 1')
        self.w3 = Web3(provider if provider is not None else
                       Web3.HTTPProvider(rpc_url, request_kwargs={'timeout': 30}))
        if self.w3.eth.chain_id != int(chain_id):
            raise ValueError('Wrong blockchain network')
        address = Web3.to_checksum_address(contract_address)
        if not self.w3.eth.get_code(address):
            raise ValueError('No contract deployed at configured address')
        self.contract = self.w3.eth.contract(address=address, abi=ABI)
        self.account = self.w3.eth.account.from_key(private_key) if private_key else None
        self.confirmations = confirmations
        self.deployment_block = int(deployment_block)

    def receipt_output(self, sequence, expected_digest):
        count, _, block_hash = self.snapshot()
        if sequence > count or self.hash_at(sequence, block_hash) != expected_digest:
            raise ValueError('Anchor not confirmed or mismatched')
        height = self.w3.eth.get_block(block_hash)['number']
        matches = []
        # Bounded ranges support RPC providers that cap eth_getLogs spans.
        for start in range(self.deployment_block, height + 1, 1000):
            matches.extend(self.contract.events.Anchored().get_logs(
                from_block=start, to_block=min(start + 999, height),
                argument_filters={'sequence': sequence}))
        if len(matches) != 1:
            raise ValueError('Expected one original anchor event; check deployment block/RPC')
        log = matches[0]
        if bytes(log['args']['digest']).hex() != expected_digest:
            raise ValueError('Anchor event digest mismatch')
        mined_block = self.w3.eth.get_block(log['blockNumber'])
        if mined_block['hash'] != log['blockHash']:
            raise ValueError('Blockchain changed during verification; retry')
        receipt = self.w3.eth.get_transaction_receipt(log['transactionHash'])
        if receipt['status'] != 1 or receipt['blockHash'] != log['blockHash']:
            raise ValueError('Receipt missing or changed; retry')
        # Check the original snapshot is still canonical after the reads.
        if self.w3.eth.get_block(height)['hash'] != block_hash:
            raise ValueError('Blockchain reorganized; retry')
        return {'txHash': self.w3.to_hex(log['transactionHash']),
                'blockNumber': log['blockNumber'],
                'timestamp': datetime.fromtimestamp(mined_block['timestamp'], timezone.utc).isoformat(),
                'logged': True,
                'ledger': f'EVM chain {self.w3.eth.chain_id} / {self.contract.address}'}

    def snapshot(self):
        # One block for all reads; wait for configured confirmation depth.
        height = max(0, self.w3.eth.block_number - self.confirmations + 1)
        block_hash = self.w3.eth.get_block(height)['hash']
        code = self.w3.eth.get_code(self.contract.address, block_identifier=height)
        if self.w3.eth.get_block(height)['hash'] != block_hash:
            raise ValueError('Blockchain reorganized during snapshot; retry')
        if not code:
            # The contract deployment itself may still be awaiting confirmations.
            return 0, ZERO, block_hash
        count = self.contract.functions.count().call(block_identifier=block_hash)
        head = bytes(self.contract.functions.head().call(block_identifier=block_hash)).hex()
        return count, head, block_hash

    def hash_at(self, sequence, block):
        return bytes(self.contract.functions.hashes(sequence).call(block_identifier=block)).hex()

    def submit(self, sequence, previous, digest):
        if self.account is None:
            raise ValueError('Worker requires signing key')
        digest_hex(previous)
        digest_hex(digest)
        sender = self.account.address
        if self.contract.functions.count().call() >= sequence:
            current = bytes(self.contract.functions.hashes(sequence).call()).hex()
            if current != digest:
                raise ValueError('Conflicting existing anchor')
            return {'status': 'awaiting_confirmations', 'sequence': sequence}
        if not self.contract.functions.writers(sender).call():
            raise ValueError('Account is not an authorized writer')
        # Single worker / dedicated account required for nonce ownership.
        if self.w3.eth.get_transaction_count(sender, 'pending') != self.w3.eth.get_transaction_count(sender, 'latest'):
            return {'status': 'pending_transaction', 'sequence': sequence}
        tx = self.contract.functions.anchor(sequence, bytes.fromhex(previous), bytes.fromhex(digest)).build_transaction({
            'from': sender, 'nonce': self.w3.eth.get_transaction_count(sender, 'pending'),
            'chainId': self.w3.eth.chain_id})
        signed = self.account.sign_transaction(tx)
        tx_hash = self.w3.eth.send_raw_transaction(signed.raw_transaction)
        # A timeout is UNKNOWN, never success. Next run reconciles contract state.
        receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash, timeout=60)
        if receipt['status'] != 1:
            raise RuntimeError('Anchor transaction reverted')
        return {'status': 'mined', 'transaction_hash': self.w3.to_hex(tx_hash),
                'sequence': sequence, 'block_number': receipt['blockNumber']}


def verify_anchoring(audit, chain):
    audit.verify_local()
    rows = audit.events()
    count, head, block = chain.snapshot()
    if count > len(rows):
        raise ValueError('Local journal is missing anchored events (truncation/restore)')
    for row in rows[:count]:
        if chain.hash_at(row['sequence'], block) != row['event_hash']:
            raise ValueError(f"Blockchain mismatch at sequence {row['sequence']}")
    expected = rows[count-1]['event_hash'] if count else ZERO
    if head != expected:
        raise ValueError('Blockchain head mismatch')
    return {'anchored_count': count, 'pending_count': len(rows)-count,
            'status': 'anchored' if count == len(rows) and count else 'pending'}


def anchor_next(audit, chain):
    """Ordered retryable outbox: events themselves are durable pending work.

    Run exactly one worker per database and dedicated signing account.
    Never call this inside a model inference HTTP request.
    """
    status = verify_anchoring(audit, chain)
    rows = audit.events()
    count = status['anchored_count']
    if count == len(rows):
        return status
    row = rows[count]
    envelope = json.loads(row['envelope_json'])
    return chain.submit(row['sequence'], envelope['previous_hash'], row['event_hash'])
