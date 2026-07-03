"""Retrieve-then-generate RAG query pipeline: embed the query, search Milvus
Lite for relevant chunks, and ask the LLM to answer using those chunks."""
from dataclasses import dataclass

from app.core.config import settings
from app.core.openai_client import get_client
from app.ingestion.embedder import embed_texts
from app.vector_store.milvus_client import search

SYSTEM_PROMPT = (
    "You are a helpful assistant. Prefer the provided context when it's "
    "relevant to the question. If the context doesn't contain the answer, "
    "fall back on your own general knowledge instead of refusing to answer."
)


@dataclass
class RagResult:
    answer: str
    sources: list[dict]


def build_prompt(query: str, chunks: list[dict]) -> list[dict]:
    context = "\n\n".join(
        f"[{i + 1}] (source: {chunk['source']})\n{chunk['text']}" for i, chunk in enumerate(chunks)
    )
    user_content = f"Context:\n{context}\n\nQuestion: {query}" if chunks else query
    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]


def answer_query(query: str, top_k: int | None = None) -> RagResult:
    top_k = top_k or settings.top_k

    query_vector = embed_texts([query])[0]
    chunks = search(query_vector, top_k=top_k)

    messages = build_prompt(query, chunks)
    response = get_client().chat.completions.create(model=settings.llm_model, messages=messages)
    answer = response.choices[0].message.content

    sources = [
        {"source": chunk["source"], "chunk_index": chunk["chunk_index"], "score": chunk["score"]}
        for chunk in chunks
    ]
    return RagResult(answer=answer, sources=sources)
