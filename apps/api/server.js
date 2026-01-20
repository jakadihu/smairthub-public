import "dotenv/config";


import express from "express";
import cors from "cors";
import aiRouter from "./routes/ai.js";
import fileRouter from "./routes/file.js";


// --- SSE PROGRESS SETUP ---
export const clients = new Set();

export function sendProgress(data) {
  for (const client of clients) {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}



const app = express();
app.use(cors());
app.use(express.json());

app.use("/ai", aiRouter);
app.use("/file", fileRouter);


// SSE endpoint a progresshez
app.get("/progress-stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // ha van compression middleware, flushHeaders kell
  res.flushHeaders?.();

  // első üzenet
  res.write(`data: ${JSON.stringify({ connected: true })}\n\n`);

  clients.add(res);

  req.on("close", () => {
    clients.delete(res);
  });
});



const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
