import { useEffect, useState, useMemo } from "react";
import { RefreshCw, Calendar, Users, CheckCircle } from "lucide-react";
import { Card } from "../Card";
import { Button } from "../Button";
import API from "../../services/api";

type Appointment = {
  _id: string;
  user:   { _id: string; firstName: string; lastName: string; email: string };
  expert: { _id: string; firstName: string; lastName: string; email: string; expertise?: string };
  slot:   { startAt: string; endAt: string; fee: number; currency: string } | null;
  startAt: string;
  endAt:   string;
  status:  "confirmed" | "cancelled" | "completed";
  payment: { status: string; amount: number; currency: string; provider: string };
  createdAt: string;
};

const STATUS_STYLES: Record<string, string> = {
  confirmed:  "bg-green-100  text-green-700",
  cancelled:  "bg-red-100    text-red-700",
  completed:  "bg-blue-100   text-blue-700",
};

const TZ = "Asia/Kathmandu";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: TZ, dateStyle: "medium", timeStyle: "short",
  });
}

export default function AdminAppointmentsPanel() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "confirmed" | "cancelled" | "completed">("all");
  const [msg, setMsg]                   = useState<{ type: "success" | "error"; text: string } | null>(null);

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/users/admin/appointments");
      setAppointments(res.data);
    } catch {
      flash("error", "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  // ── Stats ─────────────────────────────────────────────
  const stats = useMemo(() => {
    const total      = appointments.length;
    const confirmed  = appointments.filter(a => a.status === "confirmed").length;
    const completed  = appointments.filter(a => a.status === "completed").length;
    const cancelled  = appointments.filter(a => a.status === "cancelled").length;
    const revenue    = appointments
      .filter(a => a.payment?.status === "paid")
      .reduce((sum, a) => sum + (a.payment?.amount || 0), 0);
    return { total, confirmed, completed, cancelled, revenue };
  }, [appointments]);

  // ── By expert ─────────────────────────────────────────
  const byExpert = useMemo(() => {
    const map: Record<string, { name: string; expertise: string; count: number; revenue: number }> = {};
    appointments.forEach(a => {
      const id   = a.expert?._id || "unknown";
      const name = a.expert ? `${a.expert.firstName} ${a.expert.lastName}` : "Unknown";
      if (!map[id]) map[id] = { name, expertise: a.expert?.expertise || "—", count: 0, revenue: 0 };
      map[id].count++;
      if (a.payment?.status === "paid") map[id].revenue += a.payment.amount || 0;
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [appointments]);

  // ── Filtered list ─────────────────────────────────────
  const filtered = useMemo(() => {
    return appointments.filter(a => {
      const matchSearch = search === "" ||
        `${a.user?.firstName} ${a.user?.lastName} ${a.user?.email} ${a.expert?.firstName} ${a.expert?.lastName}`
          .toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [appointments, search, statusFilter]);

  const inp = "w-full border border-[#E8F0E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82]";

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2D3436]">Appointments</h2>
          <p className="text-sm text-[#5A6062] mt-0.5">{appointments.length} total appointments</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchAppointments}>
          <RefreshCw size={14} className="mr-1" /> Refresh
        </Button>
      </div>

      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === "success" ? "bg-[#E8F0E9] text-[#4A7C59]" : "bg-red-50 text-red-600"
        }`}>{msg.text}</div>
      )}

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",      value: stats.total,     icon: Calendar,     bg: "bg-blue-100",   color: "text-blue-600"   },
          { label: "Confirmed",  value: stats.confirmed,  icon: CheckCircle,  bg: "bg-green-100",  color: "text-green-600"  },
          { label: "Completed",  value: stats.completed,  icon: Users,        bg: "bg-purple-100", color: "text-purple-600" },
          { label: "Cancelled",  value: stats.cancelled,  icon: RefreshCw,    bg: "bg-red-100",    color: "text-red-600"    },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div className={`h-10 w-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-[#5A6062] uppercase tracking-wide">{label}</p>
              <p className="text-2xl font-bold text-[#2D3436] font-serif leading-none mt-0.5">{value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue card */}
      <Card className="p-4 flex items-center gap-3 border-[#7C9A82] border">
        <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center shrink-0">
          <span className="text-[#7C9A82] font-bold text-sm">Rs</span>
        </div>
        <div>
          <p className="text-xs text-[#5A6062] uppercase tracking-wide">Total Revenue Collected</p>
          <p className="text-2xl font-bold text-[#7C9A82] font-serif leading-none mt-0.5">
            NPR {stats.revenue.toLocaleString()}
          </p>
        </div>
      </Card>

      {/* ── By expert ── */}
      {byExpert.length > 0 && (
        <div>
          <h3 className="font-serif text-lg font-bold text-[#2D3436] mb-3">Appointments by Expert</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {byExpert.map(e => (
              <Card key={e.name} className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-[#7C9A82] flex items-center justify-center text-white font-medium text-sm shrink-0">
                  {e.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#2D3436] truncate">{e.name}</p>
                  <p className="text-xs text-[#5A6062]">{e.expertise}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-[#2D3436] font-serif leading-none">{e.count}</p>
                  <p className="text-xs text-[#5A6062]">
                    {e.revenue > 0 ? `NPR ${e.revenue.toLocaleString()}` : "Free"}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input className={inp + " flex-1"} placeholder="Search by user or expert name…"
          value={search} onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2">
          {(["all", "confirmed", "completed", "cancelled"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all capitalize ${
                statusFilter === s
                  ? "bg-[#7C9A82] text-white border-[#7C9A82]"
                  : "bg-white text-[#5A6062] border-[#E8F0E9] hover:border-[#7C9A82]"
              }`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="text-center py-16 text-[#5A6062]">Loading appointments…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[#5A6062]">No appointments found.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map(a => (
            <Card key={a._id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                {/* Left — user + expert */}
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#C4B5A0] flex items-center justify-center text-white font-medium text-xs shrink-0">
                    {a.user ? `${a.user.firstName[0]}${a.user.lastName[0]}` : "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#2D3436]">
                      {a.user ? `${a.user.firstName} ${a.user.lastName}` : "Unknown user"}
                    </p>
                    <p className="text-xs text-[#5A6062]">{a.user?.email}</p>
                    <p className="text-xs text-[#5A6062] mt-0.5">
                      with <span className="font-medium text-[#2D3436]">
                        {a.expert ? `${a.expert.firstName} ${a.expert.lastName}` : "Unknown expert"}
                      </span>
                      {a.expert?.expertise && ` · ${a.expert.expertise}`}
                    </p>
                  </div>
                </div>

                {/* Right — time + status + payment */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  <div className="text-right">
                    <p className="text-xs text-[#5A6062]">{fmt(a.startAt)}</p>
                    <p className="text-xs text-[#9CA3AF]">
                      {a.payment?.amount > 0
                        ? `${a.payment.currency} ${a.payment.amount} · ${a.payment.status}`
                        : "Free"}
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                    STATUS_STYLES[a.status] || "bg-gray-100 text-gray-600"
                  }`}>
                    {a.status}
                  </span>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}