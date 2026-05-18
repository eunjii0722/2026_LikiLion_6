import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { createWorkflow, createSheet } from "../../api";
import type { WorkflowDraft } from "../../api";
import { addTestRun, createLocalWorkflow, updateWorkflowConfig, buildFallbackWorkflow, type TestData } from "../productStore";
import {
  FileText,
  FileSpreadsheet,
  Mail,
  Settings,
  Play,
  ChevronRight,
  ExternalLink,
  CheckCircle,
  User,
  Link2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const workflowSteps = [
  {
    id: 1,
    icon: FileText,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
    activeBorder: "border-yellow-400",
    title: "구글폼 응답 제출",
    description: "수강 신청 폼에 새 응답이 들어오면 시작돼요",
    badge: "시작 조건",
    badgeBg: "bg-yellow-100 text-yellow-700",
  },
  {
    id: 2,
    icon: FileSpreadsheet,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    activeBorder: "border-green-500",
    title: "구글시트에 행 추가",
    description: "추출된 정보를 시트에 자동으로 저장해요",
    badge: "저장",
    badgeBg: "bg-green-100 text-green-700",
  },
  {
    id: 3,
    icon: Mail,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    activeBorder: "border-purple-500",
    title: "Gmail 확인 메일 발송",
    description: "신청자에게 접수 완료 메일을 자동으로 보내요",
    badge: "발송",
    badgeBg: "bg-purple-100 text-purple-700",
  },
];

const initialStepDetails: Record<
  number,
  { title: string; fields: { label: string; value: string; editable?: boolean }[] }
> = {
  1: {
    title: "시작 조건 설정",
    fields: [
      { label: "구글폼 URL", value: "", editable: true },
      { label: "감지 방식", value: "Drive Push 실시간 감지" },
    ],
  },
  2: {
    title: "구글시트 저장 설정",
    fields: [
      { label: "시트 이름", value: "수강신청 응답", editable: true },
    ],
  },
  3: {
    title: "Gmail 발송 설정",
    fields: [
      { label: "메일 제목", value: "[WIZE] 수강 신청이 접수되었습니다", editable: true },
      { label: "메일 내용", value: "{이름}님, {신청 과정} 수강 신청이 정상 접수되었습니다.", editable: true },
    ],
  },
};

function extractFormId(url: string): string | undefined {
  const match = url.match(/\/forms\/d\/([a-zA-Z0-9_-]+)/);
  return match?.[1];
}

export function WorkflowScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateWorkflow = location.state?.workflow as WorkflowDraft | undefined;
  const inputText = (location.state?.inputText as string) ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRunningRef = useRef(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedStep, setSelectedStep] = useState(1);
  const [editingField, setEditingField] = useState<number | null>(null);
  const stateSheetId = (location.state?.sheetId as string) ?? "";
  const [sheetUrl, setSheetUrl] = useState(stateSheetId ? `https://docs.google.com/spreadsheets/d/${stateSheetId}/edit` : "");
  const [sheetId, setSheetId] = useState(stateSheetId);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [sheetError, setSheetError] = useState("");
  const [showTestData, setShowTestData] = useState(false);
  const [testData, setTestData] = useState<TestData>({
    name: "이은지",
    email: "eunji@example.com",
    phone: "010-1234-5678",
    item: "파이썬 기초반",
  });

  const [details, setDetails] = useState(initialStepDetails);
  const [editValue, setEditValue] = useState("");

  useEffect(() => {
    if (!stateWorkflow) navigate("/input", { replace: true });
  }, [stateWorkflow, navigate]);

  const detail = details[selectedStep];

  const updateField = (stepId: number, fieldIdx: number, value: string) => {
    setDetails((prev) => ({
      ...prev,
      [stepId]: {
        ...prev[stepId],
        fields: prev[stepId].fields.map((f, i) =>
          i === fieldIdx ? { ...f, value } : f
        ),
      },
    }));
  };

  const handleCreateSheet = async () => {
    setIsCreatingSheet(true);
    setSheetError("");
    try {
      const result = await createSheet(details[2].fields[0].value);
      setSheetUrl(result.sheet_url);
      setSheetId(result.sheet_id);
      updateField(2, 0, result.sheet_name);
    } catch {
      setSheetError("시트 생성 실패. 백엔드가 실행 중인지 확인해주세요.");
    } finally {
      setIsCreatingSheet(false);
    }
  };

  const emailBodyPreview = details[3].fields[1].value
    .replace(/\{이름\}/g, testData.name)
    .replace(/\{name\}/g, testData.name)
    .replace(/\{신청 과정\}/g, testData.item)
    .replace(/\{course\}/g, testData.item)
    .replace(/\{이메일\}/g, testData.email)
    .replace(/\{email\}/g, testData.email)
    .replace(/\{연락처\}/g, testData.phone)
    .replace(/\{phone\}/g, testData.phone);

  const handleRun = async () => {
    if (isRunningRef.current) return;
    if (!stateWorkflow) return;
    if (!sheetId) {
      setSubmitError("먼저 구글시트를 생성해주세요.");
      return;
    }
    isRunningRef.current = true;
    setIsSubmitting(true);
    setSubmitError("");
    try {
      const effectiveActions = stateWorkflow.actions.length > 0
        ? stateWorkflow.actions
        : buildFallbackWorkflow(inputText).actions;
      const updatedActions = effectiveActions.map((action) => {
        if (action.service === "google_sheets") {
          return {
            ...action,
            config: { ...action.config, sheet_name: details[2].fields[0].value },
          };
        }
        if (action.service === "gmail") {
          return {
            ...action,
            config: {
              ...action.config,
              subject: details[3].fields[0].value,
              body_template: details[3].fields[1].value,
            },
          };
        }
        return action;
      });
      const formUrl = details[1].fields[0].value;
      const extractedFormId = formUrl ? extractFormId(formUrl) : undefined;
      const workflow = createLocalWorkflow(
        inputText,
        updatedActions,
        formUrl || undefined,
        testData,
        extractedFormId,
        sheetId || undefined,
      );
      const workflowId = workflow.id;
      try {
        const backendResult = await createWorkflow(
          inputText,
          updatedActions,
          sheetId || undefined,
          extractedFormId,
        );
        updateWorkflowConfig(workflowId, { backendWorkflowId: backendResult.workflow_id });
      } catch {
        // The local product flow remains usable when the backend is not running.
      }
      addTestRun(workflowId);
      localStorage.setItem("workflow_id", workflowId);
      navigate("/result", { state: { workflowId, inputText } });
    } catch {
      setSubmitError("테스트 실행 중 오류가 발생했어요. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
      isRunningRef.current = false;
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.7px" }}>
          자동화 흐름 확인
        </h1>
        <p className="text-gray-500 text-sm md:text-base">
          구글폼 응답부터 시트 저장, Gmail 발송까지 한 흐름으로 확인하세요.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Left: Workflow blocks */}
        <div className="w-full md:w-[420px] md:flex-shrink-0">
          <div className="relative">
            {workflowSteps.map((step, idx) => (
              <div key={step.id} className="relative">
                {idx < workflowSteps.length - 1 && (
                  <div className="absolute left-[31px] top-[72px] w-px h-[52px] bg-gradient-to-b from-gray-200 to-gray-100 z-0" />
                )}

                <div
                  onClick={() => setSelectedStep(step.id)}
                  className={`relative z-10 flex items-start gap-4 bg-white rounded-2xl border-2 p-5 mb-3 cursor-pointer transition-all ${
                    selectedStep === step.id
                      ? `${step.activeBorder} shadow-lg`
                      : `${step.borderColor} hover:shadow-md`
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center flex-shrink-0 ${
                      selectedStep === step.id ? "shadow-sm" : ""
                    }`}
                  >
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${step.badgeBg}`}>
                        {step.badge}
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-gray-900 leading-snug mb-1">
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">{step.description}</p>
                  </div>

                  {selectedStep === step.id && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}


            {/* 테스트 데이터 (접기/펼치기) */}
            <div className="mt-4 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <button
                onClick={() => setShowTestData(!showTestData)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <p className="text-sm font-semibold text-gray-700">테스트 데이터</p>
                  <span className="text-xs text-gray-400">(기본값 사용 중)</span>
                </div>
                {showTestData ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {showTestData && (
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "이름", key: "name" as const },
                      { label: "이메일", key: "email" as const },
                      { label: "연락처", key: "phone" as const },
                      { label: "신청 과정", key: "item" as const },
                    ].map(({ label, key }) => (
                      <div key={key}>
                        <label className="block text-xs text-gray-400 mb-1">{label}</label>
                        <input
                          value={testData[key]}
                          onChange={(e) => setTestData((prev) => ({ ...prev, [key]: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-[#F7F8FC] text-xs text-gray-700 outline-none border border-transparent focus:border-[#6366F1] transition-colors"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Settings Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden md:sticky md:top-24">
            {/* Panel Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-[#F7F8FC] to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${workflowSteps[selectedStep - 1]?.iconBg} flex items-center justify-center`}>
                    {(() => {
                      const step = workflowSteps[selectedStep - 1];
                      return step ? <step.icon className={`w-4 h-4 ${step.iconColor}`} /> : null;
                    })()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium">선택한 단계</p>
                    <p className="text-[15px] font-bold text-gray-900">
                      {workflowSteps[selectedStep - 1]?.title}
                    </p>
                  </div>
                </div>
                <Settings className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Panel Content */}
            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-5">{detail.title}</h3>

              <div className="space-y-4">
                {selectedStep !== 1 && selectedStep !== 2 && detail.fields.map((field, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {field.label}
                      </label>
                      {field.editable && (
                        <button
                          onClick={() => {
                            if (editingField !== idx) setEditValue(field.value);
                            setEditingField(editingField === idx ? null : idx);
                          }}
                          className="text-xs text-[#6366F1] opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                        >
                          수정
                        </button>
                      )}
                    </div>
                    {editingField === idx ? (
                      <div className="flex gap-2">
                        <input
                          className="flex-1 bg-[#F7F8FC] rounded-xl px-4 py-2.5 text-sm text-gray-700 outline-none border border-[#6366F1]/30 focus:border-[#6366F1] transition-colors"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          autoFocus
                        />
                        <button
                          onClick={() => {
                            updateField(selectedStep, idx, editValue);
                            setEditingField(null);
                          }}
                          className="w-9 h-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center hover:bg-[#5558E3] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => {
                          if (field.editable) {
                            setEditValue(field.value);
                            setEditingField(idx);
                          }
                        }}
                        className={`bg-[#F7F8FC] rounded-xl px-4 py-3 text-sm text-gray-700 ${
                          field.editable ? "cursor-pointer hover:bg-gray-100 transition-colors" : ""
                        }`}
                      >
                        {field.value}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Step 1: 구글폼 URL 입력 */}
              {selectedStep === 1 && (
                <div className="mt-5 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">구글폼 URL</label>
                    <input
                      type="url"
                      value={details[1].fields[0].value}
                      onChange={(e) => updateField(1, 0, e.target.value)}
                      placeholder="https://docs.google.com/forms/d/..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FC] text-sm text-gray-700 outline-none border border-transparent focus:border-[#6366F1] transition-colors"
                    />
                    {details[1].fields[0].value && (
                      <a href={details[1].fields[0].value} target="_blank" rel="noopener noreferrer"
                        className="mt-1.5 flex items-center gap-1 text-xs text-[#6366F1] hover:underline">
                        <ExternalLink className="w-3 h-3" /> 폼 열기
                      </a>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">감지 방식</label>
                    <div className="bg-[#F7F8FC] rounded-xl px-4 py-3 text-sm text-gray-500">Drive Push 실시간 감지</div>
                  </div>
                </div>
              )}

              {/* Step 2: 시트 설정 */}
              {selectedStep === 2 && (
                <div className="mt-5 space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1.5">시트 이름</label>
                    <input
                      type="text"
                      value={details[2].fields[0].value}
                      onChange={(e) => updateField(2, 0, e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-[#F7F8FC] text-sm text-gray-700 outline-none border border-transparent focus:border-[#6366F1] transition-colors"
                    />
                  </div>
                  <div className="h-px bg-gray-100" />
                  {sheetId ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-green-700">시트 연결됨</p>
                          <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-green-600 flex items-center gap-1 hover:underline mt-0.5">
                            시트 열기 <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Link2 className="w-3.5 h-3.5 text-amber-600" />
                          <p className="text-xs font-semibold text-amber-800">구글폼과 이 시트를 연결해주세요</p>
                        </div>
                        {["구글폼 → 응답 탭 클릭", "스프레드시트 아이콘 → 기존 시트 선택", "위 WIZE 시트 선택 후 확인"].map((s, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-amber-700 mb-1">
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button onClick={handleCreateSheet} disabled={isCreatingSheet}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#6366F1]/5 border border-[#6366F1]/20 text-[#6366F1] text-sm font-semibold hover:bg-[#6366F1]/10 transition-colors disabled:opacity-60">
                        {isCreatingSheet ? (
                          <><div className="w-3.5 h-3.5 border-2 border-[#6366F1]/30 border-t-[#6366F1] rounded-full animate-spin" />시트 생성 중...</>
                        ) : (
                          <><FileSpreadsheet className="w-4 h-4" />새 구글시트 자동 생성</>
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-gray-100" />
                        <span className="text-xs text-gray-400">또는</span>
                        <div className="flex-1 h-px bg-gray-100" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 block mb-1.5">기존 시트 URL 붙여넣기</label>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={sheetUrl}
                            onChange={(e) => { setSheetUrl(e.target.value); setSheetError(""); }}
                            placeholder="https://docs.google.com/spreadsheets/d/..."
                            className="flex-1 px-3 py-2.5 rounded-xl bg-[#F7F8FC] text-xs text-gray-700 outline-none border border-transparent focus:border-[#6366F1] transition-colors"
                          />
                          <button
                            onClick={() => {
                              const match = sheetUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
                              if (match) { setSheetId(match[1]); }
                              else { setSheetError("올바른 구글시트 URL을 입력해주세요."); }
                            }}
                            className="px-3 py-2 rounded-xl bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#5558E3] transition-colors whitespace-nowrap"
                          >
                            확인
                          </button>
                        </div>
                      </div>
                      {sheetError && <p className="text-xs text-red-500">{sheetError}</p>}
                    </div>
                  )}
                </div>
              )}

              {/* Email preview for step 3 */}
              {selectedStep === 3 && (
                <div className="mt-5 bg-[#FDF4FF] rounded-xl p-4 border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 mb-3">테스트 데이터 기준 미리보기</p>
                  <div className="flex items-start gap-2 flex-row-reverse">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="bg-[#6366F1] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm inline-block">
                      <p className="text-[13px] text-white leading-relaxed">{emailBodyPreview}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-6 pb-6">
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
                    테스트 실행 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    테스트 실행하기
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
