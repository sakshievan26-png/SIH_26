# SIH Member 5: repository-ready blockchain and audit trail (v0.2.0)

This package implements your Member 5 work separately from the AI models and backend.
It consumes the field names in the uploaded `SIH_26-main.zip` repository contracts, including the six-part risk breakdown. Compatibility is with that snapshot, not an unseen live GitHub revision.
It never calculates a risk score, runs OCR, or decides whether a traveller should pass.

**Start here:** run the offline demo, then the EVM demo, then give
`BACKEND_HANDOFF.md` and the whole package to Members 4 and 6.

## What you own

| File | Purpose |
|---|---|
| `member5/audit_trail.py` | SHA-256 hashing, persistent SQLite audit journal, ordered events, local integrity checks, history |
| `contracts/AuditAnchor.sol` | Actual blockchain smart contract: authorized writers and append-only commitments |
| `member5/blockchain.py` | Python EVM connector, signed transactions, receipt verification and anchoring checks |
| `member5/contracts.py` | Validation of your supplied TypeScript input contracts |
| `member5/integration.py` | Small callable interface for Members 4/6; stage logging and document comparison |
| `member5/worker.py` | Retryable background anchoring worker; separate from model inference |
| `member5/cli.py` | Log and inspect sample records without a backend |
| `integration_types.ts` | Imports the root TypeScript types and adds the proposed pending ACK union |
| `member5/api_adapter.py` | Wraps successful results in the common `ApiResponse<T>` shape; unwraps upstream risk responses |
| `contract_reference/` | Exact reviewed root contracts and their SHA-256 manifest |
| `scripts/verify_contracts.py` | Detects later contract changes before integration |
| `contracts/AuditAnchor.json` | Compiled ABI/bytecode, compiler version and source hash |
| `examples/evm_demo.py` | End-to-end standalone EVM demo, including tamper detection |
| `tests/` | Audit, concurrency, corruption and real EVM tests |

## Run independently on your laptop

Use Python 3.10 or newer; Python 3.12 was used for verification.
Merge the ZIP contents into the repository root, then open a terminal in `modules/blockchain`.
The upload ZIP only contributes files under that directory. It does not replace root contracts or the backend.

No third-party packages are needed for the audit-only demo:

```bash
python -m examples.demo
python -m unittest discover -s tests -p test_audit.py -v
```

For the real EVM demo, create a virtual environment first if desired:

```bash
python -m venv .venv
```

Windows PowerShell activation: `.venv\Scripts\Activate.ps1`.
Linux/macOS activation: `source .venv/bin/activate`.
If activation is unavailable, run the environment's Python executable directly.

```bash
python -m pip install -r requirements-demo.txt
python -m examples.evm_demo
python -m unittest discover -s tests -v
```

The EVM demo deploys the included compiled contract, signs an anchor transaction,
returns the real receipt from that EVM, and deliberately alters its disposable
SQLite journal to demonstrate detection. No MetaMask, external account or funds
are needed. Its chain and journal disappear when the demo exits.

**This demo is an in-memory EVM, not a distributed blockchain deployment.**
It verifies contract execution and integration, not multi-organization consensus.

For Colab, upload and extract the ZIP, change into `modules/blockchain`, then execute
`%pip install -r requirements-demo.txt` and `!python -m examples.evm_demo`.
Do not use Colab's temporary disk as the team's permanent journal or node.

## Log your own sample without the backend

The sample JSON follows your contract. The supplied sample document is synthetic.
Run these from the extracted package directory:

```bash
python -m member5.cli --db demo.sqlite3 record --input examples/audit_input.json --document examples/synthetic_document.txt --event-id attempt-001:completed --verification-id attempt-001 --actor-id demo-officer
python -m member5.cli --db demo.sqlite3 history --verification-id attempt-001
python -m member5.cli --db demo.sqlite3 verify --event-id attempt-001:completed --document examples/synthetic_document.txt
```

This stores a durable audit entry with `logged: false`. There is no invented
transaction hash. Reusing the same event ID and identical data returns the same
record. Changing the data under that ID raises an error. Use a new verification
ID for a new screening attempt, including another attempt on the same file.
The CLI is for a trusted local operator, not an authenticated public service.

## What is hashed, and where it goes

