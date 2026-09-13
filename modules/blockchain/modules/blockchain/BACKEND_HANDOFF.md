# Handoff to Members 4 and 6 - repository snapshot v0.2.0

Member 5 owns the audit package and smart contract. Import the package into the
Python backend; do not paste it into OCR/face/tampering model code. It has no
FastAPI, Flask or Streamlit dependency. Run the blockchain worker separately.

## Integration boundary

1. Backend captures original upload bytes before any image decoding/preprocessing.
2. Members 1-3 produce OCR/tampering/face outputs; Member 4 validates and builds the
   final `RiskScoreOutput` using their own agreed scoring logic.
3. Backend creates `AuditLogInput`, persists its final result and a durable job to
   call Member 5. The job keeps stable event/verification IDs and a retrievable
   original file or verified original-file fingerprint source.
4. Member 5 stores the audit event and returns a local pending ACK.
5. A background worker anchors pending events and obtains real blockchain receipts.
6. Backend serves the final result and audit status separately to the frontend.

The risk result must not be held hostage by blockchain RPC latency. A result can
be available while anchoring is pending; the UI must label those states separately.
Your original contract has no HTTP path, method or auth scheme. The function API
below is implemented; any HTTP routes are owned by Members 4/6.

## Exact final-decision call

```python
from member5 import AuditTrail, record_verification

# Initialize once with the SAME absolute durable DB path as the worker.
audit = AuditTrail(config.audit_database_path)

# Capture this before OpenCV processing. In the old Streamlit reference:
original_bytes = document_file.getvalue()
# document_image = cv2.imdecode(np.frombuffer(original_bytes, np.uint8), cv2.IMREAD_COLOR)

# These values are supplied/persisted by YOUR backend, not by the model or browser.
payload = {
    "documentId": internal_document_id,
    "checkpointId": authorized_checkpoint_id,
    "timestamp": decision_timestamp_iso8601,
    "riskResult": final_risk_result,
}

ack = record_verification(
    audit,
    payload,
    event_id=persisted_completion_event_id,
    verification_id=persisted_screening_attempt_id,
    actor_id=authenticated_officer_or_service_id,
    original_document_bytes=original_bytes,
)
# ack.auditStored == True: SQLite committed.
# ack.logged == False: this call makes NO blockchain confirmation claim.
```

Do not use a raw passport number as `documentId`; use an internal opaque reference.
The digest is calculated from original uploaded bytes independently of that ID.
In Streamlit, `.read()` consumes the stream. Use `.getvalue()` once to retain the
original bytes rather than hashing re-encoded or resized image pixels.

`final_risk_result` must contain exactly:

```json
{
  "score": 78,
  "decision": "flag",
  "summary": "Synthetic example: manual review recommended.",
  "breakdown": {"ocr": 18, "validation": 16, "tampering": 18, "face": 16, "barcode": 6, "watermark": 4}
}
```

This example fixes arithmetic only for demonstration. Member 5 supplies no new
risk weights/thresholds and never transforms old `DOB MATCH`/`FACE MATCH` branches
into an invented score. Missing module results must be handled by Member 4's
policy, not silently converted to zero risk.

## Stage events (optional, but needed for a full processing timeline)

The final decision contract alone cannot explain all processing steps. Invoke
`record_stage()` after each actual operation, including failed operations:

```python
from member5 import sha256
from member5.integration import record_stage

record_stage(
    audit,
    event_id=persisted_ocr_event_id,
    verification_id=persisted_screening_attempt_id,
    actor_id=authenticated_service_id,
    document_sha256=sha256(original_bytes),
    stage="OCR_COMPLETED",
    checkpoint_id=authorized_checkpoint_id,
    details={
        "status": "completed",
        "modelVersion": deployed_ocr_model_version,
        "confidence": ocr_confidence,
        "artifactRef": internal_private_result_ref,
    },
)
```

Allowed stages: `DOCUMENT_UPLOADED`, `OCR_COMPLETED`, `VALIDATION_COMPLETED`,
`TAMPERING_COMPLETED`, `FACE_COMPLETED`, `BARCODE_COMPLETED`,
`WATERMARK_COMPLETED`, `PROCESSING_FAILED`, `OFFICER_OVERRIDE`.
These events are anchored in the same global journal order. They are not invented
retroactively by the final-decision adapter. Parallel stages appear in the order
the backend records them. Use an override event with prior event ID, new decision
and reason instead of editing a previous decision. Authorize overrides in the backend.

`audit.history(verification_id)` retrieves that screening's timeline. Authorize the
requester's checkpoint/case access before returning it; history includes private
results. The function itself assumes a trusted in-process caller.

## Confirmed output for the frontend

```python
from member5.blockchain import EVMAnchor
from member5.integration import get_audit_output

reader = EVMAnchor(
    config.rpc_url,
    config.contract_address,
    config.chain_id,
    confirmations=config.confirmations,
    deployment_block=config.deployment_block,
)  # read-only: no private key

confirmed = get_audit_output(audit, reader, persisted_completion_event_id)
# None => pending. A dict => original AuditLogOutput, with logged=True.
# Exception => integrity/configuration/RPC failure; never render this as confirmed.
```

The returned dict has exactly `txHash`, `blockNumber`, `timestamp`, `logged`,
`ledger`. Timestamp is read from the mined block; it is not copied from input.
The ledger label contains the actual EVM chain ID and contract address.

