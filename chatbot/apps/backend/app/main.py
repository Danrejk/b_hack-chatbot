from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.agents.graph import run_turn
from app.audio.transcriber import transcribe_audio
from app.db import repository
from app.db.sqlite_init import init_db
from app.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    ConversationOut,
    VoiceChatResponse,
)
from app.vector_store.milvus_client import ensure_collection

app = FastAPI(title="RAG Chatbot Backend")

# Dev-only permissive CORS so the Expo/React Native client can call this
# cross-origin; no auth/cookies exist yet so allow_credentials stays False.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    ensure_collection()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


def _get_or_create_conversation(conversation_id: str | None) -> str:
    if conversation_id is None:
        return repository.create_conversation()
    if repository.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation_id


def _persist_assistant_reply(conversation_id: str, result: dict) -> str:
    """Inserts the assistant's turn and returns its message id, so callers
    can hand it back to the client (e.g. for the ack endpoint)."""
    return repository.insert_message(
        conversation_id,
        "assistant",
        result["answer"],
        sources=result["sources"],
        agent=result["agent"],
        requires_ack=result["requires_ack"],
    )


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    conversation_id = _get_or_create_conversation(request.conversation_id)

    repository.insert_message(conversation_id, "user", request.message)

    result = run_turn(conversation_id, request.message)
    message_id = _persist_assistant_reply(conversation_id, result)

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=message_id,
        answer=result["answer"],
        sources=result["sources"],
        agent=result["agent"],
        requires_ack=result["requires_ack"],
    )


@app.post("/chat/voice", response_model=VoiceChatResponse)
async def chat_voice(
    audio: UploadFile = File(...),
    conversation_id: str | None = Form(None),
) -> VoiceChatResponse:
    conversation_id = _get_or_create_conversation(conversation_id)

    transcript = transcribe_audio(await audio.read(), audio.filename, audio.content_type)
    repository.insert_message(conversation_id, "user", transcript)

    result = run_turn(conversation_id, transcript)
    message_id = _persist_assistant_reply(conversation_id, result)

    return VoiceChatResponse(
        conversation_id=conversation_id,
        message_id=message_id,
        answer=result["answer"],
        sources=result["sources"],
        agent=result["agent"],
        requires_ack=result["requires_ack"],
        transcript=transcript,
    )


@app.post("/chat/image", response_model=ChatResponse)
async def chat_image(
    image: UploadFile = File(...),
    message: str | None = Form(None),
    conversation_id: str | None = Form(None),
) -> ChatResponse:
    if not (image.content_type or "").startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    conversation_id = _get_or_create_conversation(conversation_id)
    repository.insert_message(conversation_id, "user", message or "[Image]")

    result = run_turn(conversation_id, message, await image.read(), image.content_type)
    message_id = _persist_assistant_reply(conversation_id, result)

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=message_id,
        answer=result["answer"],
        sources=result["sources"],
        agent=result["agent"],
        requires_ack=result["requires_ack"],
    )


ACK_REPLY_MESSAGE = "I have read and understood the instructions. What should I do next?"


@app.post("/conversations/{conversation_id}/messages/{message_id}/ack", response_model=ChatResponse)
def acknowledge_message(conversation_id: str, message_id: str) -> ChatResponse:
    if repository.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    repository.acknowledge_message(conversation_id, message_id)

    # Acknowledging is itself a turn: tell the model the user read the
    # instruction and is ready to continue, so it can carry on guiding them.
    repository.insert_message(conversation_id, "user", ACK_REPLY_MESSAGE)
    result = run_turn(conversation_id, ACK_REPLY_MESSAGE)
    new_message_id = _persist_assistant_reply(conversation_id, result)

    return ChatResponse(
        conversation_id=conversation_id,
        message_id=new_message_id,
        answer=result["answer"],
        sources=result["sources"],
        agent=result["agent"],
        requires_ack=result["requires_ack"],
    )


@app.get("/conversations", response_model=list[ConversationOut])
def list_conversations() -> list[dict]:
    return repository.list_conversations()


@app.get("/conversations/{conversation_id}/messages", response_model=ConversationHistoryResponse)
def get_conversation_messages(conversation_id: str) -> dict:
    if repository.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return {
        "conversation_id": conversation_id,
        "messages": repository.list_messages(conversation_id),
    }
