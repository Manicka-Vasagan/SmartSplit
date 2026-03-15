// Settlement controller records when one group member pays another.
// Fetches all settlements for a group and creates new settlement records.

import Settlement from '../models/Settlement.js';
import Group from '../models/Group.js';

// @route GET /api/settlements/group/:groupId
export const getSettlementsByGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlements = await Settlement.find({ group: req.params.groupId })
      .populate('payer', 'name email avatar')
      .populate('payee', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch settlements', error: error.message });
  }
};

// @route POST /api/settlements
export const createSettlement = async (req, res) => {
  try {
    const { groupId, payee, amount, note } = req.body;

    if (!groupId || !payee || !amount) {
      return res.status(400).json({ message: 'groupId, payee, and amount are required' });
    }

    const group = await Group.findById(groupId);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const settlement = await Settlement.create({
      group: groupId,
      payer: req.user._id,
      payee,
      amount,
      note,
    });

    const populated = await settlement.populate([
      { path: 'payer', select: 'name email avatar' },
      { path: 'payee', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create settlement', error: error.message });
  }
};
