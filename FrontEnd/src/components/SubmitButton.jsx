export default function SubmitButton({ onSubmit, count, dark }) {
  return (
    <button
      onClick={onSubmit}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 shadow-lg hover:scale-105 active:scale-95 ${
        count > 0
          ? "bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-900 shadow-amber-200"
          : dark
          ? "bg-slate-700 border border-slate-600 text-slate-300 hover:bg-slate-600"
          : "bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200"
      }`}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M2 7h10M7 2l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      Submit {count > 0 ? `(${count})` : ""}
    </button>
  );
}
