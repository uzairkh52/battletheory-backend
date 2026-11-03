const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  summary: { type: String },
  videoEmbed: { type: String }, // 🌟 Yeh wali field add kar di gayi hai Facebook iframe ke liye
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  author: { type: String, default: 'Battle Theory Editorial' },
  featuredImage: { type: String },
  tags: [{ type: String }],
  views: { type: Number, default: 0 }
}, { timestamps: true });

// 🌟 Yeh index add karne se MongoDB RAM ki bajaye index se sort karega aur error khatam ho jayega
articleSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Article', articleSchema);