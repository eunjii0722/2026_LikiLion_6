# WIZE 데모 백엔드 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 내일(2026-05-13) 발표용 — 한국어 자연어 입력 → Claude 파싱 → 구글 폼 트리거 → 구글 시트 + Gmail 실행까지 동작하는 FastAPI 백엔드

**Architecture:** FastAPI + SQLite 단일 서버. Google OAuth refresh token은 `.env`에 사전 발급. Drive Push Notification으로 구글 폼 응답을 실시간 감지하고 액션을 순서대로 실행.

**Tech Stack:** Python 3.11+, FastAPI, SQLite (sqlite3), anthropic SDK, google-api-python-client, google-auth, python-dotenv, uvicorn

---

## 파일 구조

```
wize-demo/
├── main.py                  # FastAPI 앱 + static serve
├── db.py                    # SQLite 연결 + 테이블 초기화
├── models.py                # Pydantic 요청/응답 스키마
├── routes/
│   ├── __init__.py
│   ├── parse.py             # POST /parse
│   ├── workflows.py         # POST /workflows, GET /workflows/{id}, GET /workflows/{id}/logs
│   └── webhook.py           # POST /webhook/google
├── services/
│   ├── __init__.py
│   ├── google_auth.py       # refresh token → access token
│   ├── claude.py            # 자연어 → workflow JSON
│   ├── drive_watch.py       # files.watch 등록
│   ├── google_sheets.py     # 행 추가 + 마지막 행 읽기
│   └── gmail.py             # 메일 발송
├── tests/
│   ├── test_template.py     # fill_template 단위 테스트
│   └── test_normalize.py    # normalize_row 단위 테스트
├── get_token.py             # 최초 1회 refresh token 발급 스크립트
├── .env.example
└── frontend/                # 기존 목업 (변경 없음)
```

---

## Task 1: 프로젝트 초기화 & 환경 설정

**Files:**
- Create: `wize-demo/requirements.txt`
- Create: `wize-demo/.env.example`
- Create: `wize-demo/get_token.py`

- [ ] **Step 1: requirements.txt 작성**

```
fastapi
uvicorn[standard]
anthropic
google-auth
google-auth-oauthlib
google-api-python-client
python-dotenv
pydantic
pytest
```

- [ ] **Step 2: 패키지 설치**

```bash
pip install -r requirements.txt
```

Expected: 에러 없이 설치 완료

- [ ] **Step 3: .env.example 작성**

```
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NGROK_URL=https://xxxx.ngrok.io
DEMO_USER_ID=demo-user-001
```

- [ ] **Step 4: get_token.py 작성** (최초 1회 refresh token 발급용)

```python
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/forms.responses.readonly",
]

flow = InstalledAppFlow.from_client_secrets_file("client_secret.json", SCOPES)
creds = flow.run_local_server(port=0)
print("GOOGLE_REFRESH_TOKEN =", creds.refresh_token)
```

- [ ] **Step 5: Google Cloud Console에서 OAuth 자격증명 다운로드**

Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs  
→ Download JSON → 저장 이름: `client_secret.json`  
활성화 필요한 API: Google Drive API, Google Sheets API, Gmail API

- [ ] **Step 6: refresh token 발급**

```bash
python get_token.py
```

Expected: 브라우저 열림 → Google 로그인 → 콘솔에 `GOOGLE_REFRESH_TOKEN = 1//...` 출력  
→ `.env` 파일에 붙여넣기

- [ ] **Step 7: .env 작성 (실제 값으로)**

```bash
cp .env.example .env
# .env를 열어 실제 값 입력
```

- [ ] **Step 8: 커밋**

```bash
git add requirements.txt .env.example get_token.py
git commit -m "feat: project init and env setup"
```

---

## Task 2: DB 초기화

**Files:**
- Create: `wize-demo/db.py`

- [ ] **Step 1: db.py 작성**

