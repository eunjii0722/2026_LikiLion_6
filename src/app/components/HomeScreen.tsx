import { useNavigate } from "react-router";
import {
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  Mail,
  Zap,
  Settings,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { getWorkflows } from "../productStore";

const mvpSteps = [
  {
    icon: FileText,
    title: "구글폼 응답 감지",
    description: "수강 신청 폼에 새 응답이 제출되면 자동화가 시작됩니다.",
    color: "text-yellow-500 bg-yellow-50",
  },
  {
    icon: FileSpreadsheet,
    title: "구글시트 행 추가",
    description: "이름, 이메일, 연락처, 신청 과정을 한 줄로 저장합니다.",
    color: "text-green-600 bg-green-50",
  },
  {
    icon: Mail,
    title: "Gmail 확인 메일 발송",
    description: "신청자에게 접수 완료 메일을 자동으로 보냅니다.",
    color: "text-purple-600 bg-purple-50",
  },
];

const features = [
  {
    icon: "🗣️",
    title: "말로 설명하면 끝",
    desc: "복잡한 설정 없이 하고 싶은 일을 그냥 말하듯 입력하세요.",
  },
  {
    icon: "🤖",
    title: "AI가 자동으로 구성",
    desc: "입력한 내용을 AI가 분석해서 자동화 흐름을 만들어드려요.",
  },
  {
    icon: "⚡",
    title: "바로 작동",
    desc: "테스트 한 번으로 바로 켜고 자동화를 시작하세요.",
  },
];

export function HomeScreen() {
  const navigate = useNavigate();
  const workflows = getWorkflows();
  const activeCount = workflows.filter((workflow) => workflow.status === "active").length;
  const totalRuns = workflows.reduce((sum, workflow) => sum + workflow.runs.length, 0);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F0F0FF] to-[#F7F8FC] py-12 md:py-24 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#6366F1]/20 text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            구글폼 신청 자동화 MVP
          </div>

          {/* Headline */}
          <h1
            className="text-[36px] md:text-[52px] font-bold text-gray-900 mb-6 leading-[1.2]"
            style={{ letterSpacing: "-1px" }}
          >
            구글폼 수강 신청을,
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              시트 저장과 메일까지 자동화하세요.
            </span>
          </h1>

          <p className="text-[18px] text-gray-500 mb-10 max-w-[600px] mx-auto leading-relaxed">
            구글폼 응답을 구글시트에 정리하고
            <br />
            신청자에게 Gmail 확인 메일을 보내는 한 가지 흐름에 집중했습니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/input")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl text-[16px] font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />+ 새 자동화 만들기
            </button>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <div className="flex">
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-8 -mt-10 relative z-10">
        <div className="max-w-[1200px] mx-auto bg-white rounded-2xl border border-gray-100 shadow-lg shadow-indigo-100/40 p-6">
          <div className="flex items-center justify-between gap-6 mb-5">
            <div>
              <p className="text-sm font-semibold text-[#6366F1] mb-1">내 자동화</p>
              <h2 className="text-[24px] font-bold text-gray-900">
                {workflows.length > 0 ? "생성한 자동화가 저장되어 있어요" : "내 자동화 현황"}
              </h2>
            </div>
            <button
              onClick={() => navigate("/input")}
              className="flex items-center gap-2 bg-[#111827] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              새 자동화
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[180px_180px_1fr] gap-4">
            <div className="bg-[#F7F8FC] rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">실행 중</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="bg-[#F7F8FC] rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">테스트 실행</p>
              <p className="text-2xl font-bold text-gray-900">{totalRuns}</p>
            </div>
            {workflows.length > 0 ? (
              <div className="max-h-[240px] overflow-y-auto space-y-2 pr-1">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between bg-[#F7F8FC] rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                        <Zap className="w-4 h-4 text-[#6366F1]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{workflow.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <p className="text-xs text-gray-400">{workflow.runs.length}회 실행됨</p>
                          {workflow.formUrl ? (
                            <span className="flex items-center gap-0.5 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              폼 연동됨
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-xs text-amber-500">
                              <AlertCircle className="w-3 h-3" />
                              미연동
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          workflow.status === "active"
                            ? "bg-green-50 text-green-600"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {workflow.status === "active" ? "실행 중" : "테스트 완료"}
                      </span>
                      <button
                        onClick={() => navigate(`/automations/${workflow.id}`)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-[#6366F1]/10 flex items-center justify-center text-gray-400 hover:text-[#6366F1] transition-colors"
                      >
                        <Settings className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center border border-dashed border-[#6366F1]/20 rounded-2xl bg-white py-6 px-4">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#F0F0FF] flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-5 h-5 text-[#6366F1]" />
                  </div>
                  <p className="text-sm font-bold text-gray-800 mb-1">아직 만든 자동화가 없어요</p>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    AI에게 말하듯 입력하면 자동화를 바로 만들어드려요.
                  </p>
                  <button
                    onClick={() => navigate("/input")}
                    className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-90 transition-all"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    + 첫 자동화 만들기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* MVP Flow */}
      <section className="py-12 md:py-20 px-4 md:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[24px] md:text-[32px] font-bold text-gray-900 mb-3"
              style={{ letterSpacing: "-0.5px" }}
            >
              MVP에서 제공하는 단 하나의 자동화
            </h2>
            <p className="text-gray-500">
              구글폼 수강 신청 접수부터 저장, 확인 메일까지 한 흐름으로 동작합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mvpSteps.map((step, index) => (
              <div
                key={step.title}
                onClick={() => navigate("/input")}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.color}`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                    {index + 1}단계
                  </span>
                </div>

                <h3 className="text-[17px] font-bold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  {step.description}
                </p>
                <div className="mt-5 flex items-center text-[#6366F1] text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                  설정하러 가기
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 md:py-16 px-4 md:px-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((f, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-[18px] font-bold text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-indigo-200 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 md:py-20 px-4 md:px-8 text-center bg-white">
        <div className="max-w-[600px] mx-auto">
          <h2
            className="text-[32px] font-bold text-gray-900 mb-4"
            style={{ letterSpacing: "-0.5px" }}
          >
            지금 바로 첫 자동화를 만들어보세요
          </h2>
          <button
            onClick={() => navigate("/input")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl text-[16px] font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-200"
          >
            <Sparkles className="w-4 h-4" />
            시작하기
          </button>
        </div>
      </section>
    </div>
  );
}
