import { useNavigate } from "react-router-dom";
import "../styles/assessment.css";

export default function AssessmentResult() {
  const navigate = useNavigate();
  const raw = localStorage.getItem("lastAssessmentResult");
  const result = raw ? JSON.parse(raw) : null;

  const tips = {
    Minimal: "Keep maintaining your routine: sleep, hydration, and movement.",
    Mild: "Try journaling, short walks, and talking to someone you trust.",
    Moderate: "Consider structured coping strategies and professional guidance if possible.",
    "Moderately Severe": "Strongly consider speaking with a mental health professional.",
    Severe: "Please seek professional support. If you feel unsafe, reach out to local emergency resources.",
  };

  if (!result) {
    return (
      <div className="assess-wrapper">
        <div className="assess-card">
          <h1 className="assess-title">No Result Found</h1>
          <p className="assess-subtitle">
            Please complete an assessment first.
          </p>
          <div className="assess-actions">
            <button className="assess-btn" onClick={() => navigate("/assessments")}>
              Go to Assessments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assess-wrapper">
      <div className="assess-card">
        <h1 className="assess-title">Your Result</h1>
        <p className="assess-subtitle">
        {result.assessmentType} screening result (self-awareness tool, not a diagnosis).
        </p>

        <div className="result-score">{result.totalScore}</div>
        <div className="result-pill">{result.severity}</div>

        <div className="assess-alert info" style={{ marginTop: "18px" }}>
          <strong>Guidance:</strong> {tips[result.severity] || "Take care of yourself."}
        </div>

        <div className="assess-actions">
          <button className="assess-btn" onClick={() => navigate("/assessments/history")}>
            View History
          </button>
          <button className="assess-btn secondary" onClick={() => navigate("/assessments")}>
            Back
          </button>
        </div>

        <div className="small">
          If you are experiencing thoughts of self-harm, please contact local emergency services or a trusted support person.
        </div>
      </div>
    </div>
  );
}
