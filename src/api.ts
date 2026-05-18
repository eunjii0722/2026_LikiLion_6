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

const DEMO_FORM_ID = "";
const DEMO_SHEET_ID = "";

export async function createWorkflow(
  originPrompt: string,
  actions: ActionStep[],
  sheetId?: string,
  formId?: string,
): Promise<CreateWorkflowResponse> {
  const res = await fetch(`${BASE}/workflows`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: "WIZE 데모 자동화",
      origin_prompt: originPrompt,
      trigger_config: {
        service: "google_form",
        form_id: formId ?? DEMO_FORM_ID,
        linked_sheet_id: sheetId ?? DEMO_SHEET_ID,
      },
      actions,
    }),
  });
  if (!res.ok) throw new Error(`Create workflow failed: ${res.status}`);
  return res.json();
}

export interface CreateSheetResponse {
  sheet_id: string;
  sheet_url: string;
  sheet_name: string;
}

export async function createSheet(
  title: string,
  headers?: string[],
): Promise<CreateSheetResponse> {
  const body: Record<string, unknown> = { title };
  if (headers) body.headers = headers;
  const res = await fetch(`${BASE}/sheets/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Create sheet failed: ${res.status}`);
  return res.json();
}

export async function reactivateWorkflow(
  backendWorkflowId: string,
): Promise<{ workflow_id: string; watch_expiration: string; status: string }> {
  const res = await fetch(`${BASE}/workflows/${backendWorkflowId}/reactivate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`Reactivate failed: ${res.status}`);
  return res.json();
}

export async function getWorkflowLogs(workflowId: string): Promise<LogsResponse> {
  const res = await fetch(`${BASE}/workflows/${workflowId}/logs`);
  if (!res.ok) throw new Error(`Get logs failed: ${res.status}`);
  return res.json();
}
