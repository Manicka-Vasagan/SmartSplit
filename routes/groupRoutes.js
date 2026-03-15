// Express router for group routes — all routes require JWT authentication.

import express from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
  addMember,
  deleteGroup,
} from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);
router.get('/:id', getGroupById);
router.post('/:id/add-member', addMember);
router.delete('/:id', deleteGroup);

export default router;
