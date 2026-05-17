import os
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/forms.responses.readonly",
]

def get_credentials() -> Credentials:
    try:
        creds = Credentials(
            token=None,
            refresh_token=os.getenv("GOOGLE_REFRESH_TOKEN"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=os.getenv("GOOGLE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
            scopes=SCOPES,
        )
        creds.refresh(Request())
        return creds
    except Exception as e:
        raise RuntimeError(f"Google 인증 실패: GOOGLE_REFRESH_TOKEN이 만료되었거나 잘못되었습니다. 원인: {e}")
