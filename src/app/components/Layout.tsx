import { Outlet, useNavigate, useLocation } from "react-router";
import { Zap } from "lucide-react";

const steps = [
  { path: "/input", label: "요청 입력" },
  { path: "/workflow", label: "흐름 확인" },
  { path: "/result", label: "테스트" },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";
  const isAutomationDetail = location.pathname.startsWith("/automations/");
  const currentStepIndex = steps.findIndex((s) => s.path === location.pathname);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-sm">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span
              className="text-[18px] font-bold text-gray-900"
              style={{ letterSpacing: "-0.3px" }}
            >
              WIZE
            </span>
          </button>

          {/* Step progress (only show on non-home, non-automation-detail pages) */}
          {!isHome && isAutomationDetail && (
            <div className="flex items-center gap-1.5 text-sm">
              <button
                onClick={() => navigate("/")}
                className="text-gray-400 hover:text-gray-600"
              >
                내 자동화
              </button>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium">관리</span>
            </div>
          )}
          {!isHome && !isAutomationDetail && (
            <div className="hidden sm:flex items-center gap-2">
              {steps.map((step, idx) => {
                const isActive = step.path === location.pathname;
                const isDone = currentStepIndex > idx;
                return (
                  <div key={step.path} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                          isActive
                            ? "bg-[#6366F1] text-white"
                            : isDone
                              ? "bg-[#6366F1]/20 text-[#6366F1]"
                              : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        {isDone ? "✓" : idx + 1}
                      </div>
                      <span
                        className={`text-sm transition-all ${
                          isActive
                            ? "text-[#6366F1] font-semibold"
                            : isDone
                              ? "text-[#6366F1]/70"
                              : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {idx < steps.length - 1 && (
                      <div
                        className={`w-8 h-px ${isDone ? "bg-[#6366F1]/40" : "bg-gray-200"}`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-3">
            {isHome ? (
              <>
                <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-1.5">
                  로그인
                </button>
                <button
                  onClick={() => navigate("/input")}
                  className="text-sm bg-[#6366F1] text-white px-4 py-2 rounded-lg hover:bg-[#5558E3] transition-colors font-medium"
                >
                  무료로 시작하기
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                홈으로
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
