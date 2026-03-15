// Expense controller handles creating, reading, updating, and deleting expenses,
// plus computing per-member balances using the split calculator utilities.

import Expense from '../models/Expense.js';
import Group from '../models/Group.js';
import {
  calculateEqual,
  calculateBalances,
  simplifyDebts,
} from '../utils/splitCalculator.js';

// Helper: verify user is a member of the group
const verifyMembership = async (groupId, userId) => {
  const group = await Group.findById(groupId);
  if (!group || !group.isActive) return null;
  const isMember = group.members.some((m) => m.toString() === userId.toString());
  return isMember ? group : null;
};

// @route GET /api/expenses/group/:groupId
export const getExpensesByGroup = async (req, res) => {
  try {
    const group = await verifyMembership(req.params.groupId, req.user._id);
    if (!group) {
      return res.status(403).json({ message: 'Access denied or group not found' });
    }

    const expenses = await Expense.find({ group: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch expenses', error: error.message });
  }
};

// @route POST /api/expenses
export const createExpense = async (req, res) => {
  try {
    const { groupId, title, amount, paidBy, splitType, splits, category, notes, date } =
      req.body;

    if (!groupId || !title || !amount || !paidBy) {
      return res.status(400).json({ message: 'groupId, title, amount, and paidBy are required' });
    }

    const group = await verifyMembership(groupId, req.user._id);
    if (!group) {
      return res.status(403).json({ message: 'Access denied or group not found' });
    }

    let computedSplits;
    if (splitType === 'custom' && splits && splits.length > 0) {
      computedSplits = splits;
    } else {
      const memberIds = group.members.map((m) => m.toString());
      computedSplits = calculateEqual(amount, memberIds);
    }

    const expense = await Expense.create({
      group: groupId,
      title,
      amount,
      paidBy,
      splitType: splitType || 'equal',
      splits: computedSplits,
      category,
      notes,
      date: date || Date.now(),
    });

    const populated = await expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'splits.user', select: 'name email avatar' },
    ]);

    // 🔴 Real-time: broadcast new expense to all group members
    const io = req.app.get('io');
    if (io) io.to(`group:${groupId}`).emit('expense:new', populated);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

// @route PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await verifyMembership(expense.group, req.user._id);
    if (!group) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { title, amount, paidBy, splitType, splits, category, notes, date } = req.body;

    if (title) expense.title = title;
    if (amount) expense.amount = amount;
    if (paidBy) expense.paidBy = paidBy;
    if (category) expense.category = category;
    if (notes !== undefined) expense.notes = notes;
    if (date) expense.date = date;

    if (splitType) {
      expense.splitType = splitType;
      if (splitType === 'custom' && splits) {
        expense.splits = splits;
      } else if (splitType === 'equal') {
        const memberIds = group.members.map((m) => m.toString());
        expense.splits = calculateEqual(expense.amount, memberIds);
      }
    }

    const updated = await expense.save();
    const populated = await updated.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'splits.user', select: 'name email avatar' },
    ]);

    // 🔴 Real-time: broadcast updated expense to all group members
    const io = req.app.get('io');
    if (io) io.to(`group:${expense.group.toString()}`).emit('expense:updated', populated);

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

// @route DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const group = await verifyMembership(expense.group, req.user._id);
    if (!group) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const groupId = expense.group.toString();
    await expense.deleteOne();

    // 🔴 Real-time: broadcast deletion to all group members
    const io = req.app.get('io');
    if (io) io.to(`group:${groupId}`).emit('expense:deleted', { expenseId: req.params.id, groupId });

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense', error: error.message });
  }
};

// @route GET /api/expenses/balances/:groupId
export const getBalances = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId).populate(
      'members',
      'name email avatar'
    );

    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const expenses = await Expense.find({ group: group._id })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar');

    const memberIds = group.members.map((m) => m._id.toString());
    const balanceObj = calculateBalances(expenses, memberIds);
    const transactions = simplifyDebts(balanceObj);

    // Build member map for enriching response
    const memberMap = {};
    group.members.forEach((m) => {
      memberMap[m._id.toString()] = { _id: m._id, name: m.name, email: m.email, avatar: m.avatar };
    });

    const enrichedTransactions = transactions.map((t) => ({
      from: memberMap[t.from],
      to: memberMap[t.to],
      amount: t.amount,
    }));

    const enrichedBalances = Object.entries(balanceObj).map(([userId, amount]) => ({
      user: memberMap[userId],
      balance: amount,
    }));

    res.json({
      balances: enrichedBalances,
      transactions: enrichedTransactions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to calculate balances', error: error.message });
  }
};

