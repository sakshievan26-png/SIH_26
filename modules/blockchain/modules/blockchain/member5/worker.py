"""Run periodically under ONE supervised process: python -m member5.worker."""
import json
import os
import sqlite3
from .audit_trail import AuditTrail
from .blockchain import EVMAnchor, anchor_next


def main():
    path = os.environ.get('AUDIT_DB', 'audit.sqlite3')
    # Separate SQLite lock releases automatically after crashes. It does not
    # hold the audit database write lock while waiting for the network.
    lock = sqlite3.connect(path + '.worker-lock', timeout=0, isolation_level=None)
    try:
        lock.execute('BEGIN EXCLUSIVE')
        chain = EVMAnchor(os.environ['RPC_URL'], os.environ['CONTRACT_ADDRESS'],
            int(os.environ['CHAIN_ID']), os.environ['AUDIT_PRIVATE_KEY'],
            int(os.environ.get('CONFIRMATIONS', '1')),
            int(os.environ.get('DEPLOYMENT_BLOCK', '0')))
        result = anchor_next(AuditTrail(path), chain)
        print(json.dumps(result, default=str))
    finally:
        lock.close()


if __name__ == '__main__':
    main()
