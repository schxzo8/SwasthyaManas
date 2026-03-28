import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Calendar, FileText, ChevronRight,
  X, TrendingUp, TrendingDown, Minus, AlertCircle, ArrowRight, RotateCcw
} from "lucide-react";
import API from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import type { AssessmentRecord } from "../types";

type AnswerItem = number | { _id?: string; questionIndex?: number; value?: number };

const PHQ9_QUESTIONS = [
  "Little interest or pleasure in doing things",
  "Feeling down, depressed, or hopeless",
  "Trouble falling or staying asleep, or sleeping too much",
  "Feeling tired or having little energy",
  "Poor appetite or overeating",
  "Feeling bad about yourself — or that you are a failure",
  "Trouble concentrating on things",
  "Moving or speaking so slowly that other people could have noticed",
  "Thoughts that you would be better off dead, or of hurting yourself",
];

const GAD7_QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it is hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid as if something awful might happen",
];

const ANSWER_LABEL: Record<number, string> = {
  0: "Not at all",
  1: "Several days",
  2: "More than half the days",
  3: "Nearly every day",
};

const SEVERITY_STYLES: Record<string, string> = {
  Minimal:             "bg-green-100  text-green-800",
  Mild:                "bg-yellow-100 text-yellow-800",
  Moderate:            "bg-orange-100 text-orange-800",
  "Moderately Severe": "bg-red-100    text-red-800",
  Severe:              "bg-red-200    text-red-900",
};

const SEVERITY_COLOR: Record<string, string> = {
  Minimal:             "text-green-600",
  Mild:                "text-yellow-600",
  Moderate:            "text-orange-600",
  "Moderately Severe": "text-orange-700",
  Severe:              "text-red-600",
};

const SEVERITY_RANK: Record<string, number> = {
  Minimal: 0, Mild: 1, Moderate: 2, "Moderately Severe": 3, Severe: 4,
};

const DESCRIPTIONS: Record<string, string> = {
  Minimal:             "Your symptoms suggest minimal or no depression/anxiety. Keep up your wellness practices!",
  Mild:                "You may be experiencing mild symptoms. Monitoring and self-care strategies are recommended.",
  Moderate:            "Your symptoms appear moderate. Consider consulting with a mental health professional.",
  "Moderately Severe": "These symptoms are significant. We strongly recommend speaking with a healthcare provider.",
  Severe:              "Your score suggests severe symptoms. Please seek professional help immediately.",
};

const TIPS: Record<string, string> = {
  Minimal:             "Keep maintaining your routine: sleep, hydration, and movement.",
  Mild:                "Try journaling, short walks, and talking to someone you trust.",
  Moderate:            "Consider structured coping strategies and professional guidance if possible.",
  "Moderately Severe": "Strongly consider speaking with a mental health professional.",
  Severe:              "Please seek professional support. If you feel unsafe, reach out to local emergency resources.",
};

function getMaxScore(t: string) {
  const u = t.toUpperCase();
  if (u.includes("PHQ")) return 27;
  if (u.includes("GAD")) return 21;
  return undefined;
}

function getQuestions(type: string) {
  const u = type.toUpperCase();
  if (u.includes("PHQ")) return PHQ9_QUESTIONS;
  if (u.includes("GAD")) return GAD7_QUESTIONS;
  return [];
}

function ScoreBar({ score, max }: { score: number; max: number }) {
  const pct = Math.min(100, Math.round((score / max) * 100));
  const color =
    pct < 30 ? "bg-green-400" :
    pct < 55 ? "bg-yellow-400" :
    pct < 75 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="w-full h-1.5 bg-[#E8F0E9] rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TrendBadge({ current, previous }: { current: AssessmentRecord; previous?: AssessmentRecord }) {
  if (!previous) return null;
  
  // Compare severity rank first, then score as tiebreaker
  const severityDiff = SEVERITY_RANK[current.severity] - SEVERITY_RANK[previous.severity];
  const scoreDiff    = current.totalScore - previous.totalScore;
  const diff         = severityDiff !== 0 ? severityDiff : scoreDiff;

  if (diff < 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <TrendingDown size={11} /> Improved
    </span>
  );
  if (diff > 0) return (
    <span className="flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <TrendingUp size={11} /> Worsened
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
      <Minus size={11} /> Same
    </span>
  );
}

