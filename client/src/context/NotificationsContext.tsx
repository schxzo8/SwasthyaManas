import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { connectSocket, getSocket } from "../services/socket";
import toast from "react-hot-toast";

export type AppNotification = {
  _id: string;
  user?: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  meta?: any;
  isRead: boolean;
  createdAt: string;
};

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<Ctx | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationsProvider");
  return ctx;
}

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = async () => {
    const res = await API.get("/api/notifications?limit=30");
    setNotifications(res.data.notifications || []);
    setUnreadCount(res.data.unreadCount || 0);
  };

  const markRead = async (id: string) => {
    const res = await API.patch(`/api/notifications/${id}/read`);
    setUnreadCount(res.data.unreadCount || 0);
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllRead = async () => {
    const res = await API.patch("/api/notifications/read-all");
    setUnreadCount(res.data.unreadCount || 0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  useEffect(() => {
    refresh().catch(() => {});

    const token = localStorage.getItem("token");
    const s = token ? connectSocket(token) : getSocket();
    if (!s) return;

    const onNotifNew = (payload: AppNotification) => {
      const currentUser = JSON.parse(localStorage.getItem("user") || "null");
      const currentUserId = currentUser?._id;

      if (!payload) return;
      if (payload.user && String(payload.user) !== String(currentUserId)) return;

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === payload._id);
        if (exists) return prev;
        return [payload, ...prev].slice(0, 30);
      });

      setUnreadCount((c) => c + 1);

      // Skip toast for consultation_new - it's handled by onConsultationNew
      if (payload.type === "consultation_new") return;

      // Show dynamic toast for other notifications
      toast.success(payload.title || "New notification", {
        duration: 4000,
        position: "top-right",
        icon: "🔔",
      });
    };

    const onConsultationNew = (data: any) => {
      const id = `rt_${data.requestId}`;

      setNotifications((prev) => {
        const exists = prev.some((n) => n._id === id);
        if (exists) return prev;

        return [
          {
            _id: id,
            type: "consultation_new",
            title: "New consultation request",
            message: "You received a new consultation request. Open Inbox to respond.",
            link: "/inbox",
            meta: { requestId: data.requestId },
            isRead: false,
            createdAt: data.createdAt || new Date().toISOString(),
          } as AppNotification,
          ...prev,
        ].slice(0, 30);
      });

      setUnreadCount((c) => c + 1);

      // Show dynamic toast for consultation
      toast.success("New consultation request 📩", {
        duration: 4000,
        position: "top-right",
      });
    };

    const onReconnectSync = () => {
      // Silently resync notifications on reconnect
      refresh().catch(() => {});
    };

    s.on("notification:new", onNotifNew);
    s.on("consultation:new", onConsultationNew);
    s.on("connect", onReconnectSync);

    return () => {
      s.off("notification:new", onNotifNew);
      s.off("consultation:new", onConsultationNew);
      s.off("connect", onReconnectSync);
    };
  }, []);

  const value = useMemo(
    () => ({ notifications, unreadCount, refresh, markRead, markAllRead }),
    [notifications, unreadCount]
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}