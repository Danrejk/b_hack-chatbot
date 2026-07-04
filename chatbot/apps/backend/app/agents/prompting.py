"""Shared message-building for agent nodes: system prompt + session history +
current turn (with an image content block if one was sent), reusing the same
prompt shapes as app/rag/pipeline.py so image/text handling isn't duplicated."""
from app.agents.state import TurnState
from app.rag.pipeline import build_image_prompt, build_prompt


def build_turn_messages(system_prompt: str, state: TurnState) -> list[dict]:
    if state["image_bytes"]:
        messages = build_image_prompt(
            state["message"], state["image_bytes"], state["image_mime"], history=state["history"]
        )
    else:
        messages = build_prompt(state["message"], chunks=[], history=state["history"])
    messages[0] = {"role": "system", "content": system_prompt}
    return messages
