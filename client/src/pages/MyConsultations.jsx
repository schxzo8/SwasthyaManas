import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function MyConsultations() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  const token = localStorage.getItem("token");

  const load = async () => {
    setErr("");
    try {
      const res = await API.get("/api/consultations/my", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load consultations");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ padding: 40, maxWidth: 900, margin: "0 auto" }}>
      <h1>My Consultations</h1>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>{" "}
        <button onClick={() => navigate("/experts")}>Find Experts</button>{" "}
        <button onClick={load}>Refresh</button>
      </div>

      {err && <p style={{ color: "red", marginTop: 16 }}>{err}</p>}

      <hr style={{ margin: "20px 0" }} />

      {items.length === 0 ? (
        <p>No consultation requests yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => (
            <div
              key={r._id}
              style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14, background: "#fff" }}
            >
              <h3 style={{ margin: 0 }}>
                Expert: {r.expert?.firstName} {r.expert?.lastName}{" "}
                <span style={{ color: "#666", fontSize: 14 }}>
                  ({r.expert?.expertise || "—"})
                </span>
              </h3>

              <p style={{ margin: "8px 0" }}>
                <strong>Status:</strong> {r.status}
              </p>

              <p style={{ margin: "8px 0", color: "#444" }}>
                <strong>Your message:</strong> {r.reason}
              </p>

              {r.expertReply && (
                <p style={{ margin: "8px 0", color: "#0b5f47" }}>
                  <strong>Expert reply:</strong> {r.expertReply}
                </p>
              )}

              <small style={{ color: "#777" }}>
                Requested on: {new Date(r.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
