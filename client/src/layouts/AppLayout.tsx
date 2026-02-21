// src/layouts/AppLayout.tsx
import { Outlet } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Navbar } from "../components/Navbar";
import API from "../services/api";
import { connectSocket } from "../services/socket";

export default function AppLayout() {
  const [booting, setBooting] = useState(true);
  const didBoot = useRef(false);

  useEffect(() => {
    if (didBoot.current) return; // ✅ stops double-run in StrictMode
    didBoot.current = true;

    (async () => {
      try {
        let token = localStorage.getItem("token");

        if (!token) {
          const res = await API.get("/api/auth/refresh");
          const newToken: string = res.data.token;
          localStorage.setItem("token", newToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }

        connectSocket(); // reads latest localStorage token
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  if (booting) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}