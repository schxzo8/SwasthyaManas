import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Experts() {
  const navigate = useNavigate();
  const [experts, setExperts] = useState([]);
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");

  const fetchExperts = async () => {
    setErr("");
    try {
      const res = await API.get("/api/experts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExperts(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load experts");
    }
  };

  useEffect(() => {
    fetchExperts();
    // eslint-disable-next-line
  }, []);

  const sendRequest = async () => {
    setErr("");
    setMsg("");

    if (!selectedExpert) return setErr("Please select an expert first.");
    if (!reason.trim()) return setErr("Please write a reason/message.");

    try {
      const res = await API.post(
        "/api/consultations",
        { expertId: selectedExpert._id, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data.message || "Request sent");
      setReason("");
      setSelectedExpert(null);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to send request");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>Find an Expert</h1>
      <p style={{ color: "#555" }}>
        This is a support feature (not a medical diagnosis). Choose an expert and request guidance.
      </p>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>{" "}
        <button onClick={() => navigate("/consultations")}>My Consultations</button>
      </div>

      {err && <p style={{ color: "red", marginTop: 16 }}>{err}</p>}
      {msg && <p style={{ color: "green", marginTop: 16 }}>{msg}</p>}

      <hr style={{ margin: "20px 0" }} />

      {experts.length === 0 ? (
        <p>No experts found.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {experts.map((ex) => (
            <div
              key={ex._id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 14,
                background: selectedExpert?._id === ex._id ? "#f2fff8" : "#fff",
                cursor: "pointer",
              }}
              onClick={() => setSelectedExpert(ex)}
            >
              <h3 style={{ margin: 0 }}>
                {ex.firstName} {ex.lastName}
              </h3>
              <p style={{ margin: "6px 0", color: "#444" }}>
                <strong>Expertise:</strong> {ex.expertise || "—"}
              </p>
              <small style={{ color: "#666" }}>{ex.email}</small>
            </div>
          ))}
        </div>
      )}

      <hr style={{ margin: "20px 0" }} />

      <h2>Request Consultation</h2>
      <p style={{ color: "#555" }}>
        Selected expert:{" "}
        <strong>
          {selectedExpert ? `${selectedExpert.firstName} ${selectedExpert.lastName}` : "None"}
        </strong>
      </p>

      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Write a short message (what you want help with)..."
        rows={5}
        style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc" }}
      />

      <button
        onClick={sendRequest}
        style={{
          marginTop: 12,
          padding: "12px 18px",
          borderRadius: 999,
          border: "none",
          background: "#003f35",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Send Request
      </button>
    </div>
  );
}
