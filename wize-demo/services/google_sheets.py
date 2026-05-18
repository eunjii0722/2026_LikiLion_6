from googleapiclient.discovery import build
from services.google_auth import get_credentials

def create_sheet(title: str, headers: list[str] | None = None) -> dict:
    if headers is None:
        headers = ["제출일", "이름", "이메일", "연락처", "신청 과정"]
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)

    spreadsheet = service.spreadsheets().create(
        body={
            "properties": {"title": title},
            "sheets": [{"properties": {"title": title}}],
        },
        fields="spreadsheetId,spreadsheetUrl,sheets/properties/sheetId",
    ).execute()

    sheet_id = spreadsheet["spreadsheetId"]
    grid_id = spreadsheet["sheets"][0]["properties"]["sheetId"]

    # 헤더 행 추가
    service.spreadsheets().values().update(
        spreadsheetId=sheet_id,
        range=f"{title}!A1",
        valueInputOption="USER_ENTERED",
        body={"values": [headers]},
    ).execute()

    # 헤더 행 굵게 + 배경색
    service.spreadsheets().batchUpdate(
        spreadsheetId=sheet_id,
        body={
            "requests": [{
                "repeatCell": {
                    "range": {"sheetId": grid_id, "startRowIndex": 0, "endRowIndex": 1},
                    "cell": {
                        "userEnteredFormat": {
                            "textFormat": {"bold": True},
                            "backgroundColor": {"red": 0.85, "green": 0.92, "blue": 0.85},
                        }
                    },
                    "fields": "userEnteredFormat(textFormat,backgroundColor)",
                }
            }]
        },
    ).execute()

    return {
        "sheet_id": sheet_id,
        "sheet_url": spreadsheet["spreadsheetUrl"],
        "sheet_name": title,
    }

def append_row(sheet_id: str, sheet_name: str, row: list):
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)
    service.spreadsheets().values().append(
        spreadsheetId=sheet_id,
        range=f"{sheet_name}!A:Z",
        valueInputOption="USER_ENTERED",
        body={"values": [row]},
    ).execute()

def get_last_row(sheet_id: str, sheet_name: str | None = None) -> dict:
    creds = get_credentials()
    service = build("sheets", "v4", credentials=creds)

    if sheet_name is None:
        meta = service.spreadsheets().get(spreadsheetId=sheet_id).execute()
        candidates = ["양식 응답 1", "Form Responses 1"]
        all_titles = [s["properties"]["title"] for s in meta.get("sheets", [])]
        sheet_name = next(
            (t for t in all_titles if any(c.lower() in t.lower() for c in ["양식 응답", "form responses"])),
            all_titles[0] if all_titles else "Form Responses 1",
        )

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
