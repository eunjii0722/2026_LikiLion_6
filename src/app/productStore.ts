import type { ActionStep, WorkflowDraft } from "../api";

export interface TestData {
  name: string;
  email: string;
  phone: string;
  item: string;
}

export interface ProductRun {
  id: string;
  createdAt: string;
  inputMessage: string;
  fields: TestData;
  confirmationMessage: string;
}

export interface ProductWorkflow {
  id: string;
  backendWorkflowId?: string;
  title: string;
  originPrompt: string;
  formUrl?: string;
  formId?: string;
  sheetId?: string;
  testData?: TestData;
  status: "draft" | "active";
  createdAt: string;
  updatedAt: string;
  actions: ActionStep[];
  runs: ProductRun[];
}

const STORAGE_KEY = "wize_google_forms_mvp_workflows";

export function buildFallbackWorkflow(text: string): WorkflowDraft {
  return {
    trigger: { service: "google_form", form_id: "local-product-form" },
    actions: [
      {
        order: 1,
        service: "google_sheets",
        config: {
          sheet_name: "수강신청 응답",
          columns: ["제출일", "이름", "이메일", "연락처", "신청 과정"],
        },
      },
      {
        order: 2,
        service: "gmail",
        config: {
          subject: "[WIZE] 수강 신청이 접수되었습니다",
          body_template:
            "{이름}님, {신청 과정} 수강 신청이 정상 접수되었습니다. 곧 자세한 안내를 메일로 보내드릴게요.",
        },
      },
    ],
  };
}

export function getWorkflows(): ProductWorkflow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function upsertWorkflow(workflow: ProductWorkflow) {
  const workflows = getWorkflows();
  const next = [workflow, ...workflows.filter((w) => w.id !== workflow.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function deleteWorkflow(id: string) {
  const workflows = getWorkflows().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workflows));
}

export function createLocalWorkflow(
  originPrompt: string,
  actions: ActionStep[],
  formUrl?: string,
  testData?: TestData,
  formId?: string,
  sheetId?: string,
): ProductWorkflow {
  const now = new Date().toISOString();
  const workflow: ProductWorkflow = {
    id: `wf_${Date.now()}`,
    title: "구글폼 수강 신청 자동화",
    originPrompt,
    formUrl,
    formId,
    sheetId,
    testData,
    status: "draft",
    createdAt: now,
    updatedAt: now,
    actions,
    runs: [],
  };
  upsertWorkflow(workflow);
  return workflow;
}

export function updateWorkflowConfig(
  id: string,
  patch: {
    title?: string;
    backendWorkflowId?: string;
    formUrl?: string;
    formId?: string;
    sheetId?: string;
    testData?: TestData;
    actions?: ActionStep[];
  },
): ProductWorkflow | undefined {
  const workflows = getWorkflows();
  const workflow = workflows.find((w) => w.id === id);
  if (!workflow) return undefined;
  const updated: ProductWorkflow = {
    ...workflow,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  upsertWorkflow(updated);
  return updated;
}

export function activateWorkflow(id: string): ProductWorkflow | undefined {
  const workflows = getWorkflows();
  const workflow = workflows.find((w) => w.id === id);
  if (!workflow) return undefined;
  const updated = { ...workflow, status: "active" as const, updatedAt: new Date().toISOString() };
  upsertWorkflow(updated);
  return updated;
}

export function addTestRun(id: string): ProductRun | undefined {
  const workflows = getWorkflows();
  const workflow = workflows.find((w) => w.id === id);
  if (!workflow) return undefined;
  const run = buildRun(workflow.originPrompt, workflow.testData);
  upsertWorkflow({
    ...workflow,
    runs: [run, ...workflow.runs].slice(0, 20),
    updatedAt: new Date().toISOString(),
  });
  return run;
}

export function buildRun(prompt: string, testData?: TestData): ProductRun {
  const item = testData?.item || inferCourse(prompt);
  const name = testData?.name || "이은지";
  const email = testData?.email || "eunji@example.com";
  const phone = testData?.phone || "010-1234-5678";

  return {
    id: `run_${Date.now()}`,
    createdAt: new Date().toISOString(),
    inputMessage: `구글폼 새 응답: ${name}, ${email}, ${phone}, ${item}`,
    fields: { name, email, phone, item },
    confirmationMessage: `${name}님, ${item} 수강 신청이 정상 접수되었습니다. 곧 자세한 안내를 메일로 보내드릴게요.`,
  };
}

function inferCourse(text: string) {
  if (text.includes("자바스크립트")) return "자바스크립트 입문반";
  if (text.includes("웹")) return "웹 개발 입문반";
  return "파이썬 기초반";
}
