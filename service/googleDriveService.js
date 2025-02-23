import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import redisClient from "../database/redisClient.js";
import { dataStore } from "./dataStore.js";
import { sendNotification } from "./sendNotification.js";

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(serviceAccountPath),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

dotenv.config();
export const drive = google.drive({ version: "v3", auth });

export const watchDriveFolder = async (baseURL, folderId) => {
  const webhookURL = `${baseURL}/gdrive-webhook`;
  const devWebhookURL = `${process.env.DEV_WEBHOOK_URL}/gdrive-webhook`;

  // console.log("📌 Base URL:", baseURL);
  // console.log("📌 Folder ID:", folderId);

  try {
    const response = await drive.files.watch({
      fileId: folderId,
      requestBody: {
        id: `drive-watch-${Date.now()}`,
        type: "web_hook",
        address: process.env.TELEX_ENV === "prod" ? webhookURL : devWebhookURL,
        payload: true,
        token: process.env.GOOGLE_DRIVE_WEBHOOK_TOKEN,
      },
    });

    // console.log("Webhook URL:", response.config.data.address)

    // Store channel details in Redis or a database
    await redisClient.set(
      response.data.id,
      JSON.stringify({
        resourceId: response.data.resourceId,
        expiration: response.data.expiration,
      }),
      "EX",
      86400
    ); // Store for 1 day (adjust as needed)

    console.log("✅ Watching Google Drive folder for changes...");
    console.log("📡 Webhook response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to set up Google Drive watcher:", error.message);
  }
};

export const getStartPageToken = async () => {
  const res = await drive.changes.getStartPageToken();
  await redisClient.set("googleDrivePageToken", res.data.startPageToken);
  return res.data.startPageToken;
};

export const getChanges = async () => {
  try {
    let pageToken = await redisClient.get("googleDrivePageToken");
    if (!pageToken) {
      // console.warn("⚠️    No page token found. Fetching a new one...");
      pageToken = await getStartPageToken();
    }

    const res = await drive.changes.list({
      pageToken,
      spaces: "drive",
      fields:
        "newStartPageToken, changes(file(id, name, mimeType, trashed, modifiedTime, lastModifyingUser(displayName, emailAddress)))",
    });

    if (res.data.changes?.length > 0) {
      const uniqueChanges = new Map();
      for (const change of res.data.changes) {
        if (!change.file || !change.file.id) continue;
        const fileId = change.file.id;
        const currentModified = new Date(change.file.modifiedTime).getTime();

        if (uniqueChanges.has(fileId)) {
          const existingChange = uniqueChanges.get(fileId);
          const existingModified = new Date(
            existingChange.file.modifiedTime
          ).getTime();
          if (currentModified > existingModified) {
            uniqueChanges.set(fileId, change);
          }
        } else {
          uniqueChanges.set(fileId, change);
        }
      }

      for (const [fileId, change] of uniqueChanges.entries()) {
        const modifiedTime = change.file.modifiedTime;

        if (change.file.trashed) {
          const trashNotified = await redisClient.get(
            `trashedNotified:${fileId}`
          );
          if (trashNotified) continue;

          await redisClient.set(`trashedNotified:${fileId}`, "1", "EX", 86400);

          dataStore.fileChangeData = {
            event_name: `${change.file.name} was Trashed 🗑️`,
            message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${change.file.modifiedTime}\nModified By: ${change.file.lastModifyingUser.displayName} (${change.file.lastModifyingUser.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
            status: "success",
            username: "Telex GDrive Notifier Bot",
          };

          await sendNotification(dataStore.fileChangeData);
          console.log(
            `🗑️ File Moved to Trash: ${change.file.name} (ID: ${fileId})`
          );
          // ✅ Set lastFileChangeTime when a change is detected
          await redisClient.set(
            "lastFileChangeTime",
            Date.now().toString(),
            "EX",
            86400
          );
        } else {
          const lastNotified = await redisClient.get(`lastNotified:${fileId}`);
          if (lastNotified && new Date(modifiedTime) <= new Date(lastNotified))
            continue;

          await redisClient.set(
            `lastNotified:${fileId}`,
            modifiedTime,
            "EX",
            86400
          );

          dataStore.fileChangeData = {
            event_name: `${change.file.name} was Modified 🔄`,
            message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${change.file.modifiedTime}\nModified By: ${change.file.lastModifyingUser.displayName} (${change.file.lastModifyingUser.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
            status: "success",
            username: "Telex GDrive Notifier Bot",
          };

          await sendNotification(dataStore.fileChangeData);
          console.log(`🔄 File Changed: ${change.file.name} (ID: ${fileId})`);
          // ✅ Set lastFileChangeTime when a change is detected
          await redisClient.set(
            "lastFileChangeTime",
            Date.now().toString(),
            "EX",
            86400
          );
        }
      }
    }

    if (res.data.newStartPageToken) {
      await redisClient.set("googleDrivePageToken", res.data.newStartPageToken);
    }
  } catch (error) {
    console.error("❌ Error fetching changes:", error.message);
    throw error;
  }
};
