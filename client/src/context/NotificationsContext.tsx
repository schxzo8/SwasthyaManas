import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { connectSocket, getSocket } from "../services/socket";

export type AppNotification = {
  _id: string;
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

  // initial load + socket live updates
  useEffect(() => {
    refresh().catch(() => {});

    const s = getSocket() ?? connectSocket();
    if (!s) return;

    const onNew = (payload: AppNotification) => {
      setNotifications((prev) => [payload, ...prev].slice(0, 30));
      setUnreadCount((c) => c + 1);
    };

    s.on("notification:new", onNew);
    return () => {
      s.off("notification:new", onNew);
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