import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import type { User } from "../types";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { connectSocket, getSocket } from "../services/socket";
import {
  Calendar,
  RefreshCcw,
  Search,
  ArrowLeft,
  Clock,
  User as UserIcon,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

type AppointmentStatus = "confirmed" | "cancelled" | "completed";

type Appointment = {
  _id: string;
  user?: { _id: string; firstName?: string; lastName?: string; email?: string } | string;
  expert?: { _id: string; firstName?: string; lastName?: string; email?: string; expertise?: string } | string;

  slot?: { _id: string; startAt: string; endAt: string } | string;

  startAt: string; // UTC ISO
  endAt: string;   // UTC ISO
  durationMins?: number;

  status: AppointmentStatus;

  payment?: {
    provider?: string;
    status?: "unpaid" | "paid" | "refunded";
    amount?: number;
    currency?: string;
    reference?: string;
  };

  createdAt: string;
};

type Role = "user" | "expert" | "admin";

const TZ = "Asia/Kathmandu";

function formatNepalDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(new Date(iso));
}

function formatNepalTime(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // 12-hour with AM/PM
  }).format(new Date(iso));
}

function formatNepalTimeRange(startIso: string, endIso: string) {
  return `${formatNepalTime(startIso)} - ${formatNepalTime(endIso)}`;
}

function fullName(p: any) {
  const n = `${p?.firstName ?? ""} ${p?.lastName ?? ""}`.trim();
  return n || p?.email || "Unknown";
}

function statusPill(status: AppointmentStatus) {
  if (status === "confirmed") return "bg-[#E8F0E9] text-[#2E6B3C] border-[#CFE7D4]";
  if (status === "completed") return "bg-[#E9F0FF] text-[#2B4CA0] border-[#D6E2FF]";
  return "bg-[#FDECEC] text-[#A43B3B] border-[#F8CFCF]";
}

