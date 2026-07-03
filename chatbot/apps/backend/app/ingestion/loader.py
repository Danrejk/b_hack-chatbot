"""Loads raw text documents from the knowledge base directory."""
from pathlib import Path

from app.core.config import settings

EXTENSIONS = ("*.md", "*.txt")


def load_documents(directory: Path | None = None) -> list[dict]:
    """Returns [{"source": relative filename, "text": file contents}, ...]"""
    directory = directory or settings.knowledge_base_dir

    documents = []
    for pattern in EXTENSIONS:
        for path in sorted(directory.rglob(pattern)):
            text = path.read_text(encoding="utf-8").strip()
            if text:
                documents.append({"source": str(path.relative_to(directory)), "text": text})
    return documents
