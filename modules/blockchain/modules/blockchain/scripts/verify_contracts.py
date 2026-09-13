"""Fail on upstream contract drift; never guess a new risk schema.

From repo root: python modules/blockchain/scripts/verify_contracts.py
In standalone/Colab mode the checked-in reference is checked instead and this
is clearly reported. Pass --contracts PATH to compare a different checkout.
"""
import argparse
import hashlib
import json
from pathlib import Path

MODULE = Path(__file__).resolve().parents[1]


def check_contracts(directory):
    manifest = json.loads((MODULE / 'contract_reference/manifest.json').read_text())
    mismatches = []
    for name, expected in manifest['files'].items():
        path = Path(directory) / name
        if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
            mismatches.append(name)
    return mismatches


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--contracts', type=Path)
    args = parser.parse_args()
    upstream = MODULE.parents[1] / 'contracts'
    target = args.contracts or (upstream if (upstream / 'riskScore.ts').exists()
                                else MODULE / 'contract_reference')
    errors = check_contracts(target)
    if errors:
        raise SystemExit('Contract snapshot mismatch; review/update adapter: ' + ', '.join(errors))
    print('Contract snapshot matches:', target)
    print('This checks the selected files only, not live GitHub state.')

if __name__ == '__main__':
    main()
