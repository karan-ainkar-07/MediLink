import express from "express";
import { MongoClient } from "mongodb";
import cors from "cors";

const app = express();

// ─────────────────────────────────────────────
// MUST be before routes
// ─────────────────────────────────────────────
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// ─────────────────────────────────────────────
// Mongo function
// ─────────────────────────────────────────────

async function getByDisease(diseaseList) {
  const uri =process.env.MONGODB_URL_PRATHAM;

  const client = new MongoClient(uri);

  try {
    await client.connect();

    const db = client.db("healthcare");
    const collection = db.collection("diseases");

    const result = await collection
      .find({
        name: { $in: diseaseList }
      })
      .toArray();

    return result;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  } finally {
    await client.close();
  }
}

// ─────────────────────────────────────────────
// API ROUTE
// ─────────────────────────────────────────────

app.post("/api/diseases", async (req, res) => {
  try {
    const { diseases } = req.body;

    if (!Array.isArray(diseases)) {
      return res.status(400).json({
        success: false,
        message: "diseases must be an array"
      });
    }

    const data = await getByDisease(diseases);

    return res.json({
      success: true,
      count: data.length,
      data
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

// ─────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});