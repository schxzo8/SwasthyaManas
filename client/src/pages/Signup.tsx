// src/pages/Signup.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { BlobDecoration } from "../components/BlobDecoration";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      alert("Account created successfully!");
      navigate("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#FAF7F2] relative overflow-hidden px-4 py-12">
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
          <div className="font-serif text-xl font-bold text-[#2D3436] mb-3">
            SwasthyaManas
          </div>
          <h1 className="font-serif text-3xl font-bold text-[#2D3436] mb-2">
            Begin Your Journey
          </h1>
          <p className="text-[#5A6062]">Create your account to get started</p>
        </div>

        {error && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#2D3436] mb-1">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              autoComplete="given-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] mb-1">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              autoComplete="family-name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] mb-1">
              Email Address
            </label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#2D3436] mb-1">
              Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </div>

          <Button type="submit" className="w-full mt-4" isLoading={isLoading}>
            Continue
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-[#5A6062]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="no-underline text-[#7C9A82] font-medium hover:underline"
          >
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default Signup;
