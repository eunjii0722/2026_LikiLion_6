# Frontend–Backend Integration Design
**Date:** 2026-05-12  
**Branch:** `demo/integration`

## Goal

Connect the Ver1 React frontend (currently all mocked) to the FastAPI backend so that the full demo flow works end-to-end: natural language input → Claude parsing → workflow creation → real-time Google Form response detection.

---

## Architecture

### Development
```
Vite (:5173)  --proxy-->  FastAPI (:8000)
```
Vite proxies all `/parse`, `/workflows`, `/webhook` requests to FastAPI. Hot reload works normally.

### Demo day
```npm run build  →  wize-demo/frontend/
uvicorn main:app --port 8000
```
FastAPI serves the built frontend as static files. One process only.* div 스크롤할 때

---
## Data Flow

### Main flow
```
InputScreen
  └─ POST /parse { text }
       └─ { workflow: { trigger, actions } }
            └─ navigate("/analysis", { state: { workflow } })

AnalysisScreen
  └─ reads location.state.workflow
  └─ renders dynamic cards from actions
  └─ user confirms → navigate("/workflow", { state: { workflow } })

WorkflowScreen
  └─ POST /workflows {
       title, origin_prompt,
       trigger_config: { service: "google_form", form_id: DEMO_FORM_ID, linked_sheet_id: DEMO_SHEET_ID },
       actions
     }
  └─ workflow_id → localStorage.setItem("workflow_id", id)
  └─ navigate("/demo")
```

### Demo flow
```
DemoStandbyScreen
  └─ reads workflow_id from localStorage
       └─ missing → redirect to /workflow
  └─ polls GET /workflows/{id}/logs every 2s
  └─ new log detected → navigate("/demo/message", { state: { log } })

DemoMessageScreen  → 2s delay → DemoExtractScreen
DemoExtractScreen  → 2s delay → DemoSaveScreen
DemoSaveScreen     → 2s delay → DemoCompleteScreen
DemoCompleteScreen → manual "다시 시작" → /
```
Each demo screen also has a manual "다음" button as fallback for network instability.

---

## File Changes

| File | Change |
|------|--------|
| `vite.config.ts` | Add dev proxy (`/parse`, `/workflows` → `:8000`); set `build.outDir: 'wize-demo/frontend'` |
| `src/api.ts` (new) | `parseText(text)`, `createWorkflow(payload)`, `getWorkflowLogs(id)` |
| `src/app/components/InputScreen.tsx` | Replace `setTimeout` with `parseText()` call; pass result via router state |
| `src/app/components/AnalysisScreen.tsx` | Read `location.state.workflow`; render cards dynamically from actions array |
| `src/app/components/WorkflowScreen.tsx` | On confirm: call `createWorkflow()`; save `workflow_id` to localStorage; navigate to `/demo` |
| `src/app/components/demo/DemoStandbyScreen.tsx` | Poll `getWorkflowLogs()` every 2s; auto-navigate on new log |
| `src/app/components/demo/DemoMessageScreen.tsx` | Show log data; auto-advance after 2s; manual button fallback |
| `src/app/components/demo/DemoExtractScreen.tsx` | Auto-advance after 2s; manual button fallback |
| `src/app/components/demo/DemoSaveScreen.tsx` | Auto-advance after 2s; manual button fallback |
| `src/app/components/demo/DemoCompleteScreen.tsx` | Final state; "다시 시작" → `/` |
| `wize-demo/.env` | Add `DEMO_FORM_ID`, `DEMO_SHEET_ID` |
| `wize-demo/.env.example` | Add `DEMO_FORM_ID=`, `DEMO_SHEET_ID=` (blank) |

---

## Environment Variables

Added to `wize-demo/.env`:
```
DEMO_FORM_ID=1vH6PA6la4x6p4QCINv3HGyyXzPVr9gHzO6BNl8xXw-M
DEMO_SHEET_ID=1bMAyj4CqFJbBn3IFQMlTV5y227pEQl9S_GPypxftvAQ
```

---

## Error Handling

| Scenario | Behavior |
|----------|----------|
| `POST /parse` fails | Show error message in InputScreen; stay on page |
| `POST /workflows` fails | Show error message in WorkflowScreen; stay on page |
| Polling fails | Silent retry; no user-facing error |
| `workflow_id` missing from localStorage | DemoStandby redirects to `/workflow` |

---

## Demo Day Checklist

1. Update `NGROK_URL` in `wize-demo/.env`
2. Run `npm run build` from repo root
3. Re-register Drive Push: `POST /workflows` (or start the app and go through the UI)
4. Start server: `cd wize-demo && uvicorn main:app --port 8000`
5. Open `http://localhost:8000`
