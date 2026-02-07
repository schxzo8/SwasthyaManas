import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await API.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(res.data);
      } catch (err) {
        setError("Failed to load user data");
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("lastAssessmentResult");
    window.location.href = "/login";
  };

  if (error) return <p>{error}</p>;
  if (!user) return <p>Loading dashboard...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>User Dashboard</h1>

      <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Role:</strong> {user.role}</p>

      {user.role === "expert" && (
        <p><strong>Expertise:</strong> {user.expertise}</p>
      )}

      <hr />

      <p>Welcome to SwasthyaManas</p>
      <p>Your mental health journey starts here.</p>

      {/* Assessments */}
      <button
        style={{
          marginTop: "15px",
          padding: "12px 18px",
          borderRadius: "999px",
          border: "none",
          background: "#003f35",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = "/assessments")}
      >
        Start Assessment
      </button>

      {/* Logout */}
      <button
        style={{
          marginTop: "15px",
          marginLeft: "10px",
          padding: "12px 18px",
          borderRadius: "999px",
          border: "1px solid #003f35",
          background: "#fff",
          color: "#003f35",
          cursor: "pointer",
        }}
        onClick={handleLogout}
      >
        Logout
      </button>

      {/* ===== Expert Module buttons ===== */}
      {user.role === "user" && (
        <div style={{ marginTop: "15px" }}>
          <button
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#003f35",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = "/experts")}
          >
            Find Experts
          </button>

          <button
            style={{
              marginLeft: "10px",
              padding: "12px 18px",
              borderRadius: "999px",
              border: "1px solid #003f35",
              background: "#fff",
              color: "#003f35",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = "/consultations")}
          >
            My Consultations
          </button>
        </div>
      )}

      {user.role === "expert" && (
        <div style={{ marginTop: "15px" }}>
          <button
            style={{
              padding: "12px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#003f35",
              color: "#fff",
              cursor: "pointer",
            }}
            onClick={() => (window.location.href = "/expert/inbox")}
          >
            Expert Inbox
          </button>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
