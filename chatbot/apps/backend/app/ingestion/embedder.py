"""Shared by ingestion (embedding chunks) and the RAG pipeline (embedding queries)."""
from app.core.config import settings
from app.core.openai_client import get_client


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    response = get_client().embeddings.create(model=settings.embedding_model, input=texts)
    return [item.embedding for item in response.data]
