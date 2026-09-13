# Repository compatibility review - Member 5 v0.2.0

Reviewed input: user-uploaded `SIH_26-main.zip` on 13 September 2026. This archive
has no Git metadata or commit ID; no live repository revision is claimed.

## Material findings

1. The previous validator accepted four contributions up to 25 each. The new
   `RiskScoreBreakdown` requires six: four up to 20 and barcode/watermark up to 10.
   This is a breaking INPUT change for the old Member 5 adapter; it is now fixed.
2. Barcode/watermark risk-engine inputs are optional. Their risk OUTPUT fields
   are required. Missing fields are rejected rather than interpreted as safe.
3. `AuditLogInput` and confirmed `AuditLogOutput` are unchanged. The Solidity
   contract only stores commitments, so its source/bytecode did not change.
4. `common.ts` defines a response envelope. New optional Python wrappers match
   its successful envelope and a local additive TypeScript union distinguishes
   pending ACKs from confirmed receipts. Root contracts remain unchanged.
5. The repository risk example has score 78 with contributions totaling 64.
   The module preserves it with a warning. The synthetic fixture totals 78.
6. Backend parsing fails at line 9, `2.REFERENCE_FILE`, followed by numbered
   definitions and incomplete top-level UI glue. Fixing only that line is not
   sufficient to produce a working backend or contracted risk engine.
7. The old four-field journal format is not rewritten. New submissions must use
   six fields, but old envelope bytes and their hashes remain intact.

## Additional contract questions for the relevant owners

- `ApiResponse<T>` requires data even when success is false. The team must define
  a type-safe error envelope before HTTP error routes are integrated.
- The async audit ACK is additive; the original AuditLogOutput remains a confirmed
  receipt. Member 6 needs the supplied union to render pending states correctly.
- The OCR contract lists more document types than its PassportFields/VisaFields
  union fully models. That belongs to the OCR/backend owners.
- Face output includes a liveness boolean, whereas the backend reference performs
  face similarity without a demonstrated liveness check. Member 3 owns that gap.

## Files to upload

Merge the provided ZIP into repository root. Its paths all start with
`modules/blockchain/`. Commit the notebook under `modules/blockchain/notebooks/`
and the guide under `modules/blockchain/docs/` along with the source package.
Uploading the notebook alone is enough for a demonstration, but backend imports
need the actual Python module files as well.

Do not upload runtime SQLite databases, private keys, real document samples,
notebook outputs containing PII, virtual environments or dependency caches.
The delivered notebook has cleared outputs and only synthetic defaults.

## Verification boundaries

See TEST_REPORT.md for the actual module and EVM tests, TypeScript compilation,
contract fingerprint gate and notebook execution. This review does not certify
production security, live GitHub state, persistent network operations or end-to-end
execution of the currently broken backend. Py-EVM remains a pinned demonstration
backend; the guide explains the maintenance and deployment limitations.
