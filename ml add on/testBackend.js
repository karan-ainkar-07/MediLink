// client.js

const BASE_URL = "http://localhost:2000";

// ─────────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────────
async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    console.log("Health:", data);
  } catch (err) {
    console.error("Health Error:", err.message);
  }
}

// ─────────────────────────────────────────────
// POST /api/v1/analyze
// ─────────────────────────────────────────────
async function analyze() {
  try {
    const payload = {
      ml_result: {
        symptoms: [
          { name: "fever", weight: 0.8 },
          { name: "cough", weight: 0.6 }
        ],
        age: 22,
        gender: "male",
        duration_days: 2,
        top_predictions: [
          {
            rank: 1,
            disease: "Flu",
            probability: 0.7,
            matched_symptoms: ["fever", "cough"],
            risk_level: "moderate"
          },
          {
            rank: 2,
            disease: "Common Cold",
            probability: 0.2,
            matched_symptoms: ["cough"],
            risk_level: "low"
          },
          {
            rank: 3,
            disease: "COVID-19",
            probability: 0.1,
            matched_symptoms: ["fever"],
            risk_level: "high"
          }
        ]
      }
    };

    const res = await fetch(`${BASE_URL}/api/v1/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log("Analyze Response:", data);

  } catch (err) {
    console.error("Analyze Error:", err.message);
  }
}

// ─────────────────────────────────────────────
// RUN
// ─────────────────────────────────────────────
(async () => {
  await checkHealth();
  await analyze();
})();