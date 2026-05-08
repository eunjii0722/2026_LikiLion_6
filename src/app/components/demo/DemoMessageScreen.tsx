import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  ArrowRight,
  Bell,
} from "lucide-react";

const analysisPhases = [
  { text: "메시지를 수신하고 있어요...", done: false },
  { text: "AI가 메시지 내용을 읽고 있어요...", done: false },
  { text: "신청 정보를 인식하고 있어요...", done: false },
  { text: "정보 추출이 완료되었어요! ✓", done: true },
];

export function DemoMessageScreen() {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [isAnalysisDone, setIsAnalysisDone] = useState(false);

  useEffect(() => {
    // Show notification first
    const t1 = setTimeout(() => setShowNotification(true), 400);
    const t2 = setTimeout(() => setShowBubble(true), 1000);
    // Cycle through analysis phases
    const t3 = setTimeout(() => setPhaseIndex(1), 1800);
    const t4 = setTimeout(() => setPhaseIndex(2), 2600);
    const t5 = setTimeout(() => { setPhaseIndex(3); setIsAnalysisDone(true); }, 3400);
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, []);

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
          <Bell className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-semibold text-yellow-600">새 메시지 도착</span>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.8px" }}>
          새 신청 메시지가 도착했어요
        </h1>
        <p className="text-[16px] text-gray-500">
          카카오톡 채널에 수강 신청 메시지가 왔어요. AI가 분석을 시작했어요.
        </p>
      </motion.div>

      <div className="grid grid-cols-[1fr_340px] gap-8">
        {/* Left: KakaoTalk Chat */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* Push Notification */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="flex items-center gap-3 bg-[#FFF9E6] border border-yellow-200 rounded-2xl p-4 mb-6 shadow-md"
              >
                <div className="w-10 h-10 rounded-xl bg-yellow-400 flex items-center justify-center flex-shrink-0 text-lg">
                  💬
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-gray-900">카카오톡 채널</p>
                    <span className="text-xs text-gray-400">방금 전</span>
                  </div>
                  <p className="text-sm text-gray-600">이은지님이 메시지를 보냈습니다.</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat Window */}
          <div className="bg-[#B2C7DA] rounded-2xl overflow-hidden shadow-xl">
            {/* Chat Header */}
            <div className="bg-[#3C1E1E] px-5 py-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-[#3C1E1E]">
                이
              </div>
              <div>
                <p className="text-white text-sm font-bold">이은지</p>
                <p className="text-gray-400 text-xs">수강신청 문의</p>
              </div>
            </div>

            {/* Messages */}
            <div className="p-5 space-y-3 min-h-[240px] bg-[#B2C7DA]">
              {/* Date divider */}
              <div className="flex items-center justify-center">
                <span className="bg-[#9BB2C4] text-[#4A5568] text-xs px-3 py-1 rounded-full">
                  2026년 5월 8일 목요일
                </span>
              </div>

              {/* Incoming message */}
              <AnimatePresence>
                {showBubble && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-end gap-2"
                  >
                    <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center text-sm font-bold text-[#3C1E1E] flex-shrink-0 mb-4">
                      이
                    </div>
                    <div>
                      <p className="text-xs text-[#4A6078] mb-1 ml-1 font-medium">이은지</p>
                      <div className="flex items-end gap-2">
                        <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[300px]">
                          <p className="text-[15px] text-gray-800 leading-relaxed">
                            이은지 / 010-1234-5678 / 파이썬 기초반 신청합니다.
                          </p>
                        </div>
                        <span className="text-xs text-[#4A6078] flex-shrink-0 mb-1">오후 2:30</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Analysis Status */}
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Brain className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">AI 분석 상태</p>
                <p className="text-xs text-gray-400">FlowTalk AI가 메시지를 분석하고 있어요</p>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {analysisPhases.map((phase, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: idx <= phaseIndex ? 1 : 0.3 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                      idx < phaseIndex
                        ? "bg-green-100"
                        : idx === phaseIndex
                        ? phase.done ? "bg-green-100" : "bg-blue-100"
                        : "bg-gray-100"
                    }`}>
                      {idx < phaseIndex || (idx === phaseIndex && phase.done) ? (
                        <span className="text-green-600 text-xs">✓</span>
                      ) : idx === phaseIndex ? (
                        <div className="w-2.5 h-2.5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300" />
                      )}
                    </div>
                    <span className={`text-sm ${
                      idx <= phaseIndex ? (phase.done && idx === phaseIndex ? "text-green-600 font-semibold" : "text-gray-700") : "text-gray-300"
                    }`}>
                      {phase.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Next Button */}
          <AnimatePresence>
            {isAnalysisDone && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate("/demo/extract")}
                className="mt-5 w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[15px] font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
              >
                AI가 추출한 정보 확인하기
                <ArrowRight className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Right: Flow Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">자동화 진행 상황</p>
            <div className="space-y-1">
              {[
                { icon: MessageCircle, label: "카카오톡 메시지 도착", status: "진행 중", color: "bg-yellow-50 text-yellow-500", statusBg: "bg-yellow-100 text-yellow-700", active: true },
                { icon: Brain, label: "AI 정보 추출", status: "대기 중", color: "bg-blue-50 text-blue-400", statusBg: "bg-gray-100 text-gray-400", active: false },
                { icon: FileSpreadsheet, label: "구글시트 저장", status: "대기 중", color: "bg-green-50 text-green-400", statusBg: "bg-gray-100 text-gray-400", active: false },
                { icon: Send, label: "확인 메시지 발송", status: "대기 중", color: "bg-purple-50 text-purple-400", statusBg: "bg-gray-100 text-gray-400", active: false },
              ].map((step, idx) => (
                <div key={idx}>
                  <div className={`flex items-center gap-3 p-3.5 rounded-xl ${step.active ? "bg-yellow-50 border border-yellow-200" : ""}`}>
                    <div className={`w-9 h-9 rounded-xl ${step.color} flex items-center justify-center flex-shrink-0`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${step.active ? "text-gray-900" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-block ${step.statusBg}`}>
                        {step.active ? "⚡ " : ""}{step.status}
                      </span>
                    </div>
                  </div>
                  {idx < 3 && (
                    <div className={`ml-[22px] w-px h-4 ${step.active ? "bg-yellow-200" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                <p className="text-xs text-gray-500">메시지 수신 후 즉시 AI 분석 시작</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
