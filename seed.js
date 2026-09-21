const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Explicitly load .env from the root directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const Battle = require('./models/Battle');

const sampleBattles = [
  {
    title: "Battle of Stalingrad",
    slug: "battle-of-stalingrad",
    theater: "Eastern Front",
    year: 1942,
    summary: "One of the deadliest battles in human history and a major turning point on the Eastern Front.",
    content: "# Battle of Stalingrad\n\nThe Battle of Stalingrad was a major battle on the Eastern Front of World War II...",
    keyCommanders: ["Georgy Zhukov", "Friedrich Paulus"],
    featuredImage: "https://example.com/stalingrad.jpg"
  },
  {
    title: "Battle of Midway",
    slug: "battle-of-midway",
    theater: "Pacific Theater",
    year: 1942,
    summary: "A decisive naval battle in the Pacific Theater, turning the tide against the Imperial Japanese Navy.",
    content: "# Battle of Midway\n\nFought six months after Pearl Harbor, the US Navy defeated an attacking fleet...",
    keyCommanders: ["Chester W. Nimitz", "Isoroku Yamamoto"],
    featuredImage: "https://example.com/midway.jpg"
  }
];

const seedDB = async () => {
  try {
    console.log("Connecting to Database...");
    
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    await Battle.deleteMany(); 
    await Battle.insertMany(sampleBattles);
    
    console.log("Database Seeded Successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err.message);
    process.exit(1);
  }
};

seedDB();