import { useState } from "react";
import { useNavigate } from "react-router";
import { Sparkles, ArrowRight, Lightbulb } from "lucide-react";
import { parseText } from "../../api";
import { buildFallbackWorkflow } from "../productStore";

const suggestions = [
  {
    label: "수강 신청 기본형",
    text: "구글폼으로 수강 신청이 들어오면 이름, 이메일, 연락처, 신청 과정을 구글시트에 저장하고 신청자에게 Gmail 확인 메일을 보내줘.",
  },
  {
    label: "웹 개발반 신청",
    text: "구글폼 웹 개발 입문반 신청 응답을 구글시트에 저장하고 신청자 이메일로 접수 완료 메일을 보내줘.",
  },
  {
    label: "파이썬반 신청",
    text: "구글폼 파이썬 기초반 신청 응답이 제출되면 구글시트에 행을 추가하고 Gmail로 수강 신청 완료 메일을 보내줘.",
  },
];

export function InputScreen() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [formUrl, setFormUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuggestion = (text: string) => {
    setInputText(text);
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    if (formUrl && !/https:\/\/docs\.google\.com\/forms\/d\//.test(formUrl)) {
      setError("구글폼 URL 형식이 올바르지 않아요. (예: https://docs.google.com/forms/d/...)");
      return;
    }
    setIsLoading(true);
    try {
      const { workflow } = await parseText(inputText);
      navigate("/analysis", { state: { workflow, inputText, formUrl } });
    } catch {
      const workflow = buildFallbackWorkflow(inputText);
      navigate("/analysis", { state: { workflow, inputText, formUrl, localMode: true } });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[860px] mx-auto px-4 md:px-8 py-8 md:py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-[#F0F0FF] text-[#6366F1] px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          AI 자동화 만들기
        </div>
        <h1 className="text-[28px] md:text-[40px] font-bold text-gray-900 mb-4" style={{ letterSpacing: "-0.8px" }}>
          어떤 수강 신청 폼을 자동화할까요?
        </h1>
        <p className="text-[16px] text-gray-500 leading-relaxed">
          구글폼 응답을 어떻게 저장하고 안내할지 적어주세요.
          <br />
          이 MVP는 구글폼, 구글시트, Gmail 흐름으로만 구성됩니다.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">
        <textarea
          value={inputText}
          onChange={(e) => { setInputText(e.target.value); setError(""); }}
          placeholder="구글폼으로 수강 신청이 들어오면 이름, 이메일, 연락처, 신청 과정을 구글시트에 저장하고 신청자에게 Gmail 확인 메일을 보내줘."
          className="w-full p-6 text-[16px] text-gray-700 placeholder-gray-300 resize-none outline-none bg-transparent leading-relaxed"
          rows={6}
        />
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <span className="text-sm text-gray-400">
            {inputText.length > 0 ? `${inputText.length}자 입력됨` : "구글폼 신청 자동화에 필요한 내용을 적어주세요"}
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

      {/* Google Form URL */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          연결할 구글폼 URL{" "}
          <span className="text-gray-400 font-normal">(선택사항 — 데모는 미리 연결된 폼 사용)</span>
        </label>
        <input
          type="url"
          value={formUrl}
          onChange={(e) => setFormUrl(e.target.value)}
          placeholder="https://docs.google.com/forms/d/..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 placeholder-gray-300 outline-none focus:border-[#6366F1] transition-colors bg-white"
        />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            "\"구글폼 응답을 수강신청 응답 시트에 저장해줘\"",
            "\"신청자 이메일로 접수 완료 메일을 보내줘\"",
            "\"이름, 이메일, 연락처, 신청 과정을 추출해줘\"",
            "\"파이썬 기초반 신청 자동화를 만들어줘\"",
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
