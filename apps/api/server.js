import "dotenv/config";
console.log("AI_HOST:", process.env.AI_HOST);

import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.js";
import fileRouter from "./routes/file.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/ai", aiRouter);
app.use("/file", fileRouter);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
