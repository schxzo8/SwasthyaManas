import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { toast } from "react-hot-toast";

export default function MockKhaltiPayment() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const [step, setStep]       = useState<"form" | "otp" | "processing" | "done">("form");
  const [mpin, setMpin]       = useState("");
  const [otp, setOtp]         = useState("");
  const [phone, setPhone]     = useState("98XXXXXXXX");
  const [err, setErr]         = useState("");
  const [processing, setProcessing] = useState(false);

  const amount   = params.get("amount") || "0";
  const orderId  = params.get("purchase_order_id") || "";
  const pidx     = params.get("pidx") || "";
  const slotId   = orderId.split("_")[1] || "";

  const handlePay = () => {
    setErr("");
    if (mpin !== "1111") { setErr("Invalid MPIN. Use 1111 for testing."); return; }
    setStep("otp");
  };

  const handleOtp = async () => {
    setErr("");
    if (otp !== "987654") { setErr("Invalid OTP. Use 987654 for testing."); return; }
    setStep("processing");
    setProcessing(true);

    try {
      // call our mock verify endpoint
      await API.post("/api/appointments/mock-payment/verify", { pidx, slotId });
      setStep("done");
      toast.success("Payment successful! Appointment confirmed.");
      setTimeout(() => navigate("/appointments"), 2500);
    } catch (e: any) {
      setErr(e?.response?.data?.message || "Payment failed.");
      toast.error(e?.response?.data?.message || "Payment failed.");
      setStep("otp");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#5C2D91] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">

        {/* Khalti Header */}
        <div className="bg-[#5C2D91] px-6 py-4 flex items-center gap-3">
          <div className="bg-white rounded-lg p-1.5">
            <div className="text-[#5C2D91] font-black text-lg leading-none">K</div>
          </div>
          <span className="text-white font-bold text-lg tracking-wide">khalti</span>
          <span className="ml-auto text-xs text-purple-200 bg-purple-700 px-2 py-0.5 rounded-full">
            SANDBOX
          </span>
        </div>

        <div className="px-6 py-5">

          {/* Amount */}
          <div className="bg-purple-50 rounded-xl p-4 mb-5 text-center">
            <p className="text-xs text-purple-500 uppercase tracking-wide mb-1">Amount to Pay</p>
            <p className="text-3xl font-bold text-[#5C2D91]">
              Rs. {(Number(amount) / 100).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">SwasthyaManas Appointment</p>
          </div>

          {err && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {err}
            </div>
          )}

          {/* Step: MPIN */}
          {step === "form" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Khalti ID (Phone)
                </label>
                <input
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="98XXXXXXXX"
                />
                <p className="text-xs text-gray-400 mt-1">Test: 9800000000</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  MPIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 tracking-widest text-center text-lg"
                  value={mpin}
                  onChange={e => setMpin(e.target.value)}
                  placeholder="••••"
                />
                <p className="text-xs text-gray-400 mt-1">Test MPIN: 1111</p>
              </div>
              <button
                onClick={handlePay}
                className="w-full bg-[#F7971E] hover:bg-[#e5890e] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Pay Rs. {(Number(amount) / 100).toLocaleString()}
              </button>
            </div>
          )}

          {/* Step: OTP */}
          {step === "otp" && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 text-center">
                OTP sent to <span className="font-medium">{phone}</span>
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Enter OTP
                </label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 tracking-widest text-center text-lg"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="······"
                />
                <p className="text-xs text-gray-400 mt-1">Test OTP: 987654</p>
              </div>
              <button
                onClick={handleOtp}
                disabled={processing}
                className="w-full bg-[#F7971E] hover:bg-[#e5890e] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors"
              >
                {processing ? "Verifying…" : "Confirm Payment"}
              </button>
              <button
                onClick={() => setStep("form")}
                className="w-full text-sm text-gray-400 hover:text-gray-600"
              >
                ← Back
              </button>
            </div>
          )}

          {/* Step: Processing */}
          {step === "processing" && (
            <div className="py-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full border-4 border-[#5C2D91] border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-medium text-gray-600">Processing payment…</p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="py-8 text-center space-y-3">
              <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto text-3xl">
                ✅
              </div>
              <p className="text-lg font-bold text-gray-800">Payment Successful!</p>
              <p className="text-sm text-gray-500">Redirecting to your appointments…</p>
            </div>
          )}

        </div>

        <div className="px-6 pb-4 text-center">
          <p className="text-xs text-gray-300">🔒 Secured by Khalti · Sandbox Mode</p>
        </div>
      </div>
    </div>
  );
}