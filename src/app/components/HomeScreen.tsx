import { useNavigate } from "react-router";
import {
  MessageCircle,
  FileSpreadsheet,
  Calendar,
  ArrowRight,
  Sparkles,
  CheckCircle,
  ChevronRight,
  Star,
  Play,
} from "lucide-react";

const exampleCards = [
  {
    id: 1,
    icon: "💬",
    title: "수강 신청 정리",
    description:
      "카카오톡 메시지로 들어오는 수강 신청을 자동으로 정리해요.",
    steps: [
      {
        icon: MessageCircle,
        label: "카카오톡 신청 접수",
        color: "text-yellow-500 bg-yellow-50",
      },
      {
        icon: FileSpreadsheet,
        label: "구글시트 자동 정리",
        color: "text-green-600 bg-green-50",
      },
      {
        icon: MessageCircle,
        label: "확인 메시지 발송",
        color: "text-blue-500 bg-blue-50",
      },
    ],
  },
  {
    id: 2,
    icon: "📅",
    title: "예약 관리 자동화",
    description:
      "네이버 예약을 캘린더에 등록하고 고객에게 안내 메시지를 보내요.",
    steps: [
      {
        icon: Calendar,
        label: "네이버 예약 접수",
        color: "text-green-600 bg-green-50",
      },
      {
        icon: Calendar,
        label: "캘린더 자동 등록",
        color: "text-blue-500 bg-blue-50",
      },
      {
        icon: MessageCircle,
        label: "고객 안내 발송",
        color: "text-purple-500 bg-purple-50",
      },
    ],
  },
  {
    id: 3,
    icon: "📋",
    title: "문의 자동 취합",
    description:
      "인스타 DM과 카카오 문의를 하나의 목록으로 자동 정리해요.",
    steps: [
      {
        icon: MessageCircle,
        label: "인스타 DM / 카카오 문의",
        color: "text-pink-500 bg-pink-50",
      },
      {
        icon: FileSpreadsheet,
        label: "문의 목록 자동 정리",
        color: "text-green-600 bg-green-50",
      },
      {
        icon: CheckCircle,
        label: "처리 현황 관리",
        color: "text-indigo-500 bg-indigo-50",
      },
    ],
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

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#F0F0FF] to-[#F7F8FC] py-24 px-8">
        <div className="max-w-[1200px] mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white border border-[#6366F1]/20 text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            AI 업무 자동화, 이제 누구나 쉽게
          </div>

          {/* Headline */}
          <h1
            className="text-[52px] font-bold text-gray-900 mb-6 leading-[1.2]"
            style={{ letterSpacing: "-1px" }}
          >
            말로 설명하면,
            <br />
            <span className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
              AI가 업무 자동화를 만들어드려요.
            </span>
          </h1>

          <p className="text-[18px] text-gray-500 mb-10 max-w-[600px] mx-auto leading-relaxed">
            카카오톡, 구글시트, 네이버 예약, 엑셀을
            <br />
            복잡한 설정 없이 연결해보세요.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/input")}
              className="flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-8 py-4 rounded-xl text-[16px] font-semibold hover:opacity-90 transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4" />+ 새 자동화 만들기
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-xl text-[16px] font-medium hover:bg-gray-50 transition-all border border-gray-200"
            >
              <Play className="w-4 h-4 text-[#6366F1]" />
              실제 작동 시연 보기
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

      {/* Example Cards */}
      <section className="py-20 px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-12">
            <h2
              className="text-[32px] font-bold text-gray-900 mb-3"
              style={{ letterSpacing: "-0.5px" }}
            >
              이런 자동화, 바로 만들 수 있어요
            </h2>
            <p className="text-gray-500">
              클릭 한 번으로 비슷한 자동화를 시작해보세요.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {exampleCards.map((card) => (
              <div
                key={card.id}
                onClick={() => navigate("/input")}
                className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:shadow-indigo-50 hover:-translate-y-1 transition-all cursor-pointer group"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#F0F0FF] to-[#E8E8FF] flex items-center justify-center text-2xl">
                    {card.icon}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full`}
                  >
                  </span>
                </div>

                <h3 className="text-[17px] font-bold text-gray-900 mb-2">
                  {card.title}
                </h3>
                <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                  {card.description}
                </p>

                {/* Steps */}
                <div className="space-y-2">
                  {card.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3"
                    >
                      {idx > 0 && (
                        <div className="w-4 h-3 flex items-center justify-center ml-1.5">
                          <div className="w-px h-3 bg-gray-200" />
                        </div>
                      )}
                      {idx > 0 && (
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${step.color}`}
                          >
                            <step.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-gray-600">
                            {step.label}
                          </span>
                        </div>
                      )}
                      {idx === 0 && (
                        <div className="flex items-center gap-3 w-full">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${step.color}`}
                          >
                            <step.icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-sm text-gray-600">
                            {step.label}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <div className="mt-5 flex items-center text-[#6366F1] text-sm font-medium group-hover:gap-2 gap-1 transition-all">
                  이 자동화 만들기
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-8 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-3 gap-8">
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
      <section className="py-20 px-8 text-center bg-white">
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