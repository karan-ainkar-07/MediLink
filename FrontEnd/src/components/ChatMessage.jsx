import { useEffect, useState } from "react";

export default function ChatMessage({ message, dark }) {
  const isBot = message.role === "bot";
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`flex w-full mb-5 transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
      } ${isBot ? "justify-start" : "justify-end"}`}
    >
      {isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mr-3 shadow-lg mt-1">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1v14M1 8h14" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>
      )}
      <div className={`max-w-[78%] ${isBot ? "" : "items-end flex flex-col"}`}>
        {isBot && (
          <p className={`text-[10px] font-bold tracking-widest uppercase mb-1.5 ml-1 ${dark ? "text-teal-400" : "text-teal-600"}`}>
            MediLink AI
          </p>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isBot
              ? dark
                ? "bg-slate-800 border border-slate-700 text-slate-100 rounded-tl-sm"
                : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-md"
              : dark
              ? "bg-gradient-to-br from-teal-600 to-cyan-700 text-white rounded-tr-sm"
              : "bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-tr-sm"
          }`}
        >
          {message.text}
        </div>
        <p className={`text-[10px] mt-1 mx-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>
          {message.time}
        </p>
      </div>
      {!isBot && (
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center ml-3 shadow-lg mt-1">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      )}
    </div>
  );
}
