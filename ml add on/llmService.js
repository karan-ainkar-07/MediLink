/**
 * llmService.js
 * ─────────────
 * Handles everything Gemini-related:
 *   buildUserPrompt()   → serializes input into what Gemini reads
 *   callGemini()        → hits the Gemini 2.5 Flash API
 *   parseLLMResponse()  → validates + parses Gemini's JSON back into typed objects
 *   runLLMStage()       → main entry point called by the router
 */

require("dotenv").config();
const { LLMResponse } = require("./schemas");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// ─────────────────────────────────────────────
// SYSTEM PROMPT
// ─────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a medical symptom analysis assistant inside a diagnostic pipeline.

You will receive a JSON object with:
- "ml_output": ML model predictions (top 3 diseases, user symptoms + weights, age, gender, duration)
- "knowledge_base": DB entries for each of those 3 diseases
- "cross_question_answers": null on first call, filled with severity scores (0–5) on second call

YOUR STEPS — follow exactly in order:

STEP 1 — COVERAGE CHECK (disease rank 1 only, only on first call when cross_question_answers is null):
  - matched_count = number of user's symptoms that appear in disease_1's KB symptom list
  - total = disease_1's total symptoms count in KB
  - coverage = matched_count / total
  - If coverage >= 0.90 → set status = "final", skip STEP 2, go to STEP 3
  - If coverage < 0.90 → set status = "cross_questioning", do STEP 2

STEP 2 — CROSS-QUESTIONING (only when status = "cross_questioning"):
  - For EACH of the 3 diseases, find symptoms in KB NOT mentioned by the user
  - Deduplicate missing symptoms across all 3 diseases
  - For each missing symptom, create a question object:
    {
      "symptom": "<symptom_name>",
      "question": "Do you have <symptom>? Rate 0 (none) to 5 (severe).",
      "for_diseases": ["Disease1", "Disease2"]
    }
  - Set final_result = null
  - Return immediately after filling cross_questions

STEP 3 — FINAL PROBABILITY (when status = "final" or cross_question_answers is provided):
  - For each disease, compute:
      base_score = original ML probability
      bonus = sum over answered missing symptoms:
                if symptom is in that disease's KB list:
                  (severity / 5.0) * 0.15   (max 0.15 bonus per symptom)
      updated_score = base_score + bonus
  - Normalize: divide each updated_score by sum of all updated_scores
  - Sort diseases by updated_score descending, re-rank

STEP 4 — RECOMMENDATION:
  - If top disease risk_level == "high" OR emergency == true in its KB entry → see_doctor: true, urgent: true
  - If risk_level == "moderate" → see_doctor: true, urgent: false
  - Else → see_doctor: false, urgent: false
  - Use remedy and advice from the TOP disease's KB entry

STEP 5 — BUILD OUTPUT:
  Return ONLY a raw JSON object (no markdown, no explanation) matching this exact schema:
  {
    "status": "cross_questioning" | "final",
    "cross_questions": [ ... ] or [],
    "final_result": { ... } or null
  }

final_result schema:
{
  "top_disease": "<string>",
  "confidence": <float 0-1>,
  "ranked_diseases": [
    {
      "rank": <int>,
      "disease": "<string>",
      "updated_probability": <float>,
      "risk_level": "<string>",
      "matched_symptoms": ["<string>", ...],
      "missing_symptoms_filled": [
        { "symptom": "<string>", "severity": <int> }
      ]
    }
  ],
  "recommendation": {
    "see_doctor": <bool>,
    "urgent": <bool>,
    "remedy": "<string>",
    "advice": "<string>"
  }
}

IMPORTANT:
- Return ONLY valid JSON. No markdown fences. No text before or after.
- missing_symptoms_filled = [] if no cross questions were asked
- cross_questions = [] if status is "final"
`.trim();

// ─────────────────────────────────────────────
// BUILD USER PROMPT
// ─────────────────────────────────────────────

/**
 * Serializes the full input payload into the string Gemini receives.
 *
 * @param {object} mlOutput       - validated MLOutput object
 * @param {object} knowledgeBase  - { [diseaseName]: KnowledgeBaseEntry }
 * @param {object|null} crossQuestionAnswers - { answers: { [symptom]: 0-5 } } or null
 * @returns {string}
 */
function buildUserPrompt(mlOutput, knowledgeBase, crossQuestionAnswers) {
  const payload = {
    ml_output: mlOutput,
    knowledge_base: knowledgeBase,
    cross_question_answers: crossQuestionAnswers ?? null,
  };
  return JSON.stringify(payload, null, 2);
}

// ─────────────────────────────────────────────
// CALL GEMINI
// ─────────────────────────────────────────────

/**
 * Sends the prompt to Gemini 2.5 Flash and returns the raw text response.
 *
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function callGemini(prompt) {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in environment variables.");
  }

  const url = `${GEMINI_URL}?key=${GEMINI_API_KEY}`;

  const body = {
    system_instruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      temperature: 0.1,                   // low temp = consistent structured output
      responseMimeType: "application/json", // forces Gemini to return clean JSON
    },
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();

  // Extract text from Gemini's response envelope
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error(
      `Unexpected Gemini response structure: ${JSON.stringify(data)}`
    );
  }

  return rawText;
}

// ─────────────────────────────────────────────
// PARSE + VALIDATE GEMINI RESPONSE
// ─────────────────────────────────────────────

/**
 * Strips any accidental markdown fences, parses JSON,
 * and validates against the LLMResponse Zod schema.
 *
 * @param {string} rawText
 * @returns {object} validated LLMResponse
 */
function parseLLMResponse(rawText) {
  // Strip markdown fences just in case Gemini ignores responseMimeType
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json?\s*/i, "").replace(/```\s*$/, "");
  }
  cleaned = cleaned.trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(
      `Gemini returned invalid JSON: ${err.message}\nRaw (first 500 chars): ${rawText.slice(0, 500)}`
    );
  }

  // Validate with Zod
  const result = LLMResponse.safeParse(parsed);
  if (!result.success) {
    throw new Error(
      `LLM response failed schema validation:\n${JSON.stringify(result.error.flatten(), null, 2)}`
    );
  }

  return result.data;
}

// ─────────────────────────────────────────────
// MAIN ENTRY — called by the router
// ─────────────────────────────────────────────

/**
 * Full LLM stage: build prompt → call Gemini → parse response.
 *
 * @param {object} mlOutput
 * @param {object} knowledgeBase
 * @param {object|null} crossQuestionAnswers
 * @returns {Promise<object>} LLMResponse
 */
async function runLLMStage(
  mlOutput,
  knowledgeBase,
  crossQuestionAnswers = null
) {
  // 🔥 SAFETY FIX (critical)
  const safeKB =
    knowledgeBase && typeof knowledgeBase === "object"
      ? knowledgeBase
      : {};

  const prompt = buildUserPrompt(
    mlOutput,
    safeKB,
    crossQuestionAnswers
  );

  const rawText = await callGemini(prompt);
  return parseLLMResponse(rawText);
}
module.exports = { runLLMStage, buildUserPrompt, parseLLMResponse };
