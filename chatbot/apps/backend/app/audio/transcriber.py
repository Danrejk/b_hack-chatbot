"""Speech-to-text via the OpenAI audio transcriptions API."""
from app.core.config import settings
from app.core.openai_client import get_client


def transcribe_audio(file_bytes: bytes, filename: str, content_type: str | None) -> str:
    transcript = get_client().audio.transcriptions.create(
        model=settings.stt_model,
        file=(filename, file_bytes, content_type or "application/octet-stream"),
    )
    return transcript.text
