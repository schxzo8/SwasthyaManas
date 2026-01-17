import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import "../styles/auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  setInfo("");
  setShowResend(false);

  try {
    const res = await API.post("/api/auth/login", {
      email,
      password,
    });

    localStorage.setItem("token", res.data.token);
    navigate("/dashboard");
  } catch (err) {
    const msg = err.response?.data?.message || "Login failed";
    setError(msg);

    // 👇 show resend button ONLY for unverified users
    if (msg.toLowerCase().includes("verify")) {
      setShowResend(true);
    }
  }
};


  const handleResend = async () => {
  setError("");
  setInfo("");

  try {
    const res = await API.post("/api/auth/resend-verification", {
      email,
    });

    setInfo(res.data.message);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to resend verification email");
  }
};


  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="auth-brand">SwasthyaManas</div>

        <h2 className="auth-title">Welcome Back!</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {info && <p style={{ color: "green" }}>{info}</p>}

        {showResend && (
          <p style={{ marginTop: "10px" }}>
            Didn’t receive the email?{" "}
            <button
              type="button"
              onClick={handleResend}
              style={{
                background: "none",
                border: "none",
                color: "#0a5",
                cursor: "pointer",
                textDecoration: "underline",
                padding: 0,
              }}
            >
              Resend verification email
            </button>
          </p>
        )}


        <form onSubmit={handleLogin}>
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
          Don’t have an account?{" "}
          <span onClick={() => navigate("/signup")}>Sign up</span>
        </div>
      </div>
    </div>
  );
}

export default Login;
