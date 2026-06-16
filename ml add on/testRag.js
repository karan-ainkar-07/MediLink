const BASE_URL = "http://localhost:3000";

// ─────────────────────────────────────────────
// POST /api/symptom-check
// ─────────────────────────────────────────────
async function testSymptomCheck() {
  try {
    const res = await fetch(`${BASE_URL}/api/symptom-check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        symptoms: "fever, headache, sore throat",
      }),
    });

    const data = await res.json();

    console.log("\n=== Symptom Check Response ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Symptom check error:", err.message);
  }
}

// ─────────────────────────────────────────────
// POST /api/ask
// ─────────────────────────────────────────────
async function testAsk() {
  try {
    const res = await fetch(`${BASE_URL}/api/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: "What are flu symptoms?",
      }),
    });

    const data = await res.json();

    console.log("\n=== Ask Response ===");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Ask error:", err.message);
  }
}

// ─────────────────────────────────────────────
// RUN BOTH
// ─────────────────────────────────────────────
(async () => {
  await testSymptomCheck();
  await testAsk();
})();