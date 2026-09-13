# Verification report — v0.2.0

Reviewed against the uploaded SIH_26-main.zip snapshot. No live GitHub revision was inspected.

## Passed

- 39 Python tests: 16 audit tests, 11 real-EVM tests and 12 repository contract tests.
- All 27 default notebook code cells executed in an isolated Python environment, including dependency installation, local EVM deployment, signed anchoring, receipt verification, tamper detection and source export.
- Root TypeScript contract fingerprint comparison passed.
- TypeScript 7.0.2 strict compilation passed against the unchanged repository contracts.
- Solidity source is unchanged from the previous prototype; included artifact source hash matches.

The notebook was executed with in-process IPython, not in a hosted Google Colab session. Optional upload/download and external-network branches were not enabled. The delivered notebook has cleared outputs.

## Reproduce

From modules/blockchain:

```sh
python -m pip install -r requirements-demo.txt
python -m unittest discover -s tests -v
python scripts/verify_contracts.py
tsc --noEmit --strict --target ES2020 --module NodeNext --moduleResolution NodeNext tests/contracts.typecheck.ts
```

Dependencies include Web3.py 7.16.0, eth-tester[py-evm] 0.14.0b1 and py-solc-x 2.0.5; contract compiler version is Solidity 0.8.24. Tests execute real compiled bytecode on an in-process EVM, not a distributed network.

## Test output

```text
test_changed_file_hash (test_audit.AuditTests.test_changed_file_hash) ... ok
test_concurrent_append (test_audit.AuditTests.test_concurrent_append) ... ok
test_concurrent_same_id (test_audit.AuditTests.test_concurrent_same_id) ... ok
test_conflicting_retry (test_audit.AuditTests.test_conflicting_retry) ... ok
test_contract_and_no_fake_receipt (test_audit.AuditTests.test_contract_and_no_fake_receipt) ... ok
test_contract_example_sum_warning (test_audit.AuditTests.test_contract_example_sum_warning) ... ok
test_document_comparison_does_not_claim_anchoring (test_audit.AuditTests.test_document_comparison_does_not_claim_anchoring) ... ok
test_idempotent_retry (test_audit.AuditTests.test_idempotent_retry) ... ok
test_modified_record (test_audit.AuditTests.test_modified_record) ... ok
test_network_failure_preserves_pending_work (test_audit.AuditTests.test_network_failure_preserves_pending_work) ... ok
test_pending_then_retry_and_restart (test_audit.AuditTests.test_pending_then_retry_and_restart) ... ok
test_ranges_types_and_timezone (test_audit.AuditTests.test_ranges_types_and_timezone) ... ok
test_rewritten_hashes_detected_by_chain (test_audit.AuditTests.test_rewritten_hashes_detected_by_chain) ... ok
test_sql_guards (test_audit.AuditTests.test_sql_guards) ... ok
test_stage_history (test_audit.AuditTests.test_stage_history) ... ok
test_truncation_detected_against_chain (test_audit.AuditTests.test_truncation_detected_against_chain) ... ok
test_confirmed_api_response_uses_real_receipt (test_evm.EVMTests.test_confirmed_api_response_uses_real_receipt) ... ok
test_contract_exact_retry_succeeds (test_evm.EVMTests.test_contract_exact_retry_succeeds) ... ok
test_contract_rejects_rewrite_and_out_of_order (test_evm.EVMTests.test_contract_rejects_rewrite_and_out_of_order) ... ok
test_contract_rejects_unauthorized_writer (test_evm.EVMTests.test_contract_rejects_unauthorized_writer) ... ok
test_network_and_address_checks (test_evm.EVMTests.test_network_and_address_checks) ... ok
test_retry_does_not_add_record_or_transaction (test_evm.EVMTests.test_retry_does_not_add_record_or_transaction) ... ok
test_revocation (test_evm.EVMTests.test_revocation) ... ok
test_signed_anchor_and_exact_output_contract (test_evm.EVMTests.test_signed_anchor_and_exact_output_contract) ... ok
test_timeout_after_broadcast_reconciles_without_duplicate (test_evm.EVMTests.test_timeout_after_broadcast_reconciles_without_duplicate) ... ok
test_two_records_and_history (test_evm.EVMTests.test_two_records_and_history) ... ok
test_waits_for_confirmations_without_resubmitting (test_evm.EVMTests.test_waits_for_confirmations_without_resubmitting) ... ok
test_bad_request_id_rejected_before_write (test_repo_contracts.RepositoryContractTests.test_bad_request_id_rejected_before_write) ... ok
test_barcode_watermark_stages_recorded_separately (test_repo_contracts.RepositoryContractTests.test_barcode_watermark_stages_recorded_separately) ... ok
test_common_api_response_and_retry_correlation (test_repo_contracts.RepositoryContractTests.test_common_api_response_and_retry_correlation) ... ok
test_contract_snapshot_and_drift_detection (test_repo_contracts.RepositoryContractTests.test_contract_snapshot_and_drift_detection) ... ok
test_exact_repository_example_preserved_with_warning (test_repo_contracts.RepositoryContractTests.test_exact_repository_example_preserved_with_warning) ... ok
test_existing_journal_is_not_rewritten (test_repo_contracts.RepositoryContractTests.test_existing_journal_is_not_rewritten) ... ok
test_failed_upstream_response_cannot_log_final_decision (test_repo_contracts.RepositoryContractTests.test_failed_upstream_response_cannot_log_final_decision) ... ok
test_legacy_four_field_input_is_rejected (test_repo_contracts.RepositoryContractTests.test_legacy_four_field_input_is_rejected) ... ok
test_new_required_output_fields_never_defaulted (test_repo_contracts.RepositoryContractTests.test_new_required_output_fields_never_defaulted) ... ok
test_pending_response_has_no_fake_receipt (test_repo_contracts.RepositoryContractTests.test_pending_response_has_no_fake_receipt) ... ok
test_six_fields_and_updated_caps (test_repo_contracts.RepositoryContractTests.test_six_fields_and_updated_caps) ... ok
test_upstream_success_data_unwrapped (test_repo_contracts.RepositoryContractTests.test_upstream_success_data_unwrapped) ... ok

----------------------------------------------------------------------
Ran 39 tests in 2.080s

OK
```

## Integration limits

The supplied backend does not parse as Python: the first syntax error is line 9 (`2.REFERENCE_FILE`). It also does not yet supply the complete risk-engine output. That teammate-owned code was left unchanged. Full backend/model integration therefore remains unverified.

The repository's example score is 78 while its six contributions sum to 64. The audit module preserves this input and returns a mismatch warning. It does not recalculate risk scores or fill missing barcode/watermark contributions.

Persistent RPC deployment, distributed consensus, hosted Colab behavior, production throughput, key custody and operational security remain outside these prototype checks.
