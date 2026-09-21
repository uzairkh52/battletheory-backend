const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  author: { type: String, default: 'Battle Theory Editorial' },
  featuredImage: { type: String },
  tags: [{ type: String }],
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Article', articleSchema);