import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { getWorkflowLogs } from "../../../api";
import {
  Zap,
  MessageCircle,
  Brain,
  FileSpreadsheet,
  Send,
  Play,
  Clock,
  CheckCircle,
} from "lucide-react";

const flowSteps = [
  { icon: MessageCircle, label: "카카오톡 신청", color: "bg-yellow-50 text-yellow-500", border: "border-yellow-200" },
  { icon: Brain, label: "AI 정보 추출", color: "bg-blue-50 text-blue-500", border: "border-blue-200" },
  { icon: FileSpreadsheet, label: "구글시트 저장", color: "bg-green-50 text-green-600", border: "border-green-200" },
  { icon: Send, label: "확인 메시지 발송", color: "bg-purple-50 text-purple-600", border: "border-purple-200" },
];

const recentLogs = [
  { time: "오늘 11:42", name: "박지수", class: "파이썬 기초반", status: "완료" },
  { time: "오늘 10:17", name: "김민준", class: "HTML 기초반", status: "완료" },
  { time: "어제 16:05", name: "최유진", class: "엑셀 활용반", status: "완료" },
];

export function DemoStandbyScreen() {
  const navigate = useNavigate();
  const [pollError, setPollError] = useState(false);
  const initialLogCount = useRef<number | null>(null);

  useEffect(() => {
    const workflowId = localStorage.getItem("workflow_id");
    if (!workflowId) {
      navigate("/workflow", { replace: true });
      return;
    }

    const interval = setInterval(async () => {
      try {
        const { logs } = await getWorkflowLogs(workflowId);
        if (initialLogCount.current === null) {
          initialLogCount.current = logs.length;
          return;
        }
        if (logs.length > initialLogCount.current) {
          clearInterval(interval);
          navigate("/demo/message");
        }
      } catch {
        setPollError(true);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

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
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-sm font-semibold text-green-600">자동화 실행 중</span>
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-3" style={{ letterSpacing: "-0.8px" }}>
          수강 신청 자동화가 켜져 있어요
        </h1>
        <p className="text-[16px] text-gray-500 leading-relaxed">
          카카오톡 채널에 새 신청 메시지가 도착하면 AI가 자동으로 정보를 정리합니다.
        </p>
      </motion.div>

      <div className="grid grid-cols-[1fr_380px] gap-8">
        {/* Left: Main Automation Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
        >
          {/* Active Automation Card */}
          <div className="bg-white rounded-2xl border-2 border-[#6366F1]/20 shadow-lg shadow-indigo-50 p-7 mb-6">
            {/* Card Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-indigo-200">
                  <Zap className="w-7 h-7 text-white fill-white" />
                </div>
                <div>
                  <h2 className="text-[20px] font-bold text-gray-900 mb-1">수강 신청 자동 정리</h2>
                  <p className="text-sm text-gray-400">2026년 5월 1일부터 실행 중</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-full">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-bold text-green-600">자동화 실행 중</span>
              </div>
            </div>

            {/* Flow Steps */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">자동화 흐름</p>
              <div className="flex items-center gap-2 flex-wrap">
                {flowSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${step.border} bg-white`}>
                      <div className={`w-7 h-7 rounded-lg ${step.color} flex items-center justify-center`}>
                        <step.icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">{step.label}</span>
                    </div>
                    {idx < flowSteps.length - 1 && (
                      <div className="text-gray-300 text-lg font-light">→</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 mb-6">
              <div className="bg-[#F7F8FC] rounded-xl p-4 text-center">
                <p className="text-xs text-gray-400 mb-1.5">오늘 처리된 건수</p>
                <p className="text-2xl font-bold text-gray-900">12건</p>
              </div>
            </div>

            {/* Waiting indicator */}
            <div className="bg-gradient-to-r from-[#F0F0FF] to-[#F5F0FF] rounded-xl p-4 border border-[#6366F1]/10 flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#6366F1]"
                    style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
              <p className="text-sm text-[#6366F1] font-medium">
                카카오톡 채널을 실시간으로 모니터링하고 있어요...
              </p>
            </div>
            {pollError && (
              <p className="text-xs text-red-400 mt-2 text-center">
                연결 오류 — 수동 버튼을 눌러주세요
              </p>
            )}
          </div>

          {/* Demo CTA */}
          <button
            onClick={() => navigate("/demo/message")}
            className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-[17px] font-bold hover:opacity-90 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-0.5 hover:shadow-indigo-300"
          >
            <Play className="w-5 h-5 fill-white" />
            카카오톡 신청 메시지 도착 시뮬레이션
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            버튼을 누르면 실제 자동화가 실행되는 모습을 단계별로 확인할 수 있어요.
          </p>
        </motion.div>

        {/* Right: Recent Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="space-y-4"
        >
          {/* Recent activity */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-5">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-gray-700">최근 처리 내역</h3>
            </div>
            <div className="space-y-3">
              {recentLogs.map((log, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6366F1]/20 to-[#8B5CF6]/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-[#6366F1]">{log.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{log.name}</p>
                      <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle className="w-3 h-3" />
                        {log.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{log.class}</p>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{log.time}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] rounded-2xl p-6 text-white">
            <div className="text-2xl mb-3">💡</div>
            <h3 className="text-[15px] font-bold mb-2">자동화가 실행되는 동안</h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              사람이 직접 확인하거나 입력할 필요가 없어요. 메시지가 오면 AI가 자동으로 모든 걸 처리해드려요.
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
