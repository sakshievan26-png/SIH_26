"""Off-chain, append-only-by-API audit journal. No blockchain dependency."""
import hashlib
import json
import secrets
import sqlite3
from contextlib import closing
from datetime import datetime, timezone

ZERO = '0' * 64


def canonical(value):
    """Protocol v1: Python JSON, sorted keys, compact separators, ASCII escaping.

    Store these exact bytes; this is NOT RFC 8785. Cross-language verifiers must
    hash the stored UTF-8 string, not deserialize and reserialize it.
    """
    return json.dumps(value, sort_keys=True, separators=(',', ':'),
                      ensure_ascii=True, allow_nan=False)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def digest_hex(value):
    if not isinstance(value, str) or len(value) != 64:
        raise ValueError('Expected lowercase SHA-256 hex')
    if any(c not in '0123456789abcdef' for c in value):
        raise ValueError('Expected lowercase SHA-256 hex')
    return value


def text_id(value):
    if not isinstance(value, str) or not 1 <= len(value) <= 160:
        raise ValueError('IDs must be strings of 1..160 characters')
    return value


class AuditTrail:
    def __init__(self, path):
        self.path = str(path)
        with closing(self.connect()) as db:
            db.executescript('''
            PRAGMA journal_mode=WAL;
            CREATE TABLE IF NOT EXISTS events (
                sequence INTEGER PRIMARY KEY,
                event_id TEXT UNIQUE NOT NULL,
                request_json TEXT NOT NULL,
                envelope_json TEXT NOT NULL,
                event_hash TEXT NOT NULL);
            CREATE TRIGGER IF NOT EXISTS no_update BEFORE UPDATE ON events
            BEGIN SELECT RAISE(ABORT, 'Audit events cannot be updated'); END;
            CREATE TRIGGER IF NOT EXISTS no_delete BEFORE DELETE ON events
            BEGIN SELECT RAISE(ABORT, 'Audit events cannot be deleted'); END;
            ''')

    def connect(self):
        db = sqlite3.connect(self.path, timeout=30, isolation_level=None)
        db.row_factory = sqlite3.Row
        return db

    def append(self, *, event_id, verification_id, actor_id, event_type,
               document_sha256, result):
        """Trusted backend only. Same ID + same payload returns original event.

        result must be JSON-compatible; sanitize it before calling. Exceptions
        mean no acknowledgement: caller should retry using the SAME event_id.
        """
        for value in (event_id, verification_id, actor_id, event_type):
            text_id(value)
        digest_hex(document_sha256)
        if not isinstance(result, dict):
            raise ValueError('result must be an object')
        request = canonical(dict(event_id=event_id, verification_id=verification_id,
                                 actor_id=actor_id, event_type=event_type,
                                 document_sha256=document_sha256, result=result))
        if len(request.encode()) > 262144:
            raise ValueError('Event exceeds 256 KiB; store artifacts separately')
        db = self.connect()
        try:
            db.execute('BEGIN IMMEDIATE')
            old = db.execute('SELECT * FROM events WHERE event_id=?', (event_id,)).fetchone()
            if old:
                if old['request_json'] != request:
                    raise ValueError('event_id already used for a different payload')
                db.commit()
                return dict(old)
            last = db.execute('SELECT sequence,event_hash FROM events ORDER BY sequence DESC LIMIT 1').fetchone()
            seq, previous = (last['sequence'] + 1, last['event_hash']) if last else (1, ZERO)
            envelope = canonical(dict(schema='member5.audit.v1', sequence=seq,
                previous_hash=previous, recorded_at=datetime.now(timezone.utc).isoformat(),
                salt=secrets.token_hex(32), request=json.loads(request)))
            event_hash = sha256(envelope.encode())
            db.execute('INSERT INTO events VALUES (?,?,?,?,?)',
                       (seq, event_id, request, envelope, event_hash))
            db.commit()
            return dict(sequence=seq, event_id=event_id, request_json=request,
                        envelope_json=envelope, event_hash=event_hash)
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    def events(self):
        with closing(self.connect()) as db:
            return [dict(row) for row in db.execute('SELECT * FROM events ORDER BY sequence')]

    def get_event(self, event_id):
        with closing(self.connect()) as db:
            row = db.execute('SELECT * FROM events WHERE event_id=?', (event_id,)).fetchone()
            if row is None:
                raise KeyError(event_id)
            return dict(row)

    def history(self, verification_id):
        """Trusted backend only; authorize the requester before returning details."""
        return [row for row in self.events() if
                json.loads(row['envelope_json'])['request']['verification_id'] == verification_id]

    def verify_local(self):
        """Internal consistency only: does NOT prove anchoring or completeness."""
        previous = ZERO
        rows = self.events()
        for seq, row in enumerate(rows, 1):
            body = json.loads(row['envelope_json'])
            if (row['sequence'] != seq or body['sequence'] != seq or
                body['previous_hash'] != previous or
                body['request']['event_id'] != row['event_id'] or
                canonical(body['request']) != row['request_json'] or
                sha256(row['envelope_json'].encode()) != row['event_hash']):
                raise ValueError(f'Audit corruption at sequence {seq}')
            previous = row['event_hash']
        return {'count': len(rows), 'head': previous, 'local_consistency': True}
