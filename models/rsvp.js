const mongoose = require('mongoose');

const rsvpSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    status: {
      type: String,
      enum: ['going', 'interested', 'not going'],
      default: 'going'
    }
  },
  {
    collection: 'rsvps',
    timestamps: true
  }
);

module.exports = mongoose.model('RSVP', rsvpSchema);