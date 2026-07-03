"""Singleton OpenAI client, same lazy-construction pattern as
app/vector_store/milvus_client.get_client()."""
from openai import OpenAI

from app.core.config import settings

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.openai_api_key)
    return _client
