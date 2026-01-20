import express from "express";
import pLimit from "p-limit";
import {
  generateAIResponse,
  normalizeHeaders,
  validateRow,
  buildBatchSummary
} from "../services/aiService.js";
import { sendProgress } from "../server.js";


const router = express.Router();

router.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    const result = await generateAIResponse(prompt);
    res.json({ result });
  } catch (err) {
    console.error("AI error:", err);
    res.status(500).json({ error: "AI engine error" });
  }
});

router.post("/normalize-headers", async (req, res) => {
  try {
    const { headers } = req.body;
    if (!Array.isArray(headers) || headers.length === 0) {
      return res
        .status(400)
        .json({ error: "headers must be a non-empty array" });
    }
    const mapping = await normalizeHeaders(headers);
    res.json({ normalized: mapping });
  } catch (err) {
    console.error("Normalize headers error:", err);
    res.status(500).json({ error: "Normalize headers error" });
  }
});

router.post("/validate-row", async (req, res) => {
  try {
    const { headers, row } = req.body;

    if (!headers || !row) {
      return res.status(400).json({ error: "headers and row are required" });
    }

    const result = await validateRow(headers, row);
    console.log("header", headers);
    res.json(result);
  } catch (err) {
    console.error("Row validation error:", err);
    res.status(500).json({ error: "Row validation error" });
  }
});

router.post("/validate-batch", async (req, res) => {
  try {
    const { headers, rows } = req.body;

    if (!headers || !Array.isArray(rows)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const limit = pLimit(20);
    let completed = 0;
    const total = rows.length;

    const results = await Promise.all(
      rows.map((row, index) =>
        limit(async () => {
          try {
            const result = await validateRow(headers, row);

            completed++;
            sendProgress({ current: completed, total });

            return {
              index,
              original: row,
              ...result,
              success: true,
            };
          } catch (err) {
            completed++;
            sendProgress({ current: completed, total });

            return {
              index,
              original: row,
              success: false,
              error: true,
              errorMessage: err.message || "Row validation error",
            };
          }
        })
      )
    );

    const summary = buildBatchSummary(results);

    res.json({
      headers,
      rows: results,
      summary,
    });
  } catch (err) {
    console.error("Batch validation error:", err);
    res.status(500).json({ error: "Batch validation error" });
  }
});


export default router;