```python
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = "wize.db"

def init():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id          TEXT PRIMARY KEY,
                email       TEXT UNIQUE NOT NULL,
                name        TEXT,
                usage_count INTEGER DEFAULT 0,
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS external_accounts (
                id            TEXT PRIMARY KEY,
                user_id       TEXT REFERENCES users(id),
                provider      TEXT,
                token_data    TEXT,
                account_email TEXT,
                updated_at    TEXT DEFAULT (datetime('now')),
                created_at    TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS workflows (
                id            TEXT PRIMARY KEY,
                user_id       TEXT REFERENCES users(id),
                title         TEXT NOT NULL,
                description   TEXT,
                is_active     INTEGER DEFAULT 1,
                origin_prompt TEXT,
                created_at    TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS workflow_step (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                step_order  INTEGER,
                service     TEXT,
                step_type   TEXT,
                config      TEXT
            );

            CREATE TABLE IF NOT EXISTS execution_runs (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                status      TEXT,
                started_at  TEXT DEFAULT (datetime('now')),
                summary     TEXT
            );

            CREATE TABLE IF NOT EXISTS step_logs (
                id          TEXT PRIMARY KEY,
                workflow_id TEXT REFERENCES workflows(id),
                run_id      TEXT REFERENCES execution_runs(id),
                step_id     TEXT REFERENCES workflow_step(id),
                status      TEXT,
                error_log   TEXT,
                executed_at TEXT DEFAULT (datetime('now'))
            );
        """)
        conn.execute(
            "INSERT OR IGNORE INTO users (id, email, name) VALUES (?, ?, ?)",
            (os.getenv("DEMO_USER_ID", "demo-user-001"), "demo@wize.app", "데모")
        )

@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()
```

- [ ] **Step 2: DB 초기화 확인**

```bash
python -c "from dotenv import load_dotenv; load_dotenv(); import db; db.init(); print('OK')"
```

Expected: `OK` 출력, `wize.db` 파일 생성됨

- [ ] **Step 3: 커밋**

```bash
git add db.py
git commit -m "feat: sqlite db init with all tables"
```

---

## Task 3: Pydantic 모델

**Files:**
- Create: `wize-demo/models.py`

- [ ] **Step 1: models.py 작성**

```python
from pydantic import BaseModel
from typing import List, Literal

class ParseRequest(BaseModel):
    text: str

class TriggerConfig(BaseModel):
    service: Literal["google_form"]
    form_id: str = ""

class ActionStep(BaseModel):
    order: int
    service: Literal["google_sheets", "gmail"]
    config: dict

class WorkflowDraft(BaseModel):
    trigger: TriggerConfig
    actions: List[ActionStep]

class ParseResponse(BaseModel):
    workflow: WorkflowDraft

class CreateWorkflowRequest(BaseModel):
    title: str
    origin_prompt: str
    trigger_config: dict   # form_id, linked_sheet_id
    actions: List[ActionStep]

class WorkflowResponse(BaseModel):
    workflow_id: str
    watch_expiration: str
```

- [ ] **Step 2: 커밋**

```bash
git add models.py
git commit -m "feat: pydantic request/response models"
```

---

## Task 4: Google Auth 서비스

**Files:**
- Create: `wize-demo/services/__init__.py`
- Create: `wize-demo/services/google_auth.py`

- [ ] **Step 1: services/__init__.py 생성 (빈 파일)**

```bash
touch services/__init__.py
```

- [ ] **Step 2: services/google_auth.py 작성**

```python
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
```

- [ ] **Step 3: 토큰 갱신 확인**

```bash
python -c "
from dotenv import load_dotenv; load_dotenv()
from services.google_auth import get_credentials
creds = get_credentials()
print('token:', creds.token[:20], '...')
"
```

Expected: `token: ya29.a0...` 형태 출력

- [ ] **Step 4: 커밋**

```bash
git add services/__init__.py services/google_auth.py
git commit -m "feat: google auth credential refresh"
```

---

## Task 5: Claude 파싱 서비스 + /parse 엔드포인트

