# WIZE Demo - Backend

FastAPI 기반 WIZE 데모 백엔드 브랜치입니다.
자연어 자동화 요청을 Claude로 파싱하고, Google Forms 응답을 트리거로 Google Sheets 저장 및 Gmail 발송 액션을 실행하는 API와 webhook 흐름을 제공합니다.

## 브랜치 목적

- FastAPI API 서버와 SQLite 저장소를 제공합니다.
- Claude API를 사용해 자연어 요청을 워크플로우 초안으로 변환합니다.
- Google Drive watch webhook을 등록해 Google Forms 응답 Sheet 변경을 감지합니다.
- Google Sheets와 Gmail 액션 실행 결과를 로그로 저장합니다.
- 최소 정적 데모 페이지를 `wize-demo/frontend`에서 서빙합니다.

## 프로젝트 구조

```text
.
└── wize-demo/
    ├── main.py              # FastAPI 앱 진입점
    ├── db.py                # SQLite 초기화 및 연결
    ├── models.py            # 요청/응답 모델
    ├── get_token.py         # Google OAuth refresh token 발급 스크립트
    ├── routes/
    │   ├── parse.py         # 자연어 파싱 API
    │   ├── workflows.py     # 워크플로우 생성/조회 API
    │   └── webhook.py       # Google webhook 수신 API
    ├── services/
    │   ├── claude.py        # Claude 파싱 로직
    │   ├── drive_watch.py   # Google Drive watch 등록
    │   ├── gmail.py         # Gmail 발송
    │   ├── google_auth.py   # Google 인증
    │   └── google_sheets.py # Google Sheets 처리
    └── tests/               # pytest 테스트
```

## 요구 사항

- Python 3.11 이상 권장
- Anthropic API 키
- Google Cloud OAuth 클라이언트
- 외부 webhook 수신용 HTTPS URL. 로컬 데모에서는 ngrok 같은 터널을 사용할 수 있습니다.

## 설치

```bash
cd wize-demo
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 환경 변수

```bash
cp .env.example .env
```

필수 값:

```env
ANTHROPIC_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
NGROK_URL=https://xxxx.ngrok.io
DEMO_USER_ID=demo-user-001
```

`GOOGLE_REFRESH_TOKEN`이 없으면 Google OAuth 클라이언트 JSON을 `wize-demo/client_secret.json`으로 저장한 뒤 다음 명령을 실행합니다.

```bash
python get_token.py
```

필요한 Google OAuth scope:

- `https://www.googleapis.com/auth/spreadsheets`
- `https://www.googleapis.com/auth/gmail.send`
- `https://www.googleapis.com/auth/drive`
- `https://www.googleapis.com/auth/forms.responses.readonly`

## 실행

```bash
cd wize-demo
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

서버가 실행되면 다음 주소를 사용할 수 있습니다.

- API 서버: `http://localhost:8000`
- Swagger 문서: `http://localhost:8000/docs`
- 정적 데모 페이지: `http://localhost:8000`

## 주요 API

- `POST /parse`: 자연어 요청을 워크플로우 초안으로 변환합니다.
- `POST /workflows`: 워크플로우를 저장하고 Google Drive watch를 등록합니다.
- `GET /workflows/{workflow_id}`: 워크플로우와 최근 실행 로그를 조회합니다.
- `GET /workflows/{workflow_id}/logs`: 실행 로그 목록을 조회합니다.
- `POST /webhook/google`: Google Drive watch webhook을 수신합니다.

## 기본 데모 흐름

1. `.env`에 `ANTHROPIC_API_KEY`, Google OAuth 값, `NGROK_URL`을 설정합니다.
2. FastAPI 서버를 `8000` 포트로 실행합니다.
3. ngrok 등으로 `http://localhost:8000`을 외부 HTTPS URL에 연결합니다.
4. `POST /parse`로 자연어 요청을 워크플로우 초안으로 변환합니다.
5. `POST /workflows`로 Google Form의 `form_id`와 연결된 Sheet의 `linked_sheet_id`를 포함해 워크플로우를 생성합니다.
6. Google Form 응답을 제출해 webhook, 액션 실행, 로그 저장 흐름을 확인합니다.

## 테스트

```bash
cd wize-demo
source .venv/bin/activate
pytest
```

## 참고

- `wize-demo/wize.db`는 로컬 SQLite 데이터베이스입니다.
- Google Drive watch는 만료 시간이 있으므로 장시간 데모 전에는 워크플로우를 다시 생성하거나 watch를 갱신해야 합니다.
- 외부 webhook URL이 바뀌면 `.env`의 `NGROK_URL`도 함께 갱신해야 합니다.
