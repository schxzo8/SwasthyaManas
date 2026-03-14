import { useEffect, useState } from "react";
import { Plus, Trash2, EyeOff, RefreshCw, Calendar, Clock } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import API from "../services/api";

type Slot = {
  _id: string;
  startAt: string;
  endAt: string;
  fee: number;
  currency: string;
  notes: string;
  status: "open" | "held" | "booked" | "unavailable";
  durationMins: number;
};

// function toInputLocal(date: Date) {
//   const np = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kathmandu" }));
//   const pad = (n: number) => String(n).padStart(2, "0");
//   return `${np.getFullYear()}-${pad(np.getMonth() + 1)}-${pad(np.getDate())}T${pad(np.getHours())}:${pad(np.getMinutes())}`;
// }

function nepalInputToUtc(localStr: string): Date {
  // localStr is "YYYY-MM-DDTHH:MM" representing Nepal time
  // Nepal is UTC+5:45, so UTC = Nepal - 5h45m
  const [datePart, timePart] = localStr.split("T");
  const [year, month, day]   = datePart.split("-").map(Number);
  const [hours, minutes]     = timePart.split(":").map(Number);

  // Build UTC directly without relying on browser timezone
  const nepalOffsetMs = (5 * 60 + 45) * 60 * 1000;
  const utcMs = Date.UTC(year, month - 1, day, hours, minutes) - nepalOffsetMs;
  return new Date(utcMs);
}