| Situation | UI/backend behavior |
|---|---|
| Input validation fails | Reject the audit request; Member 4 fixes invalid fields |
| Breakdown sum differs | Persist unchanged result; surface warning for Member 4 |
| Same event ID, identical payload | Return original local event; safe retry |
| Same event ID, changed payload | Treat as conflict; no overwrite |
| Journal persisted, not on chain | Show "Audit stored; blockchain pending" |
| Transaction mined, insufficient confirmations | Continue pending; no `logged: true` |
| Receipt and commitment verified | Show original `AuditLogOutput` |
| RPC timeout/outage | Show unavailable/pending status; retry; do not invent a receipt |
| Hash mismatch/missing anchored records | Raise integrity alert; preserve evidence |
| SQLite write fails | Do not acknowledge audit durability; retry from backend job |

## Durability and job ownership

Member 5's journal is itself the persistent blockchain outbox: every row beyond
the confirmed contract count remains work to do. The worker reconciles against the
chain after timeout or restart. If a transaction is still pending for the signer,
it waits rather than consuming another nonce. A stuck transaction requires operator
inspection/replacement; there is no automatic gas escalation in this prototype.

There are still TWO durability boundaries: the backend's own result database and
the Member 5 journal. This package cannot make a transaction spanning your unknown
backend database atomic. Member 4 should write the result plus an integration job
in one backend transaction, then retry that job until Member 5 acknowledges it.
Preserve the same timestamp, data, actor ID and event ID across retries. Do not
recreate IDs or timestamps inside every retry or Streamlit rerun.

The same absolute journal path and dedicated account must be used by the worker.
Use a local persistent disk; the SQLite worker lock is not a distributed queue.
For multiple hosts, move to a centrally coordinated writer/outbox before scaling.
Protect and back up the complete journal using SQLite's backup API or a stopped
consistent snapshot; copying just the live `.sqlite3` file can miss WAL contents.

## Security boundary

The backend validates officer identity, checkpoint authorization and case access.
The signing worker holds the service wallet; the browser never gets that key.
The contract authenticates the service wallet, not individual human officers.
Anyone who controls that wallet can append arbitrary future commitments until
revoked; they cannot replace previous contract entries through its API.

Serve private results through authenticated TLS endpoints. Encrypt storage/backups
and restrict DB file permissions. Do not log PII in `summary`/stage details, and
never send images or embeddings to the chain. These deployment controls are not
implemented by a standalone Python import package.

## Six-field schema and shared API envelope

The authoritative contracts are at repository root, not inside this module.
OCR/validation/tampering/face contributions are 0-20; barcode/watermark are 0-10.
All six are required in `RiskScoreOutput`. Optional upstream barcode/watermark
inputs do not permit omitting their output contributions. Member 4 must define
the missing-signal policy. This module never pads missing signals with zero.
The repository example sums to 64 while reporting score 78; it is preserved with
a warning, so Member 4 can investigate without Member 5 rewriting the evidence.

If Member 4 returns `ApiResponse<RiskScoreOutput>`, use this convenience adapter:

```python
from member5.api_adapter import record_risk_response

response = record_risk_response(
    audit,
    risk_response,  # {success: True, data: final_risk_result, requestId: ...}
    document_id=internal_document_id,
    checkpoint_id=authorized_checkpoint_id,
    timestamp=persisted_decision_timestamp,
    event_id=persisted_completion_event_id,
    verification_id=persisted_screening_attempt_id,
    actor_id=authenticated_actor_id,
    original_document_bytes=original_bytes,
)
# response['success'] == True means the API operation succeeded locally.
# response['data']['logged'] == False means this is a local pending ACK.
```

A failed upstream response raises an exception and does not create a final-decision
audit entry. You may explicitly record a sanitized PROCESSING_FAILED stage instead.
`requestId` is a correlation ID, not the event idempotency key. Retrying the same
event with a different request ID still returns the same stored audit event.

For already assembled AuditLogInput, use `record_verification_response(...,
request_id=..., **context)`. For a status read, use `get_audit_response(audit,
reader, event_id, request_id=...)`. Confirmed reads wrap the original AuditLogOutput;
pending reads wrap the additive AuditPendingAck. The status-read ACK does not
recompute validation warnings; the initial record response is where warnings are
reported. Unavailable RPC or integrity errors still raise exceptions.

`integration_types.ts` imports the actual root types and defines the additive
`ApiResponse<AuditLogOutput | AuditPendingAck>` union. Agree this async success
union with Member 6. The root common contract requires `data: T` even for failed
responses; a general error payload is not fully specified. Backend ownership must
resolve that shape. This module does not quietly return `data: null` contrary to it.

## Current repository blocker

The uploaded backend is not runnable Python: its first syntax error is line 9,
`2.REFERENCE_FILE`, followed by more numbered code fragments. It also does not
produce the contracted six-part final risk output. Member 4 must repair and finish
that backend. The Member 5 notebook and tests do not import or execute it, and
passing those tests must not be presented as passing a full AI pipeline test.

Install the module from repo root with `python -m pip install -e ./modules/blockchain`.
Run the snapshot gate before integration:
`python modules/blockchain/scripts/verify_contracts.py`.
If the contracts change again, the gate fails and identifies affected files.
Review them and update validators/tests/examples together; do not only refresh
fingerprints to make the check green.
