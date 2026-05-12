import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  FileText,
  Brain,
  FileSpreadsheet,
  Mail,
  CheckCircle,
  Zap,
  RotateCcw,
  PartyPopper,
} from "lucide-react";

const flowSteps = [
  { icon: FileText, label: "구글 폼 응답 감지", done: true },
  { icon: Brain, label: "데이터 추출", done: true },
  { icon: FileSpreadsheet, label: "구글시트 저장", done: true },
  { icon: Mail, label: "Gmail 발송", done: true },
];

const summaryItems = [
  {
    icon: FileSpreadsheet,
    label: "저장 위치",
    value: "저장 완료",
    sub: "Google Sheets",
    bg: "bg-green-50",
    iconColor: "text-green-600",
    iconBg: "bg-green-100",
    valueColor: "text-green-700",
  },
  {
    icon: Mail,
    label: "발송 상태",
    value: "발송 완료",
    sub: "Gmail 자동발송",
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
          Gmail 발송까지 완료했어요! 🎉
        </h1>
        <p className="text-[16px] text-gray-500">
          신청자에게 확인 이메일을 자동으로 발송했어요.
        </p>
      </motion.div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left */}
        <div>
          {/* Gmail Email Preview */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-xl mb-6 overflow-hidden"
          >
            {/* Gmail-style header bar */}
            <div className="bg-[#F6F8FC] border-b border-gray-200 px-5 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-4 bg-white rounded-full px-4 py-1.5 text-xs text-gray-400 border border-gray-200">
                Gmail — 받은편지함
              </div>
            </div>

            {/* Email header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-[17px] font-bold text-gray-900 mb-4">
                [WIZE] 수강 신청이 완료되었습니다
              </h2>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center flex-shrink-0 shadow-sm">
                  <span className="text-white text-sm font-bold">W</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-sm font-bold text-gray-900">WIZE 자동화 &lt;noreply@wize-demo.com&gt;</p>
                    <span className="text-xs text-gray-400">2026.05.13 09:30</span>
                  </div>
                  <p className="text-xs text-gray-500">받는사람: eunji@example.com</p>
                </div>
              </div>
            </div>

            {/* Email body */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="px-6 py-5"
            >
              <p className="text-[15px] text-gray-800 mb-4">안녕하세요, 이은지님! 👋</p>
              <p className="text-[15px] text-gray-800 mb-6">
                파이썬 기초반 수강 신청이 완료되었습니다.
              </p>

              <div className="bg-[#F6F8FC] rounded-xl p-4 mb-6 border border-gray-100">
                <p className="text-sm font-bold text-gray-700 mb-3">📋 신청 정보</p>
                <div className="space-y-1.5">
                  {[
                    { label: "이름", value: "이은지" },
                    { label: "수강과목", value: "파이썬 기초반" },
                    { label: "신청일시", value: "2026.05.13 09:30" },
                  ].map((row, idx) => (
                    <p key={idx} className="text-sm text-gray-600">
                      - {row.label}: <span className="font-semibold text-gray-800">{row.value}</span>
                    </p>
                  ))}
                </div>
              </div>

              <p className="text-[15px] text-gray-800 mb-1">자세한 안내는 추후 전달드리겠습니다.</p>
              <p className="text-[15px] text-gray-800 mb-5">감사합니다 😊</p>
              <p className="text-sm text-gray-500 font-medium">WIZE 자동화팀</p>
            </motion.div>
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
                        완료
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
