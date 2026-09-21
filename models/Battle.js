const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String }, // Frontend compatibility ke liye
    slug: { type: String },  // Duplicate index error se bachne ke liye
    year: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: {
      lat: { type: Number, default: 0 },
      lng: { type: Number, default: 0 },
    },
    theater: { 
      type: String, 
      enum: ['Pacific', 'European', 'Eastern Front', 'North Africa', 'Other'], 
      default: 'European' 
    },
    description: { type: String, required: true },
    tacticalPhases: [
      {
        phaseName: String,
        details: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Battle', battleSchema);