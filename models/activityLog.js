const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      trim: true
    },
    target: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    collection: 'activityLogs',
    timestamps: true
  }
);

module.exports = mongoose.model('ActivityLog', activitySchema);