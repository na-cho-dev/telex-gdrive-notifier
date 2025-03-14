import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import redisClient from "./database/redisClient.js";
// import bodyParser from 'body-parser'
import jsonIntegrationRouter from "./routers/jsonIntegrationRouter.js";
import telexWebhookRouter from "./routers/telexWebhookRouter.js";
import driveWebhookRouter from "./routers/driveWebhookRouter.js";
import startDriveWatch from "./service/startDriveWatch.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
// app.use(bodyParser)
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusText = http.STATUS_CODES[res.statusCode] || "UNKNOWN"; // Get status text
    console.log(
      `[${new Date().toISOString()}] - [${req.method} ${req.url} HTTP/${req.httpVersion}] - ${res.statusCode} ${statusText} (${duration}ms)`
    );
  });
  next();
});
app.use(jsonIntegrationRouter);
app.use(telexWebhookRouter);
app.use(driveWebhookRouter);

app.get("/", (req, res) => {
  res.status(200).json({ message: "Telex Drive Backup Notofier!" });
});

if (process.env.TELEX_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`🚀 Server is running on PORT ${PORT}`);

    // 🚀 Check if config exists, otherwise wait for pub/sub event
    const config = await redisClient.get("drive:config");
    if (config) {
      console.log("✅   Configuration found in Redis. Starting Drive Watch...");
      await startDriveWatch();
    } else {
      console.log(
        "⚠️   No configuration found for Drive watch. Waiting for updates..."
      );
    }
  });

  // 🔔 Subscribe to Redis to start Drive Watch when config is updated
  (async () => {
    const subscriber = redisClient.duplicate();
    await subscriber.connect();

    await subscriber.subscribe("drive:configUpdated", async () => {
      console.log("🔔   Received Event: drive:configUpdated");
      console.log("🚀   New configuration published. Starting Drive Watch...");
      await startDriveWatch();
    });
  })();
}

export default app;
