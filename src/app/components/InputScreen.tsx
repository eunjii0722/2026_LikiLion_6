import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";

const suggestions = [
  {
    label: "수강 신청 정리",
    text: "카카오톡으로 수강 신청이 오면 이름, 연락처, 신청 수업을 구글시트에 정리하고 신청자에게 확인 메시지를 보내줘.",
  },
  {
    label: "예약 내용 정리",
    text: "네이버 예약으로 새 예약이 들어오면 구글 캘린더에 자동으로 등록하고 고객에게 예약 확인 안내를 보내줘.",
  },
  {
    label: "결석자 안내 발송",
    text: "수업 전날 구글시트에 있는 수강생 목록을 확인해서 결석 처리된 학생에게 자동으로 안내 메시지를 보내줘.",
  },
];

export function InputScreen() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSuggestion = (text: string) => {
    setInputText(text);
  };

  const handleSubmit = () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/analysis");
    }, 2000);
  };

  return (
    <div className="max-w-[860px] mx-auto px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#F0F0FF] text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI 자동화 만들기
        </div>
        <h1 className="text-[40px] font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.8px" }}>
          어떤 업무를 자동화하고 싶나요?
        </h1>
        <p className="text-[16px] text-gray-500 leading-relaxed">
          평소에 반복해서 하는 일을 그대로 적어주세요.
          <br />
          AI가 자동화 흐름으로 바꿔드릴게요.
        </p>
      </div>

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="카카오톡으로 수강 신청이 오면 이름, 연락처, 신청 수업을 구글시트에 정리하고 신청자에게 확인 메시지를 보내줘."
          className="w-full p-6 text-[16px] text-gray-700 placeholder-gray-300 resize-none outline-none bg-transparent leading-relaxed"
          rows={6}
        />
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-400">
            {inputText.length > 0 ? `${inputText.length}자 입력됨` : "어떤 말로도 입력해도 괜찮아요 😊"}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!inputText.trim() || isLoading}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              inputText.trim() && !isLoading
                ? "bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-90 shadow-md shadow-indigo-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                AI가 분석 중이에요...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                AI로 자동화 만들기
              </>
            )}
          </button>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-medium text-gray-600">추천 예시로 시작해보세요</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              onClick={() => handleSuggestion(s.text)}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                inputText === s.text
                  ? "bg-[#6366F1] text-white border-[#6366F1] shadow-sm"
                  : "bg-white text-gray-600 border-gray-200 hover:border-[#6366F1] hover:text-[#6366F1]"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-[#F0F0FF] to-[#F5F0FF] rounded-2xl p-6 border border-[#6366F1]/10">
        <h4 className="text-sm font-semibold text-[#6366F1] mb-3">💡 이렇게 입력해보세요</h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            "\"카카오톡으로 주문이 오면 엑셀에 정리해줘\"",
            "\"매일 아침 9시에 할 일 목록을 카톡으로 알려줘\"",
            "\"인스타 DM 문의를 구글시트에 모아줘\"",
            "\"수강생이 결제하면 확인 문자를 보내줘\"",
          ].map((tip, idx) => (
            <div
              key={idx}
              onClick={() => setInputText(tip.replace(/"/g, ""))}
              className="bg-white/70 rounded-xl px-4 py-3 text-sm text-gray-600 cursor-pointer hover:bg-white hover:text-[#6366F1] transition-all border border-transparent hover:border-[#6366F1]/20"
            >
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
