"""Run with: uv run scripts/ingest_knowledge_base.py (from apps/backend/)"""
from app.ingestion.ingest import run_ingestion

if __name__ == "__main__":
    run_ingestion()
