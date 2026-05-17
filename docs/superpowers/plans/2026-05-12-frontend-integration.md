# Frontend–Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the Ver1 React frontend to the FastAPI backend so the full demo works end-to-end: text input → Claude parse → workflow creation → real-time Google Form response detection.

**Architecture:** Vite dev server proxies `/parse` and `/workflows` to FastAPI on :8000. On demo day, `npm run build` outputs to `wize-demo/frontend/` and FastAPI serves everything from one process.

**Tech Stack:** React 18, React Router 7, TypeScript, Vite 6, FastAPI, SQLite

---

### Task 1: Configure Vite proxy and build output

**Files:**
- Modify: `vite.config.ts`

- [ ] **Step 1: Update vite.config.ts**

Replace the existing export in `vite.config.ts` with:

```ts
import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  assetsInclude: ['**/*.svg', '**/*.csv'],
  server: {
    proxy: {
      '/parse': 'http://localhost:8000',
      '/workflows': 'http://localhost:8000',
    },
  },
  build: {
    outDir: 'wize-demo/frontend',
    emptyOutDir: true,
  },
})
```

- [ ] **Step 2: Verify dev server starts**

```bash
npm install
npm run dev
```

Expected: Vite starts on http://localhost:5173 with no errors.

- [ ] **Step 3: Commit**

```bash
git add vite.config.ts package-lock.json
git commit -m "chore: configure vite proxy and build output for backend integration"
```

---

### Task 2: Create API client

**Files:**
- Create: `src/api.ts`

- [ ] **Step 1: Create src/api.ts**

```ts
export interface ActionStep {
  order: number;
  service: "google_sheets" | "gmail";
  config: Record<string, unknown>;
}

export interface WorkflowDraft {
  trigger: { service: "google_form"; form_id: string };
  actions: ActionStep[];
}

export interface ParseResponse {
  workflow: WorkflowDraft;
}

export interface CreateWorkflowResponse {
  workflow_id: string;
  watch_expiration: string;
}

export interface ExecutionRun {
  id: string;
  workflow_id: string;
  status: string;
  started_at: string;
  summary: string | null;
}

export interface LogsResponse {
  logs: ExecutionRun[];
}

const BASE = "";  // same origin in prod; proxied in dev

export async function parseText(text: string): Promise<ParseResponse> {
  const res = await fetch(`${BASE}/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Parse failed: ${res.status}`);
  return res.json();
}

const DEMO_FORM_ID = "1vH6PA6la4x6p4QCINv3HGyyXzPVr9gHzO6BNl8xXw-M";
const DEMO_SHEET_ID = "1bMAyj4CqFJbBn3IFQMlTV5y227pEQl9S_GPypxftvAQ";

export async function createWorkflow(
  originPrompt: string,
  actions: ActionStep[]
): Promise<CreateWorkflowResponse> {
  const res = await fetch(`${BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "WIZE 데모 자동화",
      origin_prompt: originPrompt,
      trigger_config: {
        service: "google_form",
        form_id: DEMO_FORM_ID,
        linked_sheet_id: DEMO_SHEET_ID,
      },
      actions,
    }),
  });
  if (!res.ok) throw new Error(`Create workflow failed: ${res.status}`);
  return res.json();
}

export async function getWorkflowLogs(workflowId: string): Promise<LogsResponse> {
  const res = await fetch(`${BASE}/workflows/${workflowId}/logs`);
  if (!res.ok) throw new Error(`Get logs failed: ${res.status}`);
  return res.json();
}
```

- [ ] **Step 2: Commit**

```bash
git add src/api.ts
git commit -m "feat: add API client for parse, workflows, and logs"
```

---

### Task 3: Wire InputScreen to POST /parse

**Files:**
- Modify: `src/app/components/InputScreen.tsx`

The current `handleSubmit` uses `setTimeout` and navigates to `/analysis` without data. Replace it to call `parseText()` and pass the result via router state.

- [ ] **Step 1: Update imports and handleSubmit in InputScreen.tsx**

At the top, add the import:
```tsx
import { parseText } from "../../api";
```

Replace the existing `handleSubmit` function (currently using setTimeout):
```tsx
const handleSubmit = async () => {
  if (!inputText.trim()) return;
  setIsLoading(true);
  try {
    const { workflow } = await parseText(inputText);
    navigate("/analysis", { state: { workflow, inputText } });
  } catch {
    setError("분석 중 오류가 발생했어요. 다시 시도해주세요.");
  } finally {
    setIsLoading(false);
  }
};
```

- [ ] **Step 2: Add error state**

Add `error` to the existing `useState` declarations at the top of the component:
```tsx
const [error, setError] = useState("");
```

- [ ] **Step 3: Show error message in the JSX**

Add this block right above the `{/* Input Area */}` div:
```tsx
{error && (
  <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
    {error}
  </div>
)}
```

- [ ] **Step 4: Clear error on new input**

In the textarea `onChange` handler, add `setError("")`:
```tsx
onChange={(e) => { setInputText(e.target.value); setError(""); }}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/components/InputScreen.tsx
git commit -m "feat: wire InputScreen to POST /parse with error handling"
```

---

### Task 4: Update AnalysisScreen to render real data

**Files:**
- Modify: `src/app/components/AnalysisScreen.tsx`

The current screen shows 4 hardcoded cards. Update it to render cards from `location.state.workflow`. If no state, redirect to `/input`.

- [ ] **Step 1: Add imports at the top of AnalysisScreen.tsx**

`Database`, `FileText`, `Send` are already imported from lucide-react. Only add:

```tsx
import { useLocation } from "react-router";       // add to existing react-router import line
import type { WorkflowDraft } from "../../api";   // new line
```

- [ ] **Step 2: Add useLocation and derive cards inside the component**

Right after `const navigate = useNavigate();`, add:

```tsx
const location = useLocation();
const stateWorkflow = location.state?.workflow as WorkflowDraft | undefined;
const inputText = location.state?.inputText as string | undefined;

