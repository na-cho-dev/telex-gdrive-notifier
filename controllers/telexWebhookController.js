import redisClient from "../database/redisClient.js";
import { getChanges } from "../service/googleDriveService.js";
import {
  checkIfNoChanges,
  sendNoChangesNotification,
} from "../service/checkIfNoChanges.js";
import { sendNotification } from "../service/sendNotification.js";
import { dataStore } from "../service/dataStore.js";

const telexWebhook = async (req, res) => {
  try {
    const { channel_id, return_url, settings } = req.body;
    const baseURL = req.protocol + "s://" + req.get("host");
    const folderId = settings.find(
      (setting) => setting.label === "Folder ID"
    )?.default;

    await redisClient.set("telex:return_url", return_url, "EX", 86400);

    if (!folderId) {
      console.log("Folder ID is required!");
      dataStore.fileChangeData = {
        event_name: "Folder ID Required",
        message:
          "To get started, please provide a folder ID. You can find the folder ID by navigating to the desired google folder in your browser and copying the last part of the URL from the address bar. The folder ID is the unique identifier that appears after the last '/' in the URL.",
        status: "success",
        username: "Telex GDrive Notifier Bot",
      };
      await sendNotification(dataStore.fileChangeData);
      return res.status(400).json({ message: "Folder ID is required" });
    }

    console.log("Telex Webhook PINGED!!!");
    // console.log("Base URL:", baseURL);

    await redisClient.set(
      "drive:config",
      JSON.stringify({ baseURL, folderId }),
      "EX",
      86400
    );

    // Publish a message indicating configuration has been updated
    await redisClient.publish("drive:configUpdated", "new config");

    if (await checkIfNoChanges()) {
      await sendNoChangesNotification();
    } else {
      await getChanges();
    }

    res
      .status(202)
      .json({ status: "Success", message: "Google Drive webhook is active" });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default telexWebhook;
