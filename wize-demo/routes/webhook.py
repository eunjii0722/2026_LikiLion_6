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
        template = template.replace(f"{{{key}}}", str(value or ""))
    return template

def normalize_row(raw: dict) -> dict:
    result = {"submitted_at": datetime.now().strftime("%Y-%m-%d %H:%M")}
    for k, v in raw.items():
        normalized_key = COLUMN_MAP.get(k, k.lower().replace(" ", "_"))
        result[normalized_key] = v
    return result

@router.post("/webhook/google")
async def google_webhook(request: Request):
    # Google이 token 헤더로 workflow_id를 전달
    workflow_id = request.headers.get("X-Goog-Channel-Token")
    if not workflow_id:
        return {"ok": True}

    with db.get_conn() as conn:
        workflow = conn.execute(
            "SELECT * FROM workflows WHERE id = ? AND is_active = 1",
            (workflow_id,),
        ).fetchone()
        if not workflow:
            return {"ok": True}
        steps = conn.execute(
            "SELECT * FROM workflow_step WHERE workflow_id = ? ORDER BY step_order",
            (workflow_id,),
        ).fetchall()

    trigger_step = next((s for s in steps if s["step_type"] == "trigger"), None)
    if not trigger_step:
        return {"ok": True}

    trigger_config = json.loads(trigger_step["config"])
    linked_sheet_id = trigger_config.get("linked_sheet_id")

    raw_data = google_sheets.get_last_row(linked_sheet_id)
    data = normalize_row(raw_data)
    # 한국어 변수명 alias 추가 (프론트엔드 템플릿 {이름}, {신청 과정} 지원)
    data["이름"] = data.get("name", "")
    data["이메일"] = data.get("email", "")
    data["연락처"] = data.get("phone", "")
    data["신청 과정"] = data.get("course", data.get("신청_과정", ""))

    run_id = str(uuid.uuid4())
    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO execution_runs (id, workflow_id, status, started_at) VALUES (?, ?, 'running', datetime('now'))",
            (run_id, workflow_id),
        )

    errors = []
    for step in steps:
        if step["step_type"] == "trigger":
            continue

        config = json.loads(step["config"])
        step_status = "success"
        error_msg = None

        try:
            if step["service"] == "google_sheets":
                row_template = config.get("row_template") or ["{name}", "{email}", "{phone}", "{submitted_at}"]
                sheet_id = config.get("sheet_id") or linked_sheet_id
                sheet_name = config.get("sheet_name") or "Sheet1"
                row = [fill_template(cell, data) for cell in row_template]
                google_sheets.append_row(sheet_id, sheet_name, row)

            elif step["service"] == "gmail":
                to = fill_template(config.get("to", "{email}"), data)
                subject = fill_template(config.get("subject", "신청이 완료되었습니다"), data)
                body_template = config.get("body_template") or config.get("body", "안녕하세요 {name}님,\n신청이 완료되었습니다.")
                body = fill_template(body_template, data)
                gmail.send_email(to, subject, body)

        except Exception as e:
            step_status = "fail"
            error_msg = str(e)
            errors.append(error_msg)

        with db.get_conn() as conn:
            conn.execute(
                "INSERT INTO step_logs (id, workflow_id, run_id, step_id, status, error_log, executed_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
                (str(uuid.uuid4()), workflow_id, run_id, step["id"], step_status, error_msg),
            )

    final_status = "fail" if errors else "success"
    with db.get_conn() as conn:
        conn.execute(
            "UPDATE execution_runs SET status = ? WHERE id = ?",
            (final_status, run_id),
        )

    return {"ok": True}
