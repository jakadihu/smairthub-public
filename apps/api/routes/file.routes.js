import express from "express";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import {
  handleFileInspect,
  handleFileProcess,
} from "../services/file.service.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

// 1) metaadatok
router.post("/inspect", upload.single("file"), handleFileInspect);

// 2) feldolgozás
router.post("/process", upload.single("file"), handleFileProcess);



router.get("/json/:id", async (req, res) => {
  try {
    const jsonId = req.params.id;
    const filePath = path.join("/tmp/json", jsonId + ".json");

    const data = await fs.readFile(filePath, "utf8");

    res.setHeader("Content-Type", "application/json");
    res.send(data);
  } catch (err) {
    console.error("JSON download error:", err);
    res.status(404).json({ error: "JSON not found" });
  }
});

export default router;
