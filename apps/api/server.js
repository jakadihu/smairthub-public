import "dotenv/config";
import express from "express";
import cors from "cors";

import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/file.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import { uploadJsonHandler } from "./services/file.service.js"

const app = express();

app.use(cors());

app.post(
  "/file/upload-json",
  express.raw({ type: "application/json", limit: "200mb" }),
  uploadJsonHandler,
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use("/ai", aiRoutes);
app.use("/file", fileRoutes);
app.use("/progress", progressRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
