"""Input validation aligned with the uploaded SIH_26 repository snapshot.

Six output contributions are REQUIRED, even when barcode/watermark inputs to
Member 4's risk engine were optional. We never invent contributions for them.
"""
import math
from datetime import datetime
from .audit_trail import text_id

BREAKDOWN_LIMITS = {
    'ocr': 20, 'validation': 20, 'tampering': 20, 'face': 20,
    'barcode': 10, 'watermark': 10,
}


def exact_keys(obj, names, label):
    if not isinstance(obj, dict) or set(obj) != set(names):
        raise ValueError(f'{label} requires exactly: {", ".join(names)}')


def number(value, maximum, label):
    # Range-check before isfinite: huge invalid JSON integers need not overflow
    # a float conversion. bool is not accepted as a numeric contribution.
    if (type(value) not in (int, float) or not 0 <= value <= maximum
            or not math.isfinite(value)):
        raise ValueError(f'{label} must be finite and between 0 and {maximum}')


def validate_input(payload):
    exact_keys(payload, ['documentId', 'checkpointId', 'timestamp', 'riskResult'], 'AuditLogInput')
    text_id(payload['documentId'])
    text_id(payload['checkpointId'])
    timestamp = payload['timestamp']
    if not isinstance(timestamp, str) or 'T' not in timestamp:
        raise ValueError('timestamp must be ISO 8601 with time and timezone')
    try:
        parsed = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
    except ValueError as exc:
        raise ValueError('Invalid ISO 8601 timestamp') from exc
    if parsed.tzinfo is None:
        raise ValueError('timestamp must include a timezone')
    risk = payload['riskResult']
    exact_keys(risk, ['score', 'decision', 'summary', 'breakdown'], 'RiskScoreOutput')
    number(risk['score'], 100, 'score')
    if risk['decision'] not in ('accept', 'flag', 'reject'):
        raise ValueError('decision must be accept, flag, or reject')
    if not isinstance(risk['summary'], str) or len(risk['summary']) > 8192:
        raise ValueError('summary must be a string of at most 8192 characters')
    exact_keys(risk['breakdown'], BREAKDOWN_LIMITS, 'RiskScoreBreakdown (repository six-field contract)')
    for key, maximum in BREAKDOWN_LIMITS.items():
        number(risk['breakdown'][key], maximum, key)
    warnings = []
    if not math.isclose(sum(risk['breakdown'].values()), risk['score'], abs_tol=0.000001):
        warnings.append('BREAKDOWN_SUM_DIFFERS_FROM_SCORE')
    return warnings