// Redirect to input if no state
useEffect(() => {
  if (!stateWorkflow) navigate("/input", { replace: true });
}, [stateWorkflow, navigate]);

// Build cards from parsed workflow
const analysisCards = stateWorkflow
  ? [
      {
        id: 1,
        icon: FileText,
        iconBg: "bg-yellow-50",
        iconColor: "text-yellow-500",
        borderColor: "border-yellow-200",
        badgeBg: "bg-yellow-100 text-yellow-700",
        badge: "시작 조건",
        title: "구글 폼 응답 감지",
        description: "구글 폼에 새 응답이 들어오면 자동화가 시작돼요.",
        detail: "Google Form 연동 완료",
      },
      ...stateWorkflow.actions.map((action, i) => {
        if (action.service === "google_sheets") {
          return {
            id: i + 2,
            icon: Database,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
            borderColor: "border-green-200",
            badgeBg: "bg-green-100 text-green-700",
            badge: "저장",
            title: "구글시트에 자동 저장",
            description: "응답 데이터가 지정한 구글시트에 한 줄씩 추가돼요.",
            detail: "Google Sheets 연동 완료",
          };
        }
        return {
          id: i + 2,
          icon: Send,
          iconBg: "bg-purple-50",
          iconColor: "text-purple-600",
          borderColor: "border-purple-200",
          badgeBg: "bg-purple-100 text-purple-700",
          badge: "발송",
          title: "Gmail 자동 발송",
          description: "신청자에게 확인 메일을 자동으로 발송해요.",
          detail: "Gmail 연동 완료",
        };
      }),
    ]
  : [];
```

- [ ] **Step 3: Remove the existing hardcoded analysisCards constant**

Delete the hardcoded `const analysisCards = [...]` array at the top of the file (the one with 4 items: MessageCircle, FileText, Database, Send).

- [ ] **Step 4: Pass state to next screen**

Find the "자동화 흐름 확인하기" button's `onClick` and update it:
```tsx
onClick={() => navigate("/workflow", { state: { workflow: stateWorkflow, inputText } })}
```

- [ ] **Step 5: Update the "입력한 내용" preview**

Find the paragraph that shows the hardcoded input text and replace it:
```tsx
<p className="text-sm text-gray-700 leading-relaxed">
  "{inputText}"
</p>
```

- [ ] **Step 6: Commit**

```bash
git add src/app/components/AnalysisScreen.tsx
git commit -m "feat: render dynamic analysis cards from /parse response"
```

---

### Task 5: Wire WorkflowScreen to POST /workflows

**Files:**
- Modify: `src/app/components/WorkflowScreen.tsx`

The "테스트 실행하기" button currently navigates to `/result`. Change it to call `createWorkflow()`, save the `workflow_id` to localStorage, then navigate to `/demo`.

- [ ] **Step 1: Add imports**

```tsx
import { useLocation } from "react-router";
import { createWorkflow } from "../../api";
import type { WorkflowDraft } from "../../api";
```

- [ ] **Step 2: Add state inside the component**

Right after `const navigate = useNavigate();`:
```tsx
const location = useLocation();
const stateWorkflow = location.state?.workflow as WorkflowDraft | undefined;
const inputText = (location.state?.inputText as string) ?? "";
const [isSubmitting, setIsSubmitting] = useState(false);
const [submitError, setSubmitError] = useState("");
```

- [ ] **Step 3: Add handleRun function**

```tsx
const handleRun = async () => {
  if (!stateWorkflow) return;
  setIsSubmitting(true);
  setSubmitError("");
  try {
    const { workflow_id } = await createWorkflow(inputText, stateWorkflow.actions);
    localStorage.setItem("workflow_id", workflow_id);
    navigate("/demo");
  } catch {
    setSubmitError("워크플로우 등록 중 오류가 발생했어요. 다시 시도해주세요.");
  } finally {
    setIsSubmitting(false);
  }
};
```

- [ ] **Step 4: Replace the "테스트 실행하기" button**

Find the button at line ~261 (inside the Panel Footer section):
```tsx
<button
  onClick={() => navigate("/result")}
  ...
