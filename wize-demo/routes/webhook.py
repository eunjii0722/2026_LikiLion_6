from fastapi import APIRouter, Request
import json, uuid
from datetime import datetime
import db
from services import google_sheets, gmail

router = APIRouter()

COLUMN_MAP = {
    "이름": "name", "성명": "name", "name": "name",
    "이메일": "email", "email": "email", "이메일 주소": "email",
    "전화": "phone", "연락처": "phone", "전화번호": "phone", "phone": "phone",
    "수강 과목": "course", "과목": "course", "수강과목": "course",
}

def fill_template(template: str, data: dict) -> str:
    for key, value in data.items():
        template = template.replace(f"{{{{{key}}}}}", str(value or ""))
    return template

def normalize_row(raw: dict) -> dict:
    result = {"submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M")}
    for k, v in raw.items():
        normalized_key = COLUMN_MAP.get(k, k.lower().replace(" ", "_"))
        result[normalized_key] = v
    return result
