# RAG Chatbot Backend

This backend is an MVP retrieval-augmented generation (RAG) chatbot built for
a hackathon. It answers questions by retrieving relevant chunks from a
knowledge base and passing them to an LLM as context, rather than relying
purely on the model's built-in knowledge.

## Storage

- Conversations and messages are stored in SQLite, a lightweight file-based
  relational database that ships with Python's standard library.
- Document embeddings are stored in Milvus Lite, an embedded (in-process,
  file-based) mode of the Milvus vector database. It requires no Docker
  container or separate server process.

## Ingestion

Source documents are dropped into `data/knowledge_base/`. The ingestion
pipeline loads each document, splits it into overlapping text chunks,
embeds each chunk with an OpenAI embedding model, and stores the resulting
vectors in the Milvus Lite collection alongside metadata such as the source
filename and chunk index.

## Chat

When a user sends a chat message, the backend embeds the message, searches
Milvus Lite for the most similar chunks, and asks an OpenAI chat model to
answer the question using those chunks as context. The answer, along with
the list of source chunks used, is returned to the caller and persisted to
SQLite as part of the conversation history.
