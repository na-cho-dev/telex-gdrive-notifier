import express from 'express';
const router = express.Router();
import telexWebhook from '../controllers/telexWebhookController.js';

router.post('/telex-webhook', telexWebhook);

export default router;