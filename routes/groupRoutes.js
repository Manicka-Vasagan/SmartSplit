// Express router for group routes — all routes require JWT authentication.
// IMPORTANT: /join/:inviteCode must be declared BEFORE /:id to avoid conflicts.

import express from 'express';
import {
  getGroups,
  createGroup,
  getGroupById,
  addMember,
  deleteGroup,
  joinByInviteCode,
  regenerateInviteCode,
} from '../controllers/groupController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getGroups);
router.post('/', createGroup);

// ── Invite routes (must be BEFORE /:id) ──────────────────────────────
router.get('/join/:inviteCode', joinByInviteCode);
router.post('/:id/regenerate-invite', regenerateInviteCode);

// ── Standard group routes ─────────────────────────────────────────────
router.get('/:id', getGroupById);
router.post('/:id/add-member', addMember);
router.delete('/:id', deleteGroup);

export default router;
