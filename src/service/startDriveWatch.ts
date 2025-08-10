import redisClient from "../database/redisClient";
import { watchDriveFolder } from "./googleDriveService";
import { DriveConfig } from "../types/index";

const startDriveWatch = async (): Promise<void> => {
  try {
    const configData = await redisClient.get("drive:config");
    if (!configData) {
      console.log("⚠️ No drive configuration found in Redis");
      return;
    }

    const config: DriveConfig = JSON.parse(configData);
    const { baseURL, folderId } = config;

    if (!baseURL || !folderId) {
      console.log("⚠️ Invalid configuration: missing baseURL or folderId");
      return;
    }

    console.log(`🚀 Starting Drive watch for folder: ${folderId}`);
    await watchDriveFolder(baseURL, folderId);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to start drive watch:", errorMessage);
  }
};

export default startDriveWatch;
