const SYMPTOM_GROUPS = [
  {
    label: "Head & Neurological",
    icon: "🧠",
    // Removed: "Severe Headache" (severity prefix), "Poor Concentration" (duplicate of Difficulty Concentrating)
    symptoms: [
      "Headache", "Dizziness", "Sensitivity To Light",
      "Blurred Vision", "Difficulty Concentrating",
      "Neck Stiffness", "Facial Pain",
    ],
  },
  {
    label: "Eyes & Ears",
    icon: "👁️",
    symptoms: [
      "Eye Pain", "Dry Eyes", "Itchy Eyes", "Watery Eyes",
      "Redness", "Ear Pain", "Ear Fullness", "Itching Ear", "Hearing Discomfort",
    ],
  },
  {
    label: "Nose, Throat & Sinuses",
    icon: "💨",
    symptoms: [
      "Runny Nose", "Nasal Congestion", "Sneezing", "Sore Throat",
      "Throat Pain", "Throat Irritation", "Dry Throat", "Hoarseness",
      "Difficulty Swallowing",
    ],
  },
  {
    label: "Chest & Respiratory",
    icon: "🫁",
    // Removed: "Dry Cough" (Cough covers it), "Mild Cough" (severity prefix), "Frequent Coughing" (Cough covers it), "Mild Chest Discomfort" (severity prefix)
    symptoms: [
      "Cough", "Phlegm", "Chest Discomfort",
      "Rapid Heartbeat", "Pressure Around Eyes",
    ],
  },
  {
    label: "Stomach & Digestive",
    icon: "🫀",
    symptoms: [
      "Stomach Pain", "Nausea", "Vomiting", "Diarrhea",
      "Loose Stools", "Abdominal Cramps", "Abdominal Discomfort",
      "Bloating", "Burping",
    ],
  },
  {
    label: "Bowel & Appetite",
    icon: "🥗",
    symptoms: [
      "Heartburn", "Sour Taste", "Loss Of Appetite", "Frequent Bowel Movements",
      "Infrequent Bowel Movement", "Hard Stool", "Difficulty Passing Stool",
      "Dark Urine", "Dehydration",
    ],
  },
  {
    label: "Muscles, Joints & Back",
    icon: "🦴",
    symptoms: [
      "Muscle Pain", "Muscle Tightness", "Muscle Weakness", "Body Ache",
      "Lower Back Pain", "Shoulder Pain", "Neck Stiffness", "Stiffness",
      "Limited Mobility",
    ],
  },
  {
    label: "Movement & Flexibility",
    icon: "🏃",
    symptoms: [
      "Limited Movement", "Reduced Flexibility", "Pain On Movement",
      "Pain While Bending", "Swelling", "Weakness",
      "Sweating", "Thirst", "Pale Skin",
    ],
  },
  {
    label: "Skin Conditions",
    icon: "✨",
    symptoms: [
      "Rash", "Itching", "Skin Inflammation", "Oily Skin",
      "Pimples", "Blackheads", "Whiteheads", "Redness", "Irritation",
    ],
  },
  {
    label: "Scalp & Hair",
    icon: "💆",
    // Removed: "Dry Eyes" (duplicate, already in Eyes & Ears), "Irritability" & "Restlessness" (moved to Mental)
    symptoms: [
      "Dry Scalp", "Flaky Scalp", "Itching Scalp", "Scalp Irritation",
      "Hair Fall", "Dry Mouth",
    ],
  },
  {
    label: "General & Systemic",
    icon: "🌡️",
    // Removed: "Mild Fever" (severity prefix), "Loss Of Appetite" (duplicate, in Bowel & Appetite)
    symptoms: [
      "Fever", "Fatigue", "Low Energy",
      "Chills", "Weakness", "Sweating", "Dehydration",
    ],
  },
  {
    label: "Mental & Emotional",
    icon: "💭",
    symptoms: [
      "Difficulty Sleeping", "Daytime Sleepiness", "Sleep Issues",
      "Sadness", "Loss Of Interest", "Nervousness", "Irritability",
      "Restlessness", "Difficulty Concentrating",
    ],
  },
];

export default function SymptomSelector({ selected, onToggle, onDone, dark }) {
  return (
    <div className={`rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
      <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-teal-400" : "text-teal-600"}`}>
        Select Your Symptoms
      </p>
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1 custom-scroll">
        {SYMPTOM_GROUPS.map((group) => (
          <div key={group.label}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>
              <span className="text-sm">{group.icon}</span> {group.label}
            </p>
            <div className="flex flex-wrap gap-2">
              {group.symptoms.map((sym) => {
                const active = selected.includes(sym);
                return (
                  <button
                    key={sym}
                    onClick={() => onToggle(sym)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                      active
                        ? dark
                          ? "bg-teal-600 border-teal-500 text-white shadow-md scale-105"
                          : "bg-teal-500 border-teal-400 text-white shadow-md scale-105"
                        : dark
                        ? "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {active ? "✓ " : ""}{sym}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4">
        <button
          onClick={onDone}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow hover:opacity-90 transition-opacity"
        >
          {selected.length > 0 ? `Continue with ${selected.length} symptom${selected.length > 1 ? "s" : ""}` : "Skip"}
        </button>
      </div>
    </div>
  );
}