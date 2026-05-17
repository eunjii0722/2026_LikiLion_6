# ── Stage 1: 프론트엔드 빌드 ──────────────────────────────────────
FROM node:20-slim AS frontend
WORKDIR /workspace
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: 백엔드 실행 ──────────────────────────────────────────
FROM python:3.11-slim
WORKDIR /app
COPY wize-demo/ .
COPY --from=frontend /workspace/wize-demo/frontend ./frontend
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 8000
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
