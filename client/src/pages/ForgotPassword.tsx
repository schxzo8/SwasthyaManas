import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { Button } from "../components/Button";
import NotFound from "./NotFound";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthed(!!token);
  }, []);

  // Show 404 if guest user tries to access
  if (isAuthed === false) {
    return <NotFound />;
  }

  // Loading while checking auth
  if (isAuthed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2] dark:bg-slate-950">
        <p className="text-[#5A6062] dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);
      await API.post("/api/auth/forgot-password", { email: email.toLowerCase() });
      setSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8">
            <div className="text-center">
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
              <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">Check your email</h2>
              <p className="text-[#666] dark:text-slate-400 mb-6">
                We've sent a password reset link to <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-[#999] dark:text-slate-500 mb-6">
                The link will expire in 1 hour. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full bg-[#7C9A82] hover:bg-[#6a8370] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-2">Reset Password</h1>
          <p className="text-[#666] dark:text-slate-400 mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-[#D5E3DB] dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-[#1a1a1a] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 transition-all"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#666] dark:text-slate-400">
              Remember your password?{" "}
              <Link to="/login" className="text-[#7C9A82] dark:text-emerald-400 hover:text-[#6a8370] dark:hover:text-emerald-300 font-semibold">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
