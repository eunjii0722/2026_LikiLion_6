import { useState } from "react";
import { useNavigate } from "react-router";
import { useLocation } from "react-router";
import { createWorkflow } from "../../api";
import type { WorkflowDraft } from "../../api";
import {
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  Settings,
  Play,
  ChevronRight,
  Plus,
} from "lucide-react";

const workflowSteps = [
  {
    id: 1,
    icon: MessageCircle,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
    activeBorder: "border-yellow-400",
    title: "카카오톡 메시지 도착",
    description: "카카오톡 채널에 새 메시지가 오면 시작돼요",
    badge: "시작 조건",
    badgeBg: "bg-yellow-100 text-yellow-700",
  },
  {
    id: 2,
    icon: Brain,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    activeBorder: "border-blue-500",
    title: "AI가 신청 정보 추출",
    description: "메시지에서 필요한 정보를 자동으로 읽어요",
    badge: "AI 처리",
    badgeBg: "bg-blue-100 text-blue-700",
  },
  {
    id: 3,
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
    id: 4,
    icon: Send,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    activeBorder: "border-purple-500",
    title: "메시지 미리보기 및 승인",
    description: "자동 생성된 메시지를 확인하고 승인 후 발송해요",
    badge: "승인",
    badgeBg: "bg-purple-100 text-purple-700",
  },
];

const stepDetails: Record<
  number,
  { title: string; fields: { label: string; value: string; editable?: boolean }[] }
> = {
  1: {
    title: "시작 조건 설정",
    fields: [
      { label: "연결된 채널", value: "카카오톡 비즈니스 채널" },
      { label: "감지 방식", value: "새 메시지 실시간 감지" },
      { label: "필터 조건", value: "없음 (모든 메시지)", editable: true },
    ],
  },
  2: {
    title: "AI 정보 추출 설정",
    fields: [
      { label: "추출할 정보", value: "이름, 연락처, 신청 수업, 신청 시간", editable: true },
      { label: "실패 시 처리", value: "관리자에게 알림", editable: true },
    ],
  },
  3: {
    title: "구글시트 저장 설정",
    fields: [
      { label: "시트 이름", value: "수강신청 명단", editable: true },
      { label: "저장 순서", value: "이름 / 연락처 / 수업명 / 날짜", editable: true },
      { label: "중복 처리", value: "새 행으로 추가" },
    ],
  },
  4: {
    title: "메시지 미리보기 및 승인",
    fields: [
      {
        label: "메시지 내용",
        value: "{수업명} 신청이 완료되었습니다. 감사합니다! 🎉",
        editable: true,
      },
      { label: "발송 채널", value: "카카오톡 자동응답" },
      { label: "발송 방식", value: "사용자 승인 후 발송" },
    ],
  },
};

export function WorkflowScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateWorkflow = location.state?.workflow as WorkflowDraft | undefined;
  const inputText = (location.state?.inputText as string) ?? "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [selectedStep, setSelectedStep] = useState(2);
  const [editingField, setEditingField] = useState<number | null>(null);

  const detail = stepDetails[selectedStep];

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

  return (
    <div className="max-w-[1200px] mx-auto px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-[36px] font-bold text-gray-900 mb-2" style={{ letterSpacing: "-0.7px" }}>
          자동화 흐름 확인
        </h1>
        <p className="text-gray-500">
          각 단계를 클릭하면 세부 설정을 확인하고 수정할 수 있어요.
        </p>
      </div>

      <div className="flex gap-8">
        {/* Left: Workflow blocks */}
        <div className="w-[420px] flex-shrink-0">
          <div className="relative">
            {workflowSteps.map((step, idx) => (
              <div key={step.id} className="relative">
                {/* Connector line */}
                {idx < workflowSteps.length - 1 && (
                  <div className="absolute left-[31px] top-[72px] w-px h-[52px] bg-gradient-to-b from-gray-200 to-gray-100 z-0" />
                )}

                {/* Step Block */}
                <div
                  onClick={() => setSelectedStep(step.id)}
                  className={`relative z-10 flex items-start gap-4 bg-white rounded-2xl border-2 p-5 mb-3 cursor-pointer transition-all ${
                    selectedStep === step.id
                      ? `${step.activeBorder} shadow-lg`
                      : `${step.borderColor} hover:shadow-md`
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-12 h-12 rounded-xl ${step.iconBg} flex items-center justify-center flex-shrink-0 ${
                      selectedStep === step.id ? "shadow-sm" : ""
                    }`}
                  >
                    <step.icon className={`w-5 h-5 ${step.iconColor}`} />
                  </div>

                  {/* Content */}
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

                  {/* Active indicator */}
                  {selectedStep === step.id && (
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-[#6366F1] mt-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add step button */}
            <button className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#6366F1]/40 hover:text-[#6366F1] transition-all text-sm font-medium mt-1">
              <Plus className="w-4 h-4" />
              단계 추가하기
            </button>
          </div>
        </div>

        {/* Right: Settings Panel */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-24">
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
                {detail.fields.map((field, idx) => (
                  <div key={idx} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {field.label}
                      </label>
                      {field.editable && (
                        <button
                          onClick={() => setEditingField(editingField === idx ? null : idx)}
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
                          defaultValue={field.value}
                          autoFocus
                        />
                        <button
                          onClick={() => setEditingField(null)}
                          className="w-9 h-9 rounded-xl bg-[#6366F1] text-white flex items-center justify-center hover:bg-[#5558E3] transition-colors"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => field.editable && setEditingField(idx)}
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
                    등록 중...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    자동화 시작하기
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