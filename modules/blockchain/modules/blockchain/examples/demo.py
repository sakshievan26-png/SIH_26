"""Offline audit demo. No transaction hashes are fabricated."""
import json
import tempfile
from pathlib import Path
from member5 import AuditTrail, record_verification

PAYLOAD = {
    'documentId': 'internal-doc-demo-001',
    'checkpointId': 'checkpoint-demo-A',
    'timestamp': '2026-09-13T10:15:00+05:30',
    'riskResult': {
        'score': 78, 'decision': 'flag',
        'summary': 'Synthetic demo: manual review recommended.',
        'breakdown': {'ocr': 18, 'validation': 16, 'tampering': 18, 'face': 16,
                      'barcode': 6, 'watermark': 4}
    }
}

if __name__ == '__main__':
    with tempfile.TemporaryDirectory() as temp:
        audit = AuditTrail(Path(temp) / 'demo.sqlite3')
        ack = record_verification(audit, PAYLOAD, event_id='attempt-1:completed',
            verification_id='attempt-1', actor_id='demo-service',
            original_document_bytes=b'SYNTHETIC DOCUMENT - NOT A REAL ID')
        print(json.dumps({'ack': ack, 'localCheck': audit.verify_local()}, indent=2))
