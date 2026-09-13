"""Standalone real EVM execution, no external node/key/funds needed.

The in-memory test chain resets on exit; it is NOT a distributed network.
"""
import json
import tempfile
from pathlib import Path
from web3 import Web3, EthereumTesterProvider
from member5 import AuditTrail, record_verification
from member5.blockchain import EVMAnchor, anchor_next, verify_anchoring
from member5.integration import get_audit_output
from examples.demo import PAYLOAD


def main():
    provider = EthereumTesterProvider()
    w3 = Web3(provider)
    root = Path(__file__).resolve().parents[1]
    artifact = json.loads((root / 'contracts/AuditAnchor.json').read_text())
    factory = w3.eth.contract(abi=artifact['abi'], bytecode=artifact['bin'])
    tx = factory.constructor().transact({'from': w3.eth.accounts[0]})
    deployment = w3.eth.wait_for_transaction_receipt(tx)
    # This generated in-memory tester key has no external value. Never print keys.
    key = provider.ethereum_tester.backend.account_keys[0].to_hex()
    chain = EVMAnchor('', deployment['contractAddress'], w3.eth.chain_id, key,
                      deployment_block=deployment['blockNumber'], provider=provider)
    with tempfile.TemporaryDirectory() as temp:
        audit = AuditTrail(Path(temp) / 'demo.db')
        ack = record_verification(audit, PAYLOAD, event_id='demo-1:complete',
            verification_id='demo-1', actor_id='demo-officer',
            original_document_bytes=b'SYNTHETIC DOCUMENT')
        print('1. Durable local ACK:', json.dumps(ack, indent=2))
        print('2. Signed EVM transaction:', json.dumps(anchor_next(audit, chain), indent=2))
        print('3. AuditLogOutput:', json.dumps(get_audit_output(audit, chain, ack['eventId']), indent=2))
        print('4. Integrity check:', json.dumps(verify_anchoring(audit, chain), indent=2))
        print('5. Simulate DBA rewriting a stored hash (test database only).')
        db = audit.connect()
        db.execute('DROP TRIGGER no_update')
        db.execute('UPDATE events SET event_hash=?', ('f' * 64,))
        db.close()
        try:
            verify_anchoring(audit, chain)
        except ValueError as exc:
            print('Tampering detected:', exc)
        else:
            raise AssertionError('Tampering was not detected')

if __name__ == '__main__': main()
