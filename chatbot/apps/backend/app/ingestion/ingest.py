"""Orchestrates the ingestion pipeline: load -> chunk -> embed -> insert."""
from pathlib import Path

from app.ingestion.chunker import chunk_text
from app.ingestion.embedder import embed_texts
from app.ingestion.loader import load_documents
from app.vector_store.milvus_client import ensure_collection, insert_chunks


def run_ingestion(directory: Path | None = None) -> int:
    ensure_collection()

    documents = load_documents(directory)
    if not documents:
        print("No documents found in knowledge base directory - nothing to ingest.")
        return 0

    texts: list[str] = []
    payloads: list[dict] = []
    for document in documents:
        for index, chunk in enumerate(chunk_text(document["text"])):
            texts.append(chunk)
            payloads.append({"text": chunk, "source": document["source"], "chunk_index": index})

    vectors = embed_texts(texts)
    insert_chunks(vectors, payloads)

    print(f"Ingested {len(documents)} document(s) into {len(texts)} chunk(s).")
    return len(texts)


if __name__ == "__main__":
    run_ingestion()
