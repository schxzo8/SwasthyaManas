import { useNavigate } from "react-router-dom";

export default function PaymentFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8F0E9] p-10 max-w-md w-full text-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4 text-2xl">❌</div>
        <h2 className="font-serif text-xl font-bold text-[#2D3436]">Payment Failed</h2>
        <p className="text-sm text-[#5A6062] mt-2">
          Your payment was not completed. Your slot hold may have expired — please try booking again.
        </p>
        <button
          onClick={() => navigate("/experts")}
          className="mt-6 px-6 py-2 bg-[#7C9A82] text-white rounded-lg text-sm font-medium hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}