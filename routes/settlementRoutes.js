// Express router for settlement routes — all protected by JWT.

import express from 'express';
import { getSettlementsByGroup, createSettlement } from '../controllers/settlementController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/group/:groupId', getSettlementsByGroup);
router.post('/', createSettlement);

export default router;
