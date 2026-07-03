"""Run with: uv run scripts/init_db.py (from apps/backend/)"""
from app.db.sqlite_init import init_db

if __name__ == "__main__":
    init_db()
