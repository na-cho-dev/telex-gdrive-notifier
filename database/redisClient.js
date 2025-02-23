import { createClient } from "redis";

const redisClient = createClient({
  socket: {
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: process.env.REDIS_PORT || 6379,
  },
});

redisClient.on("error", (err) => console.error("❌    Redis Error:", err));

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("✅   Redis Connected!");
  } catch (error) {
    console.error("❌   Redis Connection Failed:", error);
  }
};

connectRedis();

export default redisClient;
