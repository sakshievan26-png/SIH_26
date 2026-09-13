import copy
import json
import shutil
import tempfile
import unittest
from pathlib import Path
from member5 import AuditTrail, record_verification, sha256
from member5.contracts import validate_input, BREAKDOWN_LIMITS
from member5.integration import record_stage
from member5.api_adapter import record_verification_response, record_risk_response, get_audit_response
from examples.demo import PAYLOAD
from scripts.verify_contracts import check_contracts, MODULE
from test_audit import FakeChain

class RepositoryContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.audit = AuditTrail(Path(self.temp.name) / 'test.db')
        self.context = dict(event_id='e1', verification_id='v1', actor_id='operator',
                            original_document_bytes=b'synthetic')
    def tearDown(self):
        self.temp.cleanup()
    def test_six_fields_and_updated_caps(self):
        self.assertEqual(BREAKDOWN_LIMITS, dict(ocr=20, validation=20, tampering=20,
                                              face=20, barcode=10, watermark=10))
        for key, limit in BREAKDOWN_LIMITS.items():
            for value in (0, limit):
                payload = copy.deepcopy(PAYLOAD)
                payload['riskResult']['breakdown'][key] = value
                validate_input(payload)
            for value in (-1, limit + 1, True, None, float('nan'), float('inf'), 10**1000):
                payload = copy.deepcopy(PAYLOAD)
                payload['riskResult']['breakdown'][key] = value
                with self.subTest(key=key,value=str(value)[:12]), self.assertRaises(ValueError):
                    validate_input(payload)
    def test_legacy_four_field_input_is_rejected(self):
        payload = copy.deepcopy(PAYLOAD)
        del payload['riskResult']['breakdown']['barcode']
        del payload['riskResult']['breakdown']['watermark']
        with self.assertRaisesRegex(ValueError, 'six-field'):
            record_verification(self.audit, payload, **self.context)
        self.assertEqual(len(self.audit.events()), 0)
    def test_new_required_output_fields_never_defaulted(self):
        for key in ('barcode', 'watermark'):
            payload = copy.deepcopy(PAYLOAD)
            del payload['riskResult']['breakdown'][key]
            with self.assertRaises(ValueError): validate_input(payload)
    def test_exact_repository_example_preserved_with_warning(self):
        payload = copy.deepcopy(PAYLOAD)
        payload['riskResult']['breakdown'] = dict(ocr=18, validation=12, tampering=6,
                                                 face=16, barcode=8, watermark=4)
        ack = record_verification(self.audit, payload, **self.context)
        self.assertEqual(sum(payload['riskResult']['breakdown'].values()), 64)
        self.assertEqual(ack['warnings'], ['BREAKDOWN_SUM_DIFFERS_FROM_SCORE'])
        body = json.loads(self.audit.get_event('e1')['envelope_json'])
        self.assertEqual(body['request']['result'], payload)
    def test_common_api_response_and_retry_correlation(self):
        a = record_verification_response(self.audit, PAYLOAD, request_id='request-1', **self.context)
        b = record_verification_response(self.audit, PAYLOAD, request_id='request-2', **self.context)
        self.assertEqual(set(a), {'success', 'data', 'requestId'})
        self.assertTrue(a['success'])
        self.assertFalse(a['data']['logged'])
        self.assertEqual(a['data'], b['data'])
        self.assertEqual(len(self.audit.events()), 1)
    def test_failed_upstream_response_cannot_log_final_decision(self):
        for failure in ({'success': False, 'data': {}, 'error': 'failed', 'requestId': 'r'},
                        {'success': 1, 'data': PAYLOAD['riskResult'], 'requestId': 'r'},
                        {'success': True, 'data': PAYLOAD['riskResult'], 'error': 'bad', 'requestId': 'r'}):
            with self.assertRaises(ValueError):
                record_risk_response(self.audit, failure, document_id='d', checkpoint_id='c',
                                     timestamp=PAYLOAD['timestamp'], **self.context)
        self.assertEqual(len(self.audit.events()), 0)
    def test_upstream_success_data_unwrapped(self):
        response = record_risk_response(self.audit, {'success': True,
            'data': PAYLOAD['riskResult'], 'requestId': 'risk-request'},
            document_id=PAYLOAD['documentId'], checkpoint_id=PAYLOAD['checkpointId'],
            timestamp=PAYLOAD['timestamp'], **self.context)
        self.assertEqual(response['requestId'], 'risk-request')
        self.assertTrue(response['data']['auditStored'])
    def test_bad_request_id_rejected_before_write(self):
        with self.assertRaises(ValueError):
            record_verification_response(self.audit, PAYLOAD, request_id='', **self.context)
        self.assertEqual(len(self.audit.events()), 0)
    def test_pending_response_has_no_fake_receipt(self):
        record_verification(self.audit, PAYLOAD, **self.context)
        response = get_audit_response(self.audit, FakeChain(), 'e1', request_id='status-1')
        self.assertTrue(response['success'])
        self.assertFalse(response['data']['logged'])
        self.assertNotIn('txHash', response['data'])
    def test_barcode_watermark_stages_recorded_separately(self):
        for stage in ('BARCODE_COMPLETED', 'WATERMARK_COMPLETED'):
            record_stage(self.audit, event_id=stage, verification_id='v', actor_id='service',
                document_sha256=sha256(b'sample'), stage=stage, checkpoint_id='c',
                details={'status':'completed', 'modelVersion':'synthetic'})
        self.assertEqual(self.audit.verify_local()['count'], 2)
    def test_contract_snapshot_and_drift_detection(self):
        self.assertEqual(check_contracts(MODULE / 'contract_reference'), [])
        target = Path(self.temp.name) / 'contracts'
        shutil.copytree(MODULE / 'contract_reference', target)
        (target / 'riskScore.ts').write_text('// changed upstream contract')
        self.assertEqual(check_contracts(target), ['riskScore.ts'])
    def test_existing_journal_is_not_rewritten(self):
        legacy = copy.deepcopy(PAYLOAD)
        legacy['riskResult']['breakdown'] = dict(ocr=22,validation=15,tampering=21,face=20)
        old = self.audit.append(event_id='old',verification_id='old',actor_id='service',
            event_type='VERIFICATION_COMPLETED',document_sha256=sha256(b'old'),result=legacy)
        original_bytes = old['envelope_json']
        record_verification(self.audit, PAYLOAD, **self.context)
        self.assertEqual(self.audit.get_event('old')['envelope_json'], original_bytes)
        self.assertEqual(self.audit.verify_local()['count'], 2)

if __name__ == '__main__': unittest.main()
