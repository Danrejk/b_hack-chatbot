from app.agents.state import SubagentSpec, TurnState
from app.agents.subagent_base import call_subagent

SYSTEM_PROMPT = (
    "You are a calm, focused crisis-support assistant helping someone who is "
    "lost or disoriented in a city find their way to safety. Ask short, "
    "concrete grounding questions (nearby landmarks, street signs, "
    "storefronts, transit stops) and give clear, simple next steps. Keep "
    "your tone reassuring and unhurried. Call mark_resolved once they're "
    "safe or have their bearings again."
)


def node(state: TurnState) -> dict:
    answer, resolved = call_subagent(SYSTEM_PROMPT, state)
    return {"answer": answer, "sources": [], "agent": "lost_in_city", "resolved": resolved}


SPEC = SubagentSpec(
    name="lost_in_city",
    routing_description=(
        "User is lost, disoriented, or doesn't know how to get to a safe or "
        "known location in a city."
    ),
    node_fn=node,
)
