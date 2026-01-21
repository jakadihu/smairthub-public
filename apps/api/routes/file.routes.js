import express from "express";
import multer from "multer";
import { handleFileInspect, handleFileProcess } from "../services/file.service.js";

const router = express.Router();
//const upload = multer({ storage: multer.memoryStorage() });

const upload = multer({
    storage: multer.memoryStorage(), 
    limits: {
        fileSize: 20 * 1024 * 1024 // 20MB 
    } 
});

// 1) metaadatok
router.post("/inspect", upload.single("file"), handleFileInspect);

// 2) feldolgozás
router.post("/process", upload.single("file"), handleFileProcess);

export default router;
