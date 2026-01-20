// services/file.service.js
import { processUploadedFile } from "../utils/fileHandlerRegistry.js";

export async function handleFileProcess(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs feltöltött fájl." });
    }

    const result = await processUploadedFile(req.file);
    return res.json(result);

  } catch (err) {
    console.error("File service error:", err);
    return res.status(500).json({
      error: err.message || "File processing error"
    });
  }
}
