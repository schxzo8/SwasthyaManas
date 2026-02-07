import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ExpertInbox() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [reply, setReply] = useState({}); // per request id

  const token = localStorage.getItem("token");

  const load = async () => {
    setErr("");
    try {
      const res = await API.get("/api/consultations/expert", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to load expert inbox");
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  const updateStatus = async (id, status) => {
    setErr("");
    try {
      await API.put(
        `/api/consultations/${id}`,
        { status, expertReply: reply[id] || "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await load();
    } catch (e) {
      setErr(e.response?.data?.message || "Failed to update request");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 1000, margin: "0 auto" }}>
      <h1>Expert Inbox</h1>
      <div style={{ marginTop: 16 }}>
        <button onClick={() => navigate("/dashboard")}>Back to Dashboard</button>{" "}
        <button onClick={load}>Refresh</button>
      </div>

      {err && <p style={{ color: "red", marginTop: 16 }}>{err}</p>}

      <hr style={{ margin: "20px 0" }} />

      {items.length === 0 ? (
        <p>No requests yet.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((r) => (
            <div key={r._id} style={{ border: "1px solid #ddd", borderRadius: 10, padding: 14 }}>
              <h3 style={{ margin: 0 }}>
                From: {r.user?.firstName} {r.user?.lastName}
              </h3>
              <small style={{ color: "#666" }}>{r.user?.email}</small>

              <p style={{ margin: "10px 0" }}>
                <strong>Status:</strong> {r.status}
              </p>

              <p style={{ margin: "10px 0", color: "#444" }}>
                <strong>User message:</strong> {r.reason}
              </p>

              <textarea
                rows={3}
                placeholder="Write a reply (optional)..."
                value={reply[r._id] ?? r.expertReply ?? ""}
                onChange={(e) => setReply((prev) => ({ ...prev, [r._id]: e.target.value }))}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #ccc" }}
              />

              <div style={{ marginTop: 10 }}>
                <button onClick={() => updateStatus(r._id, "accepted")}>Accept</button>{" "}
                <button onClick={() => updateStatus(r._id, "rejected")}>Reject</button>{" "}
                <button onClick={() => updateStatus(r._id, "closed")}>Close</button>
              </div>

              <small style={{ color: "#777" }}>
                Received on: {new Date(r.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
