import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import redisClient from "./database/redisClient";
import subscriber from "./database/redisSubscriber";
import jsonIntegrationRouter from "./routers/jsonIntegrationRouter";
import webhookRouter from "./routers/webhookRouter";
import startDriveWatch from "./service/startDriveWatch";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusText = http.STATUS_CODES[res.statusCode] || "UNKNOWN";
    console.log(
      `[${new Date().toISOString()}] - [${req.method} ${req.url} HTTP/${req.httpVersion}] - ${res.statusCode} ${statusText} (${duration}ms)`
    );
  });
  next();
});

// Routers
app.use(jsonIntegrationRouter);
app.use(webhookRouter);

// Base Route
app.get("/", (req, res) => {
  res.status(200).json({ message: "Telex Drive Backup Notifier!" });
});

if (process.env.TELEX_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on PORT ${PORT}`);

    // Connect to Redis first
    await redisClient.connect();
    await subscriber.connect();

    // 🚀 Check if config exists, otherwise wait for pub/sub event
    const config = await redisClient.get("drive:config");
    if (config) {
      console.log("✅ Configuration found in Redis. Starting Drive Watch...");
      await startDriveWatch();
    } else {
      console.log(
        "⚠️  No configuration found for Drive watch. Waiting for updates..."
      );
    }
  });
}

export default app;
