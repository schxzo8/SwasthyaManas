import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/assessment.css";

export default function PHQ9Form() {
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/assessment-templates/PHQ-9");
        setAssessment(res.data);
      } catch (e) {
        setError("Failed to load PHQ-9 questions. Make sure backend is running.");
      }
    };
    load();
  }, []);

  const onSelect = (idx, value) => {
    setAnswers((prev) => ({ ...prev, [idx]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!assessment) return;

    if (Object.keys(answers).length !== assessment.questions.length) {
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
      const res = await API.post("/api/assessments/phq9", payload);

      // Save latest result for result page
      localStorage.setItem("lastAssessmentResult", JSON.stringify(res.data.result));
      navigate("/assessments/result");
    } catch (e) {
      setError(e.response?.data?.message || "Failed to submit assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assessment && !error) {
    return (
      <div className="assess-wrapper">
        <div className="assess-card">
          <p className="assess-subtitle">Loading PHQ-9...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assess-wrapper">
      <div className="assess-card">
        <h1 className="assess-title">{assessment?.name || "PHQ-9"}</h1>
        <p className="assess-subtitle">{assessment?.description}</p>

        {error && <div className="assess-alert error">{error}</div>}

        {assessment && (
          <form onSubmit={handleSubmit}>
            {assessment.questions.map((q, idx) => (
              <div className="q-block" key={idx}>
                <div className="q-text">
                  {idx + 1}. {q.text}
                </div>

                <div className="options">
                  {q.options.map((opt) => (
                    <label className="opt" key={opt.value}>
                      <input
                        type="radio"
                        name={`q-${idx}`}
                        value={opt.value}
                        checked={String(answers[idx]) === String(opt.value)}
                        onChange={() => onSelect(idx, opt.value)}
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}

            <div className="assess-actions">
              <button className="assess-btn" type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit PHQ-9"}
              </button>
              <button
                type="button"
                className="assess-btn secondary"
                onClick={() => navigate("/assessments")}
                disabled={submitting}
              >
                Back
              </button>
            </div>

            <div className="small">
              Note: This is a screening tool. If you’re worried about your safety, please seek help immediately.
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
