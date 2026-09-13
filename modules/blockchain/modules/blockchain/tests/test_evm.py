"""Integration tests execute compiled bytecode on an in-process EVM."""
import copy
import json
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from member5 import AuditTrail, record_verification
from member5.audit_trail import ZERO
from member5.blockchain import EVMAnchor, anchor_next, verify_anchoring
from member5.api_adapter import get_audit_response
from member5.integration import get_audit_output
from examples.demo import PAYLOAD
try:
    from web3 import Web3, EthereumTesterProvider
    from eth_tester.exceptions import TransactionFailed
    EVM_AVAILABLE = True
except ImportError:
    EVM_AVAILABLE = False

@unittest.skipUnless(EVM_AVAILABLE, 'Install requirements-demo.txt for real EVM tests')
class EVMTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.audit = AuditTrail(Path(self.temp.name) / 'audit.db')
        self.provider = EthereumTesterProvider()
        self.w3 = Web3(self.provider)
        artifact = json.loads((Path(__file__).resolve().parents[1] / 'contracts/AuditAnchor.json').read_text())
        contract = self.w3.eth.contract(abi=artifact['abi'], bytecode=artifact['bin'])
        tx = contract.constructor().transact({'from': self.w3.eth.accounts[0]})
        receipt = self.w3.eth.wait_for_transaction_receipt(tx)
        self.full = self.w3.eth.contract(address=receipt['contractAddress'], abi=artifact['abi'])
        key = self.provider.ethereum_tester.backend.account_keys[0].to_hex()
        self.chain = EVMAnchor('', receipt['contractAddress'], self.w3.eth.chain_id,
            key, deployment_block=receipt['blockNumber'], provider=self.provider)
    def tearDown(self): self.temp.cleanup()
    def record(self, name='event-1'):
        return record_verification(self.audit, copy.deepcopy(PAYLOAD), event_id=name,
            verification_id='attempt-1', actor_id='officer-1', original_document_bytes=b'synthetic')
    def test_signed_anchor_and_exact_output_contract(self):
        ack = self.record()
        mined = anchor_next(self.audit, self.chain)
        self.assertEqual(mined['status'], 'mined')
        output = get_audit_output(self.audit, self.chain, ack['eventId'])
        self.assertEqual(set(output), {'txHash', 'blockNumber', 'timestamp', 'logged', 'ledger'})
        self.assertTrue(output['logged'])
        self.assertEqual(output['txHash'], mined['transaction_hash'])
        self.assertEqual(len(output['txHash']), 66)
        self.assertEqual(verify_anchoring(self.audit, self.chain)['status'], 'anchored')
    def test_contract_rejects_unauthorized_writer(self):
        with self.assertRaises(TransactionFailed):
            self.full.functions.anchor(1, bytes(32), bytes.fromhex('1'*64)).transact({'from': self.w3.eth.accounts[1]})
    def test_contract_rejects_rewrite_and_out_of_order(self):
        self.record()
        anchor_next(self.audit, self.chain)
        for seq, prev, digest in [(1, ZERO, '1'*64), (3, ZERO, '2'*64), (2, ZERO, '2'*64)]:
            with self.assertRaises(TransactionFailed):
                self.full.functions.anchor(seq, bytes.fromhex(prev), bytes.fromhex(digest)).transact({'from': self.w3.eth.accounts[0]})
    def test_retry_does_not_add_record_or_transaction(self):
        self.record()
        anchor_next(self.audit, self.chain)
        before = self.w3.eth.block_number
        anchor_next(self.audit, self.chain)
        self.assertEqual(self.w3.eth.block_number, before)
        self.assertEqual(self.full.functions.count().call(), 1)
    def test_contract_exact_retry_succeeds(self):
        self.record()
        anchor_next(self.audit, self.chain)
        digest = bytes.fromhex(self.audit.events()[0]['event_hash'])
        tx = self.full.functions.anchor(1, bytes(32), digest).transact({'from': self.w3.eth.accounts[0]})
        self.assertEqual(self.w3.eth.wait_for_transaction_receipt(tx)['status'], 1)
        self.assertEqual(self.full.functions.count().call(), 1)
    def test_waits_for_confirmations_without_resubmitting(self):
        self.record()
        self.chain.confirmations = 2
        anchor_next(self.audit, self.chain)
        before = self.w3.eth.block_number
        self.assertIsNone(get_audit_output(self.audit, self.chain, 'event-1'))
        self.assertEqual(anchor_next(self.audit, self.chain)['status'], 'awaiting_confirmations')
        self.assertEqual(before, self.w3.eth.block_number)
        self.provider.ethereum_tester.mine_blocks(1)
        self.assertTrue(get_audit_output(self.audit, self.chain, 'event-1')['logged'])
    def test_revocation(self):
        owner, writer = self.w3.eth.accounts[:2]
        self.full.functions.setWriter(writer, True).transact({'from': owner})
        self.full.functions.setWriter(writer, False).transact({'from': owner})
        with self.assertRaises(TransactionFailed):
            self.full.functions.anchor(1, bytes(32), bytes.fromhex('1'*64)).transact({'from': writer})
        with self.assertRaises(TransactionFailed):
            self.full.functions.setWriter(writer, True).transact({'from': writer})
    def test_two_records_and_history(self):
        self.record('first')
        self.record('second')
        anchor_next(self.audit, self.chain)
        anchor_next(self.audit, self.chain)
        self.assertEqual(self.full.functions.count().call(), 2)
        for event_id in ('first', 'second'):
            self.assertTrue(get_audit_output(self.audit, self.chain, event_id)['logged'])
    def test_network_and_address_checks(self):
        with self.assertRaises(ValueError):
            EVMAnchor('', self.full.address, 1, provider=self.provider)
        with self.assertRaises(ValueError):
            EVMAnchor('', self.w3.eth.accounts[1], self.w3.eth.chain_id, provider=self.provider)
    def test_confirmed_api_response_uses_real_receipt(self):
        self.record()
        mined = anchor_next(self.audit, self.chain)
        result = get_audit_response(self.audit, self.chain, 'event-1', request_id='read-1')
        self.assertTrue(result['success'])
        self.assertTrue(result['data']['logged'])
        self.assertEqual(result['data']['txHash'], mined['transaction_hash'])
        self.assertEqual(result['requestId'], 'read-1')
    def test_timeout_after_broadcast_reconciles_without_duplicate(self):
        self.record()
        with patch.object(self.chain.w3.eth, 'wait_for_transaction_receipt', side_effect=TimeoutError):
            with self.assertRaises(TimeoutError): anchor_next(self.audit, self.chain)
        before = self.w3.eth.block_number
        self.assertEqual(anchor_next(self.audit, self.chain)['status'], 'anchored')
        self.assertEqual(before, self.w3.eth.block_number)
        self.assertTrue(get_audit_output(self.audit, self.chain, 'event-1')['logged'])

if __name__ == '__main__': unittest.main()
