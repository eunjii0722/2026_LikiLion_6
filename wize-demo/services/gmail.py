import base64
from email.mime.text import MIMEText
from googleapiclient.discovery import build
from services.google_auth import get_credentials

def send_email(to: str, subject: str, body: str):
    creds = get_credentials()
    service = build("gmail", "v1", credentials=creds)
    message = MIMEText(body, "plain", "utf-8")
    message["to"] = to
    message["subject"] = subject
    raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
    service.users().messages().send(userId="me", body={"raw": raw}).execute()
