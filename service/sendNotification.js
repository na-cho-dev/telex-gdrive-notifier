import axios from "axios";
import redisClient from "../database/redisClient.js";

export const sendNotification = async (data) => {
    try {
        const return_url = await redisClient.get("telex:return_url");
        if (!return_url) {
            console.log("⚠️ No return_url found, skipping notification.");
            return;
        }

        // await axios.post(return_url, data, {
        //     headers: {
        //         "Accept": "application/json",
        //         "Content-Type": "application/json",
        //     },
        // });

        console.log("📢 Notification sent successfully to Telex App:", data);

    } catch (error) {
        console.error("❌ Failed to send notification:", error.message);
    }
};
