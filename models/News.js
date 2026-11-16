const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      default: 'Defense',
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Full article content is required'],
    },
    tacticalAnalysis: {
      type: String,
      default: '', // Optional BattleTheory original assessment/context
    },
    image: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: 'BattleTheory Editorial',
    },
    source: {
      type: String,
      default: 'BattleTheory Original',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Fast lookup & sorting index
newsSchema.index({ isPublished: 1, createdAt: -1 });

module.exports = mongoose.model('News', newsSchema);