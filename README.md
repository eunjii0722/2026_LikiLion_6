# WIZE — 구글폼 수강 신청 자동화 MVP

자연어로 자동화 요청을 입력하면 Claude AI가 워크플로우를 구성하고,  
구글폼 응답을 트리거로 **구글시트 저장 → Gmail 확인 메일 발송**까지 자동으로 실행합니다.

## 브랜치 구조

| 브랜치 | 설명 |
|--------|------|
| `main` | 통합 기준 브랜치 |
| `mvp/frontend` | React 프론트엔드 + 전체 MVP 흐름 |
| `demo/backend` | FastAPI 백엔드 + Google API 연동 |

## 기술 스택

### 프론트엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| React | 19 | UI 프레임워크 |
| TypeScript | 5 | 타입 안전성 |
| Vite | 6 | 빌드 도구 |
| React Router | 7 | 클라이언트 사이드 라우팅 |
| Tailwind CSS | 4 | 유틸리티 CSS |
| Lucide React | - | 아이콘 |
| Motion (Framer) | - | 애니메이션 |

### 백엔드
| 기술 | 버전 | 용도 |
|------|------|------|
| Python | 3.11 | 런타임 |
| FastAPI | - | API 서버 |
| Uvicorn | - | ASGI 서버 |
| SQLite | - | 워크플로우·실행 로그 저장 |
| Anthropic Claude API | - | 자연어 → 워크플로우 파싱 (Tool Use) |
| Google Sheets API v4 | - | 응답 행 추가·시트 생성 |
| Gmail API | - | 확인 메일 발송 |
| Google Drive API v3 | - | Push Notification (실시간 응답 감지) |

### 인프라 / 배포
| 기술 | 용도 |
|------|------|
| Docker (multi-stage) | 프론트엔드 빌드 + 백엔드 실행 통합 |
| Railway | 배포 플랫폼 (권장) |

## 프로젝트 구조

```text
.
├── src/                        # React 프론트엔드
│   ├── app/
│   │   ├── components/         # 화면별 컴포넌트
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── InputScreen.tsx
│   │   │   ├── AnalysisScreen.tsx
│   │   │   ├── WorkflowScreen.tsx
│   │   │   ├── TestResultScreen.tsx
│   │   │   └── AutomationDetailScreen.tsx
│   │   ├── productStore.ts     # localStorage 기반 상태 관리
│   │   └── routes.tsx
│   └── api.ts                  # 백엔드 API 클라이언트
├── wize-demo/                  # FastAPI 백엔드
│   ├── routes/                 # API 라우터 (parse, workflows, webhook, sheets)
│   ├── services/               # Claude, Google API, Drive Watch 연동
│   ├── tests/
│   ├── db.py                   # SQLite 연결·스키마
│   ├── main.py                 # FastAPI 앱 + 정적 파일 서빙
│   └── frontend/               # Vite 빌드 결과물 (배포 시 자동 생성)
├── Dockerfile                  # 멀티스테이지 빌드
├── .dockerignore
├── vite.config.ts              # Vite 설정 (프록시, 빌드 경로)
└── package.json
```

## 환경 변수

`wize-demo/.env` 파일을 만들어 아래 값을 입력합니다.

```env
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REFRESH_TOKEN=...
APP_URL=https://your-app.railway.app   # 배포 URL (로컬은 ngrok URL)
NGROK_URL=https://xxxx.ngrok.io        # 로컬 개발 시 대안 (APP_URL 없을 때 사용)
DEMO_USER_ID=demo-user-001
DB_PATH=wize.db                        # SQLite 파일 경로 (선택, 기본값: wize.db)
```

`GOOGLE_REFRESH_TOKEN`이 없으면 `wize-demo/client_secret.json`을 준비한 뒤 발급합니다.

```bash
cd wize-demo && python get_token.py
```

## 로컬 개발

**백엔드** (터미널 1)

```bash
cd wize-demo
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**프론트엔드** (터미널 2)

```bash
npm install
npm run dev
```

Vite 개발 서버가 `/parse`, `/workflows`, `/sheets`, `/webhook` 요청을 `localhost:8000`으로 프록시합니다.

## 프로덕션 빌드 (로컬 확인)

```bash
npm run build          # wize-demo/frontend/ 에 정적 파일 생성
cd wize-demo
uvicorn main:app --port 8000
```

## Docker 빌드

```bash
docker build -t wize-mvp .
docker run -p 8000:8000 --env-file wize-demo/.env wize-mvp
```

## 배포 (Railway 권장)

1. [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub Repo**
2. 루트 디렉터리: `/` (Dockerfile 자동 감지)
3. **Variables** 탭에서 환경변수 입력 (`APP_URL`은 배포 후 Railway가 부여하는 URL로 설정)
4. 첫 배포 완료 → 생성된 URL 확인
5. `APP_URL` 값을 해당 URL로 업데이트 → **Redeploy**
6. 앱에서 새 자동화 생성 → Drive Watch가 새 URL로 등록됨

> ⚠️ Google Drive Watch는 7일 후 만료됩니다. 만료 전 앱에서 자동화를 재활성화하거나 `POST /workflows/{id}/reactivate`를 호출하세요.

## 주요 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/parse` | 자연어 → 워크플로우 초안 (Claude Tool Use) |
| POST | `/workflows` | 워크플로우 저장 + Drive Watch 등록 |
| POST | `/workflows/{id}/reactivate` | Drive Watch 재등록 (만료 갱신) |
| GET | `/workflows/{id}/logs` | 실행 로그 조회 |
| POST | `/sheets/create` | 구글시트 자동 생성 |
| POST | `/webhook/google` | Drive Push 수신 → 시트 저장 + Gmail 발송 |

## 테스트

```bash
cd wize-demo
pytest tests/ -v
```
