"""Civil-protection subagent for war/air-strike/nuclear scenarios (see
chatbot/data/knowledge_base/crisisbox_scenario_templates.md, "War / Nuclear /
Air Strike"). Grounds its guidance in the user's known location and a single
semantic search over the knowledge base (regional alerts, emergency contact
numbers, and the backpack checklist all live there as regular documents), the
same retrieve-then-generate shape as app/rag/pipeline.py - so retrieved
sources are real and inspectable via the API's `sources` field, not a fixed
block of text always injected into the prompt."""
from app.agents.state import SubagentSpec, TurnState
from app.agents.subagent_base import call_subagent
from app.core.config import settings
from app.core.user_profile import get_user_profile
from app.ingestion.embedder import embed_texts
from app.vector_store.milvus_client import search

OPENING_ORDER = (
    "This is the first message you're sending this user for this crisis. "
    "Order: (1) briefly state what's potentially happening near them right "
    "now, based on their location and any matching alerts in the knowledge "
    "base context below - if nothing in the context matches their location, "
    "say plainly that you have no specific alert for their area yet, (2) one "
    "short calming sentence, (3) ask for location if it's unknown, (4) a "
    "short safety question or one clear next step.\n"
)
CONTINUING_ORDER = (
    "Order: (1) one short calming sentence, (2) ask for location if it's "
    "unknown, (3) a short safety question or one clear next step.\n"
)

SYSTEM_PROMPT_TEMPLATE = (
    "You are a civil protection assistant for war, air-strike, or "
    "nuclear/radiation threats. The user's known location is: {location}.\n"
    "{order}"
    "Keep every reply short and direct - a few sentences at most, or a short "
    "list only if truly needed. Never dump a long info block; if the user "
    "wants the full backpack checklist or full contact list, keep even that "
    "compact and only the parts relevant to them.\n"
    "Never name any app (not this product, not a maps/messaging/safety "
    "app) - describe actions generically instead.\n"
    "Use the knowledge base context below only if relevant to this message; "
    "ignore it otherwise.\n"
    "Set requires_ack true only for a direct action instruction (not a "
    "question). Set resolved true once the user is safely sheltered or has "
    "reached emergency services.\n\n"
    "Knowledge base context:\n{context}"
)


def _retrieve(message: str | None, location: str) -> list[dict]:
    """Searches with both the raw message (so topic-specific docs like the
    backpack checklist surface on their own terms) and the message plus
    location (so location-specific alerts surface even when the message
    doesn't name the place), then merges by best score per chunk. A single
    combined query would let the location suffix drown out an unrelated
    topic like backpack-packing, or drop location grounding entirely."""
    message = message or ""
    plain_vector, located_vector = embed_texts([message, f"{message} near {location}".strip()])

    merged: dict[tuple[str, int], dict] = {}
    for chunk in [*search(plain_vector, top_k=settings.top_k), *search(located_vector, top_k=settings.top_k)]:
        key = (chunk["source"], chunk["chunk_index"])
        if key not in merged or chunk["score"] < merged[key]["score"]:
            merged[key] = chunk

    return sorted(merged.values(), key=lambda chunk: chunk["score"])[: settings.top_k]


def _format_context(chunks: list[dict]) -> str:
    if not chunks:
        return "No relevant knowledge base content found."
    return "\n\n".join(
        f"[{i + 1}] (source: {chunk['source']})\n{chunk['text']}" for i, chunk in enumerate(chunks)
    )


def node(state: TurnState) -> dict:
    profile = get_user_profile()
    location = profile.get("location", "unknown - ask the user for their city")

    chunks = _retrieve(state["message"], location)
    order = OPENING_ORDER if state["active_agent"] != "war_crisis" else CONTINUING_ORDER
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        location=location, order=order, context=_format_context(chunks)
    )

    answer, resolved, requires_ack = call_subagent(system_prompt, state)
    sources = [
        {"source": chunk["source"], "chunk_index": chunk["chunk_index"], "score": chunk["score"]}
        for chunk in chunks
    ]
    return {
        "answer": answer,
        "sources": sources,
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
