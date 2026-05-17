# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**WIZE Demo Backend** — FastAPI 서버로 한국어 자연어 입력을 Claude API로 파싱해 워크플로우를 생성하고, Google Drive Push Notification으로 구글 폼 응답을 실시간 감지해 구글 시트 추가 + Gmail 발송을 자동 실행하는 데모.

모든 구현은 `wize-demo/` 디렉토리 안에 있다.

## 프로젝트 관리 방법

### 브랜치 전략

- `main` 브랜치에 직접 push 금지 — 반드시 PR로만 머지
- 작업 브랜치 네이밍:
  - 기능 추가: `feat/<설명>` (예: `feat/email-preview`)
  - 버그 수정: `fix/<설명>` (예: `fix/url-validation`)
  - 문서: `docs/<설명>`

### 작업 흐름

```
1. main에서 브랜치 생성
   git checkout main && git pull origin main
   git checkout -b fix/<설명>

2. 작업 후 커밋
   git add <파일>
   git commit -m "fix: 설명"

3. 원격 push
   git push -u origin fix/<설명>

4. GitHub에서 PR 생성 → main 머지
   gh pr create --base main --head fix/<설명>

5. 재배포
   git checkout main && git pull origin main
   railway up
```

### 배포

- 플랫폼: Railway (수동 배포)
- 배포 URL: `https://wize-mvp-production.up.railway.app`
- 배포 명령: `railway up` (main 최신화 후 실행)
- 환경변수는 Railway 대시보드에서 관리

## Commands

```bash
# 의존성 설치
pip install -r wize-demo/requirements.txt

# 서버 실행 (wize-demo/ 디렉토리 안에서)
cd wize-demo && uvicorn main:app --reload --port 8000

# 테스트 실행
cd wize-demo && pytest tests/ -v

# 단일 테스트
cd wize-demo && pytest tests/test_template.py::test_fill_single_variable -v

# refresh token 최초 발급 (client_secret.json 필요)
cd wize-demo && python get_token.py
```

## Architecture

### Request Flow

```
프론트 → POST /parse       → services/claude.py   → Claude API (tool_use) → workflow JSON 반환
프론트 → POST /workflows   → routes/workflows.py  → DB 저장 → services/drive_watch.py → Drive Push 등록
Google → POST /webhook/google → routes/webhook.py → google_sheets.get_last_row() → normalize_row() → fill_template() → Sheets 추가 + Gmail 발송 → DB 로그
```

### Key Design Decisions

- **Google OAuth**: refresh token은 `.env`에 사전 발급 저장. `services/google_auth.py`의 `get_credentials()`가 호출마다 access token을 갱신한다. OAuth UI 없음.
- **Drive Push**: `POST /workflows` 시점에 `services/drive_watch.py`가 `files.watch`를 등록한다. 만료 7일이며 발표 당일 아침 재등록 필요. `NGROK_URL` env var로 webhook 주소를 주입한다.
- **Claude 파싱**: Tool Use (`tool_choice: {type: "tool", name: "create_workflow"}`)로 structured output을 강제한다. 의도 불명확 시 `actions: []` 반환.
- **SQLite**: `jsonb` 대신 `TEXT`로 config JSON을 저장. `db.get_conn()`은 context manager로 자동 commit/close.
- **템플릿 변수**: `{{name}}`, `{{email}}`, `{{phone}}`, `{{submitted_at}}` 4종만 사용. `fill_template()`과 `normalize_row()`로 한국어 컬럼명 → 표준 키 변환.

### Module Responsibilities

| 모듈 | 역할 |
|------|------|
| `services/google_auth.py` | refresh token → access token 갱신, 모든 Google 서비스가 호출 |
| `services/claude.py` | 자연어 → workflow JSON, Tool Use로 schema 강제 |
| `services/drive_watch.py` | Google Drive Push 채널 등록, `NGROK_URL` 의존 |
| `services/google_sheets.py` | `append_row` (액션 실행) + `get_last_row` (웹훅에서 폼 응답 읽기) |
| `services/gmail.py` | MIME 메일 생성 + Gmail API 발송 |
| `routes/webhook.py` | Drive Push 수신, `X-Goog-Channel-Token` 헤더로 workflow_id 식별 |
| `db.py` | SQLite 연결, `init()`으로 테이블 생성 + 데모 유저 삽입 |

## Environment Variables

```
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NGROK_URL=https://xxxx.ngrok.io   # 발표 당일 아침 갱신 필수
DEMO_USER_ID=demo-user-001
```

## Specs & Plans

- 설계 스펙: `docs/superpowers/specs/2026-05-12-wize-demo-backend-design.md`
- 구현 플랜 (Task 1~13): `docs/superpowers/plans/2026-05-12-wize-demo-backend.md`
