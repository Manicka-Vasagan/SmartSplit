// Group controller handles CRUD for groups and member management.
// Only group members can view/modify a group; the creator can delete it.

import Group from '../models/Group.js';
import User from '../models/User.js';

// @route GET /api/groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user._id,
      isActive: true,
    })
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch groups', error: error.message });
  }
};

// @route POST /api/groups
export const createGroup = async (req, res) => {
  try {
    const { name, description, category } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const group = await Group.create({
      name,
      description,
      category,
      creator: req.user._id,
      members: [req.user._id],
    });

    const populated = await group.populate([
      { path: 'creator', select: 'name email avatar' },
      { path: 'members', select: 'name email avatar' },
    ]);

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
};

// @route GET /api/groups/:id
export const getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const isMember = group.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch group', error: error.message });
  }
};

// @route POST /api/groups/:id/add-member
export const addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const group = await Group.findById(req.params.id);
    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can add members' });
    }

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) {
      return res.status(404).json({ message: 'User not found with that email' });
    }

    const alreadyMember = group.members.some(
      (m) => m.toString() === userToAdd._id.toString()
    );
    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updated = await Group.findById(group._id)
      .populate('creator', 'name email avatar')
      .populate('members', 'name email avatar');

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
};

// @route DELETE /api/groups/:id
export const deleteGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group || !group.isActive) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the creator can delete this group' });
    }

    group.isActive = false;
    await group.save();

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
};
