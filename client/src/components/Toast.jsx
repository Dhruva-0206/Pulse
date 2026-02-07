import { useEffect } from "react";

export default function Toast({ show, message, type = "success", onClose }) {
  useEffect(() => {
    if (!show) return;

    const timeout = setTimeout(() => {
      onClose?.();
    }, 2500);

    return () => clearTimeout(timeout);
  }, [show, onClose]);

  if (!show) return null;

  const base =
    "fixed top-5 right-5 z-50 rounded-xl px-4 py-3 text-sm border shadow-lg transition";

  const styles =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <div className={`${base} ${styles}`}>
      <div className="flex items-center gap-3">
        <div className="font-semibold">
          {type === "error" ? "Error" : "Success"}
        </div>

        <div>{message}</div>

        <button
          onClick={onClose}
          className="ml-2 rounded-lg px-2 py-1 text-xs font-semibold hover:bg-black/5"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
