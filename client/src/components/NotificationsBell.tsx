// src/components/NotificationsBell.tsx
import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import { Link } from "react-router-dom";

export default function NotificationsBell() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);

  const recent = useMemo(() => notifications.slice(0, 6), [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      // ignore (or show toast later)
    }
  };

  const handleOpenLink = async (id: string, isRead: boolean) => {
    try {
      if (!isRead) await markRead(id);
    } catch {
      // ignore
    } finally {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-[#E8F0E9] text-[#2D3436] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E8E3DA] rounded-xl shadow-lg overflow-hidden z-50">
          <div className="px-4 py-3 flex items-center justify-between border-b border-[#E8E3DA]">
            <div className="font-semibold text-[#2D3436]">Notifications</div>
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="text-xs text-[#7C9A82] hover:underline"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="px-4 py-6 text-sm text-[#5A6062]">
                No notifications yet.
              </div>
            ) : (
              recent.map((n) => (
                <div
                  key={n._id}
                  className={`px-4 py-3 border-b border-[#FAF7F2] ${
                    n.isRead ? "bg-white" : "bg-[#F0F7F4]"
                  }`}
                >
                  <div className="text-sm font-medium text-[#2D3436]">
                    {n.title}
                  </div>

                  {n.message && (
                    <div className="text-xs text-[#5A6062] mt-1">{n.message}</div>
                  )}

                  <div className="text-[11px] text-[#9CA3AF] mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </div>

                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenLink(n._id, n.isRead);
                      }}
                      className="text-xs text-[#7C9A82] hover:underline mt-2 inline-block"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-3 bg-[#FAF7F2]">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="w-full text-sm py-2 rounded-lg border border-[#E8E3DA] hover:bg-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}