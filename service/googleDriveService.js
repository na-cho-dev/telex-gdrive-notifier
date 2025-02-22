import { google } from "googleapis";
// import { v4 as uuidv4 } from "uuid";
import path from "path";
import redisClient from "../database/redisClient.js";
import { dataStore } from "./dataStore.js";
import { sendNotification } from "./sendNotification.js";

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(serviceAccountPath),
    scopes: ["https://www.googleapis.com/auth/drive"],
});

export const drive = google.drive({ version: "v3", auth });

export const watchDriveFolder = async (baseURL, folderId) => {
    const webhookURL = `${baseURL}/gdrive-webhook`;
    const devWebhookURL = "https://c97c-197-211-63-36.ngrok-free.app/gdrive-webhook"

    // console.log("📌 Base URL:", baseURL);
    // console.log("📌 Folder ID:", folderId);

    try {
        const response = await drive.files.watch({
            fileId: folderId,
            requestBody: {
                id: `drive-watch-${Date.now()}`,
                type: "web_hook",
                address: webhookURL,
                payload: true,
                token: process.env.GOOGLE_DRIVE_WEBHOOK_TOKEN,
            },
        });

         // Store channel details in Redis or a database
        await redisClient.set(response.data.id, JSON.stringify({
            resourceId: response.data.resourceId,
            expiration: response.data.expiration,
        }), "EX", 86400); // Store for 1 day (adjust as needed)

        console.log("✅ Watching Google Drive folder for changes...");
        console.log("📡 Webhook response:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Failed to set up Google Drive watcher:", error.message);
    }
};

export const getStartPageToken = async () => {
    const res = await drive.changes.getStartPageToken();
    await redisClient.set('googleDrivePageToken', res.data.startPageToken);
    return res.data.startPageToken;
};

let data = {};

export const getChanges = async () => {
    try {
        // Retrieve the current page token from Redis.
        let pageToken = await redisClient.get("googleDrivePageToken");
        if (!pageToken) {
            console.warn("⚠️ No page token found. Fetching a new one...");
            pageToken = await getStartPageToken();
        }
        // console.log("📌 Using Page Token:", pageToken);
    
        // Fetch changes since the last page token.
        const res = await drive.changes.list({
            pageToken,
            spaces: "drive",
            fields: "newStartPageToken, changes(file(id, name, mimeType, trashed, modifiedTime, lastModifyingUser(displayName, emailAddress)))"
        });
    
        if (!res.data.changes || res.data.changes.length === 0) {
            console.log("✅ No new changes detected.");
            return;
        }
    
        // Group changes by file id to get unique changes.
        const uniqueChanges = new Map();
        for (const change of res.data.changes) {
            if (!change.file || !change.file.id) continue;
            const fileId = change.file.id;
            const currentModified = new Date(change.file.modifiedTime).getTime();
    
            if (uniqueChanges.has(fileId)) {
                const existingChange = uniqueChanges.get(fileId);
                const existingModified = new Date(existingChange.file.modifiedTime).getTime();
                // Keep the change with the latest modification time.
                if (currentModified > existingModified) {
                    uniqueChanges.set(fileId, change);
                }
            } else {
                uniqueChanges.set(fileId, change);
            }
        }
    
        // Process each unique change.
        for (const [fileId, change] of uniqueChanges.entries()) {
            const modifiedTime = change.file.modifiedTime;
            // console.log("CHANGE DETECTED!!!")

            // Check if this file has already been notified.
            if (change.file.trashed) {
                // For trash events, use a dedicated key.
                const trashNotified = await redisClient.get(`trashedNotified:${fileId}`);
                if (trashNotified) {
                    // console.log(`⚠️ Skipping duplicate trash event for file: ${fileId}`);
                    continue;
                }
                // Mark trash event as notified.
                await redisClient.set(`trashedNotified:${fileId}`, "1", "EX", 86400);
                dataStore.fileChangeData = {
                    event_name: `${change.file.name}  was Trashed 🗑️`,
                    message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${change.file.modifiedTime}\nModified By: ${change.file.lastModifyingUser.displayName} (${change.file.lastModifyingUser.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
                    status: "success",
                    username: "Telex GDrive Notifier Bot"
                };

                await sendNotification(dataStore.fileChangeData);

                console.log(`🗑️ File Moved to Trash: ${change.file.name} (ID: ${fileId})`);
              } else {
                // For update/add events, use a lastNotified key.
                const lastNotified = await redisClient.get(`lastNotified:${fileId}`);

                if (lastNotified && new Date(modifiedTime) <= new Date(lastNotified)) {
                //   console.log(`⚠️ Skipping already notified change for file: ${fileId}`);
                  continue;
                }
                await redisClient.set(`lastNotified:${fileId}`, modifiedTime, "EX", 86400);
                dataStore.fileChangeData = {
                    event_name: `${change.file.name}  was Modified 🔄`,
                    message: `File Name: "${change.file.name}"\nFile ID: ${fileId}\nModified Time: ${change.file.modifiedTime}\nModified By: ${change.file.lastModifyingUser.displayName} (${change.file.lastModifyingUser.emailAddress}).\nMIME type: ${change.file.mimeType}.`,
                    status: "success",
                    username: "Telex GDrive Notifier Bot"
                };

                await sendNotification(dataStore.fileChangeData);

                console.log(`🔄 File Changed: ${change.file.name} (ID: ${fileId})`);
            }
        }
    
        // Update the page token for future calls.
        if (res.data.newStartPageToken) {
            await redisClient.set("googleDrivePageToken", res.data.newStartPageToken);
            pageToken = res.data.newStartPageToken;
        }
    } catch (error) {
        console.error("❌ Error fetching changes:", error.message);
        throw error;
    }
};
