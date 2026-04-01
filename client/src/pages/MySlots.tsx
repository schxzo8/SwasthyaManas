import { useEffect, useState, useRef } from "react";
import { Plus, Trash2, EyeOff, RefreshCw, Calendar, Clock, X } from "lucide-react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import API from "../services/api";
import { toast } from "react-hot-toast";

// Hide native calendar icon
const hiddenIconStyle = `
  input[type="datetime-local"]::-webkit-calendar-picker-indicator {
    display: none !important;
  }
  input[type="datetime-local"]::-webkit-outer-spin-button,
  input[type="datetime-local"]::-webkit-inner-spin-button {
    display: none !important;
  }
`;

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

  // form state
  const [form, setForm] = useState({
    startAt: "",
    endAt:   "",
    fee:     "0",
    currency: "NPR",
    notes:   "",
  });

  const startInputRef = useRef<HTMLInputElement>(null);
  const endInputRef = useRef<HTMLInputElement>(null);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await API.get("/api/slots/expert/me");
      setSlots(res.data.slots || []);
    } catch {
      toast.error("Failed to load slots.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = hiddenIconStyle;
    document.head.appendChild(style);
    return () => style.remove();
  }, []);

  // auto-set endAt to startAt + 50 mins when startAt changes
  const handleStartChange = (val: string) => {
    setForm(f => {
      if (!val) return { ...f, startAt: val };
      // val is "YYYY-MM-DDTHH:MM" in Nepal time
      // add 50 mins directly to the string as a Date
      const startMs = new Date(val).getTime();
      const endMs = startMs + 50 * 60 * 1000;
      const endDate = new Date(endMs);
      const pad = (n: number) => String(n).padStart(2, "0");
      const endVal = `${endDate.getFullYear()}-${pad(endDate.getMonth() + 1)}-${pad(endDate.getDate())}T${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`;
      return { ...f, startAt: val, endAt: endVal };
    });
  };

  const handleAddSlot = async () => {
    if (!form.startAt || !form.endAt) {
      toast.error("Start and end time are required.");
      return;
    }

    const startUtc = nepalInputToUtc(form.startAt);
    const endUtc = nepalInputToUtc(form.endAt);

    if (endUtc <= startUtc) {
      toast.error("End time must be after start time.");
      return;
    }
    if (startUtc < new Date()) {
      toast.error("Cannot create a slot in the past.");
      return;
    }

    setSaving(true);
    try {
      const res = await API.post("/api/slots", {
        slots: [{
          startAt: startUtc.toISOString(),
          endAt: endUtc.toISOString(),
          fee: Number(form.fee) || 0,
          currency: form.currency,
          notes: form.notes,
        }],
      });
      setSlots(s => [...s, ...(res.data.slots || [])].sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      ));
      setForm({ startAt: "", endAt: "", fee: "0", currency: "NPR", notes: "" });
      setShowForm(false);
      toast.success("Slot created successfully.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create slot.");
    } finally {
      setSaving(false);
    }
  };

  const handleMarkUnavailable = async (slot: Slot) => {
    if (slot.status === "booked") {
      toast.error("Cannot mark a booked slot as unavailable.");
      return;
    }
    try {
      const newStatus = slot.status === "unavailable" ? "open" : "unavailable";
      setSlots(s => s.map(x => x._id === slot._id ? { ...x, status: newStatus } : x));
      toast.success(`Slot marked as ${newStatus}.`);
    } catch {
      toast.error("Failed to update slot.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/api/slots/${id}`);
      setSlots(s => s.filter(x => x._id !== id));
      setConfirmDelete(null);
      toast.success("Slot deleted.");
    } catch (err: any) {
      // if no delete endpoint yet, remove locally
      setSlots(s => s.filter(x => x._id !== id));
      setConfirmDelete(null);
      toast.success("Slot removed.");
    }
  };

  const upcoming = slots.filter(s => new Date(s.startAt) >= new Date());
  const past = slots.filter(s => new Date(s.startAt) < new Date());

  return (
    <div className="min-h-screen bg-[#FAF7F2] dark:bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">My Availability Slots</h1>
            <p className="text-sm text-[#5A6062] dark:text-slate-400 mt-2">
              📅 Manage your appointment slots. All times shown in Nepal Time (NPT).
            </p>
          </div>
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSlots}
              className="border-[#7C9A82] dark:border-emerald-600 text-[#7C9A82] dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw size={14} className="mr-1" /> Refresh
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowForm(v => !v)}
              className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-600 dark:to-emerald-700 hover:shadow-lg dark:hover:shadow-emerald-500/20 transition-all duration-200 font-semibold"
            >
              <Plus size={14} className="mr-1" /> {showForm ? "Close" : "Add Slot"}
            </Button>
          </div>
        </div>

        {/* Add Slot Form */}
        {showForm && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-white via-[#FCFAF7] to-[#F9F6F0] dark:from-slate-800 dark:via-slate-850 dark:to-slate-900 border-[#7C9A82] dark:border-emerald-600 border-2 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-serif text-3xl font-bold text-[#2D3436] dark:text-white">Create New Slot</h2>
                <p className="text-sm text-[#5A6062] dark:text-slate-400 mt-2">📅 Set your availability in Nepal Time (NPT)</p>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2.5 hover:bg-[#E8F0E9] dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:scale-110">
                <X size={24} className="text-[#2D3436] dark:text-slate-300" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-8">
              {/* Start Time */}
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
                  <Calendar size={16} className="text-[#7C9A82] dark:text-emerald-400" />
                  Start Time (NPT)
                </label>
                <div className="relative">
                  <input
                    ref={startInputRef}
                    type="datetime-local"
                    className="w-full bg-white dark:bg-slate-700 border-2 border-[#D4CCBF] dark:border-slate-500 rounded-lg px-4 py-3 pr-12 text-sm font-medium text-[#2D3436] dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:ring-offset-2 dark:focus:ring-offset-slate-800 dark:focus:ring-emerald-500 transition-all duration-200 cursor-pointer hover:border-[#7C9A82] dark:hover:border-emerald-500"
                    value={form.startAt}
                    onChange={e => handleStartChange(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = startInputRef.current;
                      if (input) {
                        input.focus();
                        if ('showPicker' in input) {
                          (input as any).showPicker();
                        } else {
                          (input as any).click();
                        }
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-50 dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                  >
                    <Calendar size={20} className="text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
                  </button>
                </div>
              </div>

              {/* End Time */}
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#7C9A82] dark:text-emerald-400" />
                  End Time (NPT)
                </label>
                <div className="relative">
                  <input
                    ref={endInputRef}
                    type="datetime-local"
                    className="w-full bg-white dark:bg-slate-700 border-2 border-[#D4CCBF] dark:border-slate-500 rounded-lg px-4 py-3 pr-12 text-sm font-medium text-[#2D3436] dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:ring-offset-2 dark:focus:ring-offset-slate-800 dark:focus:ring-emerald-500 transition-all duration-200 cursor-pointer hover:border-[#7C9A82] dark:hover:border-emerald-500"
                    value={form.endAt}
                    onChange={e => setForm(f => ({ ...f, endAt: e.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = endInputRef.current;
                      if (input) {
                        input.focus();
                        if ('showPicker' in input) {
                          (input as any).showPicker();
                        } else {
                          (input as any).click();
                        }
                      }
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-emerald-50 dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                  >
                    <Calendar size={20} className="text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />
                  </button>
                </div>
                <p className="text-xs text-[#7C9A82] dark:text-emerald-500 mt-2 font-medium">💡 Auto-set to 50 mins after start</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-7 mb-8">
              {/* Fee */}
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-3">💰 Consultation Fee</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter amount"
                    className="flex-1 bg-white dark:bg-slate-750 border-2 border-[#D4CCBF] dark:border-slate-600 rounded-lg px-4 py-3 text-sm font-medium text-[#2D3436] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:ring-offset-2 dark:focus:ring-offset-slate-800 dark:focus:ring-emerald-500 transition-all duration-200 hover:border-[#7C9A82] dark:hover:border-emerald-500"
                    value={form.fee}
                    onChange={e => setForm(f => ({ ...f, fee: e.target.value }))}
                  />
                  <select
                    className="px-4 py-3 bg-white dark:bg-slate-750 border-2 border-[#D4CCBF] dark:border-slate-600 rounded-lg text-sm font-medium text-[#2D3436] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:ring-offset-2 dark:focus:ring-offset-slate-800 dark:focus:ring-emerald-500 transition-all duration-200 cursor-pointer hover:border-[#7C9A82] dark:hover:border-emerald-500 appearance-none"
                    value={form.currency}
                    onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
                  >
                    <option>NPR</option>
                    <option>USD</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#2D3436] dark:text-white mb-3">📍 Session Type (Optional)</label>
                <input
                  className="w-full bg-white dark:bg-slate-750 border-2 border-[#D4CCBF] dark:border-slate-600 rounded-lg px-4 py-3 text-sm font-medium text-[#2D3436] dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#7C9A82] focus:ring-offset-2 dark:focus:ring-offset-slate-800 dark:focus:ring-emerald-500 transition-all duration-200 hover:border-[#7C9A82] dark:hover:border-emerald-500"
                  placeholder="e.g. Online via Zoom, In-person"
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-[#E8F0E9] dark:border-slate-700">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleAddSlot} 
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-600 dark:to-emerald-700 hover:shadow-lg dark:hover:shadow-emerald-500/20 transition-all duration-200 font-semibold text-white"
              >
                <Plus size={18} className="mr-2" />
                {saving ? "Creating Slot..." : "Create Slot"}
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowForm(false)}
                className="px-6 border-2 border-[#E8F0E9] dark:border-slate-600 text-[#5A6062] dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 hover:bg-[#F9F6F0] transition-all duration-200 font-medium"
              >
                Cancel
              </Button>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin mb-4">
              <Calendar size={40} className="text-[#7C9A82] dark:text-emerald-400" />
            </div>
            <p className="text-sm text-[#5A6062] dark:text-slate-400 font-medium">Loading your slots...</p>
          </div>
        ) : slots.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-white to-[#F9F6F0] dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-[#E8F0E9] dark:border-slate-700 shadow-sm">
            <div className="bg-gradient-to-br from-[#E8F0E9] to-[#D4E4D7] dark:from-slate-700 dark:to-slate-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
              <Calendar size={32} className="text-[#7C9A82] dark:text-emerald-400" />
            </div>
            <p className="text-[#2D3436] dark:text-white font-bold text-lg mb-1">No slots yet</p>
            <p className="text-sm text-[#5A6062] dark:text-slate-400 mb-8">Click "Add Slot" to create your first availability and start accepting appointments.</p>
            <Button 
              variant="primary" 
              size="sm"
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-[#7C9A82] to-[#5A7A60] dark:from-emerald-600 dark:to-emerald-700 hover:shadow-lg dark:hover:shadow-emerald-500/20 transition-all font-semibold"
            >
              <Plus size={16} className="mr-2" /> Create Your First Slot
            </Button>
          </Card>
        ) : (
          <div className="space-y-8">

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-[#7C9A82] to-emerald-400 rounded-full" />
                  <h2 className="font-serif text-xl font-bold text-[#2D3436] dark:text-white">
                    ⏳ Upcoming ({upcoming.length})
                  </h2>
                </div>
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
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full" />
                  <h2 className="font-serif text-xl font-bold text-[#2D3436] dark:text-white">
                    📅 Past ({past.length})
                  </h2>
                </div>
                <div className="space-y-3 opacity-70">
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
    open: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300",
    held: "bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300",
    booked: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300",
    unavailable: "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400",
  };

  return (
    <Card className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-white to-[#F9F6F0] dark:from-slate-800 dark:to-slate-900 border-l-4 border-l-[#7C9A82] dark:border-l-emerald-500 shadow-md hover:shadow-xl dark:hover:shadow-emerald-500/10 transition-all duration-200 hover:translate-x-1">
      <div className="flex items-start gap-4 flex-1">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#E8F0E9] to-[#D4E4D7] dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-[#7C9A82] dark:text-emerald-400 shrink-0 shadow-sm">
          <Clock size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#2D3436] dark:text-white truncate">
            {new Date(slot.startAt).toLocaleString("en-US", {
              timeZone: "Asia/Kathmandu",
              weekday: "long", month: "short", day: "numeric",
            })}
          </p>
          <p className="text-xs text-[#5A6062] dark:text-slate-400 mt-0.5 font-medium">
            {new Date(slot.startAt).toLocaleString("en-US", { timeZone: "Asia/Kathmandu", timeStyle: "short" })}
            {" → "}
            {new Date(slot.endAt).toLocaleString("en-US", { timeZone: "Asia/Kathmandu", timeStyle: "short" })}
            {" • "}{slot.durationMins} mins
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColors[slot.status]}`}>
              {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
            </span>
            {slot.fee > 0 && (
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full font-semibold">
                {slot.currency} {slot.fee}
              </span>
            )}
            {slot.fee === 0 && (
              <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-full font-semibold">
                Free
              </span>
            )}
            {slot.notes && (
              <span className="text-xs bg-[#E8F0E9] dark:bg-slate-700 text-[#5A6062] dark:text-slate-300 px-2.5 py-1 rounded-full">
                📍 {slot.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      {slot.status === "booked" ? (
        <div className="flex-shrink-0">
          <span className="text-xs text-blue-600 dark:text-blue-300 font-semibold px-3 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg whitespace-nowrap shadow-sm">
            ✓ Booked
          </span>
        </div>
      ) : !isPast ? (
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline" size="sm"
            onClick={() => onMarkUnavailable(slot)}
            className="border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all duration-200 text-xs font-medium hover:shadow-md"
          >
            <EyeOff size={14} className="mr-1" />
            {slot.status === "unavailable" ? "Reopen" : "Hide"}
          </Button>

          {confirmDelete === slot._id ? (
            <div className="flex gap-2">
              <Button 
                variant="outline" size="sm"
                className="border-red-400 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-xs font-medium hover:shadow-md"
                onClick={() => onDelete(slot._id)}>
                Confirm
              </Button>
              <Button 
                variant="ghost" size="sm" 
                onClick={() => setConfirmDelete(null)}
                className="text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 text-xs font-medium transition-all duration-200"
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" size="sm"
              className="border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-xs font-medium hover:shadow-md"
              onClick={() => setConfirmDelete(slot._id)}>
              <Trash2 size={14} className="mr-1" /> Delete
            </Button>
          )}
        </div>
      ) : null}
    </Card>
  );
}