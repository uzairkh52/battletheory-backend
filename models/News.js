const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    category: { type: String, default: 'DEFENSE NEWS' }, // Generic default ya blank
    source: { type: String, required: true },
    link: { type: String },
    summary: { type: String, required: true },
    content: { type: String },
    image: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', newsSchema);