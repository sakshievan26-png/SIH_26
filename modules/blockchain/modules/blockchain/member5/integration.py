"""Member 4/6 adapter. Input field names match the supplied TypeScript contract."""
from .audit_trail import sha256, text_id
from .contracts import validate_input


def record_verification(audit, payload, *, event_id, verification_id,
                        actor_id, original_document_bytes):
    """Accept AuditLogInput. Return durable local ACK, NOT AuditLogOutput.

    event_id: persist once per logical event, reuse on retries.
    verification_id: new opaque ID per screening attempt (not per document).
    actor_id: authenticated backend identity, never browser-supplied identity.
    Original bytes are hashed; neither stored here nor sent to the chain.
    """
    if not isinstance(original_document_bytes, bytes):
        raise ValueError('Pass original upload bytes, not a decoded image')
    warnings = validate_input(payload)
    event = audit.append(event_id=event_id, verification_id=verification_id,
        actor_id=actor_id, event_type='VERIFICATION_COMPLETED',
        document_sha256=sha256(original_document_bytes), result=payload)
    return {'eventId': event_id, 'sequence': event['sequence'],
            'eventHash': event['event_hash'], 'auditStored': True,
            'status': 'pending', 'logged': False, 'warnings': warnings}


STAGES = {'DOCUMENT_UPLOADED', 'OCR_COMPLETED', 'VALIDATION_COMPLETED',
          'TAMPERING_COMPLETED', 'FACE_COMPLETED', 'PROCESSING_FAILED',
          'OFFICER_OVERRIDE', 'BARCODE_COMPLETED', 'WATERMARK_COMPLETED'}


def record_stage(audit, *, event_id, verification_id, actor_id, document_sha256,
                 stage, checkpoint_id, details):
    """Optional chronological events. Backend invokes at each actual stage.

    details: sanitized JSON including model/rule version, outcome or reason code.
    Do not include images, OCR PII, embeddings, access tokens or stack traces.
    OFFICER_OVERRIDE should reference the prior eventId and state the reason.
    """
    if stage not in STAGES:
        raise ValueError('Unknown stage')
    text_id(checkpoint_id)
    if not isinstance(details, dict):
        raise ValueError('details must be an object')
    return audit.append(event_id=event_id, verification_id=verification_id,
        actor_id=actor_id, event_type=stage, document_sha256=document_sha256,
        result={'checkpointId': checkpoint_id, 'details': details})


def get_audit_output(audit, chain, event_id):
    """Return original AuditLogOutput only for a confirmed matching anchor.

    None means not yet anchored. RPC/corruption errors propagate, never success.
    """
    from .blockchain import verify_anchoring
    status = verify_anchoring(audit, chain)
    event = audit.get_event(event_id)
    if event['sequence'] > status['anchored_count']:
        return None
    return chain.receipt_output(event['sequence'], event['event_hash'])


def verify_document(audit, event_id, document_bytes, chain=None):
    """Compare exact file bytes; this does NOT classify a document as genuine."""
    import json
    audit.verify_local()
    event = audit.get_event(event_id)
    original_hash = json.loads(event['envelope_json'])['request']['document_sha256']
    output = get_audit_output(audit, chain, event_id) if chain is not None else None
    return {'fileMatchesRecorded': sha256(document_bytes) == original_hash,
            'anchorStatus': 'not_checked' if chain is None else ('anchored' if output else 'pending'),
            'auditOutput': output}
