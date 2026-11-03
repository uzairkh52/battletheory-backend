const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const battleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String },
    slug: { type: String },
    featuredImage: { type: String },
    year: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    // Theater ko String type kar diya hai taake plain text ("Pacific", "European") easily save ho sakay
    theater: { 
      type: String, 
      required: false 
    },
    // 🌟 Yahan summary field add kar di gayi hai
    summary: { 
      type: String, 
      default: '' 
    },
    description: { type: String, required: true },
    tacticalPhases: [
      {
        phaseName: String,
        details: String,
      },
    ],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Battle', battleSchema);