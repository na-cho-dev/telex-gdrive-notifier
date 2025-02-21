import { createClient } from "redis";
import startDriveWatch from "../service/startDriveWatch.js";

const subscriber = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379
  }
});

subscriber.on("error", (err) => console.error("❌ Redis Subscriber Error:", err));

const connectSubscriber = async () => {
  try {
    await subscriber.connect();
    // console.log("📡 Redis Subscriber Connected!");

    // Subscribe to changes
    await subscriber.subscribe("drive:configUpdated", async (message) => {
      // console.log("🚀 New configuration published. Starting Drive Watch...");
      await startDriveWatch();
    });

  } catch (error) {
    console.error("❌ Redis Subscriber Connection Failed:", error);
  }
};

// Connect the subscriber
connectSubscriber();

export default subscriber;