**Files:**
- Create: `wize-demo/services/claude.py`
- Create: `wize-demo/routes/__init__.py`
- Create: `wize-demo/routes/parse.py`

- [ ] **Step 1: services/claude.py 작성**

```python
import os
import anthropic

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

SYSTEM = """당신은 한국어 업무 설명을 자동화 워크플로우 JSON으로 변환합니다.
트리거는 google_form, 액션은 google_sheets와 gmail만 사용합니다.
필드명은 반드시 {{name}}, {{email}}, {{phone}}, {{submitted_at}} 중에서 씁니다.
의도가 불명확하면 actions 배열을 비워서 반환합니다."""

TOOLS = [
    {
        "name": "create_workflow",
        "description": "워크플로우 구조 생성",
        "input_schema": {
            "type": "object",
            "properties": {
                "trigger": {
                    "type": "object",
                    "properties": {
                        "service": {"type": "string", "enum": ["google_form"]},
                        "form_id": {"type": "string", "default": ""}
                    },
                    "required": ["service"]
                },
                "actions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "order": {"type": "integer"},
                            "service": {"type": "string", "enum": ["google_sheets", "gmail"]},
                            "config": {"type": "object"}
                        },
                        "required": ["order", "service", "config"]
                    }
                }
            },
            "required": ["trigger", "actions"]
        }
    }
]

def parse_natural_language(text: str) -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=SYSTEM,
        tools=TOOLS,
        tool_choice={"type": "tool", "name": "create_workflow"},
        messages=[{"role": "user", "content": text}]
    )
    for block in response.content:
        if block.type == "tool_use":
            return block.input
    return {"trigger": {"service": "google_form", "form_id": ""}, "actions": []}
```

- [ ] **Step 2: routes/__init__.py 생성 (빈 파일)**

```bash
touch routes/__init__.py
```

- [ ] **Step 3: routes/parse.py 작성**

```python
from fastapi import APIRouter
from models import ParseRequest
from services.claude import parse_natural_language

router = APIRouter()

@router.post("/parse")
def parse(req: ParseRequest):
    workflow = parse_natural_language(req.text)
    return {"workflow": workflow}
```

- [ ] **Step 4: 파싱 스모크 테스트**

임시 main.py로 서버 기동 후 curl 테스트:

```bash
# 임시 확인
python -c "
from dotenv import load_dotenv; load_dotenv()
from services.claude import parse_natural_language
result = parse_natural_language('구글 폼으로 수강 신청 오면 시트에 정리하고 메일 보내줘')
import json; print(json.dumps(result, ensure_ascii=False, indent=2))
"
```

Expected: `trigger.service = google_form`, `actions`에 `google_sheets`와 `gmail` 포함

- [ ] **Step 5: 커밋**

```bash
git add services/claude.py routes/__init__.py routes/parse.py
git commit -m "feat: claude nlp parsing and /parse endpoint"
```

---

## Task 6: Drive Watch 서비스

**Files:**
- Create: `wize-demo/services/drive_watch.py`

- [ ] **Step 1: services/drive_watch.py 작성**

```python
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
        "token": workflow_id,   # webhook에서 workflow 식별에 사용
    }

    service.files().watch(fileId=file_id, body=body).execute()

    expiration_iso = datetime.fromtimestamp(
        expiration_ms / 1000, timezone.utc
    ).isoformat()

    return {"channel_id": channel_id, "expiration": expiration_iso}
```

> **주의:** `NGROK_URL`이 `.env`에 정확히 설정되어 있어야 합니다. 발표 당일 아침 ngrok 재시작 후 URL 교체 필요.

- [ ] **Step 2: 커밋**

```bash
git add services/drive_watch.py
git commit -m "feat: google drive push notification registration"
```

---

## Task 7: Google Sheets 서비스

**Files:**
- Create: `wize-demo/services/google_sheets.py`

- [ ] **Step 1: services/google_sheets.py 작성**

