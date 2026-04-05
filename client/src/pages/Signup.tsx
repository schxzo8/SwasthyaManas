// src/pages/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import { useGoogleLogin } from "@react-oauth/google";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Eye, EyeOff } from "lucide-react";
import { BlobDecoration } from "../components/BlobDecoration";
import { toast } from "react-hot-toast";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await API.post("/api/auth/register", {
        firstName,
        lastName,
        email,
        password,
      });

      toast.success("Account created! Please check your email to verify your account.");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse: any) => {
      setError("");
      setIsLoading(true);
      try {
        await API.post("/api/auth/google-signup", {
          token: codeResponse.access_token,
        });
        
        toast.success("Account created! You can now log in.");
        navigate("/login");
      } catch (err: any) {
        const msg = err.response?.data?.message || "Google signup failed";
        setError(msg);
        toast.error(msg);
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => {
      setError("Google signup failed. Please try again.");
      toast.error("Google signup failed");
      setIsLoading(false);
    },
    flow: "implicit",
  });

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAF7F2] dark:bg-slate-950 relative overflow-hidden px-4 py-12">
      <BlobDecoration
        variant={3}
        className="top-[-10%] left-[-10%] w-[500px] h-[500px] text-[#E8F0E9]"
      />
      <BlobDecoration
        variant={1}
        className="bottom-[-10%] right-[-10%] w-[400px] h-[400px] text-[#C4B5A0] opacity-20"
      />

      <Card className="w-full max-w-md relative z-10 p-8 md:p-10">
        <div className="text-center mb-8">
          <div className="font-serif text-xl font-bold text-[#2D3436] dark:text-white mb-3">
            SwasthyaManas
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D3436] dark:text-white mb-2">
            Begin Your Journey
          </h1>
          <p className="text-[#5A6062] dark:text-slate-400">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-1">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] dark:border-slate-600 bg-[#FAF7F2] dark:bg-slate-700 text-[#2D3436] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-1">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] dark:border-slate-600 bg-[#FAF7F2] dark:bg-slate-700 text-[#2D3436] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] dark:border-slate-600 bg-[#FAF7F2] dark:bg-slate-700 text-[#2D3436] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] dark:text-white mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] dark:border-slate-600 bg-[#FAF7F2] dark:bg-slate-700 text-[#2D3436] dark:text-white placeholder-[#999] dark:placeholder-slate-500 focus:ring-2 focus:ring-[#7C9A82] dark:focus:ring-emerald-500 focus:border-transparent outline-none transition-all pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C4B5A0] dark:text-slate-500 hover:text-[#7C9A82] dark:hover:text-emerald-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Continue
          </Button>
        </form>

        <div className="mt-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#C4B5A0] dark:border-slate-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#FFFFFF] dark:bg-slate-800 text-[#5A6062] dark:text-slate-400">
              Or continue with
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => googleLogin()}
          disabled={isLoading}
          className="w-full mt-6 px-4 py-3 rounded-xl border border-[#C4B5A0] dark:border-slate-600 bg-[#FFFFFF] dark:bg-slate-700 text-[#2D3436] dark:text-white hover:bg-[#FAF7F2] dark:hover:bg-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="mt-8 text-center text-sm text-[#5A6062] dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="no-underline text-[#7C9A82] dark:text-emerald-400 font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
