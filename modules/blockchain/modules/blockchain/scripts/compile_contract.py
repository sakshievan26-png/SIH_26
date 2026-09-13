"""Downloads solc 0.8.24 if missing; builds the supplied contract only."""
import hashlib
import json
from pathlib import Path
import solcx

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'contracts/AuditAnchor.sol').read_text()
solcx.install_solc('0.8.24')
compiled = solcx.compile_source(source, output_values=['abi', 'bin'],
                                solc_version='0.8.24', optimize=True)
artifact = compiled['<stdin>:AuditAnchor']
artifact['source_sha256'] = hashlib.sha256(source.encode()).hexdigest()
artifact['compiler'] = '0.8.24'
(ROOT / 'contracts/AuditAnchor.json').write_text(json.dumps(artifact, indent=2) + '\n')
print('Compiled contracts/AuditAnchor.json with Solidity 0.8.24')
