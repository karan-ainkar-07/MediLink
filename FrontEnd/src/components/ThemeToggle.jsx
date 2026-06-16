export default function ThemeToggle({ dark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        dark
          ? "bg-gradient-to-r from-slate-700 to-slate-600 focus:ring-slate-500"
          : "bg-gradient-to-r from-amber-200 to-yellow-300 focus:ring-yellow-400"
      }`}
      aria-label="Toggle theme"
    >
      <span
        className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full shadow-md flex items-center justify-center text-xs transition-all duration-300 ${
          dark
            ? "translate-x-7 bg-slate-900 text-yellow-300"
            : "translate-x-0 bg-white text-amber-500"
        }`}
      >
        {dark ? "🌙" : "☀️"}
      </span>
    </button>
  );
}
