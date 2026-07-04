"""
Creates the SQLite schema for conversations and messages.
No auth/user tables yet - out of scope for the MVP. When those get added
later, they'll join against conversations.user_id.
"""
import sqlite3

from app.core.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS conversations (
    id            TEXT PRIMARY KEY,
    title         TEXT,
    active_agent  TEXT,
    created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    sources         TEXT,
    agent           TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id);
"""

# (table, column, type) added after the initial release - CREATE TABLE IF NOT
# EXISTS won't retrofit these onto a database file that predates them.
_MIGRATED_COLUMNS = [
    ("conversations", "active_agent", "TEXT"),
    ("messages", "agent", "TEXT"),
]


def _add_missing_columns(conn: sqlite3.Connection) -> None:
    for table, column, coltype in _MIGRATED_COLUMNS:
        existing = {row[1] for row in conn.execute(f"PRAGMA table_info({table})")}
        if column not in existing:
            conn.execute(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}")


def init_db(db_path=None) -> None:
    db_path = db_path or settings.sqlite_db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(SCHEMA)
        _add_missing_columns(conn)
        conn.commit()
    finally:
        conn.close()

    print(f"SQLite schema ready at {db_path}")


if __name__ == "__main__":
    init_db()
