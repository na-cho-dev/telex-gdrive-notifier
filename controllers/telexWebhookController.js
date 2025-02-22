import { getChanges } from "../service/googleDriveService.js";
import redisClient from "../database/redisClient.js";
import { dataStore } from "../service/dataStore.js";
import { sendNotification } from "../service/sendNotification.js";


const telexWebhook = async (req, res) => {
    try {
        const { channel_id, return_url, settings } = req.body;
        const baseURL = req.protocol + "://" + req.get("host");
        const folderId = settings.find(setting => setting.label === "Folder ID")?.default;

        console.log("Telex Webhook PINGED!!!");

        if (!folderId) {
            return res.status(400).json({ message: "Folder ID is required" });
        }

        await redisClient.set("telex:return_url", return_url, "EX", 86400);
        await redisClient.set("drive:config", JSON.stringify({ baseURL, folderId }), "EX", 86400);
        // console.log("✅ Configuration stored:", { baseURL, folderId });
        // await redisClient.del("drive:config");

        // Publish a message indicating configuration has been updated
        await redisClient.publish("drive:configUpdated", "new config");

        await getChanges();

        // Send a response back to the caller
        const data = dataStore.fileChangeData
        await sendNotification(data); 

        res.status(202).json({ status: "Success", message: "Google Drive webhook is active" });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default telexWebhook;
