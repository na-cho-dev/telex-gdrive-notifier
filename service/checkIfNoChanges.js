import redisClient from "../database/redisClient.js";
import { dataStore } from "./dataStore.js";
import { sendNotification } from "./sendNotification.js";

export const checkIfNoChanges = async () => {
    const lastChangeTimestamp = await redisClient.get("lastFileChangeTime");
    if (!lastChangeTimestamp) {
        console.log("⚠️ No last change timestamp found. Assuming no changes.");
        return true;
    }

    const currentTime = Date.now();
    const timeSinceLastChange = currentTime - Number(lastChangeTimestamp);

    console.log(`⏳ Time since last file change: ${timeSinceLastChange / 1000} sec`);

    return timeSinceLastChange > 120000;
};


export const sendNoChangesNotification = async () => {
    const lastNoChangesTime = await redisClient.get("lastNoChangesSent");
    const noChangesLock = await redisClient.get("noChangesLock");

    const lastNoChangesTimestamp = lastNoChangesTime ? Number(lastNoChangesTime) : 0;
    const currentTime = Date.now();
    const timeSinceLastNoChanges = currentTime - lastNoChangesTimestamp;

    console.log(`🕒 Time since last 'No Changes' notification: ${timeSinceLastNoChanges / 1000} sec`);
    console.log(`🔍 Lock Status:`, noChangesLock ? "ACTIVE" : "EXPIRED");

    const lockTTL = await redisClient.ttl("noChangesLock") * 1000;
    if (noChangesLock && lockTTL > 0) {
        console.warn(`⚠️ Skipping duplicate 'No Latest Changes' notification due to lock. Expires in ${lockTTL / 1000} sec`);
        return;
    }

    if (!lastNoChangesTime || timeSinceLastNoChanges > 120000) {
        console.log("✅ No latest changes detected. Sending notification...");

        dataStore.fileChangeData = {
            event_name: "No Latest Changes",
            message: "There are no new changes in the Google Drive folder.",
            status: "success",
            username: "Telex GDrive Notifier Bot"
        };

        await sendNotification(dataStore.fileChangeData);
        await redisClient.set("lastNoChangesSent", currentTime.toString());
        await redisClient.set("noChangesLock", "1", "PX", 120000);
    }
};