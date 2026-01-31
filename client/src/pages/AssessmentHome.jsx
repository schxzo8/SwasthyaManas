import { useNavigate } from "react-router-dom";
import "../styles/assessment.css";

export default function AssessmentHome() {
  const navigate = useNavigate();

  return (
    <div className="assess-wrapper">
      <div className="assess-card">
        <h1 className="assess-title">Mental Health Assessments</h1>
        <p className="assess-subtitle">
          These are screening tools for self-awareness, not a medical diagnosis.
          If you feel unsafe or overwhelmed, please reach out to a trusted person or a professional.
        </p>

        <div className="assess-actions">
          <button className="assess-btn" onClick={() => navigate("/assessments/phq9")}>
            Start PHQ-9 (Depression)
          </button>
        <button className = "assess-btn" onClick={() => navigate("/assessments/gad7")}>
            Start GAD-7 (Anxiety)
          </button>
          <button className="assess-btn secondary" onClick={() => navigate("/assessments/history")}>
            View My History
          </button>
          <button className="assess-btn secondary" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>

        </div>

        <div className="assess-alert info">
          Tip: Answer honestly based on the <strong>last 2 weeks</strong>.
        </div>
      </div>
    </div>
  );
}
