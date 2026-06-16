import { useState, useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import SymptomSelector from "./SymptomSelector";
import SeveritySelector from "./SeveritySelector";
import InputBox from "./InputBox";
import SubmitButton from "./SubmitButton";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SEVERITY_WEIGHT = { 0: 0.0, 1: 0.2, 2: 0.4, 3: 0.6, 4: 0.8, 5: 1.0 };
const SEVERITY_LABEL  = { 0: "None", 1: "Very Mild", 2: "Mild", 3: "Moderate", 4: "High", 5: "Severe" };

const DURATION_OPTIONS = [
  "Less than 24 hours",
  "1–2 days",
  "3–5 days",
  "1–2 weeks",
  "More than 2 weeks",
];

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK Q&A BANK
// Keyword-matched general medical answers for when /api/ask is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

const QA_FALLBACK_BANK = [
  { keywords: ["flu", "influenza"],
    answer: "Flu (influenza) symptoms include sudden fever, chills, body aches, fatigue, headache, and dry cough. Symptoms appear 1–4 days after exposure and last about a week. Rest, hydration, and over-the-counter pain relievers help. Antivirals like oseltamivir are most effective when started within 48 hours of onset." },
  { keywords: ["cold", "common cold"],
    answer: "The common cold causes runny nose, sneezing, mild sore throat, and low-grade fever. Unlike the flu it comes on gradually. Symptoms peak around day 2–3 and resolve within 7–10 days. Rest, fluids, and saline nasal rinses help manage symptoms." },
  { keywords: ["fever"],
    answer: "A fever is a body temperature above 38 °C (100.4 °F). It usually signals your immune system is fighting an infection. Paracetamol or ibuprofen can reduce fever. Seek medical attention if it exceeds 39.5 °C, lasts more than 3 days, or comes with severe headache, stiff neck, or difficulty breathing." },
  { keywords: ["cough"],
    answer: "Coughs can be dry (no mucus) or productive (with mucus). A dry cough is common with viral infections and allergies. A productive cough with coloured mucus may indicate bacterial infection. Honey and warm water can soothe a cough. Persistent cough lasting more than 3 weeks warrants evaluation." },
  { keywords: ["sore throat"],
    answer: "Sore throats are most often caused by viral infections. Bacterial strep throat may require antibiotics. Warm liquids, salt-water gargles, and throat lozenges help. See a doctor if symptoms last more than a week or come with high fever." },
  { keywords: ["nausea", "vomiting", "throwing up"],
    answer: "Nausea and vomiting are often caused by gastroenteritis, food poisoning, or motion sickness. Rest your stomach, then try clear fluids in small sips. Oral rehydration solutions replace lost electrolytes. Seek care if vomiting persists over 24 hours, contains blood, or is paired with severe abdominal pain." },
  { keywords: ["diarrhea", "loose stool"],
    answer: "Diarrhea is usually caused by infections, food intolerance, or medications. Stay hydrated with oral rehydration solutions. Avoid dairy, fatty, and high-fibre foods temporarily. Most cases resolve within 2–3 days. Seek care if it lasts more than 3 days, contains blood, or comes with high fever." },
  { keywords: ["stomach", "abdomen", "abdominal pain", "stomach ache"],
    answer: "Abdominal pain can range from mild (gas, indigestion) to serious (appendicitis, kidney stones). Sharp, constant, or worsening pain — especially in the lower right — warrants urgent evaluation. Note the location, character, and associated symptoms when describing pain to a doctor." },
  { keywords: ["heartburn", "acid reflux", "gerd"],
    answer: "Heartburn is caused by stomach acid flowing back into the oesophagus. Common triggers include spicy food, caffeine, alcohol, and lying down after eating. Antacids provide quick relief. Frequent heartburn (more than twice a week) may be GERD and should be evaluated by a doctor." },
  { keywords: ["asthma", "wheeze", "wheezing"],
    answer: "Asthma causes episodes of wheezing, chest tightness, and shortness of breath. Triggers include allergens, exercise, cold air, and stress. Reliever inhalers (e.g., salbutamol) provide quick relief. Always carry your reliever inhaler and follow your asthma action plan." },
  { keywords: ["breathless", "shortness of breath", "difficulty breathing"],
    answer: "Shortness of breath can stem from respiratory (asthma, pneumonia), cardiac (heart failure), or other causes. Sudden severe breathlessness with chest pain, blue lips, or fainting is a medical emergency. New or worsening breathlessness should be evaluated promptly." },
  { keywords: ["pneumonia"],
    answer: "Pneumonia is a lung infection causing fever, chills, cough with mucus, chest pain, and breathlessness. Bacterial pneumonia is treated with antibiotics. Seek urgent care if you experience severe breathlessness, confusion, or bluish lips." },
  { keywords: ["chest pain", "chest tightness"],
    answer: "Chest pain may be caused by musculoskeletal strain, acid reflux, anxiety, or cardiac issues. Any new chest pain with sweating, shortness of breath, or left arm/jaw pain is a potential cardiac emergency — call emergency services immediately." },
  { keywords: ["heart", "palpitation", "heart rate", "fast heart"],
    answer: "Heart palpitations are often harmless and triggered by caffeine, stress, or lack of sleep. See a doctor if they are frequent, prolonged, or accompanied by dizziness, fainting, or chest pain." },
  { keywords: ["blood pressure", "hypertension", "high bp"],
    answer: "Hypertension (readings consistently above 130/80 mmHg) often has no symptoms. Lifestyle changes — low-sodium diet, exercise, limiting alcohol — help. Medications are frequently needed. Uncontrolled hypertension raises risk of stroke and heart attack." },
  { keywords: ["headache", "migraine"],
    answer: "Tension headaches feel like a pressure band; migraines are typically one-sided, throbbing, with nausea or light sensitivity. Over-the-counter pain relievers help mild headaches. See a doctor for severe, sudden, or frequent headaches, or those with neurological symptoms." },
  { keywords: ["dizzy", "dizziness", "vertigo"],
    answer: "Vertigo (spinning sensation) is often from inner ear issues like BPPV. Lightheadedness may be from dehydration or low blood pressure. Sudden severe dizziness with slurred speech, double vision, or weakness requires emergency evaluation." },
  { keywords: ["stroke"],
    answer: "Use FAST — Face drooping, Arm weakness, Speech difficulty, Time to call emergency services. Stroke is a medical emergency. Do not wait to see if symptoms improve. Clot-busting treatment is time-critical." },
  { keywords: ["back pain", "backache"],
    answer: "Most back pain is mechanical and improves with rest, gentle movement, and pain relief within weeks. Red flags needing urgent care: pain after trauma, weakness/numbness in legs, loss of bladder/bowel control, or pain that wakes you from sleep." },
  { keywords: ["joint pain", "arthritis"],
    answer: "Joint pain can be from osteoarthritis (wear-and-tear), rheumatoid arthritis (autoimmune, morning stiffness), or gout (sudden severe pain, often big toe). Management depends on type. Anti-inflammatories help symptoms; a rheumatologist manages inflammatory arthritis." },
  { keywords: ["anxiety", "panic", "panic attack"],
    answer: "Anxiety disorders involve persistent worry and physical symptoms like racing heart. Panic attacks peak within minutes. Deep breathing, grounding techniques, and regular exercise help. CBT and medication are effective — speak to a mental health professional." },
  { keywords: ["depression", "sad", "low mood"],
    answer: "Depression involves persistent low mood, loss of interest, fatigue, and sleep/appetite changes. Effective treatments include CBT, antidepressants, and lifestyle changes. If you are having thoughts of self-harm, contact a crisis helpline or emergency services immediately." },
  { keywords: ["sleep", "insomnia"],
    answer: "Good sleep hygiene helps insomnia: consistent sleep times, dark/cool room, no screens 1 hour before bed, limiting caffeine after noon. CBT for insomnia (CBT-I) is more effective long-term than sleeping pills." },
  { keywords: ["diabetes", "blood sugar"],
    answer: "Diabetes involves elevated blood glucose. Type 1 requires insulin; Type 2 is managed with lifestyle changes and medications. Symptoms include frequent urination, excessive thirst, unexplained weight loss, and blurred vision. Regular monitoring and medication adherence are key." },
  { keywords: ["rash", "skin", "itching", "itch"],
    answer: "Rashes can be from allergic reactions, eczema, psoriasis, or infections. Antihistamines help allergy-related itching. See a doctor if the rash spreads rapidly, comes with fever, involves the face/genitals, or shows signs of infection." },
  { keywords: ["uti", "urinary", "urine", "burning urine"],
    answer: "UTIs cause burning urination, frequent urgency, and cloudy or foul-smelling urine. Most UTIs are treated with a short antibiotic course. Drink plenty of water. Seek care promptly — untreated UTIs can spread to the kidneys." },
  { keywords: ["diet", "nutrition", "eating", "weight loss", "weight gain"],
    answer: "A balanced diet includes vegetables, fruits, whole grains, lean proteins, and healthy fats. For weight management, a moderate calorie deficit combined with regular activity is most sustainable. Consult a registered dietitian for personalised guidance." },
  { keywords: ["exercise", "workout", "fitness"],
    answer: "WHO recommends 150–300 minutes of moderate aerobic activity per week plus strength training 2 days per week. Regular exercise reduces risk of heart disease, diabetes, depression, and many cancers. Start gradually and consult a doctor if you have a chronic condition." },
  { keywords: ["medication", "medicine", "drug", "antibiotic", "paracetamol", "ibuprofen"],
    answer: "Always complete the full antibiotic course. Paracetamol is safe at recommended doses for pain and fever. Ibuprofen should be taken with food and avoided in kidney disease or on blood thinners. Never self-prescribe prescription medications." },
  { keywords: ["emergency", "urgent", "911", "ambulance", "hospital"],
    answer: "Seek emergency care for: chest pain, difficulty breathing, stroke signs (face drooping, arm weakness, speech difficulty), uncontrolled bleeding, or loss of consciousness. Do not drive yourself — call emergency services." },
];

function getFallbackQAAnswer(question) {
  const q = question.toLowerCase();
  let bestMatch = null;
  let bestScore = 0;
  for (const entry of QA_FALLBACK_BANK) {
    const score = entry.keywords.filter((kw) => q.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = entry; }
  }
  return bestMatch && bestScore > 0 ? bestMatch.answer : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: Cross-questions for Analyze API outage
// ─────────────────────────────────────────────────────────────────────────────

const FALLBACK_CROSS_QUESTION_BANK = [
  { symptom: "Shortness of Breath",    question: "Are you experiencing shortness of breath even at rest or only during activity?",        for_diseases: ["Asthma", "Pneumonia", "Heart Failure"] },
  { symptom: "Wheezing",               question: "Do you notice a high-pitched whistling sound when you breathe out?",                     for_diseases: ["Asthma", "Bronchitis"] },
  { symptom: "Chest Tightness",        question: "Do you feel pressure or tightness in your chest that worsens with deep breaths?",        for_diseases: ["Asthma", "Angina", "Pleuritis"] },
  { symptom: "Productive Cough",       question: "Is your cough producing yellow, green, or blood-tinged mucus?",                         for_diseases: ["Pneumonia", "Bronchitis", "Tuberculosis"] },
  { symptom: "Nausea",                 question: "Do you feel nauseous mainly after eating, or does it persist throughout the day?",       for_diseases: ["Gastritis", "GERD", "Appendicitis"] },
  { symptom: "Vomiting",               question: "How many times have you vomited in the last 24 hours?",                                 for_diseases: ["Gastroenteritis", "Food Poisoning"] },
  { symptom: "Diarrhea",               question: "Is the diarrhea watery or does it contain blood or mucus?",                             for_diseases: ["IBS", "Gastroenteritis", "Crohn's Disease"] },
  { symptom: "Abdominal Pain",         question: "Where exactly is the pain located — upper, lower, left, or right side?",               for_diseases: ["Appendicitis", "Gastritis", "Kidney Stones"] },
  { symptom: "Bloating",               question: "Does bloating worsen after specific foods like dairy, wheat, or legumes?",              for_diseases: ["IBS", "Lactose Intolerance", "Celiac"] },
  { symptom: "Heartburn",              question: "Does the burning sensation travel up toward your throat or chest?",                      for_diseases: ["GERD", "Peptic Ulcer"] },
  { symptom: "Headache",               question: "Is the headache throbbing/one-sided, or a pressure band around the head?",             for_diseases: ["Migraine", "Tension Headache", "Hypertension"] },
  { symptom: "Dizziness",              question: "Does the room spin around you (vertigo), or do you feel lightheaded?",                   for_diseases: ["BPPV", "Hypotension", "Inner Ear Infection"] },
  { symptom: "Confusion",              question: "Did the confusion come on suddenly or gradually over hours/days?",                       for_diseases: ["Stroke", "Hypoglycemia", "Encephalitis"] },
  { symptom: "Blurred Vision",         question: "Is the blurring in one eye or both, and did it start suddenly?",                        for_diseases: ["Stroke", "Glaucoma", "Migraine"] },
  { symptom: "Memory Loss",            question: "Is the memory loss for recent events, long-ago events, or both?",                       for_diseases: ["Dementia", "Depression", "TIA"] },
  { symptom: "Joint Pain",             question: "Are multiple joints affected, or just one — and is there visible swelling?",            for_diseases: ["Rheumatoid Arthritis", "Gout", "Osteoarthritis"] },
  { symptom: "Back Pain",              question: "Does the pain radiate down your leg or stay localised in the back?",                    for_diseases: ["Sciatica", "Herniated Disc", "Muscle Strain"] },
  { symptom: "Muscle Weakness",        question: "Is the weakness on one side of your body or affecting both sides equally?",             for_diseases: ["Stroke", "Multiple Sclerosis", "Myopathy"] },
  { symptom: "Swollen Joints",         question: "Are the swollen joints warm and red to the touch?",                                     for_diseases: ["Gout", "Septic Arthritis", "Rheumatoid Arthritis"] },
  { symptom: "Palpitations",           question: "Do your palpitations feel like skipped beats, a racing heart, or fluttering?",         for_diseases: ["Arrhythmia", "Anxiety", "Hyperthyroidism"] },
  { symptom: "Chest Pain",             question: "Does the chest pain radiate to your left arm, jaw, or back?",                          for_diseases: ["Myocardial Infarction", "Angina", "Aortic Dissection"] },
  { symptom: "Leg Swelling",           question: "Is the swelling in both legs or just one, and does pressing leave a dent?",            for_diseases: ["Heart Failure", "DVT", "Lymphedema"] },
  { symptom: "Fatigue",                question: "Is the fatigue constant, or does it worsen in the afternoon or after activity?",        for_diseases: ["Anemia", "Hypothyroidism", "Chronic Fatigue Syndrome"] },
  { symptom: "Fever",                  question: "Has your temperature exceeded 39 °C (102 °F), and does it come and go?",               for_diseases: ["Malaria", "Typhoid", "Sepsis"] },
  { symptom: "Night Sweats",           question: "Are the night sweats severe enough to soak through your clothes or bedding?",           for_diseases: ["Tuberculosis", "Lymphoma", "Menopause"] },
  { symptom: "Unexplained Weight Loss",question: "Have you lost more than 5% of your body weight in the last 6 months without dieting?", for_diseases: ["Cancer", "Diabetes", "Hyperthyroidism"] },
  { symptom: "Loss of Appetite",       question: "Have you lost interest in food completely, or only for specific foods?",                for_diseases: ["Hepatitis", "Depression", "Cancer"] },
  { symptom: "Chills",                 question: "Do the chills come with shaking/rigors, or are they a mild feeling of cold?",          for_diseases: ["Malaria", "Sepsis", "Pneumonia"] },
  { symptom: "Rash",                   question: "Is the rash raised, flat, blistered, or scaly — and does it itch?",                    for_diseases: ["Eczema", "Psoriasis", "Allergic Reaction", "Shingles"] },
  { symptom: "Jaundice",               question: "Have you noticed yellowing in the whites of your eyes as well as your skin?",          for_diseases: ["Hepatitis", "Gallstones", "Liver Cirrhosis"] },
  { symptom: "Pale Skin",              question: "Do you also feel breathless or notice your heart racing alongside the paleness?",       for_diseases: ["Anemia", "Internal Bleeding", "Shock"] },
  { symptom: "Frequent Urination",     question: "Are you urinating more often during the day, at night, or both?",                      for_diseases: ["Diabetes", "UTI", "Prostate Enlargement"] },
  { symptom: "Burning Urination",      question: "Do you also notice cloudy or foul-smelling urine?",                                    for_diseases: ["UTI", "Urethritis", "Kidney Infection"] },
  { symptom: "Blood in Urine",         question: "Is the blood visible to the naked eye, or was it found on a urine test?",              for_diseases: ["Kidney Stones", "Bladder Cancer", "Glomerulonephritis"] },
  { symptom: "Sore Throat",            question: "Do you see white patches or pus on the back of your throat?",                          for_diseases: ["Strep Throat", "Tonsillitis", "Mononucleosis"] },
  { symptom: "Runny Nose",             question: "Is the discharge clear and watery, or thick and coloured?",                            for_diseases: ["Allergic Rhinitis", "Common Cold", "Sinusitis"] },
  { symptom: "Ear Pain",               question: "Is the pain deep inside the ear, or around the outer ear canal?",                      for_diseases: ["Otitis Media", "Otitis Externa", "TMJ"] },
  { symptom: "Swollen Lymph Nodes",    question: "Are the swollen nodes in your neck, armpits, groin, or multiple locations?",          for_diseases: ["Lymphoma", "Mononucleosis", "Bacterial Infection"] },
  { symptom: "Anxiety",                question: "Do you experience sudden intense fear or panic attacks without an obvious trigger?",    for_diseases: ["Panic Disorder", "GAD", "Hyperthyroidism"] },
  { symptom: "Depression",             question: "Have you lost interest in activities you previously enjoyed for more than 2 weeks?",   for_diseases: ["Major Depressive Disorder", "Hypothyroidism", "Bipolar"] },
  { symptom: "Insomnia",               question: "Do you struggle to fall asleep, stay asleep, or wake up too early and can't go back?", for_diseases: ["Insomnia Disorder", "Anxiety", "Sleep Apnea"] },
];

function buildFallbackCrossQuestions(symptomData, predictions, maxQ = 4) {
  const existingSymptoms = new Set(symptomData.map((d) => d.symptom.toLowerCase()));
  const topDiseases = predictions.slice(0, 3).map((p) => (p.disease || p).toLowerCase());
  const scored = FALLBACK_CROSS_QUESTION_BANK
    .filter((q) => !existingSymptoms.has(q.symptom.toLowerCase()))
    .map((q) => ({
      ...q,
      relevance: q.for_diseases.some((d) =>
        topDiseases.some((td) => td.includes(d.toLowerCase()) || d.toLowerCase().includes(td))
      ) ? 2 : 1,
    }))
    .sort((a, b) => b.relevance - a.relevance);
  return scored.slice(0, maxQ);
}

function buildFallbackFinalResult(symptomData, predictions) {
  const topPred = predictions[0];
  const urgent  = symptomData.filter((d) => d.weight >= 0.6).length >= 2 || symptomData.some((d) => d.weight >= 0.8);
  return {
    diagnosis:      topPred ? (topPred.disease || topPred) : "Undetermined",
    confidence:     topPred?.confidence ?? null,
    urgency:        urgent ? "High — please consult a doctor promptly." : "Moderate — monitor symptoms and seek care if worsening.",
    recommendation: urgent
      ? "Your symptom severity warrants prompt medical evaluation. Please visit a clinic or emergency department."
      : "Rest, stay hydrated, and monitor your symptoms. Consult a doctor if they worsen or persist beyond 48 hours.",
    disclaimer: "⚠️ This assessment is AI-generated and is NOT a substitute for professional medical advice. Always consult a qualified healthcare provider.",
    _fallback: true,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOW STAGES
// ─────────────────────────────────────────────────────────────────────────────

const STAGES = {
  WELCOME:        "WELCOME",
  SYMPTOM_SELECT: "SYMPTOM_SELECT",
  SEVERITY:       "SEVERITY",
  DURATION:       "DURATION",
  PREDICT:        "PREDICT",
  CROSS_QUESTION: "CROSS_QUESTION",
  CONFIRM:        "CONFIRM",
  // ── NEW STAGES ──
  // READY_TO_FINISH: analysis done internally, waiting for user to click Finish
  // FINISHING:       Finish clicked, firing symptom-check API, loading
  // DONE:            Everything revealed, Q&A chat open
  READY_TO_FINISH: "READY_TO_FINISH",
  FINISHING:       "FINISHING",
  DONE:            "DONE",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const botMsg  = (text, extra = {}) => ({ id: Date.now() + Math.random(), role: "bot",  text, time: now(), ...extra });
const userMsg = (text)             => ({ id: Date.now() + Math.random(), role: "user", text, time: now() });

function isRateLimitError(err) {
  if (!err) return false;
  const msg = (err.message || "").toLowerCase();
  return (
    msg.includes("429") || msg.includes("rate limit") || msg.includes("quota") ||
    msg.includes("too many requests") || msg.includes("503") ||
    msg.includes("service unavailable") || msg.includes("analyze api error") ||
    msg.includes("ask api error") || msg.includes("symptom check api error")
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// API LAYER
// ─────────────────────────────────────────────────────────────────────────────

const BASE_URL = "http://localhost:9000";

async function callPredictAPI(symptomWeights) {
  const res = await fetch("http://localhost:8000/predict", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: symptomWeights, k: 3 }),
  });
  console.log(symptomWeights)
  if (!res.ok) throw new Error(`Predict API error: ${res.status}`);
  const data = await res.json();
  return data.prediction || [];
}

async function fetchKnowledgeBase(diseaseNames) {
  const res = await fetch("http://localhost:5000/api/diseases", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ diseases: diseaseNames }),
  });
  if (!res.ok) throw new Error(`Knowledge base API error: ${res.status}`);
  const data = await res.json();
  return Object.fromEntries((data.data || []).map((item) => [item.name, item]));
}

async function callAnalyzeAPI(mlResult, knowledgeBase) {
  const res = await fetch("http://localhost:2000/api/v1/analyze", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ml_result: mlResult, knowledge_base: knowledgeBase }),
  });
  if (!res.ok) throw new Error(`Analyze API error: ${res.status}`);
  return res.json();
}

