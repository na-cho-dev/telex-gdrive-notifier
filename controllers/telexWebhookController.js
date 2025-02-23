import redisClient from "../database/redisClient.js";
import { getChanges } from "../service/googleDriveService.js";
import { checkIfNoChanges, sendNoChangesNotification } from "../service/checkIfNoChanges.js";

const telexWebhook = async (req, res) => {
    try {
        const { channel_id, return_url, settings } = req.body;
        const baseURL = req.protocol + "s://" + req.get("host");
        const folderId = settings.find(setting => setting.label === "Folder ID")?.default;

        console.log("Telex Webhook PINGED!!!");
        // console.log("Base URL:", baseURL);

        if (!folderId) {
            console.log("Folder ID is required!")
            return res.status(400).json({ message: "Folder ID is required" });
        }

        await redisClient.set("telex:return_url", return_url, "EX", 86400);
        await redisClient.set("drive:config", JSON.stringify({ baseURL, folderId }), "EX", 86400);

        // Publish a message indicating configuration has been updated
        await redisClient.publish("drive:configUpdated", "new config");

        if (await checkIfNoChanges()) {
            await sendNoChangesNotification();
        } else {
            await getChanges();
        }

        res.status(202).json({ status: "Success", message: "Google Drive webhook is active" });

    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export default telexWebhook;
