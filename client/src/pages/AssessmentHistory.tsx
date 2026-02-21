import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, FileText, ChevronRight, X } from "lucide-react";

import API from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { AssessmentRecord } from "../types";

type AnswerItem =
  | number
  | {
      _id?: string;
      questionIndex?: number;
      value?: number;
    };

export default function AssessmentHistory() {
  const [items, setItems] = useState<AssessmentRecord[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [selected, setSelected] = useState<AssessmentRecord | null>(null);

  // ✅ Questions
  const PHQ9_QUESTIONS = useMemo(
    () => [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things (e.g., reading the newspaper or watching television)",
      "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you’ve been moving around a lot more than usual",
      "Thoughts that you would be better off dead, or of hurting yourself",
    ],
    []
  );

  const GAD7_QUESTIONS = useMemo(
    () => [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid as if something awful might happen",
    ],
    []
  );

  const ANSWER_LABEL: Record<number, string> = useMemo(
    () => ({
      0: "Not at all",
      1: "Several days",
      2: "More than half the days",
      3: "Nearly every day",
    }),
    []
  );

  function getQuestionsByType(type: string): string[] {
    const t = (type || "").toUpperCase();
    if (t.includes("PHQ")) return PHQ9_QUESTIONS;
    if (t.includes("GAD")) return GAD7_QUESTIONS;
    return [];
  }

  function formatAnswerValue(v: unknown) {
    const n = typeof v === "number" ? v : Number(v);
    if (!Number.isFinite(n)) return "—";
    return `${ANSWER_LABEL[n] ?? "—"} (${n})`;
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/assessments/my");
        setItems(res.data);
      } catch (e) {
        setError("Failed to load assessment history.");
      }
    };
    load();
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Minimal":
        return "bg-green-100 text-green-700";
      case "Mild":
        return "bg-yellow-100 text-yellow-700";
      case "Moderate":
        return "bg-orange-100 text-orange-700";
      case "Moderately Severe":
        return "bg-red-100 text-red-700";
      case "Severe":
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const maxScoreByType = (t: string) => {
    const upper = (t || "").toUpperCase();
    if (upper.includes("PHQ")) return 27;
    if (upper.includes("GAD")) return 21;
    return undefined;
  };

  // ✅ normalize answers from DB to a safe, sorted array
  const normalizedAnswers = useMemo(() => {
    if (!selected) return [];

    const raw = (selected as any).answers as AnswerItem[] | undefined;
    if (!Array.isArray(raw)) return [];

    // if backend sends objects {questionIndex, value}
    const asObjects = raw
      .map((a, idx) => {
        if (typeof a === "number") {
          return { key: `n-${idx}`, questionIndex: idx, value: a };
        }
        const qi =
          typeof a.questionIndex === "number" ? a.questionIndex : idx;
        const v =
          typeof a.value === "number" ? a.value : Number(a.value);
        return {
          key: a._id || `o-${idx}`,
          questionIndex: qi,
          value: Number.isFinite(v) ? v : undefined,
        };
      })
      .sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));

    return asObjects;
  }, [selected]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="pl-0"
              onClick={() => navigate("/assessments")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Assessment
            </Button>

            <h1 className="font-serif text-3xl font-bold text-[#2D3436]">
              Assessment History
            </h1>
          </div>

          {/* <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/assessments")}>
              New Assessment
            </Button>
          </div> */}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        {/* Empty */}
        {items.length === 0 && !error && (
          <Card className="p-6">
            <p className="text-[#5A6062]">No assessments yet.</p>
            <div className="mt-4">
              <Button onClick={() => navigate("/assessments")}>
                Take your first screening
              </Button>
            </div>
          </Card>
        )}

        {/* List */}
        <div className="space-y-4">
          {items.map((r) => {
            const maxScore = maxScoreByType(r.assessmentType);
            return (
              <Card
                key={r._id}
                className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#7C9A82] flex-shrink-0">
                    <FileText size={24} />
                  </div>

                  <div>
                    <h3 className="font-bold text-[#2D3436] text-lg">
                      {r.assessmentType} Screening
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-[#5A6062] mt-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 pl-16 md:pl-0">
                  <div className="text-center">
                    <p className="text-xs text-[#5A6062] uppercase tracking-wide font-medium">
                      Score
                    </p>
                    <p className="font-serif text-xl font-bold text-[#2D3436]">
                      {r.totalScore}
                      {typeof maxScore === "number" && (
                        <span className="text-sm text-[#9CA3AF] font-sans">
                          /{maxScore}
                        </span>
                      )}
                    </p>
                  </div>

                  <div
                    className={`px-4 py-1 rounded-full text-sm font-medium ${getSeverityColor(
                      r.severity
                    )}`}
                  >
                    {r.severity}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex"
                    onClick={() => setSelected(r)}
                  >
                    Details <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Optional back button small screens */}
        <div className="mt-10 md:hidden">
          <Link to="/dashboard" className="no-underline">
            <Button variant="outline" className="w-full">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Details Modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-[#E8F0E9]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-[#E8F0E9] flex items-center justify-between">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#2D3436]">
                  {selected.assessmentType} Details
                </h2>
                <p className="text-sm text-[#5A6062]">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="h-9 w-9 rounded-full hover:bg-[#FAF7F2] flex items-center justify-center"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-sm text-[#5A6062]">
                {selected.assessmentType.toUpperCase().includes("PHQ") && (
                  <p>PHQ-9 contains 9 questions assessing depression symptoms.</p>
                )}

                {selected.assessmentType.toUpperCase().includes("GAD") && (
                  <p>GAD-7 contains 7 questions assessing anxiety symptoms.</p>
                )}
              </div>
              {/* Score + Severity cards */}
              <div className="flex flex-wrap gap-3">
                <div className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E8F0E9]">
                  <div className="text-xs text-[#5A6062]">Score</div>
                  <div className="text-lg font-bold text-[#2D3436]">
                    {selected.totalScore}
                    {typeof maxScoreByType(selected.assessmentType) ===
                      "number" && (
                      <span className="text-sm text-[#9CA3AF] font-normal">
                        {" "}
                        /{maxScoreByType(selected.assessmentType)}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border border-[#E8F0E9] ${getSeverityColor(
                    selected.severity
                  )}`}
                >
                  <div className="text-xs opacity-80">Severity</div>
                  <div className="text-lg font-bold">{selected.severity}</div>
                </div>
              </div>

              <p className="text-xs text-[#9CA3AF]">
                Higher values indicate more frequent symptoms.
              </p>

              {/* ✅ Answers with questions */}
              {normalizedAnswers.length > 0 ? (
                <div className="pt-2">
                  <h3 className="font-semibold text-[#2D3436] mb-3">Answers</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {normalizedAnswers.map((a) => {
                      const questions = getQuestionsByType(
                        selected.assessmentType
                      );
                      const qText =
                        questions[a.questionIndex] ??
                        "Question text not available";

                      return (
                        <div
                          key={a.key}
                          className="rounded-lg border border-[#E8E3DA] bg-[#FBF8F3] p-3 text-sm"
                        >
                          <div className="text-xs font-semibold text-[#2D3436] uppercase tracking-wide">
                            Q{a.questionIndex + 1}
                          </div>

                          <div className="text-xs text-[#5A6062] mt-1 leading-snug">
                            {qText}
                          </div>

                          <div className="mt-2 text-sm font-medium text-[#2D3436]">
                            {formatAnswerValue(a.value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="pt-2">
                  <h3 className="font-semibold text-[#2D3436] mb-2">Answers</h3>
                  <p className="text-sm text-[#5A6062]">
                    No answer details available for this record.
                  </p>
                </div>
              )}
            </div>

            <div className="p-5 border-t border-[#E8F0E9] flex justify-end gap-3">
              <Button variant="outline" onClick={() => setSelected(null)}>
                Close
              </Button>
              <Button onClick={() => navigate("/assessments")}>
                Take another screening
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
