import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from "lucide-react";

const extractedFields = [
  {
    icon: "👤",
    label: "이름",
    value: "이은지",
    from: "이은지 / 010-...",
    bg: "bg-blue-50",
    border: "border-blue-100",
    textColor: "text-blue-800",
    labelColor: "text-blue-500",
  },
  {
    icon: "📱",
    label: "연락처",
    value: "010-1234-5678",
    from: "/ 010-1234-5678 /",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    textColor: "text-indigo-800",
    labelColor: "text-indigo-500",
  },
  {
    icon: "📚",
    label: "신청 수업",
    value: "파이썬 기초반",
    from: "/ 파이썬 기초반 신청...",
    bg: "bg-purple-50",
    border: "border-purple-100",
    textColor: "text-purple-800",
    labelColor: "text-purple-500",
  },
  {
    icon: "🕐",
    label: "신청 시간",
    value: "2026.05.08 14:30",
    from: "메시지 수신 시각",
    bg: "bg-violet-50",
    border: "border-violet-100",
    textColor: "text-violet-800",
    labelColor: "text-violet-500",
  },
];

const flowSteps = [
  {
    icon: MessageCircle,
    label: "카카오톡 메시지 도착",
    badge: "완료",
    color: "bg-yellow-50 text-yellow-500",
    badgeBg: "bg-green-100 text-green-600",
    active: false,
    done: true,
  },
  {
    icon: Brain,
    label: "AI 정보 추출",
    badge: "진행 중",
    color: "bg-blue-50 text-blue-500",
    badgeBg: "bg-blue-100 text-blue-700",
    active: true,
    done: false,
  },
  {
    icon: FileSpreadsheet,
    label: "구글시트 저장",
    badge: "대기 중",
    color: "bg-green-50 text-green-500",
    badgeBg: "bg-gray-100 text-gray-400",
    active: false,
    done: false,
  },
  {
    icon: Send,
    label: "확인 메시지 발송",
    badge: "대기 중",
    color: "bg-purple-50 text-purple-500",
    badgeBg: "bg-gray-100 text-gray-400",
    active: false,
    done: false,
  },
];

export function DemoExtractScreen() {
  const navigate = useNavigate();

  return (
    <div className="max-w-[1100px] mx-auto px-8 py-14">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-sm font-semibold text-blue-600">AI 정보 추출 완료</span>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.8px" }}>
          AI가 신청 정보를 추출했어요
        </h1>
      </motion.div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left: Extracted Info */}
        <div>
          {/* Original Message */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-[#FFF9E6] rounded-2xl border border-yellow-200 p-5 mb-6 flex items-start gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-yellow-300 flex items-center justify-center font-bold text-[#3C1E1E] flex-shrink-0">
              이
            </div>
            <div>
              <p className="text-xs font-semibold text-yellow-700 mb-1">원본 카카오톡 메시지</p>
              <div className="bg-white rounded-xl rounded-tl-sm px-4 py-3 shadow-sm border border-yellow-100 inline-block">
                <p className="text-[15px] text-gray-800">
                  이은지 / 010-1234-5678 / 파이썬 기초반 신청합니다.
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">2026.05.08 오후 2:30</p>
            </div>
          </motion.div>

          {/* AI Arrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-6"
          >
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-200" />
            <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-blue-600">AI가 분석해서 분류했어요</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-200" />
          </motion.div>

          {/* Extracted Fields Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {extractedFields.map((field, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 + idx * 0.1 }}
                className={`${field.bg} border ${field.border} rounded-2xl p-5`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{field.icon}</span>
                  <span className={`text-xs font-semibold ${field.labelColor} uppercase tracking-wide`}>
                    {field.label}
                  </span>
                </div>
                <p className={`text-[20px] font-bold ${field.textColor} mb-2`}>
                  {field.value}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-gray-300" />
                  <p className="text-xs text-gray-400">원문: "{field.from}"</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Accuracy Banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-700 mb-1">
                4가지 정보를 모두 정확하게 추출했어요
              </p>
              <p className="text-xs text-green-600">
                누락된 항목이나 오류 없이 모든 신청 정보를 읽어냈어요.
              </p>
            </div>
          </motion.div>

          {/* Next */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => navigate("/demo/save")}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[15px] font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
          >
            구글시트 저장 확인하기
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Right: Flow Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="sticky top-24"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">자동화 진행 상황</p>
            <div className="space-y-1">
              {flowSteps.map((step, idx) => (
                <div key={idx}>
                  <div className={`flex items-center gap-3 p-3.5 rounded-xl transition-all ${
                    step.active
                      ? "bg-blue-50 border border-blue-200"
                      : step.done
                      ? "bg-green-50/60 border border-green-100"
                      : ""
                  }`}>
                    <div className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0 ${!step.active && !step.done ? "opacity-40" : ""}`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${step.active || step.done ? "text-gray-800" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-flex items-center gap-1 ${step.badgeBg}`}>
                        {step.done && <CheckCircle className="w-3 h-3" />}
                        {step.badge}
                      </span>
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className={`ml-[22px] w-px h-4 ${step.done ? "bg-green-200" : step.active ? "bg-blue-200" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-xs text-gray-400 mb-3">추출 완료된 정보</p>
              <div className="space-y-2">
                {["이름: 이은지", "연락처: 010-1234-5678", "수업: 파이썬 기초반", "시간: 2026.05.08 14:30"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
