import "dotenv/config";
import express from "express";
import cors from "cors";

import aiRoutes from "./routes/ai.routes.js";
import fileRoutes from "./routes/file.routes.js";
import progressRoutes from "./routes/progress.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Panel-agnosztikus, tiszta infrastruktúra endpointok
app.use("/ai", aiRoutes);
app.use("/file", fileRoutes);
app.use("/progress", progressRoutes);

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