/**
 * POST /api/symptom-check
 * Called when the user clicks Finish.
 * Returns a natural-language explanation of why the model gave this output.
 */
async function callSymptomCheckAPI(symptomNames) {
  const res = await fetch(`${BASE_URL}/api/symptom-check`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ symptoms: symptomNames.join(", ") }),
  });
  if (!res.ok) throw new Error(`Symptom check API error: ${res.status}`);
  return res.json();
}

/**
 * POST /api/ask
 * Called on every free-text question the user types after Finish.
 */
async function callAskAPI(question) {
  const res = await fetch(`${BASE_URL}/api/ask`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  console.log()
  if (!res.ok) throw new Error(`Ask API error: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ChatContainer({ dark }) {
  const [messages,           setMessages]           = useState([]);
  const [typing,             setTyping]             = useState(false);
  const [stage,              setStage]              = useState(STAGES.WELCOME);

  const [selectedSymptoms,   setSelectedSymptoms]   = useState([]);
  const [showSymSelector,    setShowSymSelector]    = useState(false);

  const [pendingSymptoms,    setPendingSymptoms]    = useState([]);
  const [currentSym,         setCurrentSym]         = useState(null);
  const [symptomData,        setSymptomData]        = useState([]);
  const [showSevSelector,    setShowSevSelector]    = useState(false);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const [crossQuestions,     setCrossQuestions]     = useState([]);
  const [crossQIdx,          setCrossQIdx]          = useState(0);
  const [showCrossRating,    setShowCrossRating]    = useState(false);

  const [predictions,        setPredictions]        = useState([]);
  const [finalResult,        setFinalResult]        = useState(null);

  // Held internally until Finish is clicked — never rendered before that
  const pendingResultRef = useRef(null);   // { finalResult, symptomData, predictions }

  const [symptomCheckResult, setSymptomCheckResult] = useState(null);
  const [finishLoading,      setFinishLoading]      = useState(false); // spinner on Finish button

  // Fallback flags
  const [usingFallback,      setUsingFallback]      = useState(false);
  const [qaOffline,          setQaOffline]          = useState(false);

  const [qaLoading,          setQaLoading]          = useState(false);
  const [submitted,          setSubmitted]          = useState(false);

  const bottomRef      = useRef(null);
  const initializedRef = useRef(false);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing, showSymSelector, showSevSelector, showDurationPicker, showCrossRating, qaLoading, stage]);

  // ── Init ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    addBotMsg(
      "Hello! I'm **MediLink AI**, your intelligent medical triage assistant.\n\nLet's start — please select the symptoms you're experiencing today.",
      600,
      () => { setShowSymSelector(true); setStage(STAGES.SYMPTOM_SELECT); }
    );
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────────────────────────────────
  const addBotMsg = (text, delay = 400, cb) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, botMsg(text)]);
      if (cb) setTimeout(cb, 200);
    }, delay);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 1: Symptom selection
  // ─────────────────────────────────────────────────────────────────────────
  const handleSymptomsDone = (syms) => {
    setShowSymSelector(false);
    const list = syms.length > 0 ? syms : ["General Discomfort"];
    setSelectedSymptoms(list);
    setMessages((m) => [...m, userMsg(`Selected: ${list.join(", ")}`)]);
    addBotMsg(
      `Got it — **${list.join(", ")}**.\n\nNow I'll ask about severity and duration for each one.`,
      600,
      () => startRatingQueue(list)
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 2: Severity → Duration loop
  // ─────────────────────────────────────────────────────────────────────────
  const startRatingQueue = (syms) => { setPendingSymptoms([...syms]); askNextSeverity([...syms]); };

  const askNextSeverity = (queue) => {
    if (queue.length === 0) { runAnalysisPipeline(); return; }
    const [head, ...rest] = queue;
    setPendingSymptoms(rest);
    setCurrentSym(head);
    setStage(STAGES.SEVERITY);
    addBotMsg(`Rate the severity of your **${head}** (1 = Very Mild → 5 = Severe):`, 500, () =>
      setShowSevSelector(true)
    );
  };

  const handleSeverity = (value) => {
    setShowSevSelector(false);
    setMessages((m) => [...m, userMsg(`${SEVERITY_LABEL[value]} (${value}/5)`)]);
    setSymptomData((prev) => {
      const without = prev.filter((d) => d.symptom !== currentSym);
      return [...without, { symptom: currentSym, severity: value, weight: SEVERITY_WEIGHT[value], duration: "" }];
    });
    addBotMsg(`Noted — **${SEVERITY_LABEL[value]}**. How long have you had **${currentSym}**?`, 500, () => {
      setStage(STAGES.DURATION); setShowDurationPicker(true);
    });
  };

  const handleDuration = (dur) => {
    setShowDurationPicker(false);
    setMessages((m) => [...m, userMsg(dur)]);
    setSymptomData((prev) => prev.map((d) => d.symptom === currentSym ? { ...d, duration: dur } : d));
    addBotMsg(`Got it — **${dur}** for **${currentSym}**.`, 400, () => askNextSeverity(pendingSymptoms));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 3: Predict → Knowledge Base → Analyze (with Analyze fallback)
  // ─────────────────────────────────────────────────────────────────────────
  const runAnalysisPipeline = async (extraSymptomData) => {
    const allData = extraSymptomData || symptomData;
    setStage(STAGES.PREDICT);
    addBotMsg("Analysing your symptoms with our AI model…", 400);

    try {
      const symptomWeights = allData.map((d) => ({ symptom: d.symptom, weight: d.weight }));
      const preds = await callPredictAPI(symptomWeights);
      console.log("[Predictions]", preds);

      const diseaseNames  = preds.map((p) => p.disease || p);
      const knowledgeBase = await fetchKnowledgeBase(diseaseNames);
      console.log("[Knowledge Base]", knowledgeBase);

      const mlResult = {
        symptoms: allData.map((d) => ({ name: d.symptom, weight: d.weight })),
        top_predictions: preds.map((p, i) => ({
          rank: i + 1, disease: p.disease || p, probability: p.confidence ?? 0,
        })),
      };

      let analyzeResult;
      try {
        console.log("[Analyze] calling...");
        analyzeResult = await callAnalyzeAPI(mlResult, knowledgeBase);
        console.log("[Analyze] result:", analyzeResult);
        setUsingFallback(false);
      } catch (analyzeErr) {
        console.warn("[Analyze API unavailable — activating fallback]", analyzeErr);
        if (!usingFallback) {
          addBotMsg(
            "⚠️ Our AI analysis service is temporarily busy. Switching to guided offline mode — your assessment quality won't be affected.",
            500
          );
        }
        setUsingFallback(true);
        const fallbackCQ = buildFallbackCrossQuestions(allData, preds, 4);
        analyzeResult = fallbackCQ.length > 0
          ? { success: true, status: "cross_questioning", cross_questions: fallbackCQ, final_result: null, _source: "fallback" }
          : { success: true, status: "final_result", cross_questions: [], final_result: buildFallbackFinalResult(allData, preds), _source: "fallback" };
      }

      handleAnalyzeResult(analyzeResult, allData, preds);

    } catch (err) {
      console.error("[Pipeline error]", err);
      addBotMsg("Sorry, something went wrong analysing your symptoms. Please try again.", 600);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 4: Handle Analyze response
  // ─────────────────────────────────────────────────────────────────────────
  const handleAnalyzeResult = (result, latestData, latestPreds) => {
  if (!result.success) {
    addBotMsg("The analysis service returned an error. Please try again.", 600);
    return;
  }

  // Store predictions immediately — this makes the "View Results" button appear in the bottom bar
  setPredictions(latestPreds);
  pendingResultRef.current = {
    finalResult: result.final_result || buildFallbackFinalResult(latestData, latestPreds),
    symptomData: latestData || symptomData,
    predictions: latestPreds,
  };

  // Continue cross-questioning in chat as normal
  if (result.status === "cross_questioning" && result.cross_questions?.length) {
    setCrossQuestions(result.cross_questions);
    setCrossQIdx(0);
    setStage(STAGES.CROSS_QUESTION);
    const intro = result._source === "fallback"
      ? "I have a few follow-up questions to refine your assessment. Please rate each on **0 (none) to 5 (severe)**."
      : "To narrow things down, I have a few more questions. Please rate each symptom on **0 (none) to 5 (severe)**.";
    addBotMsg(intro, 700, () => askCrossQuestion(result.cross_questions, 0));
    return;
  }

  // Final result straight away — go to READY_TO_FINISH
  setStage(STAGES.READY_TO_FINISH);
  addBotMsg("✅ Analysis complete! Click **View Results** below whenever you're ready.", 600);
};

  // ─────────────────────────────────────────────────────────────────────────
  // FINISH BUTTON HANDLER
  // Reveals predictions + final result, fires /api/symptom-check, opens Q&A
  // ─────────────────────────────────────────────────────────────────────────
  const handleFinish = async () => {
    if (!pendingResultRef.current || finishLoading) return;

    setFinishLoading(true);
    setStage(STAGES.FINISHING);

    const { finalResult: fr, symptomData: sd, predictions: preds } = pendingResultRef.current;

    // Reveal predictions and final result to state (triggers render of result widgets)
    setFinalResult(fr);
    setPredictions(preds);

    // Add user message for flow clarity
    setMessages((m) => [...m, userMsg("View my results")]);

    // Fire /api/symptom-check to get the explanation of why this output was given
    let checkResult = null;
    try {
      const names = sd.map((d) => d.symptom);
      checkResult = await callSymptomCheckAPI(names);
      console.log("[Symptom Check API]", checkResult);
      setSymptomCheckResult(checkResult["answer"]);
    } catch (err) {
      console.warn("[Symptom Check API failed — non-critical]", err);
    }

    setFinishLoading(false);
    setStage(STAGES.DONE);

    // Now open Q&A chat
    addBotMsg(
      "Here's your complete assessment report above. 💬 The chat is now open — feel free to ask me any follow-up medical questions!",
      400
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Q&A: POST /api/ask — handles every free-text question after Finish
  // ─────────────────────────────────────────────────────────────────────────
  const handleUserQuestion = async (question) => {
    if (!question.trim() || qaLoading) return;

    setMessages((m) => [...m, userMsg(question)]);
    setQaLoading(true);

    try {
      const data = await callAskAPI(question);
      const answer =
        data?.answer ||
        data?.response ||
        data?.result ||
        Object.values(data).find((v) => typeof v === "string") ||
        "I received a response but couldn't parse the content.";

      setQaOffline(false);
      addBotMsg(answer, 200);

    } catch (err) {
      console.warn("[Ask API unavailable]", err);

      if (!qaOffline) {
        setQaOffline(true);
        addBotMsg(
          "⚠️ **Our AI assistant is currently unavailable** — the service appears to be rate-limited or offline. I'll answer from my built-in medical knowledge base instead.",
          400,
          () => answerWithFallback(question)
        );
      } else {
        answerWithFallback(question);
      }
    } finally {
      setQaLoading(false);
    }
  };

  const answerWithFallback = (question) => {
    const answer = getFallbackQAAnswer(question);
    if (answer) {
      addBotMsg(answer, 300);
    } else {
      addBotMsg(
        "I don't have a specific answer for that in my offline knowledge base. Please consult a healthcare professional for personalised advice, or try again when the AI service is back online.",
        400
      );
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE 5: Cross-questioning
  // ─────────────────────────────────────────────────────────────────────────
  const askCrossQuestion = (questions, idx) => {
    if (idx >= questions.length) { finishCrossQuestioning(); return; }
    addBotMsg(questions[idx].question, 500, () => setShowCrossRating(true));
  };

  const handleCrossRating = (value) => {
    setShowCrossRating(false);
    const q = crossQuestions[crossQIdx];
    setMessages((m) => [...m, userMsg(`${SEVERITY_LABEL[value]} (${value}/5)`)]);
    if (value > 0) {
      setSymptomData((prev) => {
        const without = prev.filter((d) => d.symptom !== q.symptom);
        return [...without, { symptom: q.symptom, severity: value, weight: SEVERITY_WEIGHT[value], duration: "Reported during assessment" }];
      });
      addBotMsg(`Noted — **${SEVERITY_LABEL[value]}** for **${q.symptom}**.`, 400, goToNextCrossQ);
    } else {
      setSymptomData((prev) => prev.filter((d) => d.symptom !== q.symptom));
      addBotMsg(`Understood — no **${q.symptom}**.`, 300, goToNextCrossQ);
    }
  };

  const goToNextCrossQ = () => {
    const nextIdx = crossQIdx + 1;
    setCrossQIdx(nextIdx);
    nextIdx < crossQuestions.length ? askCrossQuestion(crossQuestions, nextIdx) : finishCrossQuestioning();
  };

  const finishCrossQuestioning = () => {
    setStage(STAGES.PREDICT);
    addBotMsg("Thanks! Re-running the analysis with your updated responses…", 600, () => {
      setSymptomData((latest) => { runAnalysisPipeline(latest); return latest; });
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBMIT (old CONFIRM stage — kept for compatibility, not used in new flow)
  // ─────────────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (submitted || symptomData.length === 0) return;
    setSubmitted(true);
    setMessages((m) => [...m, userMsg("Submit assessment")]);
    runAnalysisPipeline();
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const severityColors = (weight) =>
    weight >= 0.8 ? "bg-red-100 text-red-700"
    : weight >= 0.6 ? "bg-amber-100 text-amber-700"
    : weight >= 0.4 ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

  // Finish button: show when READY_TO_FINISH and predictions exist, hide after
// Show "View Results" button in bottom bar as soon as predictions exist, until DONE
const showFinishButton = predictions.length > 0 
  && stage !== STAGES.DONE 
  && stage !== STAGES.FINISHING
  && stage !== STAGES.PREDICT
  && !finishLoading;

const showFinishLoading = stage === STAGES.FINISHING || finishLoading;

const inputBoxEnabled  = stage === STAGES.DONE && !qaLoading;
const inputPlaceholder = stage === STAGES.DONE
  ? "Ask any follow-up medical question…"
  : "Please use the buttons above to respond…";

const displaySymptomData =
  stage === STAGES.DONE
    ? (pendingResultRef.current?.symptomData || symptomData)
    : symptomData;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">

      {/* ── Message area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scroll">

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} dark={dark} />
        ))}

        {/* Typing / loading indicator */}
        {(typing || qaLoading || showFinishLoading) && (
          <div className="flex items-center gap-2 ml-12 mb-3">
            <div className={`px-4 py-3 rounded-2xl rounded-tl-sm ${dark ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200 shadow-md"}`}>
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{ animationDelay: `${i * 0.15}s` }}
                    className={`w-2 h-2 rounded-full animate-bounce ${dark ? "bg-teal-400" : "bg-teal-500"}`}
                  />
                ))}
              </div>
            </div>
            {showFinishLoading && (
              <span className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
                Loading your results…
              </span>
            )}
          </div>
        )}

        {/* ── WIDGET: Initial symptom selector ───────────────────────────── */}
        {showSymSelector && (
          <div className="mb-4 ml-12 animate-in">
            <SymptomSelector
              selected={selectedSymptoms}
              onToggle={(sym) =>
                setSelectedSymptoms((prev) =>
                  prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
                )
              }
              onDone={() => handleSymptomsDone(selectedSymptoms)}
              dark={dark}
            />
          </div>
        )}

        {/* ── WIDGET: Severity selector ───────────────────────────────────── */}
        {showSevSelector && currentSym && (
          <div className="mb-4 ml-12 animate-in">
            <SeveritySelector symptom={currentSym} onSelect={handleSeverity} dark={dark} />
          </div>
        )}

        {/* ── WIDGET: Duration picker ─────────────────────────────────────── */}
        {showDurationPicker && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
            <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-cyan-400" : "text-cyan-600"}`}>Duration</p>
            <div className="flex flex-wrap gap-2">
              {DURATION_OPTIONS.map((d) => (
                <button key={d} onClick={() => handleDuration(d)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
                    dark
                      ? "bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-teal-500"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-400"
                  }`}
                >{d}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── WIDGET: Cross-question 0–5 rating ──────────────────────────── */}
        {showCrossRating && crossQuestions[crossQIdx] && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
            <div className="flex items-center gap-2 mb-1">
              <p className={`text-xs font-bold tracking-widest uppercase ${dark ? "text-violet-400" : "text-violet-600"}`}>
                Symptom Rating
              </p>
            </div>
            <p className={`text-sm mb-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
              {crossQuestions[crossQIdx].symptom}
            </p>
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3, 4, 5].map((v) => (
                <button key={v} onClick={() => handleCrossRating(v)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 hover:scale-105 ${
                    v === 0
                      ? dark ? "bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500"
                             : "bg-slate-100 border-slate-300 text-slate-500 hover:bg-slate-200"
                      : dark ? "bg-slate-700 border-slate-600 text-slate-200 hover:bg-violet-800 hover:border-violet-500"
                             : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-violet-50 hover:border-violet-400"
                  }`}
                >
                  {v} — {SEVERITY_LABEL[v]}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── WIDGET: ✅ Finish button — visible only in READY_TO_FINISH ──── */}
        {showFinishButton && (
          <div className="mb-4 ml-12 animate-in">
            <div className={`rounded-2xl border p-4 ${dark ? "bg-slate-800 border-teal-700" : "bg-teal-50 border-teal-200 shadow-lg"}`}>
              <p className={`text-xs font-bold tracking-widest uppercase mb-1 ${dark ? "text-teal-400" : "text-teal-700"}`}>
                Assessment Ready
              </p>
              <p className={`text-sm mb-3 ${dark ? "text-slate-300" : "text-slate-600"}`}>
                Your results have been calculated. Click <strong>Finish</strong> to reveal your predictions, final diagnosis, and a full explanation — then chat with me for any follow-up questions.
              </p>
              <button
                onClick={handleFinish}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md ${
                  dark
                    ? "bg-teal-600 hover:bg-teal-500 text-white"
                    : "bg-teal-500 hover:bg-teal-400 text-white"
                }`}
              >
                🏁 Finish & View Results
              </button>
            </div>
          </div>
        )}

        {/* ── WIDGET: Assessment summary (shown in DONE only) ─────────────── */}
        {stage === STAGES.DONE && displaySymptomData.length > 0 && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
            <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-amber-400" : "text-amber-600"}`}>
              📋 Assessment Summary
            </p>
            <div className="space-y-2">
              {displaySymptomData.map((entry, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${dark ? "bg-slate-700" : "bg-slate-50 border border-slate-100"}`}>
                  <div>
                    <p className={`text-sm font-semibold ${dark ? "text-slate-100" : "text-slate-800"}`}>{entry.symptom}</p>
                    <p className={`text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>{entry.duration}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg ${severityColors(entry.weight)}`}>
                      {SEVERITY_LABEL[entry.severity]}
                    </span>
                    <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>
                      weight: {entry.weight.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WIDGET: ML Predictions (revealed only after Finish) ─────────── */}
        {stage === STAGES.DONE && predictions.length > 0 && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-lg"}`}>
            <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-green-400" : "text-green-600"}`}>
              🧠 ML Predictions
            </p>
            <div className="space-y-2">
              {predictions.map((p, i) => (
                <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl ${dark ? "bg-slate-700" : "bg-slate-50 border border-slate-100"}`}>
                  <p className={`text-sm font-semibold ${dark ? "text-slate-100" : "text-slate-800"}`}>
                    {i + 1}. {p.disease || p}
                  </p>
                  {p.confidence != null && (
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-blue-100 text-blue-700">
                      {p.confidence}%
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── WIDGET: Final Result card (revealed only after Finish) ──────── */}
        {stage === STAGES.DONE && finalResult && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-emerald-700" : "bg-emerald-50 border-emerald-200 shadow-lg"}`}>
            <div className="flex items-center gap-2 mb-3">
              <p className={`text-xs font-bold tracking-widest uppercase ${dark ? "text-emerald-400" : "text-emerald-700"}`}>
                ✅ Final Assessment
              </p>

            </div>

            {finalResult._fallback ? (
              <div className="space-y-3">
                <div>
                  <p className={`text-xs font-semibold mb-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Most Likely Condition</p>
                  <p className={`text-base font-bold ${dark ? "text-slate-100" : "text-slate-800"}`}>
                    {finalResult.diagnosis}
                    {finalResult.confidence != null && (
                      <span className="ml-2 text-xs font-normal text-blue-500">({finalResult.confidence}% confidence)</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Urgency</p>
                  <p className={`text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>{finalResult.urgency}</p>
                </div>
                <div>
                  <p className={`text-xs font-semibold mb-0.5 ${dark ? "text-slate-400" : "text-slate-500"}`}>Recommendation</p>
                  <p className={`text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>{finalResult.recommendation}</p>
                </div>
                <p className={`text-[11px] mt-2 ${dark ? "text-slate-500" : "text-slate-400"}`}>{finalResult.disclaimer}</p>
              </div>
            ) : (
              // Real API result — render raw JSON until response shape is confirmed
              // TODO: replace with structured field rendering once shape is known
              <pre className={`text-xs whitespace-pre-wrap ${dark ? "text-slate-300" : "text-slate-700"}`}>
                {JSON.stringify(finalResult, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* ── WIDGET: Symptom Check explanation (from /api/symptom-check) ── */}
        {stage === STAGES.DONE && symptomCheckResult && (
          <div className={`mb-4 ml-12 rounded-2xl border p-4 ${dark ? "bg-slate-800 border-sky-700" : "bg-sky-50 border-sky-200 shadow-lg"}`}>
            <p className={`text-xs font-bold tracking-widest uppercase mb-3 ${dark ? "text-sky-400" : "text-sky-700"}`}>
              🔍 Why This Result?
            </p>
            {/*
              TODO: Replace raw JSON with structured rendering once API shape is confirmed.
              Example fields to render:
                <p>{symptomCheckResult.explanation}</p>
                <p>{symptomCheckResult.risk_factors}</p>
                <p>{symptomCheckResult.next_steps}</p>
            */}
            <pre className={`text-xs whitespace-pre-wrap ${dark ? "text-slate-300" : "text-slate-700"}`}>
              {JSON.stringify(symptomCheckResult, null, 2)}
            </pre>
          </div>
        )}

        {/* ── Persistent Q&A offline badge ───────────────────────────────── */}
        {stage === STAGES.DONE && qaOffline && (
          <div className={`mb-2 ml-12 flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-full w-fit ${dark ? "bg-amber-900/60 text-amber-300" : "bg-amber-100 text-amber-700"}`}>
            <span>⚠️</span>
            <span>AI assistant offline — answering from built-in knowledge base</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Bottom input bar ──────────────────────────────────────────────── */}
      {/* ── Bottom input bar ──────────────────────────────────────────────── */}
<div className={`border-t px-4 py-3 flex-shrink-0 ${dark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"}`}>
  <div className="flex gap-2 items-center">
    <div className="flex-1">
      <InputBox
        onSend={handleUserQuestion}
        disabled={!inputBoxEnabled}
        dark={dark}
        placeholder={inputPlaceholder}
      />
    </div>

    {/* "View Results" button — appears beside send as soon as predictions arrive */}
    {showFinishButton && (
      <button
        onClick={handleFinish}
        className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-md whitespace-nowrap ${
          dark
            ? "bg-teal-600 hover:bg-teal-500 text-white border border-teal-500"
            : "bg-teal-500 hover:bg-teal-400 text-white"
        }`}
      >
        🏁 View Results
      </button>
    )}

    {/* Finish loading spinner in bottom bar */}
    {showFinishLoading && (
      <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs ${dark ? "text-slate-400" : "text-slate-500"}`}>
        <span className="animate-spin">⏳</span>
        <span>Loading…</span>
      </div>
    )}
  </div>
</div>

    </div>
  );
}