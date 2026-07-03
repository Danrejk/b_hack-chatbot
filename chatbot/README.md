# rag-chatbot

MVP RAG chatbot. Building in phases - this is **Phase 0: skeleton infra**.

## What's here

- `apps/backend/` - Python backend project (uv-managed)
  - `app/core/config.py` - all settings, loaded from `.env`
  - `app/db/` - SQLite schema for conversations/messages
  - `app/vector_store/` - Milvus Lite client (embedded, file-based, no Docker)
- `data/knowledge_base/` - drop source documents here for later ingestion (Phase 1)

## What's intentionally NOT here yet

No FastAPI app, no RAG logic, no React Native client, no auth, no tests.
Those come in later phases - this step only proves the storage layer works.

## Setup

```bash
cd apps/backend
uv sync
cp .env.example .env
# edit .env and set OPENAI_API_KEY

uv run scripts/init_db.py
uv run scripts/init_vector_store.py
```

If both commands print a success line with no errors, Phase 0 is done:
you have a working SQLite database and a working vector collection,
both as plain files under `apps/backend/data/` - nothing to run, nothing
to tear down.

## Why Milvus Lite instead of a Milvus Docker setup

Milvus Lite is the embedded mode of Milvus - same `pymilvus` client API,
but it runs in-process against a local file instead of a server. Zero
ops overhead for the MVP, and moving to a real Milvus deployment later
is a one-line URI change in `.env`, not a rewrite.
