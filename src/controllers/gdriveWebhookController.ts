import { Request, Response } from "express";
import { getChanges } from "../service/googleDriveService";

const gdriveWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const resourceState = req.headers["x-goog-resource-state"];
    const channelId = req.headers["x-goog-channel-id"];
    const channelToken = req.headers["x-goog-channel-token"];

    console.log("🔔 Google Drive webhook received:", {
      resourceState,
      channelId,
      channelToken,
    });

    if (resourceState === "sync") {
      console.log("📡 Sync message received - webhook setup confirmed");
      res.status(200).json({ message: "Sync acknowledged" });
      return;
    }

    if (resourceState === "update") {
      console.log("🔄 Update detected - fetching changes...");
      await getChanges();
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Error processing Google Drive webhook:", errorMessage);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export default gdriveWebhook;
