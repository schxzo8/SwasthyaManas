import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/assessment.css";

export default function AssessmentHistory() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

  return (
    <div className="assess-wrapper">
      <div className="assess-card">
        <h1 className="assess-title">My Assessment History</h1>
        <p className="assess-subtitle">
          Your previous screening results are listed below.
        </p>

        {error && <div className="assess-alert error">{error}</div>}

        <div className="assess-actions">
        <button
            className="assess-btn"
            onClick={() => navigate("/dashboard")}
        >
            Back to Dashboard
        </button>

        <button
            className="assess-btn secondary"
            onClick={() => navigate("/assessments")}
        >
            Back to Assessments
        </button>
        </div>


        {items.length === 0 && !error && (
          <div className="assess-alert info">No assessments yet.</div>
        )}

        {items.map((r) => (
          <div className="history-item" key={r._id}>
            <div className="history-top">
              <div>
                <strong>{r.assessmentType}</strong>
                <div className="small">{new Date(r.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div><strong>Score:</strong> {r.totalScore}</div>
                <div><strong>Severity:</strong> {r.severity}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
