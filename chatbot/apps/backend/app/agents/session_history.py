"""In-process, session-lived conversation memory for the agent graph.

Not backed by sqlite or any external store - it exists purely to give the
model short-term memory of a conversation across turns within a running
server process. Cleared on restart by design; the sqlite `messages` table
remains the durable record used for conversation history display.
"""

_HISTORY: dict[str, list[dict]] = {}
MAX_TURNS = 20


def get_history(conversation_id: str) -> list[dict]:
    return _HISTORY.get(conversation_id, [])


def append_turn(conversation_id: str, role: str, content: str) -> None:
    turns = _HISTORY.setdefault(conversation_id, [])
    turns.append({"role": role, "content": content})
    del turns[:-MAX_TURNS]
