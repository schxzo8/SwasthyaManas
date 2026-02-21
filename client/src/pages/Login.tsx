import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BlobDecoration } from "../components/BlobDecoration";
import { connectSocket } from "../services/socket";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showResend, setShowResend] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setShowResend(false);
    setIsLoading(true);

    try {
      // 1) login -> token
      const res = await API.post("/api/auth/login", { email, password });
      const token: string = res.data.token;

      localStorage.setItem("token", token);

      try {
        const meRes = await API.get("/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.setItem("user", JSON.stringify(meRes.data));
      } catch (e) {
        console.warn("Could not fetch user profile, continuing anyway.", e);
      }

      // connect socket immediately after login
      const s = connectSocket();
      if (s && !s.connected) {
        await new Promise<void>((resolve) => {
        s.once("connect", () => resolve());
        s.once("connect_error", () => resolve()); // don’t hang forever
        });
      }   
      navigate("/dashboard");
    } catch (err: any) {
      // cleanup if partial login happened
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const msg = err.response?.data?.message || "Login failed";
      setError(msg);

      // show resend only for unverified users
      if (msg.toLowerCase().includes("verify")) {
        setShowResend(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setIsLoading(true);

    try {
      const res = await API.post("/api/auth/resend-verification", { email });
      setInfo(res.data.message);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Failed to resend verification email"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAF7F2] relative overflow-hidden px-4">
      <BlobDecoration
        variant={1}
        className="top-[-10%] right-[-10%] w-[500px] h-[500px] text-[#E8F0E9]"
      />
      <BlobDecoration
        variant={2}
        className="bottom-[-10%] left-[-10%] w-[400px] h-[400px] text-[#C4B5A0] opacity-20"
      />

      <Card className="w-full max-w-md relative z-10 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="font-serif text-xl font-bold text-[#2D3436] mb-3">
            SwasthyaManas
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D3436] mb-2">
            Welcome Back
          </h1>
          <p className="text-[#5A6062]">Continue your wellness journey</p>
        </div>

        {(error || info) && (
          <div className="mb-6 space-y-2">
            {error && (
              <div className="text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {error}
              </div>
            )}
            {info && (
              <div className="text-sm rounded-xl border border-green-200 bg-green-50 text-green-700 px-4 py-3">
                {info}
              </div>
            )}

            {showResend && (
              <div className="text-sm text-[#5A6062]">
                Didn’t receive the email?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!email || isLoading}
                  className="text-[#7C9A82] font-medium hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Resend verification email
                </button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#2D3436] mb-1"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#2D3436] mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-[#5A6062]">
              <input
                type="checkbox"
                className="mr-2 rounded text-[#7C9A82] focus:ring-[#7C9A82]"
              />
              Remember me
            </label>

            {/* UI only (no logic added) */}
            <Link
              to="/forgot-password"
              className="no-underline text-[#7C9A82] hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Continue
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-[#5A6062]">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="no-underline text-[#7C9A82] font-medium hover:underline"
          >
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Login;
