import express, { Router } from "express";
import telexWebhook from "../controllers/telexWebhookController";
import gdriveWebhook from "../controllers/gdriveWebhookController";

const webhookRouter: Router = express.Router();

webhookRouter.post("/tick", telexWebhook);
webhookRouter.post("/gdrive-webhook", gdriveWebhook);

export default webhookRouter;
