from dataclasses import dataclass
from typing import Callable, TypedDict


class TurnState(TypedDict):
    conversation_id: str
    message: str | None
    image_bytes: bytes | None
    image_mime: str | None
    history: list[dict]
    active_agent: str | None
    answer: str | None
    sources: list[dict]
    agent: str | None
    resolved: bool


@dataclass
class SubagentSpec:
    name: str
    routing_description: str
    node_fn: Callable[[TurnState], dict]
