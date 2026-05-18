import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  Mail,
  Zap,
  Trash2,
  Save,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Play,
  RefreshCw,
  Pencil,
} from "lucide-react";
import {
  getWorkflows,
  deleteWorkflow,
  updateWorkflowConfig,
  activateWorkflow,
  type ProductWorkflow,
} from "../productStore";
import { createSheet, reactivateWorkflow, getWorkflowLogs } from "../../api";
import type { ActionStep, WorkflowDraft } from "../../api";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
      />
    </div>
  );
}

export function AutomationDetailScreen() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<ProductWorkflow | undefined>(() =>
    getWorkflows().find((w) => w.id === id)
  );

  const sheetAction = workflow?.actions.find((a) => a.service === "google_sheets");
  const gmailAction = workflow?.actions.find((a) => a.service === "gmail");

  const [title, setTitle] = useState(workflow?.title ?? "구글폼 수강 신청 자동화");
  const [formUrl, setFormUrl] = useState(workflow?.formUrl ?? "");
  const [sheetName, setSheetName] = useState(
    (sheetAction?.config?.sheet_name as string) ?? "수강신청 응답"
  );
  const [emailSubject, setEmailSubject] = useState(
    (gmailAction?.config?.subject as string) ?? "[WIZE] 수강 신청이 접수되었습니다"
  );
  const [emailBody, setEmailBody] = useState(
    (gmailAction?.config?.body_template as string) ??
      "{이름}님, {신청 과정} 수강 신청이 정상 접수되었습니다."
  );
  const resolvedSheetId =
    (sheetAction?.config?.sheet_id as string) || workflow?.sheetId || "";
  const [createdSheetUrl, setCreatedSheetUrl] = useState(
    (sheetAction?.config?.sheet_url as string) ||
    (resolvedSheetId ? `https://docs.google.com/spreadsheets/d/${resolvedSheetId}/edit` : "")
  );
  const [createdSheetId, setCreatedSheetId] = useState(resolvedSheetId);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [backendRunCount, setBackendRunCount] = useState<number | null>(null);

  useEffect(() => {
    if (!workflow?.backendWorkflowId || workflow.status !== "active") return;
    const poll = async () => {
      try {
        const { logs } = await getWorkflowLogs(workflow.backendWorkflowId!);
        setBackendRunCount(logs.length);
      } catch {
        // Backend not running — ignore
      }
    };
    poll();
    const timer = setInterval(poll, 10_000);
    return () => clearInterval(timer);
  }, [workflow?.backendWorkflowId, workflow?.status]);

  const handleRetry = () => {
    if (!workflow) return;
    const draft: WorkflowDraft = {
      trigger: { service: "google_form", form_id: "local-product-form" },
      actions: workflow.actions,
    };
    navigate("/workflow", {
      state: { workflow: draft, inputText: workflow.originPrompt, formUrl: workflow.formUrl },
    });
  };

  if (!workflow) {
    return (
      <div className="max-w-[800px] mx-auto px-8 py-20 text-center">
        <p className="text-gray-400 mb-4">자동화를 찾을 수 없어요.</p>
        <button onClick={() => navigate("/")} className="text-[#6366F1] font-medium">
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const handleCreateSheet = async () => {
    setIsCreatingSheet(true);
    setSheetError("");
    try {
      const result = await createSheet(sheetName);
      setCreatedSheetUrl(result.sheet_url);
      setCreatedSheetId(result.sheet_id);
      setSheetName(result.sheet_name);
    } catch {
      setSheetError("시트 생성 실패. 백엔드가 실행 중인지 확인해주세요.");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const handleSave = () => {
    setIsSaving(true);
    const updatedActions: ActionStep[] = workflow.actions.map((action) => {
      if (action.service === "google_sheets") {
        return {
          ...action,
          config: {
            ...action.config,
            sheet_name: sheetName,
            ...(createdSheetId ? { sheet_id: createdSheetId, sheet_url: createdSheetUrl } : {}),
          },
        };
      }
      if (action.service === "gmail") {
        return {
          ...action,
          config: { ...action.config, subject: emailSubject, body_template: emailBody },
        };
      }
      return action;
    });
    const updated = updateWorkflowConfig(workflow.id, {
      title: title || undefined,
      formUrl: formUrl || undefined,
      actions: updatedActions,
    });
    if (updated) setWorkflow(updated);
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    deleteWorkflow(workflow.id);
    navigate("/");
  };

  const handleActivate = async () => {
    setIsActivating(true);
    const updated = activateWorkflow(workflow.id);
    if (updated) setWorkflow(updated);
    const minDelay = new Promise<void>((r) => setTimeout(r, 1200));
    if (workflow.backendWorkflowId) {
      try {
        await Promise.all([reactivateWorkflow(workflow.backendWorkflowId), minDelay]);
      } catch {
        await minDelay;
      }
    } else {
      await minDelay;
    }
    setIsActivating(false);
  };

  const isConnected = !!formUrl.trim();

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Back */}
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        내 자동화 목록
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-[24px] md:text-[28px] font-bold text-gray-900 bg-transparent outline-none border-b-2 border-transparent focus:border-[#6366F1] transition-colors w-full"
              style={{ letterSpacing: "-0.5px" }}
            />
          </div>
          <p className="text-sm text-gray-400 ml-[52px]">
            생성일 {new Date(workflow.createdAt).toLocaleDateString("ko-KR")} ·{" "}
            {workflow.runs.length}회 실행됨
          </p>
        </div>
        <span
          className={`text-sm font-semibold px-3 py-1.5 rounded-full ${
            workflow.status === "active"
              ? "bg-green-50 text-green-600"
              : "bg-amber-50 text-amber-600"
          }`}
        >
          {workflow.status === "active" ? "실행 중" : "테스트 완료"}
        </span>
      </div>

      <div className="space-y-6">
        {/* 구글폼 연동 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-gray-900">구글폼 연동</h2>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#6366F1] bg-[#6366F1]/5 px-2 py-1 rounded-lg">
              <Pencil className="w-3 h-3" />편집 가능
            </span>
            {isConnected ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                연동됨
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <AlertCircle className="w-3.5 h-3.5" />
                미연동 (데모 폼 사용 중)
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">구글폼 URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                placeholder="https://docs.google.com/forms/d/..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all"
              />
              {isConnected && (
                <a
                  href={formUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-[#F7F8FC] hover:bg-[#6366F1]/10 flex items-center justify-center text-gray-400 hover:text-[#6366F1] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 구글시트 설정 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-gray-900">구글시트 설정</h2>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#6366F1] bg-[#6366F1]/5 px-2 py-1 rounded-lg">
              <Pencil className="w-3 h-3" />편집 가능
            </span>
            {createdSheetUrl && (
              <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <CheckCircle className="w-3.5 h-3.5" />
                시트 연결됨
              </span>
            )}
          </div>

          <Field
            label="시트 이름"
            value={sheetName}
            onChange={setSheetName}
            placeholder="수강신청 응답"
          />

          <div className="mt-4">
            {createdSheetUrl ? (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-100">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-green-700 mb-0.5">생성된 시트</p>
                  <a
                    href={createdSheetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-green-600 flex items-center gap-1 hover:underline"
                  >
                    구글시트 열기 <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <button
                  onClick={() => { setCreatedSheetUrl(""); setCreatedSheetId(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  재생성
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={handleCreateSheet}
                  disabled={isCreatingSheet}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#6366F1]/30 text-[#6366F1] text-sm font-medium hover:bg-[#6366F1]/5 transition-colors disabled:opacity-60"
                >
                  {isCreatingSheet ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
                      시트 생성 중...
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="w-4 h-4" />
                      새 구글시트 자동 생성
                    </>
                  )}
                </button>
                {sheetError && (
                  <p className="text-xs text-red-500 mt-2 text-center">{sheetError}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Gmail 설정 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-[15px] font-bold text-gray-900">Gmail 발송 설정</h2>
            </div>
            <span className="flex items-center gap-1 text-xs text-[#6366F1] bg-[#6366F1]/5 px-2 py-1 rounded-lg">
              <Pencil className="w-3 h-3" />편집 가능
            </span>
          </div>
          <div className="space-y-4">
            <Field
              label="메일 제목"
              value={emailSubject}
              onChange={setEmailSubject}
              placeholder="[WIZE] 수강 신청이 접수되었습니다"
            />
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
                메일 본문
              </label>
              <textarea
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                rows={4}
                placeholder="{이름}님, {신청 과정} 수강 신청이 정상 접수되었습니다."
                className="w-full px-4 py-3 rounded-xl bg-white border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/10 transition-all resize-none"
              />
              <p className="text-xs text-gray-400 mt-1.5">
                사용 가능한 변수: {"{이름}"} {"{이메일}"} {"{연락처}"} {"{신청 과정}"}
              </p>
            </div>
            {emailBody && (
              <div className="mt-4 bg-[#FDF4FF] rounded-xl p-4 border border-purple-100">
                <p className="text-xs font-semibold text-purple-500 mb-2">예시 미리보기</p>
                <div className="bg-[#6366F1] rounded-2xl px-4 py-3 inline-block">
                  <p className="text-[13px] text-white leading-relaxed">
                    {emailBody
                      .replace(/\{이름\}/g, "홍길동")
                      .replace(/\{name\}/g, "홍길동")
                      .replace(/\{신청 과정\}/g, "파이썬 기초반")
                      .replace(/\{course\}/g, "파이썬 기초반")
                      .replace(/\{이메일\}/g, "hong@example.com")
                      .replace(/\{email\}/g, "hong@example.com")
                      .replace(/\{연락처\}/g, "010-1234-5678")
                      .replace(/\{phone\}/g, "010-1234-5678")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 실행 기록 */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-gray-900">실행 기록</h2>
            {backendRunCount !== null && backendRunCount > workflow.runs.length && (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                실제 {backendRunCount}회 수신됨
              </span>
            )}
          </div>
          {workflow.runs.length > 0 ? (
            <div className="space-y-2">
              {workflow.runs.slice(0, 5).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                >
                  <div className="text-sm text-gray-700 truncate mr-4">{run.inputMessage}</div>
                  <div className="text-xs text-gray-400 flex-shrink-0">
                    {new Date(run.createdAt).toLocaleString("ko-KR", {
                      month: "numeric",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">아직 실행 기록이 없어요. 테스트를 실행해보세요.</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            자동화 삭제
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleRetry}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Play className="w-4 h-4" />
              다시 테스트하기
            </button>
            {workflow.status !== "active" && (
              <button
                onClick={handleActivate}
                disabled={isActivating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#6366F1] text-[#6366F1] text-sm font-medium hover:bg-[#6366F1]/5 transition-colors disabled:opacity-60"
              >
                {isActivating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />
                    켜는 중...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    자동화 켜기
                  </>
                )}
              </button>
            )}
            {workflow.status === "active" && (
              <span className="flex items-center gap-1.5 text-sm font-semibold text-green-600">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                실행 중
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
            >
              {saved ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  저장됨
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  변경사항 저장
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirm modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-8">
          <div className="bg-white rounded-2xl p-6 max-w-[400px] w-full shadow-xl">
            <h3 className="text-[18px] font-bold text-gray-900 mb-2">자동화를 삭제할까요?</h3>
            <p className="text-sm text-gray-500 mb-6">
              「{workflow.title}」와 모든 실행 기록이 삭제됩니다. 이 작업은 되돌릴 수 없어요.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
