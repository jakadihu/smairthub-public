import express from "express";
import multer from "multer";
import { processUploadedFile } from "../services/fileService.js";

const router = express.Router();

// memória alapú tárolás – nem írunk lemezre
const upload = multer({ storage: multer.memoryStorage() });

router.post("/process", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nincs feltöltött fájl." });
    }

    const result = await processUploadedFile(req.file);
    return res.json(result);
  } catch (err) {
    console.error("File process error:", err);
    return res.status(500).json({ error: "File processing error" });
  }
});

export default router;
