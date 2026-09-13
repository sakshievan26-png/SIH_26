import copy
import json
import sqlite3
import tempfile
import unittest
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from member5 import AuditTrail, record_verification, sha256
from member5.audit_trail import canonical, ZERO
from member5.blockchain import anchor_next, verify_anchoring
from member5.integration import get_audit_output, record_stage, verify_document
from examples.demo import PAYLOAD

class FakeChain:
    """Only a unit-test double; never used by the application."""
    def __init__(self):
        self.hashes = []
    def snapshot(self):
        return len(self.hashes), self.hashes[-1] if self.hashes else ZERO, 0
    def hash_at(self, seq, block):
        return self.hashes[seq - 1]
    def submit(self, seq, previous, digest):
        assert seq == len(self.hashes) + 1
        assert previous == (self.hashes[-1] if self.hashes else ZERO)
        self.hashes.append(digest)
        return {'status': 'test-double'}

class AuditTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.path = Path(self.temp.name) / 'audit.db'
        self.audit = AuditTrail(self.path)
    def tearDown(self):
        self.temp.cleanup()
    def record(self, event_id='attempt-1:complete', payload=None):
        return record_verification(self.audit, payload if payload is not None else copy.deepcopy(PAYLOAD),
            event_id=event_id, verification_id='attempt-1', actor_id='officer-pseudonym',
            original_document_bytes=b'synthetic-file')
    def test_contract_and_no_fake_receipt(self):
        ack = self.record()
        self.assertFalse(ack['logged'])
        self.assertNotIn('txHash', ack)
        self.assertEqual(ack['warnings'], [])
        event = json.loads(self.audit.get_event(ack['eventId'])['envelope_json'])
        self.assertEqual(event['request']['result'], PAYLOAD)
        self.assertEqual(event['request']['document_sha256'], sha256(b'synthetic-file'))
        self.assertEqual(len(event['salt']), 64)
        self.assertEqual(self.audit.verify_local()['count'], 1)
    def test_idempotent_retry(self):
        self.assertEqual(self.record(), self.record())
        self.assertEqual(len(self.audit.events()), 1)
    def test_conflicting_retry(self):
        self.record()
        changed = copy.deepcopy(PAYLOAD)
        changed['riskResult']['decision'] = 'reject'
        with self.assertRaises(ValueError): self.record(payload=changed)
        self.assertEqual(len(self.audit.events()), 1)
    def test_ranges_types_and_timezone(self):
        for field, value in [('score', 101), ('score', True), ('score', float('nan')), ('decision', 'HIGH_RISK')]:
            payload = copy.deepcopy(PAYLOAD)
            payload['riskResult'][field] = value
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                self.record(payload=payload)
        payload = copy.deepcopy(PAYLOAD)
        payload['timestamp'] = '2026-09-13T10:00:00'
        with self.assertRaises(ValueError): self.record(payload=payload)
        self.assertEqual(len(self.audit.events()), 0)
    def test_contract_example_sum_warning(self):
        payload = copy.deepcopy(PAYLOAD)
        payload['riskResult']['breakdown']['tampering'] = 8
        self.assertEqual(self.record(payload=payload)['warnings'], ['BREAKDOWN_SUM_DIFFERS_FROM_SCORE'])
    def test_concurrent_append(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            list(pool.map(lambda i: self.record(str(i)), range(30)))
        self.assertEqual(self.audit.verify_local()['count'], 30)
    def test_concurrent_same_id(self):
        with ThreadPoolExecutor(max_workers=8) as pool:
            rows = list(pool.map(lambda _: self.record(), range(20)))
        self.assertEqual(len({row['eventHash'] for row in rows}), 1)
        self.assertEqual(len(self.audit.events()), 1)
    def test_sql_guards(self):
        self.record()
        db = self.audit.connect()
        try:
            for statement in ('DELETE FROM events', "UPDATE events SET event_hash='bad'"):
                with self.assertRaises(sqlite3.IntegrityError): db.execute(statement)
        finally: db.close()
    def test_modified_record(self):
        self.record()
        db = self.audit.connect()
        db.execute('DROP TRIGGER no_update')
        db.execute('UPDATE events SET event_hash=?', ('1' * 64,))
        db.close()
        with self.assertRaises(ValueError): self.audit.verify_local()
    def test_rewritten_hashes_detected_by_chain(self):
        self.record()
        chain = FakeChain()
        anchor_next(self.audit, chain)
        db = self.audit.connect()
        row = self.audit.events()[0]
        body = json.loads(row['envelope_json'])
        body['request']['result']['riskResult']['decision'] = 'accept'
        envelope = canonical(body)
        db.execute('DROP TRIGGER no_update')
        db.execute('UPDATE events SET envelope_json=?, request_json=?, event_hash=?',
                   (envelope, canonical(body['request']), sha256(envelope.encode())))
        db.close()
        self.assertTrue(self.audit.verify_local()['local_consistency'])
        with self.assertRaises(ValueError): verify_anchoring(self.audit, chain)
    def test_truncation_detected_against_chain(self):
        self.record()
        chain = FakeChain()
        anchor_next(self.audit, chain)
        db = self.audit.connect()
        db.execute('DROP TRIGGER no_delete')
        db.execute('DELETE FROM events')
        db.close()
        self.assertEqual(self.audit.verify_local()['count'], 0)
        with self.assertRaises(ValueError): verify_anchoring(self.audit, chain)
    def test_pending_then_retry_and_restart(self):
        self.record()
        chain = FakeChain()
        self.assertIsNone(get_audit_output(self.audit, chain, 'attempt-1:complete'))
        anchor_next(self.audit, chain)
        self.audit = AuditTrail(self.path)
        self.assertEqual(anchor_next(self.audit, chain)['status'], 'anchored')
        self.assertEqual(len(chain.hashes), 1)
    def test_stage_history(self):
        record_stage(self.audit, event_id='upload-1', verification_id='attempt-1',
            actor_id='service', document_sha256=sha256(b'synthetic-file'),
            stage='DOCUMENT_UPLOADED', checkpoint_id='A', details={'status': 'received'})
        self.record()
        self.assertEqual(len(self.audit.history('attempt-1')), 2)
        self.assertEqual(len(self.audit.history('different-attempt')), 0)
        self.assertEqual(self.audit.verify_local()['count'], 2)
    def test_changed_file_hash(self):
        self.assertNotEqual(sha256(b'file'), sha256(b'File'))
    def test_document_comparison_does_not_claim_anchoring(self):
        self.record()
        same = verify_document(self.audit, 'attempt-1:complete', b'synthetic-file')
        changed = verify_document(self.audit, 'attempt-1:complete', b'changed')
        self.assertTrue(same['fileMatchesRecorded'])
        self.assertFalse(changed['fileMatchesRecorded'])
        self.assertEqual(same['anchorStatus'], 'not_checked')
    def test_network_failure_preserves_pending_work(self):
        self.record()
        chain = FakeChain()
        def unavailable(*args): raise ConnectionError('offline')
        original = chain.submit
        chain.submit = unavailable
        with self.assertRaises(ConnectionError): anchor_next(self.audit, chain)
        self.assertEqual(verify_anchoring(self.audit, chain)['pending_count'], 1)
        chain.submit = original
        anchor_next(self.audit, chain)
        self.assertEqual(verify_anchoring(self.audit, chain)['pending_count'], 0)

if __name__ == '__main__': unittest.main()
