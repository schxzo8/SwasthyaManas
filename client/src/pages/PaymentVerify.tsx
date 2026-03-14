import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function PaymentVerify() {
  const [params] = useSearchParams();
  const navigate  = useNavigate();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verify = async () => {
      const pidx   = params.get("pidx");
      const slotId = params.get("purchase_order_id")?.split("_")[1];

      if (!pidx || !slotId) {
        setStatus("error");
        setMessage("Missing payment information.");
        return;
      }

      try {
        await API.post("/api/appointments/khalti/verify", { pidx, slotId });
        setStatus("success");
        setTimeout(() => navigate("/appointments"), 2500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Payment verification failed.");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8F0E9] p-10 max-w-md w-full text-center">
        {status === "verifying" && (
          <>
            <div className="h-12 w-12 rounded-full border-4 border-[#7C9A82] border-t-transparent animate-spin mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold text-[#2D3436]">Verifying Payment…</h2>
            <p className="text-sm text-[#5A6062] mt-2">Please wait while we confirm your payment with Khalti.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 text-2xl">✅</div>
            <h2 className="font-serif text-xl font-bold text-[#2D3436]">Payment Successful!</h2>
            <p className="text-sm text-[#5A6062] mt-2">Your appointment is confirmed. Redirecting…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">❌</div>
            <h2 className="font-serif text-xl font-bold text-[#2D3436]">Payment Failed</h2>
            <p className="text-sm text-red-500 mt-2">{message}</p>
            <button
              onClick={() => navigate("/experts")}
              className="mt-6 px-6 py-2 bg-[#7C9A82] text-white rounded-lg text-sm font-medium hover:opacity-90"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}