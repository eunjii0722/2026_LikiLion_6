# WIZE Demo - Integration

React/Vite 프론트엔드와 FastAPI 백엔드를 함께 실행하는 WIZE 데모 통합 브랜치입니다.
자연어로 자동화 요청을 입력하면 Claude가 워크플로우 초안을 만들고, Google Forms 응답을 트리거로 Google Sheets 저장 및 Gmail 발송 액션을 실행하는 흐름을 확인할 수 있습니다.

## 브랜치 목적

- `demo/backend`의 FastAPI API와 Google 연동 로직을 유지합니다.
- React 기반 데모 화면을 추가해 `/parse`, `/workflows`, `/workflows/{id}/logs` API와 연결합니다.
- Vite 개발 서버에서는 API 요청을 `http://localhost:8000` 백엔드로 프록시합니다.
- 프로덕션 빌드 결과물은 `wize-demo/frontend`에 생성되어 FastAPI 정적 파일로 서빙됩니다.

## 프로젝트 구조

```text
.
├── src/                  # React/Vite 프론트엔드
├── wize-demo/            # FastAPI 백엔드
│   ├── routes/           # API 라우터
│   ├── services/         # Claude, Google API 연동
│   ├── tests/            # 백엔드 테스트
│   └── frontend/         # Vite 빌드 결과물
├── package.json          # 프론트엔드 의존성 및 스크립트
└── vite.config.ts        # Vite 설정, API 프록시, 빌드 경로
```

## 요구 사항

- Node.js 20 이상 권장
- Python 3.11 이상 권장
- Google Cloud OAuth 클라이언트
- Anthropic API 키
- 외부 webhook 수신용 HTTPS URL. 로컬 데모에서는 ngrok 같은 터널을 사용할 수 있습니다.

## 환경 변수

백엔드 환경 변수는 `wize-demo/.env`에 둡니다.

```bash
cd wize-demo
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

`GOOGLE_REFRESH_TOKEN`이 없으면 `wize-demo/client_secret.json`을 준비한 뒤 다음 명령으로 발급합니다.

```bash
cd wize-demo
python get_token.py
```

## 설치

프론트엔드:

```bash
npm install
```

백엔드:

```bash
cd wize-demo
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 개발 서버 실행

터미널 1에서 백엔드를 실행합니다.

```bash
cd wize-demo
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

터미널 2에서 프론트엔드를 실행합니다.

```bash
npm run dev
```

Vite 개발 서버 주소로 접속하면 됩니다. 데모 플로우는 `/demo` 경로에서 확인할 수 있습니다.

## 빌드 후 FastAPI로 서빙

```bash
npm run build
cd wize-demo
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

`npm run build`는 정적 파일을 `wize-demo/frontend`에 생성합니다. 이후 FastAPI가 루트 경로에서 해당 파일을 서빙합니다.

## 주요 API

- `POST /parse`: 자연어 요청을 워크플로우 초안으로 변환합니다.
- `POST /workflows`: 워크플로우를 저장하고 Google Drive watch를 등록합니다.
- `GET /workflows/{workflow_id}`: 워크플로우와 최근 실행 로그를 조회합니다.
- `GET /workflows/{workflow_id}/logs`: 실행 로그 목록을 조회합니다.
- `POST /webhook/google`: Google Drive watch webhook을 수신합니다.

## 테스트

```bash
cd wize-demo
source .venv/bin/activate
pytest
```

## 데모 실행 순서

1. Google Form과 연결된 응답 Sheet ID를 `src/api.ts`의 데모 상수 또는 API 요청 payload에 맞춥니다.
2. `NGROK_URL`을 현재 외부 HTTPS URL로 설정합니다.
3. 백엔드와 프론트엔드 개발 서버를 실행합니다.
4. `/demo`에서 자동화 요청을 입력하고 워크플로우를 생성합니다.
5. Google Form 응답을 제출해 Sheets 저장, Gmail 발송, 실행 로그 흐름을 확인합니다.
