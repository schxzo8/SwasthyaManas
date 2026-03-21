// src/layouts/RootLayout.tsx
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import API from "../services/api";
import { connectSocket } from "../services/socket";

function notifyAuthChanged() {
  window.dispatchEvent(new Event("auth:changed"));
}

export default function RootLayout() {
  const [booting, setBooting] = useState(true);
  const didBoot = useRef(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (didBoot.current) return;
    didBoot.current = true;

    (async () => {
      try {
        let token = localStorage.getItem("token");

        if (!token) {
          const res = await API.get("/api/auth/refresh");
          const newToken: string = res.data.token;

          localStorage.setItem("token", newToken);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          notifyAuthChanged();

          token = newToken;

          const onAuthPage =
            location.pathname === "/login" ||
            location.pathname === "/signup" ||
            location.pathname === "/verify-email";

          if (onAuthPage) navigate("/dashboard", { replace: true });
        }

        if (token) connectSocket(token);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        notifyAuthChanged();
      } finally {
        setBooting(false);
      }
    })();
  }, [navigate, location.pathname]);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F2]">
        <p className="text-[#5A6062]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-primary)" }}>
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}