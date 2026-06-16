/**
 * dbService.js
 * ─────────────
 * Fetches KnowledgeBase entries for top-3 predicted diseases.
 *
 * Swap out MOCK_DB for a real DB call by replacing getDisease().
 * Examples shown in comments below for MongoDB (mongoose) and Postgres (pg).
 */

// ─────────────────────────────────────────────
// MOCK DB  (replace with real DB calls)
// ─────────────────────────────────────────────

const MOCK_DB = {
  "Common Cold": {
    id: "d001",
    name: "Common Cold",
    symptoms: ["fever", "cough", "fatigue", "runny nose", "sore throat", "sneezing"],
    description: "A viral infection of the upper respiratory tract.",
    remedy: "Rest, stay hydrated, take paracetamol for fever.",
    severity: "mild",
    emergency: false,
    risk_factors: ["cold weather exposure", "weak immunity"],
    advice: "Symptoms usually resolve in 7–10 days. See a doctor if fever exceeds 39°C.",
  },
  Influenza: {
    id: "d002",
    name: "Influenza",
    symptoms: ["fever", "cough", "fatigue", "body ache", "sore throat", "chills", "headache"],
    description: "Influenza is a viral infection that affects the respiratory system.",
    remedy: "Rest, stay hydrated, and take paracetamol if needed. Antivirals if caught early.",
    severity: "moderate",
    emergency: false,
    risk_factors: ["low immunity", "seasonal changes", "crowded places"],
    advice: "Seek medical help if fever persists beyond 5 days or breathing difficulty occurs.",
  },
  "COVID-19": {
    id: "d003",
    name: "COVID-19",
    symptoms: ["fever", "cough", "fatigue", "loss of taste", "loss of smell", "breathlessness", "body ache"],
    description: "A respiratory illness caused by SARS-CoV-2.",
    remedy: "Isolate, rest, stay hydrated. Consult doctor if oxygen saturation drops below 95%.",
    severity: "moderate",
    emergency: true,
    risk_factors: ["elderly", "comorbidities", "unvaccinated"],
    advice: "Monitor SpO2. Seek urgent care if breathlessness develops.",
  },
  Typhoid: {
    id: "d004",
    name: "Typhoid",
    symptoms: ["fever", "fatigue", "abdominal pain", "headache", "diarrhea", "loss of appetite", "rash"],
    description: "A bacterial infection caused by Salmonella typhi.",
    remedy: "Antibiotics prescribed by doctor. Soft diet, oral rehydration.",
    severity: "moderate",
    emergency: false,
    risk_factors: ["contaminated food/water", "poor sanitation"],
    advice: "Complete the full antibiotic course even if feeling better.",
  },
  Dengue: {
    id: "d005",
    name: "Dengue",
    symptoms: ["fever", "severe headache", "joint pain", "body ache", "rash", "fatigue", "nausea"],
    description: "A mosquito-borne viral infection.",
    remedy: "Paracetamol for fever, avoid NSAIDs. Platelet monitoring.",
    severity: "high",
    emergency: true,
    risk_factors: ["mosquito exposure", "tropical regions", "monsoon season"],
    advice: "Monitor platelet count. Go to ER if bleeding signs appear.",
  },
};

// ─────────────────────────────────────────────
// FETCH SINGLE DISEASE
// ─────────────────────────────────────────────

/**
 * Fetches one disease entry by name.
 *
 * TO SWAP IN MONGODB (mongoose):
 *   const Disease = require('./models/Disease');
 *   async function getDisease(name) {
 *     const doc = await Disease.findOne({ name }).lean();
 *     return doc || null;
 *   }
 *
 * TO SWAP IN POSTGRES (pg pool):
 *   const pool = require('./db/pool');
 *   async function getDisease(name) {
 *     const { rows } = await pool.query('SELECT * FROM diseases WHERE name = $1', [name]);
 *     return rows[0] || null;
 *   }
 */
async function getDisease(name) {
  // Direct match
  if (MOCK_DB[name]) return MOCK_DB[name];

  // Case-insensitive fallback
  const lower = name.toLowerCase();
  const found = Object.values(MOCK_DB).find(
    (entry) => entry.name.toLowerCase() === lower
  );
  return found || null;
}

// ─────────────────────────────────────────────
// FETCH MULTIPLE DISEASES IN PARALLEL
// ─────────────────────────────────────────────

/**
 * Fetches KB entries for all disease names in parallel.
 * Returns an object keyed by disease name (only found entries).
 *
 * @param {string[]} diseaseNames
 * @returns {Promise<Record<string, object>>}
 */
async function getDiseasesForPredictions(diseaseNames) {
  const results = await Promise.all(
    diseaseNames.map(async (name) => {
      const entry = await getDisease(name);
      return [name, entry];
    })
  );

  // Filter out nulls (diseases not found in DB)
  return Object.fromEntries(results.filter(([, entry]) => entry !== null));
}

module.exports = { getDisease, getDiseasesForPredictions };
