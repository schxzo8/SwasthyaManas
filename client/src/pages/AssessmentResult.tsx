import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BlobDecoration } from "../components/BlobDecoration";

type StoredResult = {
  assessmentType?: string; // e.g. "PHQ-9" / "GAD-7"
  totalScore?: number; // e.g. 12
  maxScore?: number; // e.g. 27 / 21 (optional)
  date?: string; // ISO string (optional)
  severity?: string; // "Minimal" | "Mild" | "Moderate" | "Moderately Severe" | "Severe"
};

export default function AssessmentResult() {
  const navigate = useNavigate();

  const raw = localStorage.getItem("lastAssessmentResult");
  const result: StoredResult | null = raw ? JSON.parse(raw) : null;

  const tips: Record<string, string> = {
    Minimal: "Keep maintaining your routine: sleep, hydration, and movement.",
    Mild: "Try journaling, short walks, and talking to someone you trust.",
    Moderate:
      "Consider structured coping strategies and professional guidance if possible.",
    "Moderately Severe":
      "Strongly consider speaking with a mental health professional.",
    Severe:
      "Please seek professional support. If you feel unsafe, reach out to local emergency resources.",
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 flex items-center justify-center">
        <Card className="w-full max-w-lg p-8 text-center">
          <h1 className="font-serif text-3xl font-bold text-[#2D3436] mb-2">
            No Result Found
          </h1>
          <p className="text-[#5A6062] mb-6">
            Please complete an assessment first.
          </p>
          <Button className="w-full" onClick={() => navigate("/assessments")}>
            Go to Assessments
          </Button>
        </Card>
      </div>
    );
  }

  const score = Number(result.totalScore ?? 0);
  const type = result.assessmentType || "Assessment";
  const maxScore = Number(result.maxScore ?? 0);

  // Severity + color (use stored severity if present; otherwise infer)
  let severity = result.severity || "";
  let color = "text-[#7C9A82]";
  let description =
    "This is a self-awareness screening tool. Consider your context and seek support if needed.";

  // If backend didn't give severity, infer using common PHQ-9 / GAD-7 cutoffs
  if (!severity) {
    if (score <= 4) severity = "Minimal";
    else if (score <= 9) severity = "Mild";
    else if (score <= 14) severity = "Moderate";
    else if (score <= 19) severity = "Moderately Severe";
    else severity = "Severe";
  }

  if (severity === "Minimal") {
    color = "text-green-600";
    description =
      "Your symptoms suggest minimal or no depression/anxiety. Keep up your wellness practices!";
  } else if (severity === "Mild") {
    color = "text-yellow-600";
    description =
      "You may be experiencing mild symptoms. Monitoring and self-care strategies are recommended.";
  } else if (severity === "Moderate") {
    color = "text-orange-600";
    description =
      "Your symptoms appear moderate. Consider consulting with a mental health professional.";
  } else if (severity === "Moderately Severe") {
    color = "text-orange-700";
    description =
      "These symptoms are significant. We strongly recommend speaking with a healthcare provider.";
  } else if (severity === "Severe") {
    color = "text-red-600";
    description =
      "Your score suggests severe symptoms. Please seek professional help immediately.";
  }

  const dateText = result.date
    ? new Date(result.date).toLocaleDateString()
    : "";

  // If maxScore is missing, show score only (still works)
  const showOutOf = maxScore > 0;

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 relative overflow-hidden flex items-center justify-center">
      <BlobDecoration
        variant={3}
        className="top-0 left-0 w-full h-full text-[#E8F0E9]"
      />

      <div className="max-w-3xl w-full relative z-10">
        <Card className="p-8 md:p-12 text-center">
          <div className="mb-8">
            <h1 className="font-serif text-3xl font-bold text-[#2D3436] mb-2">
              {type} Results
            </h1>
            <p className="text-[#5A6062]">
              {dateText ? `Completed on ${dateText}` : "Your latest assessment result"}
            </p>
          </div>

          {/* Score ring */}
          <div className="mb-10 relative inline-block">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#E8F0E9"
                strokeWidth="12"
                fill="none"
              />

              {/* only draw progress ring if maxScore is available */}
              {showOutOf && (
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 88}
                  strokeDashoffset={2 * Math.PI * 88 * (1 - score / maxScore)}
                  className={`${color} transition-all duration-1000 ease-out`}
                />
              )}
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-5xl font-serif font-bold ${color}`}>
                {score}
              </span>
              {showOutOf && (
                <span className="text-sm text-[#5A6062] font-medium">
                  out of {maxScore}
                </span>
              )}
            </div>
          </div>

          <div className="mb-8 max-w-lg mx-auto">
            <h2 className={`text-2xl font-bold mb-3 ${color}`}>{severity}</h2>
            <p className="text-[#5A6062] text-lg leading-relaxed">{description}</p>
          </div>

          {/* extra guidance from old page */}
          <div className="mb-10 max-w-xl mx-auto">
            <div className="text-left bg-[#FFFDF9] p-4 rounded-xl border border-[#E8F0E9]">
              <p className="text-sm text-[#5A6062]">
                <strong>Guidance:</strong>{" "}
                {tips[severity] || "Take care of yourself."}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl mx-auto">
            <Link to="/experts">
              <Button className="w-full">
                Find an Expert <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link to="/assessments">
              <Button variant="outline" className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" /> Retake Assessment
              </Button>
            </Link>

            <Button
              variant="secondary"
              className="w-full md:col-span-2"
              onClick={() => navigate("/assessments/history")}
            >
              View History
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-[#E8F0E9]">
            <div className="flex items-start gap-3 text-left bg-[#FFFDF9] p-4 rounded-xl border border-[#E8F0E9]">
              <AlertCircle className="h-5 w-5 text-[#7C9A82] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#5A6062]">
                <strong>Disclaimer:</strong> This screening tool is not a medical diagnosis.
                If you are in crisis or feeling suicidal, please call emergency services
                or a crisis hotline immediately.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
