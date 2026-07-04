"""Builds and compiles the coordinator/subagent state graph, and exposes
run_turn() as the single entrypoint used by every chat endpoint. LangGraph is
used purely as an in-process router - no checkpointer, no persistence layer.
Conversation state (active_agent) lives in sqlite via app.db.repository;
short-term prompt memory lives in app.agents.session_history."""
from langgraph.graph import END, START, StateGraph

from app.agents import session_history
from app.agents.coordinator import coordinator_node
from app.agents.registry import SUBAGENTS
from app.agents.state import TurnState
from app.db import repository

_graph = StateGraph(TurnState)
_graph.add_node("coordinator", coordinator_node)
for _name, _spec in SUBAGENTS.items():
    _graph.add_node(_name, _spec.node_fn)
    _graph.add_edge(_name, END)


def _entry_router(state: TurnState) -> str:
    return state["active_agent"] if state["active_agent"] in SUBAGENTS else "coordinator"


_graph.add_conditional_edges(
    START, _entry_router, {**{name: name for name in SUBAGENTS}, "coordinator": "coordinator"}
)


def _coordinator_router(state: TurnState):
    return state["agent"] if state["agent"] not in (None, "coordinator") else END


_graph.add_conditional_edges(
    "coordinator", _coordinator_router, {**{name: name for name in SUBAGENTS}, END: END}
)

GRAPH = _graph.compile()


def run_turn(
    conversation_id: str,
    message: str | None,
    image_bytes: bytes | None = None,
    image_mime: str | None = None,
) -> dict:
    active_agent = repository.get_active_agent(conversation_id)
    history = session_history.get_history(conversation_id)

    final = GRAPH.invoke(
        {
            "conversation_id": conversation_id,
            "message": message,
            "image_bytes": image_bytes,
            "image_mime": image_mime,
            "history": history,
            "active_agent": active_agent,
            "answer": None,
            "sources": [],
            "agent": None,
            "resolved": False,
            "requires_ack": False,
        }
    )

    if final["resolved"]:
        repository.set_active_agent(conversation_id, None)
    elif final["agent"] != "coordinator":
        repository.set_active_agent(conversation_id, final["agent"])

    session_history.append_turn(conversation_id, "user", message or "[Image]")
    session_history.append_turn(conversation_id, "assistant", final["answer"])
    return final
