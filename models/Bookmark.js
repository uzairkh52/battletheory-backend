const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemType: { type: String, enum: ['battle', 'article', 'news'], required: true },
  itemId: { type: String, required: true }, // Can be MongoDB ObjectId or slug string
  title: { type: String, required: true },
  slug: { type: String, required: true },
  thumbnail: { type: String },
  theater: { type: String },
  year: { type: String },
  summary: { type: String },
}, { timestamps: true });

// Prevent duplicate bookmarks for the same user and item
bookmarkSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);