import { useState } from "react";
import ChatContainer from "../components/ChatContainer";
import ThemeToggle from "../components/ThemeToggle";

export default function SymptomsChecker() {
  const [dark, setDark] = useState(true);

  return (
    <div className={`${dark ? "dark" : ""}`}>
      <div className={`flex flex-col h-screen w-screen overflow-hidden transition-colors duration-300 ${dark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-900"}`}>

        {/* Header */}
        <header className={`flex-shrink-0 flex items-center justify-between px-5 py-3 border-b ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200 shadow-sm"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2v14M2 9h14" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight leading-none">MediLink</h1>
              <p className={`text-[10px] font-semibold tracking-widest uppercase leading-none mt-0.5 ${dark ? "text-teal-400" : "text-teal-600"}`}>
                AI Triage System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${dark ? "border-emerald-600 bg-emerald-900/30 text-emerald-400" : "border-emerald-300 bg-emerald-50 text-emerald-700"}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Session Active
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className={`text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>
                {dark ? "Dark" : "Light"}
              </span>
              <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
            </div>
            {/* Mobile toggle */}
            <div className="sm:hidden">
              <ThemeToggle dark={dark} onToggle={() => setDark((d) => !d)} />
            </div>
          </div>
        </header>

        {/* Gold accent strip */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-shrink-0 opacity-60" />

        {/* Chat area */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full max-w-3xl mx-auto w-full flex flex-col">
            <ChatContainer dark={dark} />
          </div>
        </main>

        {/* Footer */}
        <footer className={`flex-shrink-0 py-2 text-center text-[10px] font-medium tracking-wide border-t ${dark ? "border-slate-800 text-slate-600" : "border-slate-200 text-slate-400"}`}>
          MediLink AI · For informational use only · Not a substitute for professional medical advice
        </footer>
      </div>

      <style>{`
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #4B5563; border-radius: 10px; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce { animation: bounce 0.9s ease-in-out infinite; }
        .animate-in { animation: fadeUp 0.25s ease forwards; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
