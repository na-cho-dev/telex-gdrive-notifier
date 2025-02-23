import { watchDriveFolder } from "./googleDriveService.js";
import redisClient from "../database/redisClient.js";

const startDriveWatch = async () => {
  try {
    const configStr = await redisClient.get("drive:config");
    if (!configStr) {
      // console.log("⚠️ No configuration found for Drive watch.");
      return;
    }
    const { baseURL, folderId } = JSON.parse(configStr);
    // console.log("🚀 Starting watch with config:", { baseURL, folderId });
    await watchDriveFolder(baseURL, folderId);
  } catch (error) {
    console.error("❌ Error starting drive watch:", error.message);
  }
};

export default startDriveWatch;
