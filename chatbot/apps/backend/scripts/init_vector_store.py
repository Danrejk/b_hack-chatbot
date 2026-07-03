"""Run with: uv run scripts/init_vector_store.py (from apps/backend/)"""
from app.vector_store.milvus_client import ensure_collection

if __name__ == "__main__":
    ensure_collection()
