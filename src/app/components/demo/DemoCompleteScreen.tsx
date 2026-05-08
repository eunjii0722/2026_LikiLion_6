import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  CheckCircle,
  Clock,
  MapPin,
  Zap,
  RotateCcw,
  BarChart2,
  PartyPopper,
} from "lucide-react";

const flowSteps = [
  { icon: MessageCircle, label: "카카오톡 메시지 도착", done: true },
  { icon: Brain, label: "AI 정보 추출", done: true },
  { icon: FileSpreadsheet, label: "구글시트 저장", done: true },
  { icon: Send, label: "확인 메시지 발송", done: true },
];

const summaryItems = [
  {
    icon: MapPin,
    label: "저장 위치",
    value: "수강신청 명단",
    sub: "Google Sheets",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    valueColor: "text-green-700",
  },
  {
    icon: Send,
    label: "발송 상태",
    value: "완료",
    sub: "카카오톡 자동응답",
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
    valueColor: "text-purple-700",
  },
];

export function DemoCompleteScreen() {
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
          <div className="w-7 h-7 rounded-full bg-[#6366F1]/10 flex items-center justify-center">
            <PartyPopper className="w-3.5 h-3.5 text-[#6366F1]" />
          </div>
          <span className="text-sm font-semibold text-[#6366F1]">자동화 실행 완료</span>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.8px" }}>
          확인 메시지 발송까지 완료했어요! 🎉
        </h1>
        <p className="text-[16px] text-gray-500">
          신청자에게 카카오톡 확인 메시지를 자동으로 보냈어요.
        </p>
      </motion.div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left */}
        <div>
          {/* Sent Message Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-[#B2C7DA] rounded-2xl overflow-hidden shadow-xl mb-6"
          >
            {/* Chat Header */}
            <div className="bg-[#3C1E1E] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-[#3C1E1E]">
                이
              </div>
              <div>
                <p className="text-white text-sm font-bold">이은지</p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-green-400 text-xs">자동 응답 완료</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-4 bg-[#B2C7DA]">
              <div className="flex items-center justify-center">
                <span className="bg-[#9BB2C4] text-[#4A5568] text-xs px-3 py-1 rounded-full">
                  2026년 5월 8일 목요일
                </span>
              </div>

              {/* Incoming message */}
              <div className="flex items-end gap-2">
                <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-[#3C1E1E] flex-shrink-0 mb-4">
                  이
                </div>
                <div>
                  <p className="text-xs text-[#4A6078] mb-1 ml-1 font-medium">이은지</p>
                  <div className="flex items-end gap-2">
                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[280px]">
                      <p className="text-[14px] text-gray-800">
                        이은지 / 010-1234-5678 / 파이썬 기초반 신청합니다.
                      </p>
                    </div>
                    <span className="text-xs text-[#4A6078] flex-shrink-0 mb-1">오후 2:30</span>
                  </div>
                </div>
              </div>

              {/* Sent message (from FlowTalk bot) */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex items-end gap-2 flex-row-reverse"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 mb-4 shadow-sm">
                  <Zap className="w-4 h-4 text-white fill-white" />
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-xs text-[#4A6078] mb-1 mr-1 font-medium">FlowTalk 자동응답</p>
                  <div className="flex items-end gap-2 flex-row-reverse">
                    <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl rounded-tr-sm px-4 py-3 shadow-md max-w-[320px]">
                      <p className="text-[14px] text-white leading-relaxed">
                        파이썬 기초반 신청이 완료되었습니다. 자세한 안내는 추후 전달드리겠습니다. 😊
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 mb-1">
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-[#4A6078]">오후 2:30</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4 mb-6"
          >
            {summaryItems.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 + idx * 0.1 }}
                className={`${item.bg} rounded-2xl p-5`}
              >
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center mb-3`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                <p className={`text-[18px] font-bold ${item.valueColor} mb-0.5`}>{item.value}</p>
                <p className="text-xs text-gray-400">{item.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* All done banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-6 mb-6 flex items-center gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <PartyPopper className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-[17px] mb-1">
                모든 자동화가 완료되었어요!
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-indigo-200 text-xs">전체 처리</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <button
              onClick={() => navigate("/demo")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 hover:border-gray-300 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              처음부터 다시 보기
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-[#6366F1]/30 text-[#6366F1] bg-[#F0F0FF] font-medium hover:bg-[#E8E8FF] transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              실행 기록 보기
            </button>
            <button
              onClick={() => navigate("/input")}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
            >
              <Zap className="w-4 h-4 fill-white" />
              나만의 자동화 만들기
            </button>
          </motion.div>
        </div>

        {/* Right: Flow Complete */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="sticky top-24"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">전체 실행 결과</p>
            <div className="space-y-1">
              {flowSteps.map((step, idx) => (
                <div key={idx}>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-green-50 border border-green-100"
                  >
                    <div className="w-9 h-9 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{step.label}</p>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-flex items-center gap-1 bg-green-100 text-green-600">
                        <CheckCircle className="w-3 h-3" />
                      </span>
                    </div>
                  </motion.div>
                  {idx < flowSteps.length - 1 && (
                    <div className="ml-[22px] w-px h-4 bg-green-200" />
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">수행된 작업</span>
                <span className="text-sm font-bold text-gray-900">4가지</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">오류</span>
                <span className="text-sm font-bold text-green-600">없음</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
