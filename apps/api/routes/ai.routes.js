import express from "express";
import { handleAIRequest } from "../services/ai.service.js";

const router = express.Router();

router.post("/", handleAIRequest);

export default router;
