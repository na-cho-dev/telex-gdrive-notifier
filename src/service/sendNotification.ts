import axios from "axios";
import redisClient from "../database/redisClient";
import { FileChangeData } from "../types/index";

export const sendNotification = async (data: FileChangeData): Promise<void> => {
  try {
    const returnUrl = await redisClient.get("telex:return_url");
    if (!returnUrl) {
      console.log("⚠️ No return_url found, skipping notification.");
      return;
    }

    await axios.post(returnUrl, data, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("📢 Notification sent successfully to Telex App:", data);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.log("❌ Failed to send notification:", errorMessage);
  }
};
