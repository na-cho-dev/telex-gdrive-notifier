import express from 'express';
const router = express.Router();
import jsonIntegration from '../controllers/jsonIntegrationController.js';

router.get('/integration.json', jsonIntegration);

export default router;