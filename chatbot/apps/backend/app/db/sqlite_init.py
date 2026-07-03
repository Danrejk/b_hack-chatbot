"""
Creates the SQLite schema for conversations and messages.
No auth/user tables yet - out of scope for the MVP. When those get added
later, they'll join against conversations.user_id.
"""
import sqlite3

from app.core.config import settings

SCHEMA = """
CREATE TABLE IF NOT EXISTS conversations (
    id          TEXT PRIMARY KEY,
    title       TEXT,
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
    id              TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL REFERENCES conversations(id),
    role            TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content         TEXT NOT NULL,
    sources         TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation
    ON messages(conversation_id);
"""


def init_db(db_path=None) -> None:
    db_path = db_path or settings.sqlite_db_path
    db_path.parent.mkdir(parents=True, exist_ok=True)

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(SCHEMA)
        conn.commit()
    finally:
        conn.close()

    print(f"SQLite schema ready at {db_path}")


if __name__ == "__main__":
    init_db()
