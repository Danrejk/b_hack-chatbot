"""Routes each turn to a specialized subagent when one clearly applies,
otherwise falls back to today's general RAG answer unchanged."""
from app.agents.prompting import build_turn_messages
from app.agents.registry import SUBAGENTS
from app.agents.state import TurnState
from app.core.config import settings
from app.core.openai_client import get_client
from app.rag.pipeline import answer_query, answer_query_with_image

COORDINATOR_SYSTEM_PROMPT = (
    "You are the routing coordinator for a personal crisis-support "
    "assistant. Decide whether the user's message should be delegated to "
    "one of the specialized subagents described by the available tools. "
    "Only delegate when a subagent clearly applies. If none do, don't call "
    "any tool."
)


def _delegation_tools() -> list[dict]:
    return [
        {
            "type": "function",
            "function": {
                "name": f"delegate_to_{name}",
                "description": spec.routing_description,
                "parameters": {"type": "object", "properties": {}},
            },
        }
        for name, spec in SUBAGENTS.items()
    ]


def coordinator_node(state: TurnState) -> dict:
    messages = build_turn_messages(COORDINATOR_SYSTEM_PROMPT, state)
    response = get_client().chat.completions.create(
        model=settings.llm_model,
        messages=messages,
        tools=_delegation_tools(),
        tool_choice="auto",
    )

    for call in response.choices[0].message.tool_calls or []:
        name = call.function.name.removeprefix("delegate_to_")
        if name in SUBAGENTS:
            return SUBAGENTS[name].node_fn(state)

    result = (
        answer_query_with_image(
            state["message"], state["image_bytes"], state["image_mime"], history=state["history"]
        )
        if state["image_bytes"]
        else answer_query(state["message"], history=state["history"])
    )
    return {
        "answer": result.answer,
        "sources": result.sources,
        "agent": "coordinator",
        "resolved": False,
        "requires_ack": False,
    }
