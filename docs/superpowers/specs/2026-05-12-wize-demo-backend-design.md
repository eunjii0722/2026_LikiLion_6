# WIZE 데모 백엔드 설계

> 작성일: 2026-05-12 | 발표일: 2026-05-13
> 목적: 내일 시연용 바이브코딩 레퍼런스

---

## 범위

트리거: Google Forms 새 응답  
액션 1: Google Sheets 행 추가  
액션 2: Gmail 확인 메일 발송  
자연어 파싱: Claude API (claude-sonnet-4-6) Structured Output  
스택: FastAPI + SQLite + 사전 발급 Google 토큰 + 기존 목업 프론트

---

## 1. 프로젝트 구조

```
wize-demo/
├── main.py              # FastAPI 진입점
├── db.py                # SQLite 연결 + 테이블 초기화
├── models.py            # Pydantic 스키마
├── routes/
│   ├── parse.py         # POST /parse
│   ├── workflows.py     # POST /workflows, GET /workflows/{id}
│   └── webhook.py       # POST /webhook/google
├── services/
│   ├── claude.py        # 자연어 → workflow JSON
│   ├── google_sheets.py # 행 추가
│   ├── gmail.py         # 메일 발송
│   └── drive_watch.py   # files.watch 등록/갱신
├── .env
└── frontend/            # 기존 목업 (static serve)
```

**런타임 흐름**

```
프론트 → POST /parse       → Claude API → workflow JSON 미리보기 반환
프론트 → POST /workflows   → DB 저장 + Drive Push 등록
Google → POST /webhook/google → Sheets 추가 + Gmail 발송
```

---

## 2. API 엔드포인트

```
POST /parse
  body:  { "text": "수강 신청 오면 시트 정리하고 메일 보내줘" }
  res:   { "workflow": { trigger, actions[], dataMap } }

POST /workflows
  body:  { "title": "수강신청 관리", "origin_prompt": "...", "config": { ... } }
  res:   { "workflow_id": "uuid", "watch_expiration": "..." }
  side:  Drive Push 등록 (files.watch)

GET /workflows/{id}
  res:   워크플로우 상태 + 최근 실행 로그 5건

POST /webhook/google
  body:  Google Drive Push 알림 (헤더에 channel ID)
  side:  폼 응답 읽기 → Sheets 추가 → Gmail 발송 → 로그 저장
  res:   200 OK

GET /workflows/{id}/logs
  res:   실행 로그 목록
```

**환경변수 (.env)**

```
ANTHROPIC_API_KEY=
GOOGLE_REFRESH_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NGROK_URL=https://xxxx.ngrok.io   # 발표 당일 아침 갱신
```

---

## 3. DB 스키마

> ERD(`common/ERD.md`) 기반. 데모용이므로 `subscriptions`, `templates` 제외. SQLite 적용 (jsonb → TEXT).

```sql
-- 데모 단일 사용자 (사전 생성)
CREATE TABLE users (
  id          TEXT PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  name        TEXT,
  usage_count INTEGER DEFAULT 0,
  created_at  TEXT DEFAULT (datetime('now'))
);

-- Google OAuth 토큰 저장 (.env 대신 DB 보관 가능)
CREATE TABLE external_accounts (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  provider      TEXT,               -- 'google'
  token_data    TEXT,               -- refresh token (AES-256 암호화)
  account_email TEXT,
  updated_at    TEXT DEFAULT (datetime('now')),
  created_at    TEXT DEFAULT (datetime('now'))
);

CREATE TABLE workflows (
  id            TEXT PRIMARY KEY,
  user_id       TEXT REFERENCES users(id),
  title         TEXT NOT NULL,
  description   TEXT,
  is_active     INTEGER DEFAULT 1,
  origin_prompt TEXT,
  created_at    TEXT DEFAULT (datetime('now'))
);

-- 트리거 1개 + 액션 N개 (step_type: 'trigger' | 'action')
CREATE TABLE workflow_step (
  id          TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id),
  step_order  INTEGER,
  service     TEXT,               -- 'google_form' | 'google_sheets' | 'gmail'
  step_type   TEXT,               -- 'trigger' | 'action'
  config      TEXT                -- JSON (service별 구조 아래 참고)
);

CREATE TABLE execution_runs (
  id          TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id),
  status      TEXT,               -- 'success' | 'fail'
  started_at  TEXT DEFAULT (datetime('now')),
  summary     TEXT
);

CREATE TABLE step_logs (
  id          TEXT PRIMARY KEY,
  workflow_id TEXT REFERENCES workflows(id),
  run_id      TEXT REFERENCES execution_runs(id),
  step_id     TEXT REFERENCES workflow_step(id),
  status      TEXT,
  error_log   TEXT,
  executed_at TEXT DEFAULT (datetime('now'))
);
```

**config JSON 구조 (service별)**

```json
// service = "google_form" (trigger)
{
  "form_id": "1FAIpQLSe...",
  "linked_sheet_id": "1BxiM...",
  "watch_channel_id": "uuid",
  "watch_expiration": "2026-05-19T10:00:00Z"
}

// service = "google_sheets" (action)
{
  "sheet_id": "1BxiM...",
  "sheet_name": "수강신청",
  "row_template": ["{{name}}", "{{phone}}", "{{course}}", "{{submitted_at}}"]
}

// service = "gmail" (action)
{
  "to": "{{email}}",
  "subject": "수강신청이 접수되었습니다",
  "body": "{{name}}님, 수강신청이 완료되었습니다."
}
```

---

## 4. Claude 파싱 스키마

**Structured Output 응답 구조**

```python
{
  "trigger": {
    "service": "google_form",
    "form_id": str
  },
  "actions": [
    {
      "order": int,
      "service": "google_sheets" | "gmail",
      "config": {
        # google_sheets
        "sheet_id": str,
        "row_template": ["{{name}}", "{{email}}", "{{phone}}", "{{submitted_at}}"]
        # gmail
        "to": "{{email}}",
        "subject": str,
        "body": str
      }
    }
  ]
}
```

**System Prompt**

```
당신은 한국어 업무 설명을 자동화 워크플로우 JSON으로 변환합니다.
트리거는 google_form, 액션은 google_sheets와 gmail만 사용합니다.
필드명은 반드시 {{name}}, {{email}}, {{phone}}, {{submitted_at}} 중에서 씁니다.
의도가 불명확하면 actions 배열을 비워서 반환합니다.
```

---

## 5. 비기능 / 데모 주의사항

- Google OAuth refresh token은 `.env`에 사전 발급해서 저장 (OAuth UI 없음)
- Drive Push 채널은 `POST /workflows` 시점에 등록, 만료 7일
- ngrok URL은 발표 당일 아침 `.env` 갱신 + Drive Push 재등록 필요
- 수강생 개인정보는 서버 DB에 저장하지 않음 (로그에도 미포함)
- 액션 실패 시 `execution_logs`에 `status='fail'`, `error_msg` 기록