| Data | Off-chain journal | On-chain |
|---|---|---|
| Original document image/bytes | Not stored here; backend owns secure artifact storage | Never |
| SHA-256 of original uploaded bytes | Yes | Not separately exposed |
| Exact contracted `riskResult`, including summary and breakdown | Yes | Only committed through the event hash |
| Internal document ID, checkpoint, screening ID, actor ID | Yes | Only committed through the event hash |
| Submitted timestamp and server recording timestamp | Yes, separately | Only committed through the event hash |
| Random 32-byte salt, previous hash, sequence, schema version | Yes | Sequence and event hash only |
| Writer wallet and transaction/block metadata | Retrieved from chain | Inherently visible |

The event digest is SHA-256 of the exact UTF-8 `envelope_json` stored in SQLite.
The envelope includes the original-file SHA-256, risk result, context, random
salt and previous event hash. This binds both the file fingerprint and the decision
into one commitment. A different file or decision should fail comparison against
the existing anchor. Do not confuse this digest with an EVM transaction hash;
the transaction hash is returned by the blockchain and is a separate value.

The serializer sorts keys, uses compact separators and ASCII escaping, and rejects
NaN/Infinity. It is a Python-defined versioned format, not RFC 8785 canonical JSON.
Other languages should hash the stored envelope string's exact UTF-8 bytes.
Do not round-trip it through JavaScript before hashing. Existing records must not
be reserialized after future schema/serializer changes.

The random salt makes guessing low-entropy record contents from the commitment
harder when the journal remains private. Hashing is not encryption. SQLite data
is plaintext; protect the journal, backups and artifacts using backend access
controls, volume encryption and a defined retention policy. Use pseudonymous
internal references and keep identifying information out of summaries where possible.

## Connect a persistent EVM network

The contract PDF names Fabric only as an example. This implementation chooses EVM
for a smaller standalone Python prototype. It does not implement Fabric chaincode,
Fabric identities, or Fabric endorsement policies. If your team selects Fabric,
keep the audit journal and input adapter, and replace the connector and contract.

For a persistent local/private EVM or a selected test network:

1. Provision the node/network with your integration teammate. Keep local development
   RPC bound to trusted interfaces. An in-process demo cannot serve as that node.
2. Install `requirements-blockchain.txt`. Set `RPC_URL`, the expected `CHAIN_ID`,
   and a dedicated funded test signing key in `AUDIT_PRIVATE_KEY`. Never commit or
   send the key to the browser. Funding/network selection is not done by this package.
3. Deploy once: `python scripts/deploy_contract.py`. Record its printed contract
   address, deployment block and transaction hash. If a timeout occurs, inspect
   that transaction before retrying deployment; do not blindly deploy duplicates.
4. Set `CONTRACT_ADDRESS`, `DEPLOYMENT_BLOCK`, `AUDIT_DB` (an absolute durable path)
   and `CONFIRMATIONS`. One confirmation means inclusion, not irreversible finality;
   choose a depth appropriate for your chain and demo. All components use the same DB.
5. Run `python -m member5.worker` repeatedly under one supervisor. Each invocation
   handles at most the next unconfirmed journal record. New local entries remain
   durable when RPC is unavailable. A second worker on the same path is excluded
   by a separate SQLite lock; the lock releases after a process crash.
6. Verify an entry using the CLI `verify` command with `--chain`, or call
   `get_audit_output()` from the backend. Reads need no signing key.

The deployer starts as owner/writer. For a separate service wallet, the owner calls
`setWriter(serviceAddress, true)` with the full ABI; revoke with `false`. Owner
administration should be separate from the service key for a shared deployment.
The minimal contract has an immutable owner and no upgrade/owner-recovery mechanism;
plan key custody accordingly. Never reuse the signing wallet for another worker
or application. The included worker serializes one journal, not a shared wallet
across arbitrary databases or machines.

Pin the chain ID, contract address, deployment block and reviewed bytecode in
trusted configuration. Anyone able to substitute the database AND the configured
chain/RPC can substitute the evidence presented to a verifier. Node governance,
trusted RPC access and independent verification matter.

To rebuild the checked-in artifact after a contract edit:

```bash
python -m pip install -r requirements-demo.txt
python scripts/compile_contract.py
python -m unittest discover -s tests -v
```

## Guarantees and limits you can explain to judges

