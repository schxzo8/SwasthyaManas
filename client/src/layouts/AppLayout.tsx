// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import API from "../services/api";
import { connectSocket } from "../services/socket";
import { NotificationsProvider } from "../context/NotificationsContext";

export default function AppLayout() {
  const [booting, setBooting] = useState(true);
  const didBoot = useRef(false);

  useEffect(() => {
    if (didBoot.current) return; // prevents double-run in StrictMode
    didBoot.current = true;

    (async () => {
      try {
        let token = localStorage.getItem("token");

        // try refresh token if access token missing
        if (!token) {
          const res = await API.get("/api/auth/refresh");
          const newToken: string = res.data.token;

          localStorage.setItem("token", newToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        // 🔌 connect socket after token ready
        connectSocket();
      } catch {
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
    <NotificationsProvider> {/* global notification system */}
      <div className="min-h-screen flex flex-col">
        <Navbar />

        {/* page content */}
        <main className="flex-1">
          <Outlet />
        </main>

        <Footer />
      </div>
    </NotificationsProvider>
  );
}