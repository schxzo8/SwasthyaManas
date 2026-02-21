import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Video, Calendar, Clock, MoreVertical } from "lucide-react";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import API from "../services/api";
import type { Consultation } from "../types";
import { connectSocket } from "../services/socket";

export default function MyConsultations() {
  const navigate = useNavigate();

  const [items, setItems] = useState<Consultation[]>([]);
  const [err, setErr] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // ✅ load consultations (no manual token/header needed if you already use axios interceptor)
  const load = useCallback(async () => {
    setErr("");
    setIsLoading(true);
    try {
      const res = await API.get("/api/consultations/my");
      setItems(res.data || []);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load consultations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ load on mount
  useEffect(() => {
    load();
  }, [load]);

  // ✅ socket updates (connects if not already connected)
  useEffect(() => {
    const s = connectSocket();
    if (!s) return;

    const onUpdate = () => load();
    s.on("consultation:update", onUpdate);

    return () => {
      s.off("consultation:update", onUpdate);
    };
  }, [load]);

  const statusLabel = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "upcoming") return "Upcoming";
    if (s === "completed") return "Completed";
    if (s === "pending") return "Pending";
    if (s === "approved") return "Approved";
    if (s === "rejected") return "Rejected";
    return status || "Unknown";
  };

  const statusBadgeClass = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "upcoming" || s === "approved") return "bg-green-500 text-white";
    if (s === "completed") return "bg-[#E8F0E9] text-[#2D3436]";
    if (s === "rejected") return "bg-red-500 text-white";
    return "bg-[#FFFDF9] text-[#5A6062] border border-[#E8F0E9]";
  };

  const getExpertName = (c: Consultation) => {
    const first = c.expert?.firstName || "";
    const last = c.expert?.lastName || "";
    const full = `${first} ${last}`.trim();
    return full || "Expert";
  };

  const getRole = (c: Consultation) =>
    c.expert?.expertise || (c as any).role || "Licensed Professional";

  const getImage = (c: Consultation) =>
    (c.expert as any)?.image ||
    (c as any)?.image ||
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=100&h=100";

  const createdDate = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const createdTime = (iso?: string) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
  };

  // If you later add scheduled fields (start/end), you can wire them here:
  const timeRange = (c: Consultation) => {
    const start = (c as any).startTime as string | undefined;
    const end = (c as any).endTime as string | undefined;

    if (!start && !end) return `${createdTime(c.createdAt)}`;

    const s = start
      ? new Date(start).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";
    const e = end
      ? new Date(end).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";

    return e ? `${s} - ${e}` : s;
  };

  const canJoin = (status?: string) => {
    const s = (status || "").toLowerCase();
    return s === "upcoming" || s === "approved";
  };

  const joinUrlFor = (c: Consultation) =>
    (c as any).meetLink || (c as any).callLink || (c as any).videoLink || "";

  const onJoin = (c: Consultation) => {
    const url = joinUrlFor(c);
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h1 className="font-serif text-3xl font-bold text-[#2D3436]">My Consultations</h1>

          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate("/experts")}>
              Find Experts
            </Button>
            <Button variant="secondary" onClick={load} isLoading={isLoading}>
              Refresh
            </Button>
          </div>
        </div>

        {err && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
            {err}
          </p>
        )}

        {isLoading ? (
          <div className="text-center text-[#5A6062]">Loading consultations...</div>
        ) : items.length === 0 ? (
          <div className="text-center text-[#5A6062]">No consultation requests yet.</div>
        ) : (
          <div className="space-y-6">
            {items.map((c) => {
              const joinable = canJoin(c.status);
              const joinUrl = joinUrlFor(c);

              return (
                <Card key={c._id} className="p-6">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <img
                      src={getImage(c)}
                      alt={getExpertName(c)}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#E8F0E9]"
                    />

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl font-bold text-[#2D3436]">
                            {getExpertName(c)}
                          </h3>
                          <p className="text-sm text-[#5A6062]">{getRole(c)}</p>
                        </div>

                        <div
                          className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadgeClass(
                            c.status
                          )}`}
                        >
                          {statusLabel(c.status)}
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-4 mt-3 text-sm text-[#5A6062]">
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>{createdDate(c.createdAt) || "—"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{timeRange(c) || "—"}</span>
                        </div>
                      </div>

                      <div className="mt-4 text-sm text-[#2D3436] bg-[#FFFDF9] border border-[#E8F0E9] rounded-xl px-4 py-3">
                        <div className="text-xs font-semibold text-[#5A6062] mb-1">Your message</div>
                        <div className="whitespace-pre-wrap">{c.reason || "—"}</div>
                      </div>

                      {c.expertReply && (
                        <div className="mt-3 text-sm text-[#0b5f47] bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                          <div className="text-xs font-semibold text-[#0b5f47] mb-1">
                            Expert reply
                          </div>
                          <div className="whitespace-pre-wrap">{c.expertReply}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {joinable ? (
                        <Button
                          onClick={() => onJoin(c)}
                          disabled={!joinUrl}
                          title={!joinUrl ? "No call link available yet" : "Join call"}
                        >
                          <Video className="mr-2 h-4 w-4" /> Join Call
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          View Notes
                        </Button>
                      )}

                      <button
                        type="button"
                        className="p-2 hover:bg-[#E8F0E9] rounded-full text-[#5A6062]"
                        onClick={() => {
                          // optional menu placeholder
                        }}
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
