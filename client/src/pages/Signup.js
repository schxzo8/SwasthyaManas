import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await API.post("/api/auth/register", {
        email,
        password,
      });

      alert("Account created successfully!");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">SwasthyaManas</div>

        <h2 className="auth-title">Welcome to SwasthyaManas</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={handleSignup}>
          <input
            type="email"
            className="auth-input"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="auth-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="auth-button" type="submit">
            Continue
          </button>
        </form>

        <div className="auth-link">
          Already have an account?{" "}
          <span onClick={() => navigate("/login")}>Log in</span>
        </div>
      </div>
    </div>
  );
}

export default Signup;
