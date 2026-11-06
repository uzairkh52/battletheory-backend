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
    videoEmbed: { type: String, default: '' }, // 🌟 Video Embed Field Added
    year: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    theater: { 
      type: String, 
      required: false 
    },
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