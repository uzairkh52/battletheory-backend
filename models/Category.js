const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    // 🌟 Article vs Battle categories ko isolate karne ke liye
    type: {
      type: String,
      enum: ['article', 'battle'],
      default: 'article',
      required: [true, 'Category type is required'],
    },
  },
  { timestamps: true }
);

categorySchema.pre('validate', function () {
  if (this.name && !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }
});

module.exports = mongoose.model('Category', categorySchema);