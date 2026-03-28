import { useMemo, useState } from "react";
import { Bell, Mail, MessageCircle } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import { useNavigate } from "react-router-dom";
import type { AppNotification } from "../context/NotificationsContext";

const TZ = "Asia/Kathmandu";

function formatNepalDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(iso));
}

export default function CommunicationHub() {
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"notifications" | "inbox">("notifications");
  const navigate = useNavigate();

  const recent = useMemo(() => notifications.slice(0, 6), [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch {
      // ignore for now
    }
  };

  const handleView = async (n: AppNotification) => {
    try {
      if (!n.isRead) await markRead(n._id);
    } catch {
      // ignore
    } finally {
      setOpen(false);
      if (n.link) navigate(n.link);
    }
  };

  const handleGoToInbox = () => {
    setOpen(false);
    navigate("/inbox");
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-[#E8F0E9] dark:hover:bg-slate-700 text-[#2D3436] dark:text-white transition-colors"
        aria-label="Communications"
      >
        <MessageCircle size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[11px] flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 border border-[#E8E3DA] dark:border-slate-700 rounded-xl shadow-lg overflow-hidden z-50">
          {/* Tab Navigation */}
          <div className="flex border-b border-[#E8E3DA] dark:border-slate-700">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 font-medium text-sm transition-colors ${
                activeTab === "notifications"
                  ? "text-[#7C9A82] dark:text-emerald-400 border-b-2 border-[#7C9A82] dark:border-emerald-400"
                  : "text-[#5A6062] dark:text-slate-400 hover:text-[#2D3436] dark:hover:text-white"
              }`}
            >
              <Bell size={16} />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setActiveTab("inbox")}
              className={`flex-1 px-4 py-3 flex items-center justify-center gap-2 font-medium text-sm transition-colors ${
                activeTab === "inbox"
                  ? "text-[#7C9A82] dark:text-emerald-400 border-b-2 border-[#7C9A82] dark:border-emerald-400"
                  : "text-[#5A6062] dark:text-slate-400 hover:text-[#2D3436] dark:hover:text-white"
              }`}
            >
              <Mail size={16} />
              <span>Inbox</span>
            </button>
          </div>

          {/* Content */}
          {activeTab === "notifications" ? (
            <>
              <div className="px-4 py-3 flex items-center justify-between border-b border-[#E8E3DA] dark:border-slate-700 bg-[#FAF7F2] dark:bg-slate-900">
                <div className="text-sm font-semibold text-[#2D3436] dark:text-white">
                  Recent Notifications
                </div>
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-xs text-[#7C9A82] dark:text-emerald-400 hover:underline transition-colors"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {recent.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F0E9] dark:bg-slate-700 mb-3">
                      <Bell size={20} className="text-[#7C9A82] dark:text-emerald-400" />
                    </div>
                    <p className="text-sm text-[#5A6062] dark:text-slate-400">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  recent.map((n) => (
                    <button
                      key={n._id}
                      onClick={() => handleView(n)}
                      className={`w-full px-4 py-3 border-b border-[#FAF7F2] dark:border-slate-700 text-left hover:bg-[#FAF7F2] dark:hover:bg-slate-700 transition-colors ${
                        n.isRead ? "bg-white dark:bg-slate-800" : "bg-[#F0F7F4] dark:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                          n.isRead ? "bg-transparent" : "bg-[#7C9A82] dark:bg-emerald-400"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-[#2D3436] dark:text-white">
                            {n.title}
                          </div>
                          {n.message && (
                            <div className="text-xs text-[#5A6062] dark:text-slate-400 mt-1 line-clamp-2">
                              {n.message}
                            </div>
                          )}
                          <div className="text-[11px] text-[#9CA3AF] dark:text-slate-500 mt-1">
                            {formatNepalDateTime(n.createdAt)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </>
          ) : (
            <>
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#E8F0E9] dark:bg-slate-700 mb-3">
                  <Mail size={20} className="text-[#7C9A82] dark:text-emerald-400" />
                </div>
                <p className="text-sm font-medium text-[#2D3436] dark:text-white mb-2">
                  Your Messages
                </p>
                <p className="text-xs text-[#5A6062] dark:text-slate-400 mb-4">
                  View all your conversations and messages with experts
                </p>
                <button
                  onClick={handleGoToInbox}
                  className="inline-block px-4 py-2 bg-[#7C9A82] dark:bg-emerald-600 text-white rounded-lg hover:bg-[#5A7A60] dark:hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  Open Inbox
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