>
  <Play className="w-4 h-4 fill-white" />
  테스트 실행하기
</button>
```

Replace with:
```tsx
{submitError && (
  <p className="text-xs text-red-500 mb-3 text-center">{submitError}</p>
)}
<button
  onClick={handleRun}
  disabled={isSubmitting}
  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[15px] font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
>
  {isSubmitting ? (
    <>
      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      등록 중...
    </>
  ) : (
    <>
      <Play className="w-4 h-4 fill-white" />
      자동화 시작하기
    </>
  )}
</button>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/components/WorkflowScreen.tsx
git commit -m "feat: wire WorkflowScreen to POST /workflows and save workflow_id"
```

---

### Task 6: Add polling to DemoStandbyScreen

**Files:**
- Modify: `src/app/components/demo/DemoStandbyScreen.tsx`

Add polling logic on mount: read `workflow_id` from localStorage, poll `/workflows/{id}/logs` every 2s, auto-navigate to `/demo/message` when a new log appears. Keep the existing manual button as fallback.

- [ ] **Step 1: Add imports**

```tsx
import { useState, useEffect, useRef } from "react";
import { getWorkflowLogs } from "../../../api";
```

(File already imports `useNavigate` — add only the new ones.)

- [ ] **Step 2: Add polling logic inside the component**

Right after `const navigate = useNavigate();`:

```tsx
const [pollError, setPollError] = useState(false);
const initialLogCount = useRef<number | null>(null);

useEffect(() => {
  const workflowId = localStorage.getItem("workflow_id");
  if (!workflowId) {
    navigate("/workflow", { replace: true });
    return;
  }

  const interval = setInterval(async () => {
    try {
      const { logs } = await getWorkflowLogs(workflowId);
      if (initialLogCount.current === null) {
        initialLogCount.current = logs.length;
        return;
      }
      if (logs.length > initialLogCount.current) {
        clearInterval(interval);
        navigate("/demo/message");
      }
    } catch {
      setPollError(true);
    }
  }, 2000);

  return () => clearInterval(interval);
}, [navigate]);
```

- [ ] **Step 3: Show polling error hint (optional)**

Find the waiting indicator div (the one with the bouncing dots) and add below it:
```tsx
{pollError && (
  <p className="text-xs text-red-400 mt-2 text-center">
    연결 오류 — 수동 버튼을 눌러주세요
  </p>
)}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/components/demo/DemoStandbyScreen.tsx
git commit -m "feat: add real-time polling in DemoStandbyScreen"
```

---

### Task 7: Build and smoke test

- [ ] **Step 1: Start the backend**

```bash
cd wize-demo && uvicorn main:app --reload --port 8000
```

- [ ] **Step 2: Start the frontend dev server in a new terminal**

```bash
# from repo root
npm run dev
```

- [ ] **Step 3: Walk through the main flow**

1. Open http://localhost:5173/input
2. Type "구글 폼 응답이 오면 시트에 저장하고 이메일 보내줘" → click submit
3. Verify AnalysisScreen shows real cards from Claude (not hardcoded)
4. Click "자동화 흐름 확인하기" → verify WorkflowScreen loads
5. Click "자동화 시작하기" → verify it calls POST /workflows (check uvicorn logs)
6. Verify navigation lands on `/demo` (DemoStandbyScreen)
7. Check localStorage has `workflow_id`

- [ ] **Step 4: Test build output**

```bash
# from repo root
npm run build
```

Expected: `wize-demo/frontend/` is populated with `index.html` and assets.

- [ ] **Step 5: Smoke test built version**

Stop the Vite dev server, then restart uvicorn and visit http://localhost:8000.
Expected: same UI loads from the built static files.

- [ ] **Step 6: Final commit**

```bash
git add wize-demo/frontend/
git commit -m "build: add initial frontend build output"
git push origin demo/integration
```
