"""
Central place for all configuration. Everything else in the app should
import from here instead of calling os.getenv directly, so there's exactly
one place to look when a path or model name needs to change.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

# apps/backend/ is the project root for this service
BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


def _resolve(path_str: str) -> Path:
    """Resolve a path from .env relative to the backend root."""
    return (BACKEND_ROOT / path_str).resolve()


class Settings:
    # LLM provider
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    embedding_model: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
    llm_model: str = os.getenv("LLM_MODEL", "gpt-4o-mini")
    stt_model: str = os.getenv("STT_MODEL", "whisper-1")
    vision_model: str = os.getenv("VISION_MODEL", "") or llm_model

    # Storage
    sqlite_db_path: Path = _resolve(os.getenv("SQLITE_DB_PATH", "./data/conversations.db"))
    vector_db_path: Path = _resolve(os.getenv("VECTOR_DB_PATH", "./data/milvus_lite.db"))
    vector_collection_name: str = os.getenv("VECTOR_COLLECTION_NAME", "knowledge_base")
    embedding_dim: int = int(os.getenv("EMBEDDING_DIM", "1536"))

    # Knowledge base
    knowledge_base_dir: Path = _resolve(os.getenv("KNOWLEDGE_BASE_DIR", "../../data/knowledge_base"))

    # RAG
    chunk_size: int = int(os.getenv("CHUNK_SIZE", "800"))
    chunk_overlap: int = int(os.getenv("CHUNK_OVERLAP", "100"))
    top_k: int = int(os.getenv("TOP_K", "4"))


settings = Settings()
