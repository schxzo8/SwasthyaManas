import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get(`/api/auth/verify-email/${token}`);
        setMessage(res.data.message);

        // redirect after success
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Verification failed"
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>Email Verification</h2>

      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <>
          <p style={{ color: "green" }}>{message}</p>
          <p>Redirecting to login...</p>
        </>
      )}
    </div>
  );
}

export default VerifyEmail;
