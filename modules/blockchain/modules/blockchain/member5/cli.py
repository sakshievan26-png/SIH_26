"""Local trusted-operator CLI; no public HTTP endpoint or login system."""
import argparse
import json
import os
from pathlib import Path
from .audit_trail import AuditTrail
from .integration import record_verification, verify_document


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--db', default='audit.sqlite3')
    sub = parser.add_subparsers(dest='command', required=True)
    record = sub.add_parser('record')
    for flag in ('input', 'document', 'event-id', 'verification-id', 'actor-id'):
        record.add_argument('--' + flag, required=True)
    history = sub.add_parser('history')
    history.add_argument('--verification-id', required=True)
    verify = sub.add_parser('verify')
    verify.add_argument('--event-id', required=True)
    verify.add_argument('--document', required=True)
    verify.add_argument('--chain', action='store_true')
    args = parser.parse_args()
    audit = AuditTrail(args.db)
    if args.command == 'record':
        result = record_verification(audit, json.loads(Path(args.input).read_text()),
            event_id=args.event_id, verification_id=args.verification_id,
            actor_id=args.actor_id, original_document_bytes=Path(args.document).read_bytes())
    elif args.command == 'history':
        audit.verify_local()
        result = audit.history(args.verification_id)
    else:
        chain = None
        if args.chain:
            from .blockchain import EVMAnchor
            chain = EVMAnchor(os.environ['RPC_URL'], os.environ['CONTRACT_ADDRESS'],
                int(os.environ['CHAIN_ID']),
                confirmations=int(os.environ.get('CONFIRMATIONS', '1')),
                deployment_block=int(os.environ.get('DEPLOYMENT_BLOCK', '0')))
        result = verify_document(audit, args.event_id, Path(args.document).read_bytes(), chain)
    print(json.dumps(result, indent=2))

if __name__ == '__main__': main()
