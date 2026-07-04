"""Reads the static user profile seed file. No auth/accounts yet, so this is
a single implicit user - read fresh each call (not cached) so editing the
seed file takes effect without restarting the server."""
import json

from app.core.config import settings


def get_user_profile() -> dict:
    if not settings.user_profile_path.exists():
        return {}
    return json.loads(settings.user_profile_path.read_text(encoding="utf-8"))
