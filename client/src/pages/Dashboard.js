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
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser(res.data);
      } catch (err) {
        setError("Failed to load user data");
      }
    };

    fetchUser();
  }, []);

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

      <p>Welcome to SwasthyaManas </p>
      <p>Your mental health journey starts here.</p>

      {/* Take the PHQ-9 assessment quiz */}
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
      onClick={() => window.location.href = "/assessments"}
    >
      Start Assessment
    </button>
    </div>
  );
}

export default Dashboard;
