// src/layouts/RootLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import API from "../services/api";
import { connectSocket } from "../services/socket";

export default function RootLayout() {
  const [booting, setBooting] = useState(true);
  const didBoot = useRef(false);

  useEffect(() => {
    if (didBoot.current) return; // ✅ StrictMode safe
    didBoot.current = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");

        // If no access token, try refresh (cookie-based)
        if (!token) {
          const res = await API.get("/api/auth/refresh");
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        // Connect socket if we have token now
        if (localStorage.getItem("token")) {
          connectSocket();
        }
      } catch {
        // Guest mode (no token)
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <p className="text-[#5A6062]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}