import { useState } from "react";

export default function InputBox({ onSend, disabled, dark, placeholder }) {
  const [val, setVal] = useState("");

  const send = () => {
    if (!val.trim() || disabled) return;
    onSend(val.trim());
    setVal("");
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition-all duration-200 ${
      dark
        ? "bg-slate-800 border-slate-600 focus-within:border-teal-500"
        : "bg-white border-slate-200 focus-within:border-teal-400 shadow-sm"
    }`}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
        disabled={disabled}
        placeholder={placeholder || "Type your message..."}
        className={`flex-1 bg-transparent outline-none text-sm py-1 ${
          dark ? "text-slate-100 placeholder-slate-500" : "text-slate-800 placeholder-slate-400"
        } disabled:opacity-40`}
      />
      <button
        onClick={send}
        disabled={disabled || !val.trim()}
        className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white shadow hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <path d="M13 7.5L2 2l2 5.5-2 5.5 11-5.5z" fill="white" />
        </svg>
      </button>
    </div>
  );
}
