"""
CRUD helpers on top of the schema created in sqlite_init.py. Each function
opens its own short-lived connection - simplest thing that's safe when
FastAPI runs sync endpoints across a threadpool.
"""
import json
import sqlite3
import uuid
from contextlib import contextmanager

from app.core.config import settings


@contextmanager
def _connect():
    conn = sqlite3.connect(settings.sqlite_db_path)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def create_conversation(title: str | None = None) -> str:
    conversation_id = str(uuid.uuid4())
    with _connect() as conn:
        conn.execute(
            "INSERT INTO conversations (id, title) VALUES (?, ?)",
            (conversation_id, title),
        )
    return conversation_id


def get_conversation(conversation_id: str) -> dict | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT id, title, created_at FROM conversations WHERE id = ?",
            (conversation_id,),
        ).fetchone()
    return dict(row) if row else None


def list_conversations() -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            "SELECT id, title, created_at FROM conversations ORDER BY created_at DESC"
        ).fetchall()
    return [dict(row) for row in rows]


def get_active_agent(conversation_id: str) -> str | None:
    with _connect() as conn:
        row = conn.execute(
            "SELECT active_agent FROM conversations WHERE id = ?",
            (conversation_id,),
        ).fetchone()
    return row["active_agent"] if row else None


def set_active_agent(conversation_id: str, agent: str | None) -> None:
    with _connect() as conn:
        conn.execute(
            "UPDATE conversations SET active_agent = ? WHERE id = ?",
            (agent, conversation_id),
        )


def insert_message(
    conversation_id: str,
    role: str,
    content: str,
    sources: list[dict] | None = None,
    agent: str | None = None,
) -> str:
    message_id = str(uuid.uuid4())
    sources_json = json.dumps(sources) if sources is not None else None
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO messages (id, conversation_id, role, content, sources, agent)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (message_id, conversation_id, role, content, sources_json, agent),
        )
    return message_id


def list_messages(conversation_id: str) -> list[dict]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT id, conversation_id, role, content, sources, agent, created_at
            FROM messages
            WHERE conversation_id = ?
            ORDER BY created_at ASC
            """,
            (conversation_id,),
        ).fetchall()

    messages = []
    for row in rows:
        message = dict(row)
        message["sources"] = json.loads(message["sources"]) if message["sources"] else None
        messages.append(message)
    return messages
