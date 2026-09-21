const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Guest users ke liye false rakhein
    },
    // Dynamic Reference (Article ya Battle)
    targetType: {
      type: String,
      required: true,
      enum: ['Article', 'Battle'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);