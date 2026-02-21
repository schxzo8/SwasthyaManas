import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import API from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { ProgressBar } from "../components/ProgressBar";
import { AssessmentData } from "../types";

export default function GAD7Form() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load from backend (real data, no dummy)
  useEffect(() => {
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const res = await API.get("/api/assessment-templates/GAD-7");
        const tpl: AssessmentData = res.data;
        setAssessment(tpl);
        setAnswers(new Array(tpl.questions.length).fill(-1));
        setCurrentQuestion(0);
      } catch (e) {
        setError("Failed to load GAD-7 questions. Make sure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const total = assessment?.questions.length ?? 0;

  const isAnswered = useMemo(() => {
    if (!total) return false;
    return answers[currentQuestion] !== -1;
  }, [answers, currentQuestion, total]);

  const isLastQuestion = useMemo(() => {
    if (!total) return false;
    return currentQuestion === total - 1;
  }, [currentQuestion, total]);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestion] = value;
      return next;
    });

    // auto-advance like your UI version
    if (currentQuestion < total - 1) {
      setTimeout(() => setCurrentQuestion((curr) => curr + 1), 250);
    }
  };

  const handleNext = () => {
    if (!total) return;
    if (currentQuestion < total - 1) setCurrentQuestion((curr) => curr + 1);
    else finishAssessment();
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((curr) => curr - 1);
  };

  const finishAssessment = async () => {
    setError("");
    if (!assessment) return;

    // require all answers
    if (answers.some((v) => v === -1)) {
      setError("Please answer all questions before submitting.");
      return;
    }

    const payload = {
      answers: assessment.questions.map((_, idx) => ({
        questionIndex: idx,
        value: Number(answers[idx]),
      })),
    };

    try {
      setSubmitting(true);
      const res = await API.post("/api/assessments/gad7", payload);
      localStorage.setItem(
        "lastAssessmentResult",
        JSON.stringify(res.data.result)
      );
      navigate("/assessments/result");
    } catch (e: any) {
      setError(e?.response?.data?.message || "Failed to submit assessment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !assessment) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl p-8">
          <p className="text-[#5A6062]">Loading GAD-7...</p>
        </Card>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl p-8">
          <h1 className="font-serif text-2xl font-bold text-[#2D3436] mb-2">
            GAD-7
          </h1>
          {error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : (
            <p className="text-[#5A6062]">Unable to load assessment.</p>
          )}
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate("/assessments")}>
              Back to Assessments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const q = assessment.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/assessments")}
          className="mb-4 pl-0 hover:bg-transparent"
          disabled={submitting}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Assessments
        </Button>

        <ProgressBar
          current={currentQuestion + 1}
          total={assessment.questions.length}
          label={`Question ${currentQuestion + 1} of ${assessment.questions.length}`}
        />
      </div>

      <Card className="w-full max-w-2xl p-8 md:p-12 min-h-[400px] flex flex-col">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#2D3436] mb-2 leading-tight">
          {assessment.name || "GAD-7"}
        </h2>

        <p className="text-sm text-[#5A6062]">
          {assessment.description ||
            "Over the last 2 weeks, how often have you been bothered by the following problems?"}
        </p>

        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        <p className="text-xl text-[#5A6062] mt-8 mb-8 font-medium">
          {currentQuestion + 1}. {q.text}
        </p>

        <div className="grid grid-cols-1 gap-3 mt-auto">
          {q.options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              disabled={submitting}
              onClick={() => handleAnswer(Number(opt.value))}
              className={`
                text-left px-6 py-4 rounded-xl border transition-all duration-200
                ${
                  answers[currentQuestion] === Number(opt.value)
                    ? "bg-[#7C9A82] text-white border-[#7C9A82] shadow-md"
                    : "bg-white border-[#C4B5A0] text-[#2D3436] hover:bg-[#E8F0E9] hover:border-[#7C9A82]"
                }
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t border-[#E8F0E9]">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentQuestion === 0 || submitting}
          >
            Previous
          </Button>

          <Button onClick={handleNext} disabled={!isAnswered || submitting}>
            {isLastQuestion ? (submitting ? "Submitting..." : "See Results") : "Next"}
            {!isLastQuestion && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </Card>
    </div>
  );
}
