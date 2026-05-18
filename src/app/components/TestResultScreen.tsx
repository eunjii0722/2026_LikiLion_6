import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  CheckCircle,
  FileText,
  Brain,
  FileSpreadsheet,
  Mail,
  Zap,
  ArrowRight,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  PartyPopper,
  Link2,
} from "lucide-react";
import { motion } from "motion/react";
import { activateWorkflow, buildRun, getWorkflows } from "../productStore";
import { reactivateWorkflow } from "../../api";
import type { WorkflowDraft } from "../../api";

const resultSteps = [
  {
    id: 1,
    icon: FileText,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    status: "완료",
    statusColor: "text-green-600 bg-green-50",
    title: "구글폼 응답 감지",
  },
  {
    id: 2,
    icon: Brain,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    status: "완료",
    statusColor: "text-green-600 bg-green-50",
    title: "응답 필드 정리",
  },
  {
    id: 3,
    icon: FileSpreadsheet,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    status: "완료",
    statusColor: "text-green-600 bg-green-50",
    title: "구글시트 저장",
  },
  {
    id: 4,
    icon: Mail,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    status: "완료",
    statusColor: "text-green-600 bg-green-50",
    title: "Gmail 발송",
  },
];

export function TestResultScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const workflowId =
    (location.state?.workflowId as string | undefined) ??
    localStorage.getItem("workflow_id") ??
    "";
  const workflow = getWorkflows().find((item) => item.id === workflowId);
  const run = workflow?.runs[0] ?? buildRun(workflow?.originPrompt ?? "");

  const sheetAction = workflow?.actions.find((a) => a.service === "google_sheets");
  const gmailAction = workflow?.actions.find((a) => a.service === "gmail");
  const sheetName = (sheetAction?.config?.sheet_name as string) ?? "수강신청 응답";
  const emailSubject = (gmailAction?.config?.subject as string) ?? "[WIZE] 수강 신청이 접수되었습니다";
  const rawBodyTemplate = (gmailAction?.config?.body_template as string) ?? "";
  const emailBody = rawBodyTemplate
    ? rawBodyTemplate
        .replace(/\{이름\}/g, run.fields.name)
        .replace(/\{name\}/g, run.fields.name)
        .replace(/\{신청 과정\}/g, run.fields.item)
        .replace(/\{course\}/g, run.fields.item)
    : run.confirmationMessage;
  const todayRunCount = workflow?.runs.filter((r) => {
    const d = new Date(r.createdAt);
    const today = new Date();
    return d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();
  }).length ?? 0;
  const [isActivating, setIsActivating] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("extraction");

  const handleRetry = () => {
    if (!workflow) {
      navigate("/input");
      return;
    }
    const retryWorkflow: WorkflowDraft = {
      trigger: { service: "google_form", form_id: "local-product-form" },
      actions: workflow.actions,
    };
    navigate("/workflow", {
      state: {
        workflow: retryWorkflow,
        inputText: workflow.originPrompt,
        formUrl: workflow.formUrl,
      },
    });
  };

  const handleActivate = async () => {
    setIsActivating(true);
    if (workflowId) activateWorkflow(workflowId);
    const minDelay = new Promise<void>((r) => setTimeout(r, 1200));
    if (workflow?.backendWorkflowId) {
      try {
        await Promise.all([reactivateWorkflow(workflow.backendWorkflowId), minDelay]);
      } catch {
        await minDelay;
      }
    } else {
      await minDelay;
    }
    setIsActivating(false);
    setIsActive(true);
  };

  if (isActive) {
    return (
      <div className="max-w-[700px] mx-auto px-8 py-16 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] mx-auto mb-6 flex items-center justify-center shadow-xl shadow-indigo-200">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-[40px] font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.8px" }}>
            자동화가 켜졌어요! 🎉
          </h1>
          <p className="text-[16px] text-gray-500 mb-8 leading-relaxed">
            이제부터 새 접수가 들어오면<br />
            자동으로 시트에 정리되고 확인 메일이 발송돼요.
          </p>

          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 text-left">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white fill-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{workflow?.title ?? "업무 접수 자동화"}</p>
                  <p className="text-sm text-gray-500">방금 생성됨</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-semibold text-green-600">실행 중</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#F7F8FC] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">처리된 건수</p>
                <p className="text-lg font-bold text-gray-900">{workflow?.runs.length ?? 1}건</p>
              </div>
              <div className="bg-[#F7F8FC] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">오늘 실행</p>
                <p className="text-lg font-bold text-gray-900">{todayRunCount}회</p>
              </div>
              <div className="bg-[#F7F8FC] rounded-xl p-3 text-center">
                <p className="text-xs text-gray-400 mb-1">정확도</p>
                <p className="text-lg font-bold text-green-600">99%</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
            >
              홈으로 돌아가기
            </button>
            <button
              onClick={() => navigate("/input")}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-semibold hover:opacity-90 transition-all shadow-md shadow-indigo-200"
            >
              새 자동화 만들기
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <CheckCircle className="w-3.5 h-3.5" />
          테스트 성공
        </div>
        <h1 className="text-[28px] md:text-[40px] font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.8px" }}>
          테스트가 완료되었어요. ✅
        </h1>
        <p className="text-[16px] text-gray-500">
          모든 단계가 정상적으로 작동했어요. 아래에서 결과를 확인해보세요.
        </p>
      </div>

      {/* Step status */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {resultSteps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${step.iconBg} flex items-center justify-center border-2 border-green-200`}
              >
                <step.icon className={`w-4 h-4 md:w-5 md:h-5 ${step.iconColor}`} />
              </div>
              <div className="mt-2 text-center">
                <div className="hidden md:block text-xs font-medium text-gray-600">{step.title}</div>
                <div className={`text-xs font-semibold mt-1 px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${step.statusColor}`}>
                  <CheckCircle className="w-3 h-3" />
                  <span className="hidden md:inline">{step.status}</span>
                </div>
              </div>
            </div>
            {idx < resultSteps.length - 1 && (
              <div className="w-4 md:w-12 h-px bg-green-200 mb-8 md:mb-12 mx-1 flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Result Cards */}
      <div className="space-y-4 mb-10">
        {/* Input message */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === "input" ? null : "input")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-yellow-500" />
              </div>
              <span className="font-semibold text-gray-900">제출된 구글폼 응답</span>
            </div>
            {expandedSection === "input" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "input" && (
            <div className="px-6 pb-5 border-t border-gray-50">
              <div className="mt-4 bg-[#FFF9E6] rounded-xl p-4 border border-yellow-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-300 flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    이
                  </div>
                  <div>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm border border-yellow-100 inline-block">
                      <p className="text-[15px] text-gray-800">
                        {run.inputMessage}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 ml-1">오전 10:23</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Extraction result */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === "extraction" ? null : "extraction")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-500" />
              </div>
              <span className="font-semibold text-gray-900">AI 추출 결과</span>
            </div>
            {expandedSection === "extraction" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "extraction" && (
            <div className="px-6 pb-5 border-t border-gray-50">
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "이름", value: run.fields.name, icon: "👤" },
                  { label: "이메일", value: run.fields.email, icon: "✉️" },
                  { label: "연락처", value: run.fields.phone, icon: "📱" },
                  { label: "신청 과정", value: run.fields.item, icon: "📚" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-blue-50 rounded-xl p-4">
                    <div className="text-lg mb-1">{item.icon}</div>
                    <p className="text-xs text-blue-400 font-medium mb-1">{item.label}</p>
                    <p className="text-[15px] font-bold text-blue-800">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">모든 정보를 정확하게 추출했어요</span>
              </div>
            </div>
          )}
        </div>

        {/* Google Sheet result */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === "sheet" ? null : "sheet")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
              </div>
              <span className="font-semibold text-gray-900">구글시트 저장 결과 — {sheetName}</span>
            </div>
            {expandedSection === "sheet" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "sheet" && (
            <div className="px-6 pb-5 border-t border-gray-50">
              <div className="mt-4 bg-[#F0FDF4] rounded-xl overflow-hidden border border-green-100">
                {/* Sheet header */}
                <div className="grid grid-cols-5 bg-green-100 text-green-800 text-xs font-semibold px-4 py-2.5 gap-4">
                  <span>제출일</span>
                  <span>이름</span>
                  <span>이메일</span>
                  <span>연락처</span>
                  <span>신청 과정</span>
                </div>
                {/* Example rows */}
                <div className="grid grid-cols-5 text-xs text-gray-400 px-4 py-2.5 gap-4 border-b border-green-50">
                  <span>2026.05.07</span>
                  <span>김민지</span>
                  <span>minji@example.com</span>
                  <span>010-9876-5432</span>
                  <span>HTML 기초반</span>
                </div>
                {/* New row (highlighted) */}
                <div className="grid grid-cols-5 text-sm text-green-800 px-4 py-3 gap-4 bg-green-50 font-medium border-l-4 border-green-400">
                  <span>{new Date(run.createdAt).toLocaleDateString("ko-KR")}</span>
                  <span>{run.fields.name}</span>
                  <span>{run.fields.email}</span>
                  <span>{run.fields.phone}</span>
                  <span>{run.fields.item}</span>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">「{sheetName}」에 새 행이 추가되었어요</span>
              </div>
            </div>
          )}
        </div>

        {/* Message sent */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <button
            onClick={() => setExpandedSection(expandedSection === "message" ? null : "message")}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <span className="font-semibold text-gray-900">발송된 Gmail 확인 메일</span>
                <p className="text-xs text-gray-400 mt-0.5">제목: {emailSubject}</p>
              </div>
            </div>
            {expandedSection === "message" ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {expandedSection === "message" && (
            <div className="px-6 pb-5 border-t border-gray-50">
              <div className="mt-4 bg-[#FDF4FF] rounded-xl p-4 border border-purple-100">
                <div className="flex items-start gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0">
                    <Zap className="w-4 h-4 text-white fill-white" />
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="bg-[#6366F1] rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm inline-block">
                      <p className="text-[15px] text-white">
                        {emailBody}
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 mr-1">오전 10:23</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-500">{run.fields.name} 님께 Gmail 확인 메일 발송 완료</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 구글폼-시트 연결 안내 (자동화 켜기 전) */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Link2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-amber-800">자동화 켜기 전에 확인해주세요</p>
        </div>
        <p className="text-xs text-gray-500 mb-3 leading-relaxed">
          구글폼과 WIZE 시트를 연결해야 폼 응답이 자동으로 처리돼요.
        </p>
        <div className="space-y-1.5">
          {[
            "구글폼 편집 → 상단 응답(Responses) 탭 클릭",
            "초록색 스프레드시트 아이콘 클릭",
            "기존 스프레드시트 선택 → WIZE가 만든 시트 선택",
            "확인 클릭 후 아래 버튼 누르기",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-amber-700">
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
        <button
          onClick={handleRetry}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          다시 테스트하기
        </button>
        <button
          onClick={handleActivate}
          disabled={isActivating}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-10 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[16px] font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 hover:-translate-y-0.5"
        >
          {isActivating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              켜는 중...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              자동화 켜기
            </>
          )}
        </button>
      </div>
    </div>
  );
}
