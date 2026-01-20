// routes/progress.routes.js
import express from "express";
import { progressStreamHandler } from "../sse/progress.js";

const router = express.Router();

router.get("/progress-stream", progressStreamHandler);

export default router;
