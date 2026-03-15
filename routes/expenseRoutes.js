// Express router for expense routes. Note the order of routes matters:
// /balances/:groupId must come before /:id to avoid conflicts.

import express from 'express';
import {
  getExpensesByGroup,
  createExpense,
  updateExpense,
  deleteExpense,
  getBalances,
} from '../controllers/expenseController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/balances/:groupId', getBalances);
router.get('/group/:groupId', getExpensesByGroup);
router.post('/', createExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

export default router;
