const mongoose = require('mongoose');

function estimateReadingTime(...texts) {
  const words = texts
    .filter(Boolean)
    .join(' ')
    .replace(/<[^>]*>/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

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
    tags: {
      type: [String],
      default: [],
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
      default: '',
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    imageAlt: {
      type: String,
      default: '',
      trim: true,
    },
    author: {
      type: String,
      default: 'BattleTheory Editorial',
      trim: true,
    },
    source: {
      type: String,
      default: 'BattleTheory Original',
      trim: true,
    },
    sourceUrl: {
      type: String,
      default: '',
      trim: true,
    },
    readingTime: {
      type: Number,
      default: 1,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

newsSchema.pre('validate', function () {
  if (!this.imageAlt && this.title) {
    this.imageAlt = this.title;
  }

  if (this.isPublished && !this.publishedAt) {
    this.publishedAt = this.createdAt || new Date();
  }

  this.readingTime = estimateReadingTime(this.content, this.tacticalAnalysis);
});

newsSchema.index({ isPublished: 1, createdAt: -1 });
newsSchema.index({ slug: 1 }, { unique: true });

module.exports = mongoose.model('News', newsSchema);