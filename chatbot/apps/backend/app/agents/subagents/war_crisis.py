"""Civil-protection subagent for war/air-strike/nuclear scenarios (see
chatbot/data/knowledge_base/crisisbox_scenario_templates.md, "War / Nuclear /
Air Strike"). Grounds its guidance in the user's known location and any
matching curated regional alert content already in the knowledge base."""
from app.agents.state import SubagentSpec, TurnState
from app.agents.subagent_base import call_subagent
from app.core.config import settings
from app.core.user_profile import get_user_profile
from app.ingestion.embedder import embed_texts
from app.vector_store.milvus_client import search

SYSTEM_PROMPT_TEMPLATE = (
    "You are a civil protection assistant helping someone during a possible "
    "war, air strike, or nuclear/radiation threat. The user's known location "
    "is: {location}. Stay calm, conservative, and shelter-first. Ask short "
    "safety questions (indoors/outdoors, sirens or explosions now, nearby "
    "shelter/basement, visible damage, official evacuation order, injuries). "
    "Give clear step-by-step instructions, distinguishing air-strike guidance "
    "(shelter/basement, away from windows, lie low) from nuclear/radiation "
    "guidance (go indoors, seal windows/doors, await official clearance). "
    "Prefer the local alert information below when relevant. Set "
    "requires_ack to true whenever your reply gives the user a directive "
    "they must act on now (e.g. move to shelter, take cover, evacuate). Set "
    "resolved to true once they're safely sheltered or have reached "
    "emergency services.\n\n"
    "Relevant local alert information:\n{alerts}"
)


def _location_context() -> tuple[str, str]:
    profile = get_user_profile()
    location = profile.get("location", "unknown - ask the user for their city")

    query_vector = embed_texts([f"current alerts and shelter information near {location}"])[0]
    chunks = search(query_vector, top_k=settings.top_k)
    alerts = (
        "\n\n".join(f"({chunk['source']}) {chunk['text']}" for chunk in chunks)
        or "No specific regional alert data available."
    )
    return location, alerts


def node(state: TurnState) -> dict:
    location, alerts = _location_context()
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(location=location, alerts=alerts)

    answer, resolved, requires_ack = call_subagent(system_prompt, state)
    return {
        "answer": answer,
        "sources": [],
        "agent": "war_crisis",
        "resolved": resolved,
        "requires_ack": requires_ack,
    }


SPEC = SubagentSpec(
    name="war_crisis",
    routing_description=(
        "User mentions war, air strikes, bombing, explosions, missiles, "
        "nuclear or radiation threats, chemical attacks, shelling, sirens, "
        "attack warnings, or is asking about finding shelter."
    ),
    node_fn=node,
)