export default function AppointmentsPage() {
  const navigate = useNavigate();

  const [me, setMe] = useState<User | null>(null);
  const [items, setItems] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // UI
  const [tab, setTab] = useState<"upcoming" | "past" | "all">("upcoming");
  const [q, setQ] = useState("");

  const role = (me?.role || "user") as Role;
  const isExpert = role === "expert";

  const load = async () => {
    setErr("");
    setLoading(true);
    try {
      const meRes = await API.get("/api/users/me");
      const meData: User = meRes.data;
      setMe(meData);

      // pick endpoint by role
      const base = meData.role === "expert" ? "/api/appointments/expert" : "/api/appointments/my";

      const res = await API.get(`${base}?view=${tab}`);
      const list: Appointment[] = res.data?.appointments ?? [];
      setItems(list);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [tab]);

  // Socket: reload on new appointment or updates
  useEffect(() => {
    const s = getSocket() ?? connectSocket();
    if (!s) return;

    const onNew = () => load();
    const onUpdate = () => load();
    const onSlotUpdate = () => load(); // optional but helpful

    s.on("appointment:new", onNew);
    s.on("appointment:update", onUpdate);
    s.on("slot:update", onSlotUpdate);

    return () => {
      s.off("appointment:new", onNew);
      s.off("appointment:update", onUpdate);
      s.off("slot:update", onSlotUpdate);
    };
    // eslint-disable-next-line
  }, [tab]);

  // If backend returns ALL always, we filter here too (safe)
  const now = Date.now();
  const visible = useMemo(() => {
    let list = [...items];

    // fallback filter by tab (if backend didn’t)
    if (tab !== "all") {
      list = list.filter((a) => {
        const end = new Date(a.endAt).getTime();
        return tab === "upcoming" ? end >= now : end < now;
      });
    }

    const query = q.trim().toLowerCase();
    if (!query) return list;

    return list.filter((a) => {
      const other = isExpert ? a.user : a.expert;
      const otherName = typeof other === "string" ? "" : fullName(other);
      const otherEmail = typeof other === "string" ? "" : (other?.email ?? "");
      const status = (a.status ?? "").toLowerCase();
      const date = formatNepalDate(a.startAt).toLowerCase();
      return (
        otherName.toLowerCase().includes(query) ||
        otherEmail.toLowerCase().includes(query) ||
        status.includes(query) ||
        date.includes(query)
      );
    });
  }, [items, tab, q, isExpert, now]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2D3436]">Appointments</h1>
            <p className="text-[#5A6062] mt-1">
              {isExpert
                ? "See your upcoming and past sessions with users."
                : "See your booking history and upcoming sessions."}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">Timezone: Nepal (Asia/Kathmandu)</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")} className="gap-2">
              <ArrowLeft size={16} /> Back
            </Button>

            <Button variant="outline" size="sm" onClick={load} isLoading={loading} className="gap-2">
              <RefreshCcw size={16} /> Refresh
            </Button>
          </div>
        </div>

        {err && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        )}

        {/* Tabs + Search */}
        <Card className="p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {(["upcoming", "past", "all"] as const).map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      active
                        ? "bg-[#7C9A82] text-white border-[#7C9A82]"
                        : "bg-white text-[#2D3436] border-[#E8E3DA] hover:bg-[#FAF7F2]"
                    }`}
                  >
                    {t === "upcoming" ? "Upcoming" : t === "past" ? "Past" : "All"}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-80">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, status, date..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#C4B5A0] bg-[#FAF7F2] focus:ring-2 focus:ring-[#7C9A82] outline-none"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9CA3AF]" />
            </div>
          </div>
        </Card>

        {/* List */}
        {visible.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#E8F0E9] mb-4">
              <Calendar className="text-[#7C9A82]" />
            </div>
            <h2 className="font-serif text-xl font-bold text-[#2D3436]">No appointments</h2>
            <p className="text-sm text-[#5A6062] mt-2">
              {tab === "upcoming"
                ? "You don’t have any upcoming sessions yet."
                : tab === "past"
                  ? "No past sessions found."
                  : "No sessions found."}
            </p>

            {!isExpert && (
              <div className="mt-5">
                <Button onClick={() => navigate("/experts")}>Find Experts</Button>
              </div>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visible.map((a) => {
              const other = isExpert ? a.user : a.expert;
              const otherObj = typeof other === "string" ? null : other;

              const title = otherObj ? fullName(otherObj) : "Unknown";
              const subtitle = isExpert
                ? otherObj?.email
                : (otherObj as any)?.expertise || otherObj?.email;

              const fee = a.payment?.amount ?? 0;
              const currency = a.payment?.currency ?? "NPR";

              return (
                <Card key={a._id} className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#5A7A60] font-bold">
                          {(title?.[0] || "U").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-serif text-xl font-bold text-[#2D3436] truncate">
                            {title}
                          </div>
                          <div className="text-xs text-[#5A6062] truncate">
                            {subtitle || (isExpert ? "User" : "Expert")}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-[#5A6062]">
                          <Calendar size={16} className="text-[#7C9A82]" />
                          <span className="text-[#2D3436] font-medium">{formatNepalDate(a.startAt)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[#5A6062]">
                          <Clock size={16} className="text-[#7C9A82]" />
                          <span className="text-[#2D3436] font-medium">
                            {formatNepalTimeRange(a.startAt, a.endAt)}
                          </span>
                          <span className="text-xs text-[#9CA3AF]">
                            • {a.durationMins ?? 50} mins
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[#5A6062]">
                          <UserIcon size={16} className="text-[#7C9A82]" />
                          <span className="text-[#2D3436] font-medium">
                            {isExpert ? "User session" : "Expert session"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${statusPill(
                          a.status
                        )}`}
                      >
                        {a.status}
                      </span>

                      <div className="text-right">
                        <div className="text-xs text-[#9CA3AF]">Fee</div>
                        <div className="font-serif font-bold text-[#2D3436]">
                          {currency} {fee}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="mt-5 pt-4 border-t border-[#E8F0E9] flex flex-wrap gap-2 justify-between items-center">
                    <div className="text-xs text-[#9CA3AF]">
                      Booked on {formatNepalDate(a.createdAt)}
                    </div>

                    <div className="flex gap-2">
                      {a.status === "confirmed" && new Date(a.endAt).getTime() > Date.now() && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#2E6B3C]">
                            <CheckCircle2 size={14} /> Upcoming
                        </span>
                      )}

                      {a.status === "confirmed" && new Date(a.endAt).getTime() < Date.now() && (
                        <span className="Inline-flex items-center gap-1 text-xs text-[#2B4CA0]">
                          <Clock size={14} /> Completed
                        </span>
                      )}
                      
                      {a.status === "cancelled" && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#A43B3B]">
                          <XCircle size={14} /> Cancelled
                        </span>
                      )}
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