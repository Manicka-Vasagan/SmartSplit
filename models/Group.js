// Mongoose schema for Group. Each group has a creator, a list of member references,
// a category enum, an isActive flag for soft deletion, and a unique inviteCode
// used to join via shareable link.

import mongoose from 'mongoose';
import crypto from 'crypto';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Group name is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      enum: ['Trip', 'Roommates', 'Friends', 'Other'],
      default: 'Other',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // Unique short code used to generate a shareable invite link.
    // Automatically generated on group creation.
    inviteCode: {
      type: String,
      unique: true,
      default: () => crypto.randomBytes(6).toString('hex'), // e.g. "a3f9c2e1b4d7"
    },
  },
  { timestamps: true }
);

const Group = mongoose.model('Group', groupSchema);
export default Group;
