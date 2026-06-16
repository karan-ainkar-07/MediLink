const LEVELS = [
  { value: 1, label: "Very Mild", color: "from-emerald-400 to-green-500", desc: "Barely noticeable" },
  { value: 2, label: "Mild", color: "from-lime-400 to-green-400", desc: "Minor discomfort" },
  { value: 3, label: "Moderate", color: "from-amber-400 to-yellow-500", desc: "Affecting daily life" },
  { value: 4, label: "High", color: "from-orange-400 to-amber-500", desc: "Significant impact" },
  { value: 5, label: "Severe", color: "from-red-500 to-rose-600", desc: "Needs urgent care" },
];

export default function SeveritySelector({ symptom, onSelect, dark }) {
  return (
    <div className={`rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
      <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${dark ? "text-amber-400" : "text-amber-600"}`}>
        Severity Rating
      </p>
      <p className={`text-sm font-semibold mb-3 ${dark ? "text-slate-200" : "text-slate-700"}`}>
        How severe is your <span className="text-teal-500">{symptom}</span>?
      </p>
      <div className="grid grid-cols-5 gap-2">
        {LEVELS.map((level) => (
          <button
            key={level.value}
            onClick={() => onSelect(level.value)}
            className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-200 hover:scale-105 group ${
              dark ? "border-slate-600 hover:border-slate-400 bg-slate-700" : "border-slate-200 hover:border-slate-300 bg-slate-50"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${level.color} flex items-center justify-center text-white font-bold text-sm shadow-sm`}>
              {level.value}
            </div>
            <span className={`text-[10px] font-bold text-center leading-tight ${dark ? "text-slate-300" : "text-slate-600"}`}>
              {level.label}
            </span>
            <span className={`text-[9px] text-center leading-tight hidden sm:block ${dark ? "text-slate-500" : "text-slate-400"}`}>
              {level.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
