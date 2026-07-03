from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.db import repository
from app.db.sqlite_init import init_db
from app.rag.pipeline import answer_query
from app.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationHistoryResponse,
    ConversationOut,
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


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    conversation_id = request.conversation_id
    if conversation_id is None:
        conversation_id = repository.create_conversation()
    elif repository.get_conversation(conversation_id) is None:
        raise HTTPException(status_code=404, detail="Conversation not found")

    repository.insert_message(conversation_id, "user", request.message)

    result = answer_query(request.message)

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
