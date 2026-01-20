import express from "express";
import multer from "multer";
import { handleFileProcess } from "../services/file.service.js";

const router = express.Router();

// memória alapú tárolás – nem írunk lemezre
const upload = multer({ storage: multer.memoryStorage() });

router.post("/process", upload.single("file"), handleFileProcess);

export default router;
