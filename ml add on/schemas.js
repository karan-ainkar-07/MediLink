const { z } = require("zod");

// ─────────────────────────────────────────────
// ML OUTPUT (what your XGBoost backend sends)
// ─────────────────────────────────────────────

const SymptomInput = z.object({
  name: z.string(),
  weight: z.number().min(0).max(1),
});

const MLAnalysis = z.object({
  total_symptoms_received: z.number().int(),
  confidence_score: z.number(),
  severity_level: z.string(),
});

const TopPrediction = z.object({
  rank: z.number().int(),
  disease: z.string(),
  probability: z.number(),
});

const MLRecommendation = z.object({
  see_doctor: z.boolean(),
  home_care: z.boolean(),
  urgent_attention: z.boolean(),
  advice: z.string(),
});

const MLOutput = z.object({
  symptoms: z.array(SymptomInput),
  top_predictions: z.array(TopPrediction),
});

// ─────────────────────────────────────────────
// KNOWLEDGE BASE (your DB disease documents)
// ─────────────────────────────────────────────

const KnowledgeBaseEntry = z.object({
  id: z.string(),
  name: z.string(),
  symptoms: z.array(z.string()),
  description: z.string(),
  remedy: z.string(),
  severity: z.string(),
  emergency: z.boolean(),
  risk_factors: z.array(z.string()),
  advice: z.string(),
});

// ─────────────────────────────────────────────
// CROSS QUESTION ANSWERS (frontend → backend)
// ─────────────────────────────────────────────

const CrossQuestionAnswers = z.object({
  // e.g. { "body ache": 3, "sore throat": 1, "chills": 0 }
  answers: z.record(z.string(), z.number().int().min(0).max(5)),
});

// ─────────────────────────────────────────────
// LLM RESPONSE (what Gemini returns, parsed)
// ─────────────────────────────────────────────

const CrossQuestion = z.object({
  symptom: z.string(),
  question: z.string(),
  for_diseases: z.array(z.string()),
});

const MissingSymptomFilled = z.object({
  symptom: z.string(),
  severity: z.number().int(),
});

const RankedDisease = z.object({
  rank: z.number().int(),
  disease: z.string(),
  updated_probability: z.number(),
  risk_level: z.string(),
  matched_symptoms: z.array(z.string()),
  missing_symptoms_filled: z.array(MissingSymptomFilled),
});

const Recommendation = z.object({
  see_doctor: z.boolean(),
  urgent: z.boolean(),
  remedy: z.string(),
  advice: z.string(),
});

const FinalResult = z.object({
  top_disease: z.string(),
  confidence: z.number(),
  ranked_diseases: z.array(RankedDisease),
  recommendation: Recommendation,
});

const LLMResponse = z.object({
  status: z.enum(["cross_questioning", "final"]),
  cross_questions: z.array(CrossQuestion),
  final_result: FinalResult.nullable(),
});

// ─────────────────────────────────────────────
// API REQUEST/RESPONSE SHAPES
// ─────────────────────────────────────────────

const AnalyzeRequest = z.object({
  ml_result: MLOutput,
});

const AnswerRequest = z.object({
  ml_result: MLOutput,
  cross_question_answers: CrossQuestionAnswers,
});

const AnalyzeResponse = z.object({
  success: z.boolean(),
  status: z.string(),
  cross_questions: z.array(CrossQuestion),
  final_result: FinalResult.nullable().optional(),
  message: z.string(),
});

module.exports = {
  SymptomInput,
  MLOutput,
  KnowledgeBaseEntry,
  CrossQuestionAnswers,
  CrossQuestion,
  MissingSymptomFilled,
  RankedDisease,
  Recommendation,
  FinalResult,
  LLMResponse,
  AnalyzeRequest,
  AnswerRequest,
  AnalyzeResponse,
};