- SQL triggers prevent ordinary updates/deletes through SQLite. A database admin
  can drop them. The local hash chain alone does not defeat an attacker who rewrites
  all local hashes; an independently retained on-chain commitment detects that.
- Chain checks detect altered anchored records and missing anchored suffixes by
  comparing contract count and per-sequence hashes. Unanchored changes, omitted
  events, and a wholly compromised writer/backend cannot be ruled out.
- The contract enforces authorized append order and prevents replacing an old
  commitment. It cannot know whether a risk score or an officer's identity is true.
- A file match means the exact bytes match the recorded fingerprint. It does not
  mean a passport is genuine, the face belongs to its holder, or the AI was correct.
- Backend timestamps are recorded assertions; the chain block timestamp reflects
  inclusion under that chain's rules, not the exact real-world screening time.
- Confirmations reduce reorganization risk. A local single-operator chain can be
  reset. Real organizational tamper resistance requires independently governed nodes
  or a separately trusted network, key custody and durable backups.
- This prototype anchors each event and scans history for verification. It is not
  benchmarked for border-checkpoint throughput. A later version can batch Merkle
  roots and index receipts, with an explicitly versioned proof protocol.
- Login, HTTP authorization, TLS, model validation and secure document storage are
  backend/deployment responsibilities. This package supplies no public endpoint.

A precise presentation claim is: **"We record verification events off-chain and
anchor their hashes on an EVM ledger, making later changes to anchored history
detectable when compared against the trusted ledger."**

## Repository review and what changed

The authoritative inputs for v0.2.0 are the files in the user-uploaded
`SIH_26-main.zip`. No GitHub URL or commit SHA was supplied, so this is a snapshot
review. `contract_reference/manifest.json` fingerprints the reviewed contracts.

| Contract | Finding / implemented behavior |
|---|---|
| Root `blockchainAudit.ts` | Input and confirmed output field shapes are unchanged. |
| Root `riskScore.ts` | Six required output contributions: OCR/validation/tampering/face 0-20 each, barcode/watermark 0-10 each. Missing contributions are rejected, not filled in. |
| Root `common.ts` | `ApiResponse<T>` has success, data, requestId and optional error. Success wrappers are supplied; pending success is not blockchain confirmation. |
| Barcode/watermark inputs | Optional in the risk engine input, but their numeric contributions remain required in the output. Member 4 defines how unavailable signals are scored. |
| Example arithmetic | Repository example contributions total 64 but score is 78. Emit a mismatch warning; preserve the supplied record. Demo contributions total 78. |
| Backend reference | `modules/backend/document_verification.py` fails Python parsing at line 9 (`2.REFERENCE_FILE`). It also has numbered definitions and unresolved top-level UI variables; it is not a runnable integrated backend. |

The existing backend is left for its owner. Do not claim end-to-end model integration
has passed. Member 5's module, EVM behavior, notebook flow and TypeScript fixtures
are independently tested. Old four-field input is rejected for new submissions;
existing audit envelopes remain unchanged and can still be integrity-checked.
The Solidity contract and audit envelope format are unchanged, so no new contract
deployment or rehashing is required solely for this risk-schema update.

Run the contract gate from repository root:

```bash
python modules/blockchain/scripts/verify_contracts.py
```

To install the module into your backend environment, from repository root:

```bash
python -m pip install -e ./modules/blockchain
```

The audit-only module needs no third-party runtime package. Add the blockchain
requirements to the worker environment. TypeScript fixtures can be checked with:

```bash
npx --package typescript tsc --noEmit --strict --target ES2020 --module NodeNext --moduleResolution NodeNext modules/blockchain/tests/contracts.typecheck.ts
```

See `REPOSITORY_REVIEW.md` for review limits, `TEST_REPORT.md` for validation and
`BACKEND_HANDOFF.md` for the callable APIs. The notebook is in `notebooks/` and the
updated explanation PDF is in `docs/` in the upload bundle. Colab's generated
source-only export does not automatically include either of those deliverables.

Technical references used for the connector and contract:
[Web3.py 7 API](https://web3py.readthedocs.io/en/v7.10.0/web3.eth.html) and
[Solidity smart contracts](https://docs.soliditylang.org/en/latest/introduction-to-smart-contracts.html).
