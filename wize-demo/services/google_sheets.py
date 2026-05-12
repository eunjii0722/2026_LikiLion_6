from googleapiclient.discovery import build
from services.google_auth import get_credentials

def append_row(sheet_id: str, sheet_name: str, row: list):
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)
    service.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=f"{sheet_name}!A:Z",
        valueInputOption="USER_ENTERED",
        body={"values": [row]},
    ).execute()

def get_last_row(sheet_id: str, sheet_name: str = "Form Responses 1") -> dict:
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)
    result = service.spreadsheets().values().get(
        spreadsheetId=sheet_id,
        range=f"{sheet_name}!A1:Z",
    ).execute()
    values = result.get("values", [])
    if len(values) < 2:
        return {}
    headers = values[0]
    last_row = values[-1]
    return dict(zip(headers, last_row))
