"""
Wraps Milvus Lite: the embedded, file-based mode of Milvus. Passing a local
file path (instead of a server URI like "http://host:19530") makes pymilvus
run Milvus in-process - no Docker, no server to manage. Same client API as
full Milvus, so swapping to a real Milvus deployment later is just a URI
change, not a rewrite.

Note: Milvus Lite runs on Linux and macOS, not native Windows - fine under
WSL2.
"""
from pymilvus import MilvusClient

from app.core.config import settings


def get_client() -> MilvusClient:
    settings.vector_db_path.parent.mkdir(parents=True, exist_ok=True)
    return MilvusClient(uri=str(settings.vector_db_path))


def ensure_collection(client: MilvusClient | None = None) -> None:
    """
    Creates the knowledge base collection if it doesn't exist yet.
    Uses dynamic fields so ingestion can attach metadata (source, chunk
    index, etc.) without a rigid schema - fine for an MVP, worth tightening
    once the metadata shape stabilizes.
    """
    client = client or get_client()
    name = settings.vector_collection_name

    if client.has_collection(collection_name=name):
        print(f"Collection '{name}' already exists")
        return

    client.create_collection(
        collection_name=name,
        dimension=settings.embedding_dim,
        auto_id=True,
        enable_dynamic_field=True,
    )
    print(f"Created collection '{name}' (dim={settings.embedding_dim})")


def insert_chunks(
    vectors: list[list[float]],
    payloads: list[dict],
    client: MilvusClient | None = None,
) -> None:
    """Insert embedded chunks. Each payload becomes dynamic fields on its row
    (e.g. source, chunk_index, text) alongside its vector."""
    client = client or get_client()
    data = [{"vector": vector, **payload} for vector, payload in zip(vectors, payloads)]
    client.insert(collection_name=settings.vector_collection_name, data=data)


def search(
    query_vector: list[float],
    top_k: int,
    client: MilvusClient | None = None,
) -> list[dict]:
    """Vector search for the closest chunks to query_vector, returned as
    plain dicts: {"text", "source", "chunk_index", "score"}."""
    client = client or get_client()
    # Milvus Lite doesn't keep a collection loaded across client instances,
    # so a fresh process needs to load it before it can be searched.
    client.load_collection(collection_name=settings.vector_collection_name)
    results = client.search(
        collection_name=settings.vector_collection_name,
        data=[query_vector],
        limit=top_k,
        output_fields=["text", "source", "chunk_index"],
    )

    hits = results[0] if results else []
    return [
        {
            "text": hit["entity"]["text"],
            "source": hit["entity"]["source"],
            "chunk_index": hit["entity"]["chunk_index"],
            "score": hit["distance"],
        }
        for hit in hits
    ]


if __name__ == "__main__":
    ensure_collection()
