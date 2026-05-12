import { Outlet, useNavigate, useLocation } from "react-router";
import { Zap, X, ChevronRight } from "lucide-react";

const demoSteps = [
  { path: "/demo", label: "대기 중", icon: "⏸️" },
  { path: "/demo/message", label: "메시지 도착", icon: "💬" },
  { path: "/demo/extract", label: "정보 추출", icon: "🤖" },
  { path: "/demo/save", label: "시트 저장", icon: "📊" },
  { path: "/demo/complete", label: "발송 완료", icon: "✅" },
];

export function DemoLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentIndex = demoSteps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      {/* Demo Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1440px] mx-auto px-8 h-16 flex items-center justify-between">
          {/* Logo + Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-sm">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-[18px] font-bold text-gray-900" style={{ letterSpacing: "-0.3px" }}>
                FlowTalk
              </span>
            </button>
            <div className="flex items-center gap-1.5 bg-[#F0F0FF] text-[#6366F1] px-3 py-1 rounded-full text-xs font-semibold">
              <div className="w-1.5 h-1.5 rounded-full bg-[#6366F1] animate-pulse" />
              실행 시연 모드
            </div>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-1">
            {demoSteps.map((step, idx) => {
              const isActive = currentIndex === idx;
              const isDone = currentIndex > idx;
              return (
                <div key={step.path} className="flex items-center">
                  <button
                    onClick={() => navigate(step.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white shadow-md shadow-indigo-200"
                        : isDone
                        ? "bg-[#6366F1]/10 text-[#6366F1]"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    <span>{step.icon}</span>
                    <span>{step.label}</span>
                  </button>
                  {idx < demoSteps.length - 1 && (
                    <ChevronRight className={`w-3 h-3 mx-0.5 ${isDone ? "text-[#6366F1]/40" : "text-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Exit */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            시연 종료
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-700 ease-out"
            style={{ width: `${((currentIndex + 1) / demoSteps.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
