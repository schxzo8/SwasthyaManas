import { ReactNode } from "react";
import { AlertCircle } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-in fade-in">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm mx-4 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E8F0E9] dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${isDangerous ? "bg-red-100 dark:bg-red-900/30" : "bg-blue-100 dark:bg-blue-900/30"}`}>
              <AlertCircle size={20} className={isDangerous ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"} />
            </div>
            <h2 className="text-lg font-semibold text-[#2D3436] dark:text-white">
              {title}
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-[#5A6062] dark:text-slate-300 text-sm leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#FAF7F2] dark:bg-slate-900/50 rounded-b-2xl flex gap-3 justify-end border-t border-[#E8F0E9] dark:border-slate-700">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-[#C4B5A0] dark:border-slate-600 text-[#2D3436] dark:text-white hover:bg-[#E8F0E9] dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white"
                : "bg-[#7C9A82] hover:bg-[#6B8A72] dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
            }`}
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
