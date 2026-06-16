import express from "express";
import cors from "cors";
import "dotenv/config";
import { initRAG, queryRAG } from "./ragService.js";

const app  = express();
const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.json());

// ── POST /api/symptom-check ───────────────────────────────────
// Body: { symptoms: "fever, headache, sore throat" }
// Returns: { answer: "..." }
app.post("/api/symptom-check", async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || symptoms.trim() === "") {
      return res.status(400).json({ error: "symptoms field is required" });
    }

    const question = `The patient has the following symptoms: ${symptoms}. What could this indicate and what should they do?`;
    const answer   = await queryRAG(question);

    return res.status(200).json({ answer });
  } catch (err) {
    console.error("❌ /api/symptom-check error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── POST /api/ask ─────────────────────────────────────────────
// Body: { question: "What are flu symptoms?" }
// Returns: { answer: "..." }
app.post("/api/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question || question.trim() === "") {
      return res.status(400).json({ error: "question field is required" });
    }

    const answer = await queryRAG(question);
    return res.status(200).json({ answer });
  } catch (err) {
    console.error("❌ /api/ask error:", err.message);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Start ─────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initRAG(); // warm up RAG on startup
});
