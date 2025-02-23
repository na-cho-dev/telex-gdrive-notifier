import { getChanges } from "../service/googleDriveService.js";

export const driveWebhook = async (req, res) => {
  const resourceState = req.headers["x-goog-resource-state"];
  const channelId = req.headers["x-goog-channel-id"];
  const receivedToken = req.headers["x-goog-channel-token"];

  // console.log("🔔 Webhook Triggered: ", { resourceState, channelId });

  if (["add", "update", "trash"].includes(resourceState)) {
    await getChanges(); // Fetch the latest changes
  }
};
