from pydantic import BaseModel


class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None


class SourceOut(BaseModel):
    source: str
    chunk_index: int
    score: float


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    sources: list[SourceOut]


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    sources: list[SourceOut] | None = None
    created_at: str


class ConversationOut(BaseModel):
    id: str
    title: str | None
    created_at: str


class ConversationHistoryResponse(BaseModel):
    conversation_id: str
    messages: list[MessageOut]
