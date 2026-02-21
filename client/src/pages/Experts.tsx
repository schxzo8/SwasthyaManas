import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Star, MapPin } from "lucide-react";
import API from "../services/api";
import { Button } from "../components/Button";
import { Card } from "../components/Card";
import { Expert } from "../types";

export default function Experts() {
  const navigate = useNavigate();

  const [experts, setExperts] = useState<Expert[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [reason, setReason] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  const token = localStorage.getItem("token");

  const fetchExperts = async () => {
    setErr("");
    setIsLoading(true);
    try {
      const res = await API.get("/api/experts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExperts(res.data);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to load experts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendRequest = async () => {
    setErr("");
    setMsg("");

    if (!selectedExpert) return setErr("Please select an expert first.");
    if (!reason.trim()) return setErr("Please write a reason/message.");

    setIsSending(true);
    try {
      const res = await API.post(
        "/api/consultations",
        { expertId: selectedExpert._id, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMsg(res.data?.message || "Request sent");
      setReason("");
      setSelectedExpert(null);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Failed to send request");
    } finally {
      setIsSending(false);
    }
  };

  // UI helpers (no dummy data; just safe fallbacks)
  const getDisplayName = (ex: Expert) =>
    `${ex.firstName ?? ""} ${ex.lastName ?? ""}`.trim() || ex.email || "Expert";

  const getRole = (ex: Expert) =>
    // prefer role if you have it, else fallback to expertise
    (ex as any).role || ex.expertise || "Licensed Professional";

  const getLocation = (ex: Expert) =>
    (ex as any).location || "Remote";

  const getImage = (ex: Expert) =>
    (ex as any).image ||
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300&h=300";

  const getRating = (ex: Expert) =>
    typeof (ex as any).rating === "number" ? (ex as any).rating : 4.8;

  const getSpecialties = (ex: Expert): string[] => {
    const s = (ex as any).specialties;
    if (Array.isArray(s) && s.length) return s;
    if (typeof ex.expertise === "string" && ex.expertise.trim()) {
      // simple split if expertise is comma-separated
      return ex.expertise.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 6);
    }
    return [];
  };

  const isAvailable = (ex: Expert) =>
    typeof (ex as any).available === "boolean" ? (ex as any).available : true;

  const selectedId = useMemo(() => selectedExpert?._id, [selectedExpert]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold text-[#2D3436] mb-4">
            Find Your Expert
          </h1>
          <p className="text-[#5A6062] max-w-2xl mx-auto">
            This is a support feature (not a medical diagnosis). Choose an expert and request guidance.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
            <Button variant="secondary" onClick={() => navigate("/consultations")}>
              My Consultations
            </Button>
          </div>
        </div>

        {/* Messages */}
        {(err || msg) && (
          <div className="max-w-3xl mx-auto mb-8 space-y-2">
            {err && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {err}
              </p>
            )}
            {msg && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                {msg}
              </p>
            )}
          </div>
        )}

        {/* Experts grid */}
        {isLoading ? (
          <div className="text-center text-[#5A6062]">Loading experts...</div>
        ) : experts.length === 0 ? (
          <div className="text-center text-[#5A6062]">No experts found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {experts.map((expert) => {
              const available = isAvailable(expert);
              const isSelected = selectedId === expert._id;

              return (
                <Card
                  key={expert._id}
                  className={`overflow-hidden flex flex-col h-full p-0 cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-[#7C9A82]" : "hover:shadow-md"
                  }`}
                  onClick={() => setSelectedExpert(expert)}
                >
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={getImage(expert)}
                      alt={getDisplayName(expert)}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />

                    {available && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                        Available
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif text-lg font-bold text-[#2D3436]">
                          {getDisplayName(expert)}
                        </h3>
                        <p className="text-xs text-[#7C9A82] font-medium uppercase tracking-wide">
                          {getRole(expert)}
                        </p>
                      </div>

                      <div className="flex items-center bg-[#FFFDF9] px-2 py-1 rounded border border-[#E8F0E9]">
                        <Star className="h-3 w-3 text-yellow-400 fill-current mr-1" />
                        <span className="text-xs font-bold text-[#2D3436]">
                          {getRating(expert).toFixed(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-xs text-[#5A6062] mb-4 gap-1">
                      <MapPin size={12} />
                      <span>{getLocation(expert)}</span>
                    </div>

                    {/* Specialties */}
                    {getSpecialties(expert).length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {getSpecialties(expert).map((spec, i) => (
                          <span
                            key={`${expert._id}-spec-${i}`}
                            className="text-xs bg-[#E8F0E9] text-[#5A7A60] px-2 py-1 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-auto pt-4 border-t border-[#E8F0E9] space-y-2">
                      <Button
                        className="w-full"
                        variant={available ? "primary" : "secondary"}
                        disabled={!available}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          // prevent card click double-trigger
                          e.stopPropagation();
                          setSelectedExpert(expert);
                        }}
                      >
                        {available ? (isSelected ? "Selected" : "Select Expert") : "Fully Booked"}
                      </Button>

                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          navigate(`/book/${expert._id}`);
                        }}
                      >
                        Book Slot
                      </Button>
                      {/* keep email display like your old logic (optional but useful) */}
                      {expert.email && (
                        <p className="text-[11px] text-[#5A6062] text-center">
                          {expert.email}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Request Consultation */}
        <div className="max-w-3xl mx-auto mt-12">
          <Card className="p-6 md:p-8">
            <h2 className="font-serif text-2xl font-bold text-[#2D3436] mb-2">
              Request Consultation
            </h2>
            <p className="text-sm text-[#5A6062] mb-4">
              Selected expert:{" "}
              <strong className="text-[#2D3436]">
                {selectedExpert ? getDisplayName(selectedExpert) : "None"}
              </strong>
            </p>

            <textarea
              value={reason}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setReason(e.target.value)
              }
              placeholder="Write a short message (what you want help with)..."
              rows={5}
              className="w-full px-4 py-3 rounded-xl border border-[#C4B5A0] focus:ring-2 focus:ring-[#7C9A82] focus:border-transparent outline-none transition-all bg-[#FAF7F2]"
            />

            <div className="mt-4 flex items-center gap-3">
              <Button
                onClick={sendRequest}
                isLoading={isSending}
                disabled={isSending}
              >
                Send Request
              </Button>

              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedExpert(null);
                  setReason("");
                  setErr("");
                  setMsg("");
                }}
                disabled={isSending}
              >
                Clear
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
