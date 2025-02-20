import { google } from "googleapis";
import dotenv from "dotenv";
import path from "path";

const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH;
const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
const webhookUrl = process.env.WEBHOOK_URL;

const auth = new google.auth.GoogleAuth({
    keyFile: path.resolve(serviceAccountPath),
    scopes: ["https://www.googleapis.com/auth/drive"],
});

const drive = google.drive({ version: "v3", auth });

export async function watchDriveFolder() {
    try {
        const response = await drive.files.watch({
            fileId: folderId,
            requestBody: {
                id: "unique-channel-id",
                type: "web_hook",
                address: webhookUrl,
            },
        });

        console.log("✅ Watching Google Drive folder for changes...");
    } catch (error) {
        console.error("❌ Failed to set up Google Drive watcher:", error.message);
    }
}
