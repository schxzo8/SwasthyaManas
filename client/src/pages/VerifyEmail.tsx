import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState("Verifying your email...");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await API.get(`/api/auth/verify-email/${token}`);
        setMessage(res.data.message);
        setIsLoading(false);

        // redirect after success
        setTimeout(() => navigate("/login"), 3000);
      } catch (err: any) {
        setError(
          err.response?.data?.message || "Verification failed"
        );
        setIsLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8 text-center">
          {error ? (
            <>
              <div className="w-16 h-16 bg-[#fff5f5] dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-3">Verification Failed</h2>
              <p className="text-red-600 dark:text-red-400 font-medium mb-4">{error}</p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#7C9A82] hover:bg-[#6a8370] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </>
          ) : isLoading ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 border-4 border-[#E8F0E9] dark:border-slate-600 border-t-[#7C9A82] dark:border-t-emerald-500 rounded-full animate-spin"></div>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">Verifying Email</h2>
              <p className="text-[#666] dark:text-slate-400">Please wait while we verify your email...</p>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#EBF8F5] dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-[#7C9A82] dark:text-emerald-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">Email Verified!</h2>
              <p className="text-[#7C9A82] dark:text-emerald-400 font-medium mb-1">{message}</p>
              <p className="text-[#999] dark:text-slate-500 text-sm">Redirecting to login...</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
