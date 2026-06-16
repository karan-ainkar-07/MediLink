/**
 * index.js
 * ─────────
 * Run with:
 *   node index.js
 *   or with auto-reload:
 *   npx nodemon index.js
 */

require("dotenv").config();
const express = require("express");
const router = require("./router");

const app = express();
const PORT =2000;

// ── Middleware ──
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*"); // restrict to your domain in prod
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

// ── Routes ──
app.use("/api/v1", router);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// ── Global error handler ──
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(500).json({ success: false, error: err.message });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`✅ Symptom Checker API running on http://localhost:${PORT}`);
  console.log(`   POST /api/v1/analyze`);
  console.log(`   POST /api/v1/analyze/answer`);
  console.log(`   GET  /health`);
});
