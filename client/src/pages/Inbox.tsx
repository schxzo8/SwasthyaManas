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
  const pageTitle = isExpert ? "Expert Inbox" : "Inbox";
  const pageSubtitle = isExpert
    ? "Manage consultation requests and replies."
    : "Track your consultation requests and expert replies.";
  const messageTitle = isExpert ? "User message" : "Your message";
  const replyLabel = isExpert ? "Expert reply" : "Reply from expert";
  const searchPlaceholder = isExpert
    ? "Search users, email, status..."
    : "Search experts, status...";

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

  // ✅ Accept/Reject/Close should ONLY change status (no reply here)
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

  // ✅ Send reply should keep status accepted and update expertReply
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
    if (isPending) return "Pending: waiting for expert to accept.";
    if (isRejected) return "Rejected: expert rejected your request.";
    if (isClosed) return "Closed: this consultation has been closed.";
    if (isAccepted && !selected.expertReply) return "Accepted: waiting for expert reply.";
    return "";
  }, [selected, isExpert, isPending, isRejected, isClosed, isAccepted]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2D3436]">
              {pageTitle}
            </h1>
            <p className="text-[#5A6062] mt-1">{pageSubtitle}</p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="gap-2"
            >
              <ArrowLeft size={16} />
              Back
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={fetchMeAndInbox}
              className="gap-2"
              isLoading={loading}
            >
              <RefreshCcw size={16} />
              Refresh
            </Button>
          </div>
        </div>

        {err && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        )}

        {!isExpert && selected && userStatusHint && (
          <div className="mb-6 text-sm rounded-xl border border-[#E8F0E9] bg-white text-[#5A6062] px-4 py-3">
            {userStatusHint}
          </div>
        )}

        <Card className="h-[75vh] flex overflow-hidden p-0">
          {/* Left list */}
          <div className="w-full md:w-1/3 border-r border-[#E8F0E9] flex flex-col">
            <div className="p-4 border-b border-[#E8F0E9] bg-white">
              <div className="relative">
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#C4B5A0] bg-[#FAF7F2] focus:ring-2 focus:ring-[#7C9A82] outline-none"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="p-6 text-sm text-[#5A6062]">
                  {isExpert ? "No incoming requests yet." : "No consultation requests yet."}
                </div>
              ) : (
                filtered.map((r) => {
                  const other = isExpert ? r.user : r.expert;
                  const name = `${other?.firstName ?? "Unknown"} ${other?.lastName ?? ""}`.trim();
                  const active = r._id === selectedId;

                  return (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setSelectedId(r._id)}
                      className={`w-full text-left p-4 border-b border-[#E8F0E9] hover:bg-[#FAF7F2] transition-colors ${
                        active ? "bg-[#F0F7F4]" : "bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              active
                                ? "bg-[#7C9A82] text-white"
                                : "bg-[#E8F0E9] text-[#5A6062]"
                            }`}
                          >
                            {(other?.firstName?.[0] || "U") + (other?.lastName?.[0] || "")}
                          </div>

                          <div className="min-w-0">
                            <div className="font-medium text-[#2D3436] truncate">{name}</div>
                            <div className="text-xs text-[#5A6062] truncate">{other?.email}</div>
                          </div>
                        </div>

                        <span className="text-xs text-[#9CA3AF] whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-sm text-[#5A6062] truncate">{r.reason}</p>
                        <span className="shrink-0 inline-block px-2.5 py-1 rounded-full bg-[#FAF7F2] text-[11px] font-medium text-[#5A7A60] border border-[#E8F0E9]">
                          {r.status}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right detail */}
          <div className="hidden md:flex flex-1 bg-white flex-col">
            {!selected ? (
              <div className="flex-1 flex items-center justify-center flex-col text-[#9CA3AF]">
                <div className="h-16 w-16 bg-[#E8F0E9] rounded-full flex items-center justify-center mb-4">
                  <Mail size={32} className="text-[#7C9A82]" />
                </div>
                <p>Select a request to read</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col">
                <div className="p-6 border-b border-[#E8F0E9]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-[#2D3436]">{otherName}</h2>
                      <p className="text-sm text-[#5A6062]">{otherEmail}</p>
                      <p className="text-xs text-[#9CA3AF] mt-1">
                        Created: {new Date(selected.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <span className="inline-block px-3 py-1 rounded-full bg-[#FAF7F2] text-xs font-medium text-[#5A7A60] border border-[#E8F0E9]">
                      {selected.status}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto">
                  <Card className="p-5">
                    <h3 className="font-medium text-[#2D3436] mb-2">{messageTitle}</h3>
                    <p className="text-sm text-[#5A6062] leading-relaxed">{selected.reason}</p>
                  </Card>

                  {/* Reply */}
                  <div>
                    <label className="block text-sm font-medium text-[#2D3436] mb-2">
                      {replyLabel}
                    </label>

                    <textarea
                      rows={5}
                      placeholder={
                        isExpert
                          ? isAccepted
                            ? "Write your reply..."
                            : "Accept first to enable reply..."
                          : isRejected
                          ? "This request was rejected."
                          : isClosed
                          ? "This consultation is closed."
                          : "Waiting for expert reply..."
                      }
                      value={currentReplyText}
                      readOnly={!replyEnabled}
                      onChange={(e) => {
                        if (!replyEnabled) return;
                        setReplyDraft((prev) => ({ ...prev, [selected._id]: e.target.value }));
                      }}
                      className={`w-full px-4 py-3 rounded-xl border border-[#C4B5A0] outline-none transition-all ${
                        replyEnabled
                          ? "focus:ring-2 focus:ring-[#7C9A82] bg-[#FAF7F2]"
                          : "bg-[#F5F2EC] text-[#5A6062]"
                      }`}
                    />
                  </div>

                  {/* Actions */}
                  {isExpert ? (
                    <div className="flex flex-wrap gap-3">
                      <Button
                        disabled={!isPending}
                        onClick={() => updateStatusOnly(selected._id, "accepted")}
                      >
                        Accept
                      </Button>

                      <Button
                        disabled={!isPending}
                        variant="outline"
                        onClick={() => updateStatusOnly(selected._id, "rejected")}
                      >
                        Reject
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => updateStatusOnly(selected._id, "closed")}
                      >
                        Close
                      </Button>

                      <Button
                        variant="secondary"
                        disabled={!isAccepted || !(currentReplyText || "").trim()}
                        onClick={() => sendReply(selected._id, currentReplyText)}
                      >
                        Send Reply
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => navigate("/consultations")}>
                        View All
                      </Button>
                      <Button variant="outline" onClick={() => navigate("/experts")}>
                        Find Experts
                      </Button>
                    </div>
                  )}

                  {isExpert && isPending && (
                    <p className="text-xs text-[#9CA3AF]">
                      Accept first, then type and press <b>Send Reply</b>.
                    </p>
                  )}

                  {!isExpert && isRejected && (
                    <p className="text-xs text-red-600">
                      This request was rejected by the expert. You can’t reply here.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
