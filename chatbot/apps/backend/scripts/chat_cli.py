"""Interactive terminal client for the chat API.

Run with (from apps/backend/, with the API server already running):
    uv run scripts/chat_cli.py
"""
import json
import urllib.error
import urllib.request

API_URL = "http://localhost:8000/chat"


def send_message(message: str, conversation_id: str | None) -> dict:
    payload = {"message": message}
    if conversation_id:
        payload["conversation_id"] = conversation_id

    request = urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(request) as response:
        return json.loads(response.read())


def main() -> None:
    conversation_id = None
    print("Chat with the RAG backend. Type 'exit' or Ctrl+C to quit.\n")

    while True:
        try:
            message = input("you> ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            break

        if not message or message.lower() in {"exit", "quit"}:
            break

        try:
            result = send_message(message, conversation_id)
        except urllib.error.URLError as error:
            print(f"Could not reach the API at {API_URL} - is uvicorn running? ({error})\n")
            continue

        conversation_id = result["conversation_id"]
        print(f"bot> {result['answer']}")
        if result["sources"]:
            sources = ", ".join(f"{s['source']}#{s['chunk_index']}" for s in result["sources"])
            print(f"     sources: {sources}")
        print()


if __name__ == "__main__":
    main()
