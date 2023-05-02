import express from 'express';

import { verifyWebhook, processNotification } from '../controllers/webhookController.js';

const router = express.Router();

router.get('/', verifyWebhook);
router.post('/', processNotification);

export default router;
