const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String, required: true, unique: true },
  summary: { type: String, required: true },
  category: { type: String, default: 'Military AI & Defense' },
  publishedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('News', newsSchema);