```python
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
```

> `get_last_row`는 구글 폼 응답 시트(`Form Responses 1`)에서 마지막 행을 읽습니다.  
> 폼 응답 시트의 시트 이름이 다를 경우 `sheet_name` 파라미터로 조정하세요.

- [ ] **Step 2: 커밋**

```bash
git add services/google_sheets.py
git commit -m "feat: google sheets append and read"
```

---

## Task 8: Gmail 서비스

**Files:**
- Create: `wize-demo/services/gmail.py`

- [ ] **Step 1: services/gmail.py 작성**

```python
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
```

- [ ] **Step 2: 메일 발송 확인 (선택)**

```bash
python -c "
from dotenv import load_dotenv; load_dotenv()
from services.gmail import send_email
send_email('your@email.com', '테스트', 'WIZE 메일 발송 테스트')
print('sent')
"
```

Expected: 수신 이메일에 메일 도착 확인

- [ ] **Step 3: 커밋**

```bash
git add services/gmail.py
git commit -m "feat: gmail send service"
```

---

## Task 9: 단위 테스트 (template 함수)

**Files:**
- Create: `wize-demo/tests/__init__.py`
- Create: `wize-demo/tests/test_template.py`
- Create: `wize-demo/tests/test_normalize.py`

webhook.py에서 쓸 두 함수를 먼저 `routes/webhook.py`에 작성하고 테스트합니다.

- [ ] **Step 1: routes/webhook.py에 헬퍼 함수 작성 (라우터 등록 전)**

```python
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
```

- [ ] **Step 2: tests/__init__.py 생성**

```bash
touch tests/__init__.py
```

- [ ] **Step 3: tests/test_template.py 작성**

```python
from routes.webhook import fill_template

def test_fill_single_variable():
    result = fill_template("{{name}}님 안녕하세요", {"name": "김철수"})
    assert result == "김철수님 안녕하세요"

def test_fill_multiple_variables():
    result = fill_template("{{name}}, {{email}}", {"name": "김철수", "email": "kim@test.com"})
    assert result == "김철수, kim@test.com"

def test_fill_missing_variable_stays():
    result = fill_template("{{name}} {{phone}}", {"name": "김철수"})
    assert result == "김철수 {{phone}}"

def test_fill_none_value_becomes_empty():
    result = fill_template("{{name}}", {"name": None})
    assert result == ""
```

- [ ] **Step 4: tests/test_normalize.py 작성**

```python
from routes.webhook import normalize_row

def test_korean_name_column():
    result = normalize_row({"이름": "김철수"})
    assert result["name"] == "김철수"

def test_korean_email_column():
    result = normalize_row({"이메일": "kim@test.com"})
    assert result["email"] == "kim@test.com"

def test_submitted_at_added():
    result = normalize_row({})
    assert "submitted_at" in result

def test_unknown_column_lowercased():
    result = normalize_row({"수강 레벨": "초급"})
    assert "수강_레벨" in result
```

- [ ] **Step 5: 테스트 실행**

```bash
pytest tests/ -v
```

Expected:
```
tests/test_template.py::test_fill_single_variable PASSED
tests/test_template.py::test_fill_multiple_variables PASSED
tests/test_template.py::test_fill_missing_variable_stays PASSED
tests/test_template.py::test_fill_none_value_becomes_empty PASSED
tests/test_normalize.py::test_korean_name_column PASSED
tests/test_normalize.py::test_korean_email_column PASSED
tests/test_normalize.py::test_submitted_at_added PASSED
tests/test_normalize.py::test_unknown_column_lowercased PASSED
8 passed
```

- [ ] **Step 6: 커밋**

```bash
git add routes/webhook.py tests/__init__.py tests/test_template.py tests/test_normalize.py
git commit -m "test: template fill and column normalize unit tests"
```

---

## Task 10: 웹훅 핸들러 완성

**Files:**
- Modify: `wize-demo/routes/webhook.py`

