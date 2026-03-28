import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import type { Consultation, User } from "../types";

import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Search, Mail, ArrowLeft, RefreshCcw } from "lucide-react";

import { connectSocket, getSocket } from "../services/socket";

type Role = "user" | "expert" | "admin";

type ConsultationUpdatePayload = {
  requestId: string;
  status?: "pending" | "accepted" | "rejected" | "closed";
  expertReply?: string;
  updatedAt?: string;
};

export default function Inbox() {
  const navigate = useNavigate();

  const [me, setMe] = useState<User | null>(null);
  const [items, setItems] = useState<Consultation[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // drafts only for expert
  const [replyDraft, setReplyDraft] = useState<Record<string, string>>({});

  const role = (me?.role || "user") as Role;
  const isExpert = role === "expert";

  // prevent double loads (socket can fire quickly)
  const loadingRef = useRef(false);

  const fetchMeAndInbox = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    setErr("");
    setLoading(true);

    try {
      // 1) who am I
      const meRes = await API.get("/api/users/me");
      const meData: User = meRes.data;
      setMe(meData);

      // 2) inbox list based on role
      const url =
        meData.role === "expert"
          ? "/api/consultations/expert"
          : "/api/consultations/my";

      const res = await API.get(url);
      const list: Consultation[] = res.data || [];

      setItems(list);

      // keep selection stable
      setSelectedId((prev) => {
        if (prev && list.some((x) => x._id === prev)) return prev;
        return list[0]?._id ?? null;
      });
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load inbox");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  // initial load
  useEffect(() => {
    fetchMeAndInbox();
  }, [fetchMeAndInbox]);

  // socket listeners
  useEffect(() => {
    const s = getSocket() ?? connectSocket();
    if (!s) return;

    const onNew = () => fetchMeAndInbox();

    const onUpdate = (payload: ConsultationUpdatePayload) => {
      setItems((prev) => {
        const idx = prev.findIndex((x) => x._id === payload.requestId);
        if (idx === -1) {
          fetchMeAndInbox();
          return prev;
        }
        const next = [...prev];
        next[idx] = {
          ...next[idx],
          status: payload.status ?? next[idx].status,
          expertReply: payload.expertReply ?? next[idx].expertReply,
          updatedAt: payload.updatedAt ?? new Date().toISOString(),
        };
        return next;
      });
    };

    s.on("consultation:new", onNew);
    s.on("consultation:update", onUpdate);

    return () => {
      s.off("consultation:new", onNew);
      s.off("consultation:update", onUpdate);
    };
  }, [fetchMeAndInbox]);

  // role-based UI labels
  const pageTitle = isExpert ? "Expert Inbox" : "My Inbox";
  const pageSubtitle = isExpert
    ? "Manage incoming requests and send replies"
    : "Track your consultation requests and expert responses";
  const messageTitle = isExpert ? "User Message" : "Your Request";
  const replyLabel = isExpert ? "Your Reply" : "Expert Response";
  const searchPlaceholder = isExpert
    ? "Search by name, email, or status..."
    : "Search by expert name, status...";

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;

    return items.filter((r) => {
      const other = isExpert ? r.user : r.expert;
      const name = `${other?.firstName ?? ""} ${other?.lastName ?? ""}`.toLowerCase();
      const email = (other?.email ?? "").toLowerCase();
      const reason = (r.reason ?? "").toLowerCase();
      const status = (r.status ?? "").toLowerCase();
      const expertReply = (r.expertReply ?? "").toLowerCase();

      return (
        name.includes(query) ||
        email.includes(query) ||
        reason.includes(query) ||
        status.includes(query) ||
        expertReply.includes(query)
      );
    });
  }, [items, q, isExpert]);

  const selected = useMemo(
    () => filtered.find((x) => x._id === selectedId) || null,
    [filtered, selectedId]
  );

  // keep selection valid when filter changes
  useEffect(() => {
    if (!selectedId && filtered.length > 0) setSelectedId(filtered[0]._id);
    if (selectedId && filtered.length > 0 && !filtered.some((x) => x._id === selectedId)) {
      setSelectedId(filtered[0]._id);
    }
    if (filtered.length === 0) setSelectedId(null);
  }, [filtered, selectedId]);

  const isPending = selected?.status === "pending";
  const isAccepted = selected?.status === "accepted";
  const isRejected = selected?.status === "rejected";
  const isClosed = selected?.status === "closed";

  const otherPerson = selected ? (isExpert ? selected.user : selected.expert) : null;
  const otherName = otherPerson
    ? `${otherPerson.firstName ?? ""} ${otherPerson.lastName ?? ""}`.trim()
    : "";
  const otherEmail = otherPerson?.email ?? "";

  const currentReplyText = useMemo(() => {
    if (!selected) return "";
    const id = selected._id;
    if (Object.prototype.hasOwnProperty.call(replyDraft, id)) return replyDraft[id];
    return selected.expertReply ?? "";
  }, [selected, replyDraft]);

  const replyEnabled = isExpert && isAccepted;

  const patchLocal = (id: string, patch: Partial<Consultation>) => {
    setItems((prev) => prev.map((x) => (x._id === id ? { ...x, ...patch } : x)));
  };

  // Accept/Reject/Close should ONLY change status (no reply here)
  const updateStatusOnly = async (
    id: string,
    status: "accepted" | "rejected" | "closed"
  ) => {
    setErr("");

    // optimistic
    patchLocal(id, { status, updatedAt: new Date().toISOString() });

    try {
      await API.put(`/api/consultations/${id}`, { status });
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to update status");
      fetchMeAndInbox();
    }
  };

  // Send reply should keep status accepted and update expertReply
  const sendReply = async (id: string, text: string) => {
    setErr("");
    const reply = text.trim();

    // optimistic
    patchLocal(id, {
      status: "accepted",
      expertReply: reply,
      updatedAt: new Date().toISOString(),
    });

    try {
      await API.put(`/api/consultations/${id}`, {
        status: "accepted",
        expertReply: reply,
      });

      // clear draft after success
      setReplyDraft((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to send reply");
      fetchMeAndInbox();
    }
  };

  const userStatusHint = useMemo(() => {
    if (!selected || isExpert) return "";
    if (isPending) return "⏳ Waiting for expert to review your request";
    if (isRejected) return "❌ This request was declined. You can send a new request to another expert";
    if (isClosed) return "✓ This consultation has been closed";
    if (isAccepted && !selected.expertReply) return "✓ Request accepted! Waiting for expert's response";
    if (isAccepted && selected.expertReply) return "✓ Expert has responded to your request";
    return "";
  }, [selected, isExpert, isPending, isRejected, isClosed, isAccepted]);

  const statusConfig = {
    pending: {
      bg: "bg-amber-50 dark:bg-amber-900",
      border: "border-amber-200 dark:border-amber-700",
      badge: "bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-100",
      badgeBorder: "border-amber-200 dark:border-amber-700",
    },
    accepted: {
      bg: "bg-emerald-50 dark:bg-emerald-900",
      border: "border-emerald-200 dark:border-emerald-700",
      badge: "bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100",
      badgeBorder: "border-emerald-200 dark:border-emerald-700",
    },
    rejected: {
      bg: "bg-red-50 dark:bg-red-900",
      border: "border-red-200 dark:border-red-700",
      badge: "bg-red-100 dark:bg-red-800 text-red-900 dark:text-red-100",
      badgeBorder: "border-red-200 dark:border-red-700",
    },
    closed: {
      bg: "bg-slate-50 dark:bg-slate-800",
      border: "border-slate-200 dark:border-slate-700",
      badge: "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-slate-100",
      badgeBorder: "border-slate-200 dark:border-slate-700",
    },
  };

  const currentStatusConfig = selected ? statusConfig[selected.status as keyof typeof statusConfig] : statusConfig.pending;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF7F2] via-[#FCFAF7] to-[#F9F6F0] dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="font-serif text-5xl font-bold text-[#1a1a1a] dark:text-white mb-2">
                {pageTitle}
              </h1>
              <p className="text-[#6B7280] dark:text-slate-400 text-lg">{pageSubtitle}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/dashboard")}
                className="gap-2 hover:shadow-md transition-all"
              >
                <ArrowLeft size={18} />
                Back
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchMeAndInbox}
                className="gap-2 hover:shadow-md transition-all"
                isLoading={loading}
              >
                <RefreshCcw size={18} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {err && (
          <div className="mb-6 rounded-2xl border border-red-300 dark:border-red-700 bg-gradient-to-r from-red-50 dark:from-red-900 to-red-100 dark:to-red-800 text-red-900 dark:text-red-100 px-6 py-4 shadow-md">
            <p className="font-medium">Error</p>
            <p className="text-sm mt-1">{err}</p>
          </div>
        )}

        {/* Status Hint */}
        {!isExpert && selected && userStatusHint && (
          <div className="mb-6 rounded-2xl border border-emerald-300 dark:border-emerald-700 bg-gradient-to-r from-emerald-50 dark:from-emerald-900 to-emerald-100 dark:to-emerald-800 text-emerald-900 dark:text-emerald-100 px-6 py-4 shadow-md">
            <p className="text-base font-medium">{userStatusHint}</p>
          </div>
        )}

        {/* Main Card */}
        <Card className="h-[calc(100vh-300px)] min-h-[500px] flex overflow-hidden p-0 shadow-2xl rounded-3xl border-0 bg-white dark:bg-slate-900">
          {/* Left Sidebar - List */}
          <div className="w-full md:w-[35%] border-r border-[#E8E6E1] dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* Search Bar */}
            <div className="p-5 border-b border-[#E8E6E1] dark:border-slate-700 bg-gradient-to-b from-[#FCFAF7] dark:from-slate-800 to-white dark:to-slate-900 flex-shrink-0 sticky top-0">
              <div className="relative">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-[#B0ABA0] dark:text-slate-500" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#D4CCBF] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#1a1a1a] dark:text-white shadow-sm focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all placeholder-[#9CA3AF] dark:placeholder-slate-500 font-medium"
                />
              </div>
            </div>

            {/* List Container */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="h-24 w-24 bg-gradient-to-br from-[#E8F0E9] dark:from-slate-700 to-[#D4DFD8] dark:to-slate-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                    <Mail size={48} className="text-[#7C9A82] dark:text-emerald-400" />
                  </div>
                  <p className="text-[#1a1a1a] dark:text-white font-semibold text-lg mb-2">
                    {isExpert ? "No Incoming Requests" : "No Consultations Yet"}
                  </p>
                  <p className="text-[#6B7280] dark:text-slate-400 text-sm">
                    {isExpert ? "Requests will appear here when users need your expertise" : "Start by requesting a consultation with an expert"}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-[#E8E6E1] dark:divide-slate-700">
                  {filtered.map((r) => {
                    const other = isExpert ? r.user : r.expert;
                    const name = `${other?.firstName ?? "Unknown"} ${other?.lastName ?? ""}`.trim();
                    const active = r._id === selectedId;

                    const statusIndicator = {
                      pending: { color: "from-amber-400 to-amber-500", text: "Pending" },
                      accepted: { color: "from-emerald-400 to-emerald-500", text: "Accepted" },
                      rejected: { color: "from-red-400 to-red-500", text: "Rejected" },
                      closed: { color: "from-slate-400 to-slate-500", text: "Closed" },
                    }[r.status];

                    return (
                      <button
                        key={r._id}
                        type="button"
                        onClick={() => setSelectedId(r._id)}
                        className={`w-full text-left px-5 py-4 transition-all duration-200 hover:bg-[#F9F6F0] dark:hover:bg-slate-800 active:bg-[#F0F7F4] dark:active:bg-slate-700 ${
                          active ? "bg-gradient-to-r from-[#F0F7F4] dark:from-slate-800 to-[#E8F0E9] dark:to-slate-700 shadow-md relative" : "bg-white dark:bg-slate-900"
                        }`}
                      >
                        {/* Active indicator */}
                        {active && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C9A82] to-[#5A7A60]"></div>
                        )}

                        <div className="flex gap-4">
                          {/* Avatar */}
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all shadow-md ${
                              active
                                ? "bg-gradient-to-br from-[#7C9A82] to-[#5A7A60] text-white scale-110"
                                : "bg-gradient-to-br from-[#F0F7F4] dark:from-slate-700 to-[#E8F0E9] dark:to-slate-600 text-[#7C9A82] dark:text-emerald-400"
                            }`}
                          >
                            {(other?.firstName?.[0] || "U").toUpperCase()}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1.5">
                              <h3 className="font-semibold text-[#1a1a1a] dark:text-white truncate text-sm">{name}</h3>
                              <span className="text-xs text-[#9CA3AF] dark:text-slate-500 whitespace-nowrap flex-shrink-0">
                                {new Date(r.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-xs text-[#6B7280] dark:text-slate-400 truncate mb-2">{other?.email}</p>
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-[#6B7280] dark:text-slate-400 line-clamp-1">{r.reason}</p>
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex-shrink-0 bg-gradient-to-r ${statusIndicator?.color || "from-slate-400 to-slate-500"} text-white shadow-sm`}>
                                {statusIndicator?.text}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Detail View */}
          <div className="hidden md:flex flex-1 bg-white dark:bg-slate-900 flex-col overflow-hidden">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center flex-col">
                <div className="h-32 w-32 bg-gradient-to-br from-[#E8F0E9] dark:from-slate-700 to-[#D4DFD8] dark:to-slate-600 rounded-full flex items-center justify-center mb-8 shadow-xl">
                  <Mail size={64} className="text-[#7C9A82] dark:text-emerald-400" />
                </div>
                <p className="text-[#1a1a1a] dark:text-white text-2xl font-semibold mb-2">No Message Selected</p>
                <p className="text-[#6B7280] dark:text-slate-400 text-base">Choose a consultation from the list to view details</p>
              </div>
            ) : (
              <>
                {/* Detail Header */}
                <div className={`px-8 py-6 border-b-2 bg-gradient-to-b dark:to-slate-900 to-white flex-shrink-0 ${currentStatusConfig.border} ${currentStatusConfig.bg}`}>
                  <div className="flex items-start justify-between gap-6 mb-4">
                    <div className="flex items-start gap-5 flex-1">
                      <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#7C9A82] to-[#5A7A60] flex items-center justify-center text-white font-bold text-xl shadow-lg flex-shrink-0">
                        {(otherPerson?.firstName?.[0] || "U").toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h2 className="font-serif text-3xl font-bold text-[#1a1a1a] dark:text-white">{otherName}</h2>
                        <p className="text-[#6B7280] dark:text-slate-400 mt-1">{otherEmail}</p>
                        <p className="text-xs text-[#6B7280] dark:text-slate-400 mt-3">
                          📅 {new Date(selected.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${currentStatusConfig.badge} ${currentStatusConfig.badgeBorder} shadow-md`}>
                      {selected.status.charAt(0).toUpperCase() + selected.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
                  {/* User Message Card */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-widest mb-4">
                      {messageTitle}
                    </label>
                    <div className="bg-gradient-to-br from-[#F9F6F0] dark:from-slate-800 to-[#F5F2EC] dark:to-slate-700 border-2 border-[#E8E6E1] dark:border-slate-700 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <p className="text-[#2D3436] dark:text-slate-200 text-base leading-relaxed whitespace-pre-wrap">{selected.reason}</p>
                    </div>
                  </div>

                  {/* Reply Card */}
                  <div>
                    <label className="block text-xs font-bold text-[#6B7280] dark:text-slate-400 uppercase tracking-widest mb-4">
                      {replyLabel}
                    </label>
                    <div className="relative">
                      <textarea
                        rows={7}
                        placeholder={
                          isExpert
                            ? isAccepted
                              ? "Type your response here... Be helpful and clear."
                              : "Accept the request first to write a reply"
                            : isRejected
                            ? "This request was declined. Request from another expert."
                            : isClosed
                            ? "This consultation has been closed."
                            : "Waiting for expert's response..."
                        }
                        value={currentReplyText}
                        readOnly={!replyEnabled}
                        onChange={(e) => {
                          if (!replyEnabled) return;
                          setReplyDraft((prev) => ({ ...prev, [selected._id]: e.target.value }));
                        }}
                        className={`w-full px-5 py-4 rounded-2xl border-2 outline-none transition-all text-base leading-relaxed resize-none font-medium ${
                          replyEnabled
                            ? "border-[#D4CCBF] dark:border-slate-700 focus:border-[#7C9A82] focus:ring-4 focus:ring-[#7C9A82] focus:ring-opacity-5 bg-white dark:bg-slate-800 text-[#2D3436] dark:text-slate-200 shadow-sm"
                            : "border-[#E8E6E1] dark:border-slate-700 bg-[#F5F2EC] dark:bg-slate-800 text-[#6B7280] dark:text-slate-400 cursor-not-allowed"
                        }`}
                      />
                      {replyEnabled && (
                        <div className="absolute bottom-4 right-4 text-xs text-[#9CA3AF] dark:text-slate-500">
                          {(currentReplyText || "").length} characters
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info Messages */}
                  {isExpert && isPending && (
                    <div className="bg-blue-50 dark:bg-blue-900 border-l-4 border-blue-400 p-4 rounded text-blue-800 dark:text-blue-200 text-sm">
                      <p className="font-semibold mb-1">📝 Action Required</p>
                      <p>Accept or reject this request to proceed with communication.</p>
                    </div>
                  )}

                  {!isExpert && isRejected && (
                    <div className="bg-red-50 dark:bg-red-900 border-l-4 border-red-400 p-4 rounded text-red-800 dark:text-red-200 text-sm">
                      <p className="font-semibold mb-1">Request Declined</p>
                      <p>This expert has declined your request. Browse other experts to find help.</p>
                    </div>
                  )}

                  {!isExpert && isClosed && (
                    <div className="bg-slate-50 dark:bg-slate-800 border-l-4 border-slate-400 p-4 rounded text-slate-800 dark:text-slate-200 text-sm">
                      <p className="font-semibold mb-1">Consultation Closed</p>
                      <p>This consultation has been completed and closed.</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="px-8 py-6 border-t-2 border-[#E8E6E1] dark:border-slate-700 bg-gradient-to-b from-white dark:from-slate-800 to-[#FCFAF7] dark:to-slate-900 flex-shrink-0">
                  {isExpert ? (
                    <div className="grid grid-cols-4 gap-3">
                      <Button
                        disabled={!isPending}
                        onClick={() => updateStatusOnly(selected._id, "accepted")}
                        className="shadow-lg hover:shadow-xl transition-all text-base font-semibold"
                      >
                        ✓ Accept
                      </Button>

                      <Button
                        disabled={!isPending}
                        variant="outline"
                        onClick={() => updateStatusOnly(selected._id, "rejected")}
                        className="text-base font-semibold"
                      >
                        ✕ Decline
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => updateStatusOnly(selected._id, "closed")}
                        className="text-base font-semibold"
                      >
                        Close
                      </Button>

                      <Button
                        disabled={!isAccepted || !(currentReplyText || "").trim()}
                        onClick={() => sendReply(selected._id, currentReplyText)}
                        className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] shadow-lg hover:shadow-xl transition-all text-white font-semibold"
                      >
                        Send →
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={() => navigate("/consultations")}
                        className="text-base font-semibold"
                      >
                        My Requests
                      </Button>
                      <Button
                        onClick={() => navigate("/experts")}
                        className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] shadow-lg hover:shadow-xl transition-all text-white font-semibold"
                      >
                        Find More Experts →
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
