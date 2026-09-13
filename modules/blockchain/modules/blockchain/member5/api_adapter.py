"""Optional in-process helpers for contracts/common.ts ApiResponse<T>.

No HTTP server is created. Exceptions propagate for Member 4's error handler.
The shared contract requires data:T even on failure, so we do NOT silently
invent a null error shape or return a fake successful audit result.
"""
from .audit_trail import text_id
from .integration import record_verification, get_audit_output


def success_response(data, request_id):
    text_id(request_id)
    return {'success': True, 'data': data, 'requestId': request_id}


def record_verification_response(audit, payload, *, request_id, **context):
    text_id(request_id)  # Validate before the side effect.
    return success_response(record_verification(audit, payload, **context), request_id)


def record_risk_response(audit, risk_response, *, document_id, checkpoint_id,
                         timestamp, **context):
    """Accept ApiResponse<RiskScoreOutput> from Member 4 and unwrap data.

    The upstream requestId is preserved as a correlation ID. It is NOT the
    idempotency key: context still requires stable event_id/verification_id.
    """
    required = {'success', 'data', 'requestId'}
    if (not isinstance(risk_response, dict) or not required <= set(risk_response)
            or set(risk_response) - required - {'error'}):
        raise ValueError('Expected ApiResponse<RiskScoreOutput>')
    if risk_response['success'] is not True or risk_response.get('error'):
        raise ValueError('Risk response failed; no final-decision audit record written')
    text_id(risk_response['requestId'])
    payload = {'documentId': document_id, 'checkpointId': checkpoint_id,
               'timestamp': timestamp, 'riskResult': risk_response['data']}
    return record_verification_response(audit, payload,
        request_id=risk_response['requestId'], **context)


def get_audit_response(audit, chain, event_id, *, request_id):
    """ApiResponse<AuditLogOutput | AuditPendingAck>. Errors propagate."""
    text_id(request_id)
    confirmed = get_audit_output(audit, chain, event_id)
    if confirmed is not None:
        return success_response(confirmed, request_id)
    event = audit.get_event(event_id)
    pending = {'eventId': event_id, 'sequence': event['sequence'],
               'eventHash': event['event_hash'], 'auditStored': True,
               'status': 'pending', 'logged': False, 'warnings': []}
    return success_response(pending, request_id)
