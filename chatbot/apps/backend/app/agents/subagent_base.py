"""Shared plumbing for subagent nodes: build the prompt, call the model, and
report the reply plus resolved/requires_ack flags.

Uses structured output (a JSON schema response_format) rather than parallel
tool-calling for these flags: in testing, gpt-4o-mini reliably calls a tool
when it's the *only* thing in the response (e.g. resolving with no further
text), but when asked to return both real reply text and call a second tool
in parallel, it unreliably narrates the tool call as text instead of
actually invoking it. Structured output guarantees the flags are always
present in the same single call.
"""
import json

from app.agents.prompting import build_turn_messages
from app.agents.state import TurnState
from app.core.config import settings
from app.core.openai_client import get_client

RESPONSE_FORMAT = {
    "type": "json_schema",
    "json_schema": {
        "name": "subagent_reply",
        "schema": {
            "type": "object",
            "properties": {
                "reply": {
                    "type": "string",
                    "description": "The reply to show the user.",
                },
                "resolved": {
                    "type": "boolean",
                    "description": (
                        "True once the situation is resolved and the user no "
                        "longer needs this specialized help."
                    ),
                },
                "requires_ack": {
                    "type": "boolean",
                    "description": (
                        "True only when `reply` is a statement telling the "
                        "user what to do right now (e.g. 'move to the "
                        "basement', 'evacuate now'). False when `reply` is "
                        "only asking the user a clarifying question, even "
                        "an urgent-sounding one - questions never require "
                        "acknowledgment, only directives do."
                    ),
                },
            },
            "required": ["reply", "resolved", "requires_ack"],
            "additionalProperties": False,
        },
        "strict": True,
    },
}


def call_subagent(system_prompt: str, state: TurnState) -> tuple[str, bool, bool]:
    messages = build_turn_messages(system_prompt, state)

    response = get_client().chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        response_format=RESPONSE_FORMAT,
    )
    data = json.loads(response.choices[0].message.content)
    return data["reply"], data["resolved"], data["requires_ack"]
