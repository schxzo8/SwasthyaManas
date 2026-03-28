import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../components/Button";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid reset link");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!newPassword.trim()) {
      setError("Password is required");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await API.post(`/api/auth/reset-password/${token}`, {
        newPassword,
      });
      setSuccess(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      const message = err?.response?.data?.message || "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (error === "Invalid reset link") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8 text-center">
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
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-3">Invalid Link</h2>
            <p className="text-red-600 dark:text-red-400 font-medium mb-4">This password reset link is invalid or has expired.</p>
            <Link to="/login">
              <button className="w-full bg-[#7C9A82] hover:bg-[#6a8370] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                Back to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8 text-center">
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
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white mb-2">Password Reset!</h2>
            <p className="text-[#666] dark:text-slate-400 mb-6">Your password has been successfully reset.</p>
            <p className="text-sm text-[#999] dark:text-slate-500 mb-6">Redirecting to login in 3 seconds...</p>
            <Link to="/login">
              <button className="w-full bg-[#7C9A82] hover:bg-[#6a8370] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-colors">
                Go to Login
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-[#E8F0E9] dark:border-slate-700 p-8">
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-2">Set New Password</h1>
          <p className="text-[#666] dark:text-slate-400 mb-8">Create a strong password to secure your account</p>

          {error && (
            <div className="mb-6 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#D5E3DB] dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-[#1a1a1a] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500 hover:text-[#7C9A82] dark:hover:text-emerald-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#D5E3DB] dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-[#1a1a1a] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 transition-all pr-12"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] dark:text-slate-500 hover:text-[#7C9A82] dark:hover:text-emerald-400 transition-colors"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="text-xs text-blue-800 dark:text-blue-300">
                💡 <span className="font-semibold">Password Tips:</span> Use at least 8 characters with uppercase, lowercase, numbers, and symbols.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full"
            >
              {loading ? "Resetting..." : "Reset Password"}
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
