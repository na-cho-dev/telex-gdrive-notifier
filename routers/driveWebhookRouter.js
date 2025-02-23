import express from "express";
const router = express.Router();
import { driveWebhook } from "../controllers/driveWebhookController.js";

router.post("/gdrive-webhook", driveWebhook);

export default router;
