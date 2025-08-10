import redisClient from "../database/redisClient";
import { sendNotification } from "./sendNotification";
import { dataStore } from "./dataStore";

export const checkIfNoChanges = async (): Promise<boolean> => {
  try {
    const lastChangeTime = await redisClient.get("lastFileChangeTime");

    if (!lastChangeTime) return true; // No changes recorded yet

    const lastChange = parseInt(lastChangeTime);
    const now = Date.now();
    const twoMinutesInMs = 2 * 60 * 1000; // 2 minutes in milliseconds

    // Return true if no changes in the last 2 minutes
    return now - lastChange > twoMinutesInMs;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error checking for changes:", errorMessage);
    return true; // Default to true if there's an error
  }
};

export const sendNoChangesNotification = async (): Promise<void> => {
  try {
    dataStore.fileChangeData = {
      event_name: "No Recent Changes 📊",
      message:
        "No file changes detected in the monitored Google Drive folder in the last check. The system is actively monitoring for any new updates.",
      status: "success",
      username: "Telex GDrive Notifier Bot",
    };

    await sendNotification(dataStore.fileChangeData);
    console.log("📊 No changes notification sent");
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to send no changes notification:", errorMessage);
  }
};