- [ ] **Step 1: webhook.py에 Drive Push 핸들러 추가**

```python
# routes/webhook.py (Task 9에서 작성한 헬퍼 함수 아래에 추가)

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
                row = [fill_template(cell, data) for cell in config["row_template"]]
                google_sheets.append_row(config["sheet_id"], config["sheet_name"], row)

            elif step["service"] == "gmail":
                to = fill_template(config["to"], data)
                subject = fill_template(config["subject"], data)
                body = fill_template(config["body"], data)
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
```

- [ ] **Step 2: 커밋**

```bash
git add routes/webhook.py
git commit -m "feat: drive push webhook handler — sheets + gmail execution"
```

---

## Task 11: 워크플로우 라우터

**Files:**
- Create: `wize-demo/routes/workflows.py`

- [ ] **Step 1: routes/workflows.py 작성**

```python
from fastapi import APIRouter
from models import CreateWorkflowRequest
import uuid, json
import db
from services.drive_watch import register_watch

router = APIRouter()

@router.post("/workflows")
def create_workflow(req: CreateWorkflowRequest):
    workflow_id = str(uuid.uuid4())
    user_id = "demo-user-001"

    with db.get_conn() as conn:
        conn.execute(
            "INSERT INTO workflows (id, user_id, title, origin_prompt, is_active) VALUES (?, ?, ?, ?, 1)",
            (workflow_id, user_id, req.title, req.origin_prompt),
        )
        trigger_step_id = str(uuid.uuid4())
        conn.execute(
            "INSERT INTO workflow_step (id, workflow_id, step_order, service, step_type, config) VALUES (?, ?, 0, 'google_form', 'trigger', ?)",
            (trigger_step_id, workflow_id, json.dumps(req.trigger_config)),
        )
        for action in sorted(req.actions, key=lambda a: a.order):
            conn.execute(
                "INSERT INTO workflow_step (id, workflow_id, step_order, service, step_type, config) VALUES (?, ?, ?, ?, 'action', ?)",
                (str(uuid.uuid4()), workflow_id, action.order, action.service, json.dumps(action.config)),
            )

    linked_sheet_id = req.trigger_config.get("linked_sheet_id")
    watch_result = register_watch(linked_sheet_id, workflow_id)

    updated_config = {**req.trigger_config, **{
        "watch_channel_id": watch_result["channel_id"],
        "watch_expiration": watch_result["expiration"],
    }}
    with db.get_conn() as conn:
        conn.execute(
            "UPDATE workflow_step SET config = ? WHERE id = ?",
            (json.dumps(updated_config), trigger_step_id),
        )

    return {"workflow_id": workflow_id, "watch_expiration": watch_result["expiration"]}

@router.get("/workflows/{workflow_id}")
def get_workflow(workflow_id: str):
    with db.get_conn() as conn:
        workflow = conn.execute(
            "SELECT * FROM workflows WHERE id = ?", (workflow_id,)
        ).fetchone()
        logs = conn.execute(
            "SELECT * FROM execution_runs WHERE workflow_id = ? ORDER BY started_at DESC LIMIT 5",
            (workflow_id,),
        ).fetchall()
    return {"workflow": dict(workflow), "logs": [dict(l) for l in logs]}

@router.get("/workflows/{workflow_id}/logs")
def get_logs(workflow_id: str):
    with db.get_conn() as conn:
        runs = conn.execute(
            "SELECT * FROM execution_runs WHERE workflow_id = ? ORDER BY started_at DESC",
            (workflow_id,),
        ).fetchall()
    return {"logs": [dict(r) for r in runs]}
```

- [ ] **Step 2: 커밋**

```bash
git add routes/workflows.py
git commit -m "feat: workflow create, get, logs endpoints"
```

---

## Task 12: main.py 조립 + 서버 기동

**Files:**
- Create: `wize-demo/main.py`

- [ ] **Step 1: main.py 작성**

