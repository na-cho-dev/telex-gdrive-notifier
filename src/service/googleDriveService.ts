import { google, drive_v3 } from "googleapis";
import dotenv from "dotenv";
import path from "path";
import redisClient from "../database/redisClient";
import { dataStore } from "./dataStore";
import { sendNotification } from "./sendNotification";
import { WatchResponse } from "../types/index";

dotenv.config();

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error(
    "GOOGLE_SERVICE_ACCOUNT_PATH environment variable is required"
  );
}

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve(serviceAccountPath),
  scopes: ["https://www.googleapis.com/auth/drive"],
});

export const drive = google.drive({ version: "v3", auth });

export const watchDriveFolder = async (
  baseURL: string,
  folderId: string
): Promise<WatchResponse | undefined> => {
  const webhookURL = `${baseURL}/gdrive-webhook`;
  const devWebhookURL = `${process.env.DEV_WEBHOOK_URL}/gdrive-webhook`;

  try {
    const response = await drive.files.watch({
      fileId: folderId,
      requestBody: {
        id: `drive-watch-${Date.now()}`,
        type: "web_hook",
        address: process.env.TELEX_ENV === "prod" ? webhookURL : devWebhookURL,
        payload: true,
        token: process.env.GOOGLE_DRIVE_WEBHOOK_TOKEN ?? null,
      },
    });

    if (
      !response.data.id ||
      !response.data.resourceId ||
      !response.data.expiration
    ) {
      throw new Error("Invalid watch response from Google Drive API");
    }

    await redisClient.set(
      response.data.id,
      JSON.stringify({
        resourceId: response.data.resourceId,
        expiration: response.data.expiration,
      }),
      "EX",
      86400
    );

    console.log("✅ Watching Google Drive folder for changes...");
    console.log("📡 Webhook response:", response.data);

    return response.data as WatchResponse;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Failed to set up Google Drive watcher:", errorMessage);
    return undefined;
  }
};

export const getStartPageToken = async (): Promise<string> => {
  const res = await drive.changes.getStartPageToken();
  if (!res.data.startPageToken) {
    throw new Error("Failed to get start page token from Google Drive API");
  }

  await redisClient.set("googleDrivePageToken", res.data.startPageToken);
  return res.data.startPageToken;
};

export const getChanges = async (): Promise<void> => {
  try {
    let pageToken = await redisClient.get("googleDrivePageToken");
    if (!pageToken) {
      pageToken = await getStartPageToken();
    }

    const res = await drive.changes.list({
      pageToken,
      spaces: "drive",
      fields:
        "newStartPageToken, changes(file(id, name, mimeType, trashed, modifiedTime, lastModifyingUser(displayName, emailAddress)))",
    });

    if (res.data.changes?.length && res.data.changes.length > 0) {
      const uniqueChanges = new Map<string, drive_v3.Schema$Change>();

      for (const change of res.data.changes) {
        if (!change.file?.id) continue;

        const fileId = change.file.id;
        const currentModified = new Date(
          change.file.modifiedTime || ""
        ).getTime();

        if (uniqueChanges.has(fileId)) {
          const existingChange = uniqueChanges.get(fileId);
          const existingModified = new Date(
            existingChange?.file?.modifiedTime || ""
          ).getTime();

          if (currentModified > existingModified) {
            uniqueChanges.set(fileId, change);
          }
        } else {
          uniqueChanges.set(fileId, change);
        }
      }

      for (const [fileId, change] of uniqueChanges.entries()) {
        if (!change.file) continue;

        const modifiedTime = change.file.modifiedTime;
        if (!modifiedTime) continue;

        if (change.file.trashed) {
          const trashNotified = await redisClient.get(
            `trashedNotified:${fileId}`
          );
          if (trashNotified) continue;

          await redisClient.set(`trashedNotified:${fileId}`, "1", "EX", 86400);

          dataStore.fileChangeData = {
            event_name: `${change.file.name} was Trashed 🗑️`,
            message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${modifiedTime}\nModified By: ${change.file.lastModifyingUser?.displayName} (${change.file.lastModifyingUser?.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
            status: "success",
            username: "Telex GDrive Notifier Bot",
          };

          await sendNotification(dataStore.fileChangeData);
          console.log(
            `🗑️ File Moved to Trash: ${change.file.name} (ID: ${fileId})`
          );

          await redisClient.set(
            "lastFileChangeTime",
            Date.now().toString(),
            "EX",
            86400
          );
        } else {
          const lastNotified = await redisClient.get(`lastNotified:${fileId}`);
          if (
            lastNotified &&
            new Date(modifiedTime) <= new Date(lastNotified)
          ) {
            continue;
          }

          await redisClient.set(
            `lastNotified:${fileId}`,
            modifiedTime,
            "EX",
            86400
          );

          dataStore.fileChangeData = {
            event_name: `${change.file.name} was Modified 🔄`,
            message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${modifiedTime}\nModified By: ${change.file.lastModifyingUser?.displayName} (${change.file.lastModifyingUser?.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
            status: "success",
            username: "Telex GDrive Notifier Bot",
          };

          await sendNotification(dataStore.fileChangeData);
          console.log(`🔄 File Changed: ${change.file.name} (ID: ${fileId})`);

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
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error fetching changes:", errorMessage);
    throw error;
  }
};