export default function AssessmentHistory() {
  const [items, setItems]       = useState<AssessmentRecord[]>([]);
  const [error, setError]       = useState("");
  const [selected, setSelected] = useState<AssessmentRecord | null>(null);
  const [filter, setFilter]     = useState<"all" | "PHQ-9" | "GAD-7">("all");
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/api/assessments/my")
      .then(r => setItems(r.data))
      .catch(() => setError("Failed to load assessment history."));
  }, []);

  const filtered = useMemo(() =>
    filter === "all" ? items : items.filter(i => i.assessmentType === filter),
    [items, filter]
  );

  const normalizedAnswers = useMemo(() => {
    if (!selected) return [];
    const raw = (selected as any).answers as AnswerItem[] | undefined;
    if (!Array.isArray(raw)) return [];
    return raw.map((a, idx) => {
      if (typeof a === "number") return { key: `n-${idx}`, questionIndex: idx, value: a };
      const qi = typeof a.questionIndex === "number" ? a.questionIndex : idx;
      const v  = typeof a.value === "number" ? a.value : Number(a.value);
      return { key: (a as any)._id || `o-${idx}`, questionIndex: qi, value: Number.isFinite(v) ? v : undefined };
    }).sort((a, b) => (a.questionIndex ?? 0) - (b.questionIndex ?? 0));
  }, [selected]);

  const previousRecord = useMemo(() => {
    if (!selected) return undefined;
    return items.find(i =>
      i.assessmentType === selected.assessmentType &&
      i._id !== selected._id &&
      new Date(i.createdAt) < new Date(selected.createdAt)
    );
  }, [selected, items]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="pl-0" onClick={() => navigate("/assessments")}>
              <ArrowLeft className="mr-1 h-4 w-4" /> Back
            </Button>
            <div>
              <h1 className="font-serif text-3xl font-bold text-[#2D3436] dark:text-white">Assessment History</h1>
              <p className="text-sm text-[#5A6062] dark:text-slate-400 mt-0.5">
                {items.length} screening{items.length !== 1 ? "s" : ""} completed
              </p>
            </div>
          </div>

          {/* Filter pills */}
          <div className="flex gap-2">
            {(["all", "PHQ-9", "GAD-7"] as const).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === f
                    ? "bg-[#7C9A82] text-white border-[#7C9A82]"
                    : "bg-white dark:bg-slate-800 text-[#5A6062] dark:text-slate-400 border-[#E8F0E9] dark:border-slate-700 hover:border-[#7C9A82] dark:hover:border-slate-600"
                }`}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 px-4 py-3">
            {error}
          </div>
        )}

        {filtered.length === 0 && !error && (
          <Card className="p-10 text-center">
            <FileText size={40} className="mx-auto text-[#C4B5A0] dark:text-slate-600 mb-3" />
            <p className="text-[#5A6062] dark:text-slate-400 font-medium">No assessments yet.</p>
            <Button className="mt-4" onClick={() => navigate("/assessments")}>
              Take your first screening
            </Button>
          </Card>
        )}

        <div className="space-y-3">
          {filtered.map((r, idx) => {
            const max  = getMaxScore(r.assessmentType);
            const prev = filtered.slice(idx + 1).find(i => i.assessmentType === r.assessmentType);
            return (
              <Card key={r._id}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer group"
                onClick={() => setSelected(r)}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                      r.assessmentType.includes("PHQ") ? "bg-[#7C9A82]" : "bg-[#C4B5A0]"
                    }`}>
                      {r.assessmentType.includes("PHQ") ? "P9" : "G7"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-[#2D3436] dark:text-white">{r.assessmentType} Screening</h3>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${SEVERITY_STYLES[r.severity] || "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"}`}>
                          {r.severity}
                        </span>
                        <TrendBadge current={r} previous={prev} />
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#5A6062] dark:text-slate-400 mt-1">
                        <Calendar size={12} />
                        {new Date(r.createdAt).toLocaleString(undefined, {
                          year: "numeric", month: "short", day: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="text-right min-w-[60px]">
                      <p className="text-xs text-[#5A6062] dark:text-slate-400 uppercase tracking-wide">Score</p>
                      <p className="font-serif text-2xl font-bold text-[#2D3436] dark:text-white leading-none">
                        {r.totalScore}
                        {max && <span className="text-sm text-[#9CA3AF] dark:text-slate-500 font-sans">/{max}</span>}
                      </p>
                      {max && <div className="mt-1.5 w-16"><ScoreBar score={r.totalScore} max={max} /></div>}
                    </div>
                    <ChevronRight size={18} className="text-[#C4B5A0] dark:text-slate-600 group-hover:text-[#7C9A82] dark:group-hover:text-emerald-400 transition-colors" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-10 md:hidden">
          <Link to="/dashboard" className="no-underline">
            <Button variant="outline" className="w-full">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* ── Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}>
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-[#E8F0E9] dark:border-slate-700"
            onClick={e => e.stopPropagation()}>

            {/* Modal header */}
            <div className="p-6 border-b border-[#E8F0E9] dark:border-slate-700 flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${
                  selected.assessmentType.includes("PHQ") ? "bg-[#7C9A82]" : "bg-[#C4B5A0]"
                }`}>
                  {selected.assessmentType.includes("PHQ") ? "P9" : "G7"}
                </div>
                <div>
                  <h2 className="font-serif text-2xl font-bold text-[#2D3436] dark:text-white">
                    {selected.assessmentType} Screening
                  </h2>
                  <p className="text-sm text-[#5A6062] dark:text-slate-400">
                    {new Date(selected.createdAt).toLocaleString(undefined, {
                      year: "numeric", month: "long", day: "numeric",
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelected(null)}
                className="h-9 w-9 rounded-full hover:bg-[#FAF7F2] dark:hover:bg-slate-700 flex items-center justify-center shrink-0">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">

              {/* Score ring + severity + trend */}
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Score ring */}
                <div className="relative shrink-0">
                  <svg className="w-32 h-32 -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#E8F0E9" strokeWidth="10" fill="none" />
                    {getMaxScore(selected.assessmentType) && (
                      <circle cx="64" cy="64" r="56"
                        stroke="currentColor" strokeWidth="10" fill="none"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={2 * Math.PI * 56 * (1 - selected.totalScore / getMaxScore(selected.assessmentType)!)}
                        className={`${SEVERITY_COLOR[selected.severity] || "text-[#7C9A82]"} transition-all duration-700`}
                      />
                    )}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-3xl font-serif font-bold ${SEVERITY_COLOR[selected.severity] || "text-[#7C9A82]"}`}>
                      {selected.totalScore}
                    </span>
                    {getMaxScore(selected.assessmentType) && (
                      <span className="text-xs text-[#9CA3AF] dark:text-slate-500">of {getMaxScore(selected.assessmentType)}</span>
                    )}
                  </div>
                </div>

                {/* Severity info */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-xl font-bold font-serif ${SEVERITY_COLOR[selected.severity] || "text-[#7C9A82]"}`}>
                      {selected.severity}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${SEVERITY_STYLES[selected.severity] || "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300"}`}>
                      {selected.assessmentType}
                    </span>
                    {previousRecord && <TrendBadge current={selected} previous={previousRecord} />}
                  </div>

                  <p className="text-sm text-[#5A6062] dark:text-slate-400 leading-relaxed">
                    {DESCRIPTIONS[selected.severity] || "This is a self-awareness screening tool."}
                  </p>

                  <div className="bg-[#FFFDF9] dark:bg-slate-700 border border-[#E8F0E9] dark:border-slate-600 rounded-xl p-3">
                    <p className="text-sm text-[#5A6062] dark:text-slate-300">
                      <span className="font-semibold text-[#2D3436] dark:text-white">Guidance: </span>
                      {TIPS[selected.severity] || "Take care of yourself."}
                    </p>
                  </div>
                </div>
              </div>

              {/* Type description */}
              <p className="text-xs text-[#9CA3AF] dark:text-slate-500">
                {selected.assessmentType.includes("PHQ")
                  ? "PHQ-9: 9 questions assessing depression severity over the past 2 weeks."
                  : "GAD-7: 7 questions assessing anxiety severity over the past 2 weeks."}
              </p>

              {/* Question responses */}
              {normalizedAnswers.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-[#2D3436] dark:text-white mb-3">Question Responses</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {normalizedAnswers.map(a => {
                      const questions = getQuestions(selected.assessmentType);
                      const qText     = questions[a.questionIndex] ?? "Question not available";
                      const v         = typeof a.value === "number" ? a.value : -1;
                      const barColor  = v === 0 ? "bg-green-400" : v === 1 ? "bg-yellow-400" : v === 2 ? "bg-orange-400" : "bg-red-400";
                      return (
                        <div key={a.key} className="rounded-xl border border-[#E8E3DA] dark:border-slate-600 bg-[#FBF8F3] dark:bg-slate-700 p-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-semibold text-[#7C9A82] dark:text-emerald-400 uppercase tracking-wide">Q{a.questionIndex + 1}</span>
                            {v >= 0 && <span className="text-xs font-medium text-[#2D3436] dark:text-white">{v}/3</span>}
                          </div>
                          <p className="text-xs text-[#5A6062] dark:text-slate-400 leading-snug mb-2">{qText}</p>
                          <div className="h-1.5 bg-[#E8F0E9] dark:bg-slate-600 rounded-full overflow-hidden mb-1.5">
                            <div className={`h-full rounded-full ${barColor}`}
                              style={{ width: v >= 0 ? `${Math.round((v / 3) * 100)}%` : "0%" }} />
                          </div>
                          <p className="text-xs font-medium text-[#2D3436] dark:text-white">
                            {v >= 0 ? (ANSWER_LABEL[v] ?? "—") : "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-[#5A6062] dark:text-slate-400">No answer details available for this record.</p>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <Link to="/experts" className="no-underline" onClick={() => setSelected(null)}>
                  <Button className="w-full">
                    Find an Expert <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" onClick={() => { setSelected(null); navigate("/assessments"); }}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Retake Assessment
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 bg-[#FFFDF9] dark:bg-slate-700 border border-[#E8F0E9] dark:border-slate-600 rounded-xl p-4">
                <AlertCircle className="h-4 w-4 text-[#7C9A82] dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[#5A6062] dark:text-slate-300">
                  <span className="font-semibold">Disclaimer: </span>
                  This screening tool is not a medical diagnosis. If you are in crisis or feeling suicidal,
                  please call emergency services or a crisis hotline immediately.
                </p>
              </div>

            </div>

            <div className="p-6 border-t border-[#E8F0E9] dark:border-slate-700 flex justify-end">
              <Button variant="outline" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}