```python
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import db
from routes import parse, workflows, webhook

app = FastAPI(title="WIZE Demo")
db.init()

app.include_router(parse.router)
app.include_router(workflows.router)
app.include_router(webhook.router)

app.mount("/", StaticFiles(directory="frontend", html=True), name="static")
```

- [ ] **Step 2: 서버 기동**

```bash
uvicorn main:app --reload --port 8000
```

Expected: `Uvicorn running on http://127.0.0.1:8000`

- [ ] **Step 3: API 문서 확인**

브라우저에서 `http://localhost:8000/docs` 열기  
Expected: `/parse`, `/workflows`, `/webhook/google`, `/workflows/{workflow_id}`, `/workflows/{workflow_id}/logs` 전부 표시

- [ ] **Step 4: ngrok 기동**

```bash
ngrok http 8000
```

Expected: `https://xxxx.ngrok.io` URL 출력 → `.env`의 `NGROK_URL` 업데이트

- [ ] **Step 5: 커밋**

```bash
git add main.py
git commit -m "feat: fastapi app assembly and static frontend serve"
```

---

## Task 13: 엔드투엔드 데모 흐름 확인

발표 전 최종 확인 체크리스트.

- [ ] **Step 1: /parse 테스트**

```bash
curl -X POST http://localhost:8000/parse \
  -H "Content-Type: application/json" \
  -d '{"text": "구글 폼으로 수강 신청 오면 시트에 정리하고 확인 메일 보내줘"}'
```

Expected: `trigger.service = google_form`, `actions`에 `google_sheets`와 `gmail` 포함된 JSON

- [ ] **Step 2: 구글 폼 + 연결 시트 ID 확인**

- 테스트용 구글 폼 생성
- 폼 응답 연결 시트 생성 (폼 설정 → 응답 → 스프레드시트에서 보기)
- 연결 시트 URL에서 `spreadsheetId` 추출: `https://docs.google.com/spreadsheets/d/{spreadsheetId}/edit`

- [ ] **Step 3: /workflows 테스트 (워크플로우 생성 + Drive Push 등록)**

```bash
curl -X POST http://localhost:8000/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수강신청 관리",
    "origin_prompt": "구글 폼으로 수강 신청 오면 시트에 정리하고 메일 보내줘",
    "trigger_config": {
      "form_id": "YOUR_FORM_ID",
      "linked_sheet_id": "YOUR_LINKED_SHEET_ID"
    },
    "actions": [
      {
        "order": 1,
        "service": "google_sheets",
        "config": {
          "sheet_id": "YOUR_LINKED_SHEET_ID",
          "sheet_name": "수강신청",
          "row_template": ["{{name}}", "{{email}}", "{{phone}}", "{{submitted_at}}"]
        }
      },
      {
        "order": 2,
        "service": "gmail",
        "config": {
          "to": "{{email}}",
          "subject": "수강신청이 접수되었습니다",
          "body": "{{name}}님, 수강신청이 완료되었습니다."
        }
      }
    ]
  }'
```

Expected: `{"workflow_id": "...", "watch_expiration": "2026-05-19T..."}`

- [ ] **Step 4: 구글 폼에 테스트 응답 제출**

폼에 이름/이메일/전화번호 입력 후 제출  
Expected: 30초 이내에
- 구글 시트에 행 추가됨
- 입력한 이메일로 확인 메일 수신

- [ ] **Step 5: 로그 확인**

```bash
curl http://localhost:8000/workflows/{workflow_id}/logs
```

Expected: `{"logs": [{"status": "success", ...}]}`

---

## 발표 당일 아침 체크리스트

- [ ] ngrok 재시작 → 새 URL 확인
- [ ] `.env`의 `NGROK_URL` 업데이트
- [ ] `uvicorn main:app --reload --port 8000` 기동
- [ ] `POST /workflows`로 Drive Push 재등록 (기존 것은 만료됨)
- [ ] 테스트 폼 응답 1개 제출 → 정상 동작 확인
