const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['event', 'announcement', 'discussion'],
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled', 'closed'],
      default: 'active'
    },
    location: {
      type: String,
      trim: true
    },
    eventDate: {
      type: Date
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    collection: 'posts',
    timestamps: true
  }
);

module.exports = mongoose.model('Post', postSchema);