import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { connectSocket, getSocket } from "../services/socket";
import { Calendar, Clock, RefreshCcw, ArrowLeft, CheckCircle2 } from "lucide-react";

type SlotStatus = "open" | "held" | "booked" | "cancelled";

type AvailabilitySlot = {
  _id: string;
  expert: string;
  startAt: string; // ISO UTC
  endAt: string;   // ISO UTC
  durationMins?: number;
  status: SlotStatus;
  heldBy?: string | null;
  holdExpiresAt?: string | null;
  bookedBy?: string | null;
  fee?: number;
  currency?: string;
  notes?: string;
};

type Expert = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise?: string;
};

const TZ = "Asia/Kathmandu";

// -------- Nepal formatting helpers ----------
function formatNepalDayKey(d: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}-${m}-${day}`;
}

function formatNepalDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function formatNepalTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

function msToCountdown(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// Parse "YYYY-MM-DD" Nepal day key into a Date only for LABEL rendering.
function nepalDayKeyToLabelDate(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1, 12, 0, 0));
}

export default function BookingPage() {
  const navigate = useNavigate();
  const { expertId } = useParams<{ expertId: string }>();

  const [expert, setExpert] = useState<Expert | null>(null);

  // lists
  const [allOpenSlots, setAllOpenSlots] = useState<AvailabilitySlot[]>([]);
  const [daySlots, setDaySlots] = useState<AvailabilitySlot[]>([]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);

  // local hold state (may reset on refresh, so we also rely on selectedSlot.holdExpiresAt)
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [holdTick, setHoldTick] = useState(0);
  const holdTimerRef = useRef<number | null>(null);

  // confirmation state
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedInfo, setConfirmedInfo] = useState<{
    dayLabel: string;
    timeLabel: string;
    feeLabel: string;
  } | null>(null);

  const meId = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}")?._id || null;
    } catch {
      return null;
    }
  }, []);

  const loadExpertAndDays = async () => {
    if (!expertId) return;

    setErr("");
    setLoading(true);
    try {
      // expert info
      const expRes = await API.get("/api/experts");
      const found =
        (expRes.data || []).find((x: Expert) => x._id === expertId) || null;
      setExpert(found);

      // load ALL slots needed for day list (backend should return open + my held)
      const res = await API.get(`/api/slots/expert/${expertId}`);
      const list: AvailabilitySlot[] = res.data?.slots || res.data || [];
      setAllOpenSlots(list);

      // default day
      const first = list[0];
      if (first) {
        const key = formatNepalDayKey(new Date(first.startAt));
        setSelectedDayKey((prev) => prev ?? key);
      } else {
        setSelectedDayKey(null);
        setSelectedSlotId(null);
        setHoldExpiresAt(null);
        setDaySlots([]);
      }
    } catch (e: any) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load booking data");
      // await load();
    } finally {
      setLoading(false);
    }
  };

  const loadSlotsForDay = async (dayKey: string | null) => {
    if (!expertId) return;
    if (!dayKey) {
      setDaySlots([]);
      return;
    }

    try {
      const res = await API.get(`/api/slots/expert/${expertId}?date=${dayKey}`);
      const list: AvailabilitySlot[] = res.data?.slots || res.data || [];
      setDaySlots(list);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load day slots");
      setDaySlots([]);
    }
  };

  // initial load
  useEffect(() => {
    loadExpertAndDays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertId]);

  // day change load
  useEffect(() => {
    loadSlotsForDay(selectedDayKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDayKey, expertId]);

  // socket refresh
  useEffect(() => {
    const s = getSocket() ?? connectSocket();
    if (!s) return;

    const refreshAll = async () => {
      await loadExpertAndDays();
      if (selectedDayKey) await loadSlotsForDay(selectedDayKey);
    };

    const onSlotUpdate = () => refreshAll();
    const onAvailabilityUpdate = () => refreshAll();
    const onAppointmentNew = () => refreshAll();

    s.on("slot:update", onSlotUpdate);
    s.on("availability:update", onAvailabilityUpdate);
    s.on("appointment:new", onAppointmentNew);

    return () => {
      s.off("slot:update", onSlotUpdate);
      s.off("availability:update", onAvailabilityUpdate);
      s.off("appointment:new", onAppointmentNew);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expertId, selectedDayKey]);

  const dayOptions = useMemo(() => {
    const set = new Set<string>();
    for (const s of allOpenSlots) set.add(formatNepalDayKey(new Date(s.startAt)));
    return Array.from(set).sort((a, b) => (a < b ? -1 : 1));
  }, [allOpenSlots]);

  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return daySlots.find((s) => s._id === selectedSlotId) ?? null;
  }, [daySlots, selectedSlotId]);

  // effective expiry: local state OR backend slot value
  const effectiveHoldExpiresAt = useMemo(() => {
    return holdExpiresAt || selectedSlot?.holdExpiresAt || null;
  }, [holdExpiresAt, selectedSlot]);

  const holdRemainingMs = useMemo(() => {
    if (!effectiveHoldExpiresAt) return 0;
    return new Date(effectiveHoldExpiresAt).getTime() - Date.now();
  }, [effectiveHoldExpiresAt, holdTick]);

  // tick timer while a hold exists
  useEffect(() => {
    if (holdTimerRef.current) {
      window.clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (!effectiveHoldExpiresAt) return;

    holdTimerRef.current = window.setInterval(() => {
      setHoldTick((x) => x + 1);
    }, 1000);

    return () => {
      if (holdTimerRef.current) {
        window.clearInterval(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };
  }, [effectiveHoldExpiresAt]);

  // auto-expire UI when countdown ends
  useEffect(() => {
    if (effectiveHoldExpiresAt && holdRemainingMs <= 0) {
      setHoldExpiresAt(null);
      setSelectedSlotId(null);
      loadSlotsForDay(selectedDayKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdRemainingMs]);

  const canConfirm = useMemo(() => {
    if (!selectedSlotId) return false;
    if (!effectiveHoldExpiresAt) return false;

    const notExpired = new Date(effectiveHoldExpiresAt).getTime() > Date.now();
    if (!notExpired) return false;

    const isMineHeld =
      selectedSlot?.status === "held" && !!meId && selectedSlot?.heldBy === meId;

    // allow if held by me (normal) OR still open (rare edge)
    return isMineHeld || selectedSlot?.status === "open";
  }, [selectedSlotId, effectiveHoldExpiresAt, selectedSlot, meId]);

  const onPickDay = (key: string) => {
    setSelectedDayKey(key);
    setSelectedSlotId(null);
    setHoldExpiresAt(null);
    setConfirmed(false);
    setConfirmedInfo(null);
  };

  const holdSlot = async (slotId: string) => {
    setErr("");
    setConfirmed(false);
    setConfirmedInfo(null);

    try {
      const res = await API.post(`/api/slots/${slotId}/hold`);
      const slot: AvailabilitySlot | undefined = res.data?.slot;

      setSelectedSlotId(slotId);
      setHoldExpiresAt(slot?.holdExpiresAt || null);

      await loadSlotsForDay(selectedDayKey);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to hold slot");
      await loadSlotsForDay(selectedDayKey);
    }
  };

  const confirmSlot = async () => {
    if (!selectedSlotId) return;
    setErr("");

    try {
      await API.post(`/api/slots/${selectedSlotId}/confirm`);

      const slot = daySlots.find((s) => s._id === selectedSlotId) || null;
      const d = slot ? new Date(slot.startAt) : null;

      setConfirmed(true);
      setConfirmedInfo({
        dayLabel: d ? formatNepalDate(d) : "—",
        timeLabel: d ? formatNepalTime(d) : "—",
        feeLabel: slot ? `${slot.currency || "NPR"} ${slot.fee ?? 0}` : "—",
      });

      setHoldExpiresAt(null);
      setSelectedSlotId(null);

      await loadExpertAndDays();
      await loadSlotsForDay(selectedDayKey);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to confirm booking");
      await loadSlotsForDay(selectedDayKey);
    }
  };

  const clearSelection = () => {
    setSelectedSlotId(null);
    setHoldExpiresAt(null);
    setConfirmed(false);
    setConfirmedInfo(null);
  };

  const expertName = expert ? `${expert.firstName} ${expert.lastName}` : "Expert";

  if (!expertId) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] p-6">
        <Card className="p-6">
          <p className="text-sm text-red-700">Missing expertId in route.</p>
          <Button className="mt-3" onClick={() => navigate("/experts")}>
            Back to Experts
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-10 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#2D3436]">
              Book Appointment
            </h1>
            <p className="text-[#5A6062] mt-1">
              Expert:{" "}
              <span className="font-semibold text-[#2D3436]">{expertName}</span>
              {expert?.expertise ? (
                <span className="ml-2 text-xs text-[#7C9A82] font-medium uppercase tracking-wide">
                  {expert.expertise}
                </span>
              ) : null}
            </p>
            <p className="text-xs text-[#9CA3AF] mt-1">
              Timezone: Nepal (Asia/Kathmandu)
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/experts")}
              className="gap-2"
            >
              <ArrowLeft size={16} /> Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await loadExpertAndDays();
                await loadSlotsForDay(selectedDayKey);
              }}
              isLoading={loading}
              className="gap-2"
            >
              <RefreshCcw size={16} /> Refresh
            </Button>
          </div>
        </div>

        {err && (
          <div className="mb-6 text-sm rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
            {err}
          </div>
        )}

        {/* Confirmation */}
        {confirmed && confirmedInfo && (
          <Card className="p-6 mb-6 border border-[#E8E3DA] bg-white">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-[#7C9A82]" />
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2D3436]">
                  Booking Confirmed
                </h2>
                <p className="text-sm text-[#5A6062] mt-1">
                  {confirmedInfo.dayLabel} • {confirmedInfo.timeLabel} •{" "}
                  {confirmedInfo.feeLabel}
                </p>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left */}
          <div className="lg:col-span-8 space-y-6">
            {/* Day selector */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar size={18} className="text-[#7C9A82]" />
                <h2 className="font-serif text-xl font-bold text-[#2D3436]">
                  Select Day
                </h2>
              </div>

              {dayOptions.length === 0 ? (
                <p className="text-sm text-[#5A6062]">No available slots.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dayOptions.map((key) => {
                    const active = key === selectedDayKey;
                    const labelDate = nepalDayKeyToLabelDate(key);

                    return (
                      <button
                        key={key}
                        onClick={() => onPickDay(key)}
                        className={`px-3 py-2 rounded-xl text-sm border transition-all ${
                          active
                            ? "bg-[#7C9A82] text-white border-[#7C9A82]"
                            : "bg-white text-[#2D3436] border-[#E8E3DA] hover:bg-[#FAF7F2]"
                        }`}
                      >
                        {formatNepalDate(labelDate)}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Time slots */}
            <Card className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={18} className="text-[#7C9A82]" />
                <h2 className="font-serif text-xl font-bold text-[#2D3436]">
                  Select Time
                </h2>
              </div>

              {!selectedDayKey ? (
                <p className="text-sm text-[#5A6062]">Pick a day to see times.</p>
              ) : daySlots.length === 0 ? (
                <p className="text-sm text-[#5A6062]">No slots for this day.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {daySlots.map((s) => {
                    const time = formatNepalTime(new Date(s.startAt));
                    const active = s._id === selectedSlotId;
                    const isMineHeld = s.status === "held" && s.heldBy === meId;
                    const disabled = !(s.status === "open" || isMineHeld);

                    return (
                      <button
                        key={s._id}
                        disabled={disabled}
                        onClick={() => holdSlot(s._id)}
                        className={`py-3 px-3 rounded-full text-sm font-medium border transition-all ${
                          active
                            ? "bg-[#7C9A82] border-[#7C9A82] text-white shadow-md"
                            : disabled
                            ? "bg-[#F5F2EC] border-transparent text-[#B7B7B7] cursor-not-allowed"
                            : "bg-white border-[#E8E3DA] text-[#2D3436] hover:border-[#7C9A82] hover:text-[#7C9A82]"
                        }`}
                        title={disabled ? `Not available (${s.status})` : "Hold this slot"}
                      >
                        {time}
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Right */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              <Card className="p-6">
                <h3 className="font-serif text-xl font-bold text-[#2D3436] mb-4">
                  Booking Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#5A6062]">Expert</span>
                    <span className="font-medium text-[#2D3436]">{expertName}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#5A6062]">Date</span>
                    <span className="font-medium text-[#2D3436]">
                      {selectedSlot ? formatNepalDate(new Date(selectedSlot.startAt)) : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#5A6062]">Time</span>
                    <span className="font-medium text-[#2D3436]">
                      {selectedSlot ? formatNepalTime(new Date(selectedSlot.startAt)) : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-[#5A6062]">Duration</span>
                    <span className="font-medium text-[#2D3436]">
                      {selectedSlot?.durationMins ?? 50} mins
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-[#E8E3DA]">
                    <span className="text-[#5A6062]">Fee</span>
                    <span className="font-serif font-bold text-[#2D3436]">
                      {selectedSlot ? `${selectedSlot.currency || "NPR"} ${selectedSlot.fee ?? 0}` : "—"}
                    </span>
                  </div>
                </div>

                {effectiveHoldExpiresAt && (
                  <div className="mt-4 text-xs rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
                    Slot held for you • expires in <b>{msToCountdown(holdRemainingMs)}</b>
                  </div>
                )}

                <div className="mt-5 flex flex-col gap-2">
                  <Button disabled={!canConfirm} onClick={confirmSlot}>
                    Confirm Booking
                  </Button>

                  <Button
                    variant="outline"
                    disabled={!selectedSlotId && !effectiveHoldExpiresAt}
                    onClick={clearSelection}
                  >
                    Clear Selection
                  </Button>
                </div>

                <p className="mt-4 text-xs text-[#9CA3AF]">
                  Tip: We “hold” a slot first to prevent double booking. Then you confirm.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}