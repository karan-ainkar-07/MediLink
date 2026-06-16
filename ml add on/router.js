const { Router } = require("express");
const { runLLMStage } = require("./llmService");

const router = Router();

// ─────────────────────────────────────────────
// ERROR LOGGER
// ─────────────────────────────────────────────
function logError(route, err, context = {}) {
  console.error("──── ERROR ────");
  console.error("Route:", route);
  console.error("Message:", err.message);
  console.error("Stack:", err.stack);

  if (context && Object.keys(context).length) {
    try {
      console.error("Context:", JSON.stringify(context, null, 2));
    } catch {
      console.error("Context (unserializable):", context);
    }
  }

  console.error("───────────────");
}

// ─────────────────────────────────────────────
// EXTRACT TOP DISEASES (SAFE)
// ─────────────────────────────────────────────
function extractDiseaseNames(mlOutput) {
  const list = Array.isArray(mlOutput?.top_predictions)
    ? mlOutput.top_predictions
    : [];

  return [...list]
    .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
    .slice(0, 3)
    .map((p) => p.disease)
    .filter(Boolean);
}

// ─────────────────────────────────────────────
// SAFE KB NORMALIZER
// ─────────────────────────────────────────────
function safeKB(input) {
  if (!input || typeof input !== "object") return {};

  if (Array.isArray(input)) {
    return Object.fromEntries(input.map((x) => [x.name, x]));
  }

  return input;
}

// ─────────────────────────────────────────────
// /analyze
// ─────────────────────────────────────────────
router.post("/analyze", async (req, res) => {
  try {
    console.log("──── /analyze REQUEST RECEIVED ────");
    console.log(JSON.stringify(req.body, null, 2));

    const { ml_result, knowledge_base } = req.body || {};

    // ─────────────────────────────
    // MANUAL VALIDATION
    // ─────────────────────────────
    if (!ml_result) {
      return res.status(400).json({
        success: false,
        error: "ml_result missing",
      });
    }

    if (!Array.isArray(ml_result.top_predictions)) {
      return res.status(400).json({
        success: false,
        error: "ml_result.top_predictions must be an array",
      });
    }

    if (!knowledge_base || typeof knowledge_base !== "object") {
      return res.status(400).json({
        success: false,
        error: "knowledge_base missing or invalid",
      });
    }

    console.log("STEP 1: validation passed");

    // ─────────────────────────────
    // CORE PIPELINE
    // ─────────────────────────────
    const diseaseNames = extractDiseaseNames(ml_result);
    console.log("STEP 2: diseases extracted:", diseaseNames);

    const kb = safeKB(knowledge_base);

    const filteredKB = Object.fromEntries(
      Object.entries(kb).filter(([key]) =>
        diseaseNames.includes(key)
      )
    );

    console.log("STEP 3: calling LLM");

    const llmResponse = await runLLMStage(
      ml_result,
      filteredKB,
      null
    );

    console.log("STEP 4: LLM response received");

    return res.json({
      success: true,
      status: llmResponse?.status || "unknown",
      cross_questions: llmResponse?.cross_questions || [],
      final_result: llmResponse?.final_result ?? null,
    });

  } catch (err) {
    logError("/analyze", err, { body: req.body });

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ─────────────────────────────────────────────
// /analyze/answer
// ─────────────────────────────────────────────
router.post("/analyze/answer", async (req, res) => {
  try {
    console.log("──── /analyze/answer REQUEST ────");

    const {
      ml_result,
      cross_question_answers,
      knowledge_base,
    } = req.body || {};

    if (!ml_result || !Array.isArray(ml_result.top_predictions)) {
      return res.status(400).json({
        success: false,
        error: "invalid ml_result",
      });
    }

    if (!knowledge_base) {
      return res.status(400).json({
        success: false,
        error: "knowledge_base missing",
      });
    }

    const diseaseNames = extractDiseaseNames(ml_result);
    const kb = safeKB(knowledge_base);

    const filteredKB = Object.fromEntries(
      Object.entries(kb).filter(([key]) =>
        diseaseNames.includes(key)
      )
    );

    console.log("STEP 2: calling LLM (answer mode)");

    const llmResponse = await runLLMStage(
      ml_result,
      filteredKB,
      cross_question_answers
    );

    return res.json({
      success: true,
      status: "final",
      cross_questions: [],
      final_result: llmResponse?.final_result || null,
    });

  } catch (err) {
    logError("/analyze/answer", err, { body: req.body });

    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;