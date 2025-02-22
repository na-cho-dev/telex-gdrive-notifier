import express from 'express';
const router = express.Router();
import telexWebhook from '../controllers/telexWebhookController.js';

router.post('/tick', telexWebhook);

export default router;