import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  MessageCircle,
  Database,
  FileText,
  Send,
  Edit3,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const analysisSteps = [
  { label: "사용자 입력 이해 중...", duration: 600 },
  { label: "도구 연결 감지 중...", duration: 500 },
  { label: "자동화 흐름 구성 중...", duration: 700 },
  { label: "분석 완료!", duration: 0 },
];

const analysisCards = [
  {
    id: 1,
    icon: MessageCircle,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    borderColor: "border-yellow-200",
    badgeBg: "bg-yellow-100 text-yellow-700",
    badge: "시작 조건",
    title: "카카오톡 메시지 도착",
    description:
      "카카오톡 채널에 새 메시지가 올 때마다 자동화가 시작돼요.",
    detail: "카카오톡 비즈니스 채널 · 실시간 감지",
  },
  {
    id: 2,
    icon: FileText,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    borderColor: "border-blue-200",
    badgeBg: "bg-blue-100 text-blue-700",
    badge: "가져올 정보",
    title: "신청 내용 자동 추출",
    description:
      "AI가 메시지에서 이름, 연락처, 신청 수업을 자동으로 읽어요.",
    detail: "이름 · 연락처 · 신청 수업명 · 신청 시간",
  },
  {
    id: 3,
    icon: Database,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    borderColor: "border-green-200",
    badgeBg: "bg-green-100 text-green-700",
    badge: "저장 위치",
    title: "구글시트에 자동 저장",
    description:
      "추출된 정보가 지정한 구글시트에 한 줄씩 추가돼요.",
    detail: "수강신청 명단 시트 · 새 행 추가",
  },
  {
    id: 4,
    icon: Send,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-600",
    borderColor: "border-purple-200",
    badgeBg: "bg-purple-100 text-purple-700",
    badge: "승인",
    title: "메시지 미리보기 및 승인",
    description:
      "자동 생성된 메시지를 확인하고 승인 후 발송해요.",
    detail: "사용자 승인 후 발송",
  },
];

export function AnalysisScreen() {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [visibleCards, setVisibleCards] = useState<number[]>(
    [],
  );
  const [editingId, setEditingId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    let currentStep = 0;
    const runStep = () => {
      if (currentStep >= analysisSteps.length - 1) {
        setStepIndex(analysisSteps.length - 1);
        setIsDone(true);
        // Reveal cards one by one
        analysisCards.forEach((card, i) => {
          setTimeout(() => {
            setVisibleCards((prev) => [...prev, card.id]);
          }, i * 180);
        });
        return;
      }
      setStepIndex(currentStep);
      setTimeout(() => {
        currentStep++;
        runStep();
      }, analysisSteps[currentStep].duration);
    };
    const timer = setTimeout(runStep, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="max-w-[900px] mx-auto px-8 py-14">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-[#F0F0FF] text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI 분석 결과
        </div>
        <h1
          className="text-[38px] font-bold text-gray-900 mb-3"
          style={{ letterSpacing: "-0.7px" }}
        >
          {isDone
            ? "자동화 흐름을 만들었어요!"
            : "AI가 분석하고 있어요..."}
        </h1>
        <p className="text-gray-500 text-[15px]">
          {isDone
            ? "아래 내용이 맞는지 확인하고 수정할 수 있어요."
            : "잠깐만 기다려 주세요. 금방 완료돼요 😊"}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-3 mb-12">
        {analysisSteps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-500 ${
                idx < stepIndex
                  ? "bg-[#6366F1]/10 text-[#6366F1]"
                  : idx === stepIndex
                    ? isDone && idx === analysisSteps.length - 1
                      ? "bg-green-100 text-green-600"
                      : "bg-[#6366F1] text-white shadow-md shadow-indigo-200"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {idx < stepIndex ||
              (isDone && idx === stepIndex) ? (
                <CheckCircle className="w-3 h-3" />
              ) : idx === stepIndex && !isDone ? (
                <div className="w-2.5 h-2.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <div className="w-2 h-2 rounded-full bg-gray-300" />
              )}
              {step.label}
            </div>
            {idx < analysisSteps.length - 1 && (
              <div
                className={`w-6 h-px transition-all duration-500 ${
                  idx < stepIndex
                    ? "bg-[#6366F1]/40"
                    : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Original Input Preview */}
      <div className="bg-gradient-to-r from-[#F7F8FC] to-[#F0F0FF] rounded-2xl p-5 border border-[#6366F1]/10 mb-8 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#6366F1]" />
        </div>
        <div>
          <p className="text-xs font-semibold text-[#6366F1] mb-1">
            입력한 내용
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            "카카오톡으로 수강 신청이 오면 이름, 연락처, 신청
            수업을 구글시트에 정리하고 신청자에게 확인 메시지를
            보내줘."
          </p>
        </div>
      </div>

      {/* Analysis Result Cards */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {analysisCards.map((card) => {
          const isVisible = visibleCards.includes(card.id);
          const isEditing = editingId === card.id;
          return (
            <div
              key={card.id}
              className={`bg-white rounded-2xl border-2 ${card.borderColor} p-5 transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0 shadow-sm"
                  : "opacity-0 translate-y-4"
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center`}
                  >
                    <card.icon
                      className={`w-5 h-5 ${card.iconColor}`}
                    />
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeBg}`}
                  >
                    {card.badge}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setEditingId(isEditing ? null : card.id)
                  }
                  className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-[#6366F1]/10 hover:text-[#6366F1] flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Card Body */}
              <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">
                {card.title}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                {card.description}
              </p>

              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    className="flex-1 bg-[#F7F8FC] rounded-xl px-3 py-2 text-xs text-gray-700 outline-none border border-[#6366F1]/30 focus:border-[#6366F1] transition-colors"
                    defaultValue={card.detail}
                    autoFocus
                  />
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-2 rounded-xl bg-[#6366F1] text-white text-xs font-semibold hover:bg-[#5558E3] transition-colors"
                  >
                    저장
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-xl px-3 py-2 text-xs text-gray-500">
                  {card.detail}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confidence Score */}
      {isDone && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200 mb-8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-green-600">
              카카오톡 · 구글시트 연동 방법을 확인했고, 흐름이
              문제없이 구성됐어요.
            </p>
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/input")}
          className="px-6 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all"
        >
          다시 입력하기
        </button>
        <button
          onClick={() => navigate("/workflow")}
          disabled={!isDone}
          className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-[15px] font-semibold transition-all ${
            isDone
              ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-90 shadow-md shadow-indigo-200"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        >
          자동화 흐름 확인하기
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}