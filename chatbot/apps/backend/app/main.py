from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.audio.transcriber import transcribe_audio
from app.db import repository
from app.db.sqlite_init import init_db
from app.rag.pipeline import answer_query, answer_query_with_image
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


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    conversation_id = _get_or_create_conversation(request.conversation_id)

    repository.insert_message(conversation_id, "user", request.message)

    result = answer_query(request.message)

    sources = [dict(source) for source in result.sources]
    repository.insert_message(conversation_id, "assistant", result.answer, sources=sources)

    return ChatResponse(conversation_id=conversation_id, answer=result.answer, sources=sources)


@app.post("/chat/voice", response_model=VoiceChatResponse)
async def chat_voice(
    audio: UploadFile = File(...),
    conversation_id: str | None = Form(None),
) -> VoiceChatResponse:
    conversation_id = _get_or_create_conversation(conversation_id)

    transcript = transcribe_audio(await audio.read(), audio.filename, audio.content_type)
    repository.insert_message(conversation_id, "user", transcript)

    result = answer_query(transcript)
    sources = [dict(source) for source in result.sources]
    repository.insert_message(conversation_id, "assistant", result.answer, sources=sources)

    return VoiceChatResponse(
        conversation_id=conversation_id,
        answer=result.answer,
        sources=sources,
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

    result = answer_query_with_image(message, await image.read(), image.content_type)
    sources = [dict(source) for source in result.sources]
    repository.insert_message(conversation_id, "assistant", result.answer, sources=sources)

    return ChatResponse(conversation_id=conversation_id, answer=result.answer, sources=sources)


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
