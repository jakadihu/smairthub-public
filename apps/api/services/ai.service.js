// services/ai.service.js
import { callModel } from "../lib/ai/callModel.js";

export async function handleAIRequest(req, res) {
  try {
    const { prompt } = req.body;

    // --- Input validation ---
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    // --- Model call ---
    const response = await callModel(prompt);    

    // --- Success ---
    return res.json({ response });
  } catch (err) {
    console.error("AI service error:", err);
    return res.status(500).json({ error: "AI request failed" });
  }
}

