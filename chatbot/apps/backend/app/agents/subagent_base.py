"""Shared plumbing for subagent nodes: build the prompt, call the model with
the handoff tool available, and report whether it handed off."""
from app.agents.prompting import build_turn_messages
from app.agents.state import TurnState
from app.core.config import settings
from app.core.openai_client import get_client

HANDOFF_TOOL = {
    "type": "function",
    "function": {
        "name": "mark_resolved",
        "description": (
            "Call this once the situation is resolved and the user no "
            "longer needs this specialized help."
        ),
        "parameters": {"type": "object", "properties": {}},
    },
}


def call_subagent(system_prompt: str, state: TurnState) -> tuple[str, bool]:
    messages = build_turn_messages(system_prompt, state)

    response = get_client().chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        tools=[HANDOFF_TOOL],
    )
    message = response.choices[0].message
    resolved = any(call.function.name == "mark_resolved" for call in (message.tool_calls or []))
    fallback = "Glad that's resolved - take care." if resolved else "Understood."
    answer = message.content or fallback
    return answer, resolved
