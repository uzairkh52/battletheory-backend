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
      required: false,
    },
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
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    parentComment: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);