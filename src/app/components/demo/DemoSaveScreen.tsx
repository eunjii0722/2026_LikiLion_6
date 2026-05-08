import { useNavigate } from "react-router";
import { motion } from "motion/react";
import {
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  ArrowRight,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

const existingRows = [
  { num: 1, name: "김민준", contact: "010-9876-0001", class: "HTML 기초반", time: "2026.05.07 10:15", status: "완료" },
  { num: 2, name: "박지수", contact: "010-5432-1001", class: "엑셀 활용반", time: "2026.05.07 14:20", status: "완료" },
  { num: 3, name: "최유진", contact: "010-2345-6789", class: "파이썬 기초반", time: "2026.05.08 09:50", status: "완료" },
];

const flowSteps = [
  { icon: MessageCircle, label: "카카오톡 메시지 도착", done: true, active: false },
  { icon: Brain, label: "AI 정보 추출", done: true, active: false },
  { icon: FileSpreadsheet, label: "구글시트 저장", done: false, active: true },
  { icon: Send, label: "확인 메시지 발송", done: false, active: false },
];

export function DemoSaveScreen() {
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
          <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center">
            <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-sm font-semibold text-green-600">구글시트 저장 완료</span>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.8px" }}>
          구글시트에 자동 저장되었어요
        </h1>
        <p className="text-[16px] text-gray-500">
          추출된 정보가 '수강신청 명단' 시트에 새 행으로 자동 추가되었어요.
        </p>
      </motion.div>

      <div className="grid grid-cols-[1fr_320px] gap-8">
        {/* Left: Google Sheet View */}
        <div>
          {/* Sheet metadata */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="flex items-center justify-between mb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">수강신청 명단</p>
                <p className="text-xs text-gray-400">Google Sheets · 마지막 업데이트: 방금 전</p>
              </div>
            </div>
            <button className="flex items-center gap-1.5 text-xs text-[#6366F1] font-medium px-3 py-1.5 rounded-lg hover:bg-[#F0F0FF] transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              시트 열기
            </button>
          </motion.div>

          {/* Spreadsheet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm mb-5"
          >
            {/* Sheet Tab */}
            <div className="bg-gray-50 border-b border-gray-200 px-4 pt-3 flex items-center gap-1">
              <div className="bg-white border border-gray-200 border-b-0 px-4 py-1.5 rounded-t-lg text-xs font-semibold text-green-700">
                수강신청 명단
              </div>
              <div className="px-3 py-1.5 text-xs text-gray-400">Sheet2</div>
            </div>

            {/* Header Row */}
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_100px] bg-[#F3F4F6] border-b border-gray-200">
              <div className="px-3 py-2.5 text-xs font-bold text-gray-400 border-r border-gray-200 text-center"></div>
              {["이름", "연락처", "신청 수업", "신청 시간", "처리 상태"].map((col) => (
                <div key={col} className="px-4 py-2.5 text-xs font-bold text-gray-600 border-r border-gray-200 last:border-r-0">
                  {col}
                </div>
              ))}
            </div>

            {/* Existing Rows */}
            {existingRows.map((row) => (
              <div
                key={row.num}
                className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_100px] border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <div className="px-3 py-3 text-xs text-gray-400 border-r border-gray-100 text-center font-medium">
                  {row.num}
                </div>
                <div className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{row.name}</div>
                <div className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{row.contact}</div>
                <div className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{row.class}</div>
                <div className="px-4 py-3 text-sm text-gray-700 border-r border-gray-100">{row.time}</div>
                <div className="px-4 py-3">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {row.status}
                  </span>
                </div>
              </div>
            ))}

            {/* NEW Row - Highlighted */}
            <motion.div
              initial={{ opacity: 0, backgroundColor: "#ECFDF5" }}
              animate={{ opacity: 1, backgroundColor: "#ECFDF5" }}
              transition={{ delay: 0.5, duration: 0.4 }}
              className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_100px] border-b-2 border-green-300 relative"
              style={{ background: "#ECFDF5" }}
            >
              {/* New badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="absolute -left-2 top-1/2 -translate-y-1/2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm"
              >
                NEW
              </motion.div>
              <div className="px-3 py-3.5 text-xs text-green-600 border-r border-green-200 text-center font-bold">
                4
              </div>
              <div className="px-4 py-3.5 text-sm font-bold text-green-800 border-r border-green-200">이은지</div>
              <div className="px-4 py-3.5 text-sm font-bold text-green-800 border-r border-green-200">010-1234-5678</div>
              <div className="px-4 py-3.5 text-sm font-bold text-green-800 border-r border-green-200">파이썬 기초반</div>
              <div className="px-4 py-3.5 text-sm font-bold text-green-800 border-r border-green-200">2026.05.08 14:30</div>
              <div className="px-4 py-3.5">
                <span className="text-xs font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                  저장 완료
                </span>
              </div>
            </motion.div>

            {/* Empty row hint */}
            <div className="grid grid-cols-[40px_1fr_1fr_1fr_1fr_100px] bg-gray-50/50">
              <div className="px-3 py-2.5 text-xs text-gray-200 border-r border-gray-100 text-center">5</div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-4 py-2.5 border-r border-gray-100 last:border-r-0" />
              ))}
            </div>
          </motion.div>

          {/* Save confirmation banner */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="flex items-center gap-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 mb-6"
          >
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-700 mb-1">4행에 신청 정보가 저장되었어요</p>
            </div>
          </motion.div>

          {/* Next */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onClick={() => navigate("/demo/complete")}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[15px] font-bold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
          >
            확인 메시지 발송 결과 보기
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>

        {/* Right: Flow Progress */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="sticky top-24"
        >
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-5">자동화 진행 상황</p>
            <div className="space-y-1">
              {flowSteps.map((step, idx) => (
                <div key={idx}>
                  <div className={`flex items-center gap-3 p-3.5 rounded-xl ${
                    step.active
                      ? "bg-green-50 border border-green-200"
                      : step.done
                      ? "bg-green-50/40 border border-green-100"
                      : ""
                  }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      step.active ? "bg-green-100 text-green-600" :
                      step.done ? "bg-green-50 text-green-500" :
                      "bg-gray-50 text-gray-300"
                    }`}>
                      <step.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-semibold ${step.active || step.done ? "text-gray-800" : "text-gray-400"}`}>
                        {step.label}
                      </p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-0.5 inline-flex items-center gap-1 ${
                        step.active ? "bg-green-100 text-green-700" :
                        step.done ? "bg-green-100 text-green-600" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {step.done && <CheckCircle className="w-3 h-3" />}
                        {step.active ? "⚡ 완료" : step.done ? "완료" : "대기 중"}
                      </span>
                    </div>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className={`ml-[22px] w-px h-4 ${step.done || step.active ? "bg-green-200" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Saved info summary */}
          <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-3">저장된 내용</p>
            <div className="space-y-2.5">
              {[
                { label: "저장 위치", value: "수강신청 명단" },
                { label: "추가된 행", value: "4행 (새로 추가)" },
                { label: "저장 시간", value: "2026.05.08 14:30:01" },
                { label: "처리 상태", value: "저장 완료" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-xs text-green-600">{item.label}</span>
                  <span className="text-xs font-bold text-green-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