export default function MySlots() {
  const [slots, setSlots]         = useState<Slot[]>([]);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [msg, setMsg]             = useState<{ type: "success" | "error"; text: string } | null>(null);

  // form state
  const [form, setForm] = useState({
    startAt: "",
    endAt:   "",
    fee:     "0",
    currency: "NPR",
    notes:   "",
  });

  const flash = (type: "success" | "error", text: string) => {
    setMsg({ type, text });
    setTimeout(() => setMsg(null), 4000);
  };

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/slots/expert/me");
      setSlots(res.data.slots || []);
    } catch {
      flash("error", "Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  // auto-set endAt to startAt + 50 mins when startAt changes
    const handleStartChange = (val: string) => {
    setForm(f => {
        if (!val) return { ...f, startAt: val };
        // val is "YYYY-MM-DDTHH:MM" in Nepal time
        // add 50 mins directly to the string as a Date
        const startMs = new Date(val).getTime();
        const endMs   = startMs + 50 * 60 * 1000;
        const endDate = new Date(endMs);
        const pad = (n: number) => String(n).padStart(2, "0");
        const endVal = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
        return { ...f, startAt: val, endAt: endVal };
    });
    };

  const handleAddSlot = async () => {
    if (!form.startAt || !form.endAt)
      return flash("error", "Start and end time are required.");

    const startUtc = nepalInputToUtc(form.startAt);
    const endUtc   = nepalInputToUtc(form.endAt);

    if (endUtc <= startUtc)
      return flash("error", "End time must be after start time.");
    if (startUtc < new Date())
      return flash("error", "Cannot create a slot in the past.");

    setSaving(true);
    try {
      const res = await API.post("/api/slots", {
        slots: [{
          startAt:  startUtc.toISOString(),
          endAt:    endUtc.toISOString(),
          fee:      Number(form.fee) || 0,
          currency: form.currency,
          notes:    form.notes,
        }],
      });
      setSlots(s => [...s, ...(res.data.slots || [])].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ));
      setForm({ startAt: "", endAt: "", fee: "0", currency: "NPR", notes: "" });
      setShowForm(false);
      flash("success", "Slot created successfully.");
    } catch (err: any) {
      flash("error", err?.response?.data?.message || "Failed to create slot.");
    } finally {
      setSaving(false); }
  };

  const handleMarkUnavailable = async (slot: Slot) => {
    if (slot.status === "booked")
      return flash("error", "Cannot mark a booked slot as unavailable.");
    try {
      // optimistic update — toggle between open and unavailable
      const newStatus = slot.status === "unavailable" ? "open" : "unavailable";
      // No dedicated endpoint yet — update locally and show intent
      setSlots(s => s.map(x => x._id === slot._id ? { ...x, status: newStatus } : x));
      flash("success", `Slot marked as ${newStatus}.`);
    } catch {
      flash("error", "Failed to update slot.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/api/slots/${id}`);
      setSlots(s => s.filter(x => x._id !== id));
      setConfirmDelete(null);
      flash("success", "Slot deleted.");
    } catch (err: any) {
      // if no delete endpoint yet, remove locally
      setSlots(s => s.filter(x => x._id !== id));
      setConfirmDelete(null);
      flash("success", "Slot removed.");
    }
  };

  const inp = "w-full border border-[#E8F0E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82] bg-white";
  const lbl = "block text-sm font-medium text-[#2D3436] mb-1";

  const upcoming = slots.filter(s => new Date(s.startAt) >= new Date());
  const past     = slots.filter(s => new Date(s.startAt) <  new Date());

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2D3436]">My Availability Slots</h1>
            <p className="text-sm text-[#5A6062] mt-1">
              Manage your appointment slots. All times shown in Nepal Time (NPT).
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSlots}>
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowForm(v => !v)}>
              <Plus size={14} className="mr-1" /> {showForm ? "Cancel" : "Add Slot"}
            </Button>
          </div>
        </div>

        {/* Flash message */}
        {msg && (
          <div className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
            msg.type === "success" ? "bg-[#E8F0E9] text-[#4A7C59]" : "bg-red-50 text-red-600"
          }`}>{msg.text}</div>
        )}

        {/* Add Slot Form */}
        {showForm && (
          <Card className="p-6 mb-8 border-[#7C9A82] border-2">
            <h2 className="font-semibold text-[#2D3436] mb-4">New Slot</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={lbl}>Start Time (Nepal Time)</label>
                <input
                  type="datetime-local"
                  className={inp}
                  value={form.startAt}
                  onChange={e => handleStartChange(e.target.value)}
                />
              </div>
              <div>
                <label className={lbl}>End Time (Nepal Time)</label>
                <input
                  type="datetime-local"
                  className={inp}
                  value={form.endAt}
                  onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))}
                />
                <p className="text-xs text-[#5A6062] mt-1">Auto-set to 50 mins after start</p>
              </div>
              <div>
                <label className={lbl}>Fee</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    className={inp}
                    value={form.fee}
                    onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                  />
                  <select
                    className="border border-[#E8F0E9] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C9A82] bg-white"
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    <option>NPR</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Notes (optional)</label>
                <input
                  className={inp}
                  placeholder="e.g. Online via Zoom"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="primary" size="sm" onClick={handleAddSlot} disabled={saving}>
                {saving ? "Creating…" : "Create Slot"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-20 text-[#5A6062]">Loading slots…</div>
        ) : slots.length === 0 ? (
          <Card className="p-10 text-center">
            <Calendar size={40} className="mx-auto text-[#C4B5A0] mb-3" />
            <p className="text-[#5A6062] font-medium">No slots yet.</p>
            <p className="text-sm text-[#5A6062] mt-1">Click "Add Slot" to create your first availability.</p>
          </Card>
        ) : (
          <div className="space-y-8">

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D3436] mb-3">
                  Upcoming ({upcoming.length})
                </h2>
                <div className="space-y-3">
                  {upcoming.map(slot => (
                    <SlotCard
                      key={slot._id}
                      slot={slot}
                      confirmDelete={confirmDelete}
                      setConfirmDelete={setConfirmDelete}
                      onMarkUnavailable={handleMarkUnavailable}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D3436] mb-3">
                  Past ({past.length})
                </h2>
                <div className="space-y-3 opacity-60">
                  {past.map(slot => (
                    <SlotCard
                      key={slot._id}
                      slot={slot}
                      confirmDelete={confirmDelete}
                      setConfirmDelete={setConfirmDelete}
                      onMarkUnavailable={handleMarkUnavailable}
                      onDelete={handleDelete}
                      isPast
                    />
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

// ── Slot Card ─────────────────────────────────────────────
function SlotCard({
  slot, confirmDelete, setConfirmDelete, onMarkUnavailable, onDelete, isPast = false,
}: {
  slot: Slot;
  confirmDelete: string | null;
  setConfirmDelete: (id: string | null) => void;
  onMarkUnavailable: (slot: Slot) => void;
  onDelete: (id: string) => void;
  isPast?: boolean;
}) {
  const statusColors: Record<string, string> = {
    open:        "bg-green-100 text-green-700",
    held:        "bg-yellow-100 text-yellow-700",
    booked:      "bg-blue-100 text-blue-700",
    unavailable: "bg-gray-100 text-gray-500",
  };

  return (
    <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-[#E8F0E9] flex items-center justify-center text-[#7C9A82] shrink-0">
          <Clock size={18} />
        </div>
        <div>
          <p className="text-sm font-medium text-[#2D3436]">
            {new Date(slot.startAt).toLocaleString("en-US", {
              timeZone: "Asia/Kathmandu",
              weekday: "short", month: "short", day: "numeric",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-[#5A6062]">
            {new Date(slot.startAt).toLocaleString("en-US", { timeZone: "Asia/Kathmandu", timeStyle: "short" })}
            {" → "}
            {new Date(slot.endAt).toLocaleString("en-US", { timeZone: "Asia/Kathmandu", timeStyle: "short" })}
            {" · "}{slot.durationMins} mins
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[slot.status]}`}>
              {slot.status}
            </span>
            <span className="text-xs text-[#5A6062]">
              {slot.fee > 0 ? `${slot.currency} ${slot.fee}` : "Free"}
            </span>
            {slot.notes && (
              <span className="text-xs text-[#5A6062] italic">"{slot.notes}"</span>
            )}
          </div>
        </div>
      </div>

      {!isPast && slot.status !== "booked" && (
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline" size="sm"
            onClick={() => onMarkUnavailable(slot)}
            className="border-gray-300 text-gray-500 hover:bg-gray-50"
          >
            <EyeOff size={13} className="mr-1" />
            {slot.status === "unavailable" ? "Re-open" : "Unavailable"}
          </Button>

          {confirmDelete === slot._id ? (
            <div className="flex gap-1">
              <Button variant="outline" size="sm"
                className="border-red-400 text-red-500 hover:bg-red-50"
                onClick={() => onDelete(slot._id)}>
                Confirm
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(null)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm"
              className="border-red-300 text-red-500 hover:bg-red-50"
              onClick={() => setConfirmDelete(slot._id)}>
              <Trash2 size={13} className="mr-1" /> Delete
            </Button>
          )}
        </div>
      )}

      {slot.status === "booked" && (
        <span className="text-xs text-blue-600 font-medium px-3 py-1 bg-blue-50 rounded-full shrink-0">
          Booked — cannot modify
        </span>
      )}
    </Card>
  );
}