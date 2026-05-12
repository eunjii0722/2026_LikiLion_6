import os
import uuid
from datetime import datetime, timedelta, timezone
from googleapiclient.discovery import build
from services.google_auth import get_credentials

def register_watch(file_id: str, workflow_id: str) -> dict:
    creds = get_credentials()
    service = build("drive", "v3", credentials=creds)

    channel_id = str(uuid.uuid4())
    expiration_ms = int(
        (datetime.now(timezone.utc) + timedelta(days=7)).timestamp() * 1000
    )

    body = {
        "id": channel_id,
        "type": "web_hook",
        "address": f"{os.getenv('NGROK_URL')}/webhook/google",
        "expiration": expiration_ms,
        "token": workflow_id,
    }

    service.files().watch(fileId=file_id, body=body).execute()

    expiration_iso = datetime.fromtimestamp(
        expiration_ms / 1000, timezone.utc
    ).isoformat()

    return {"channel_id": channel_id, "expiration": expiration_iso}
