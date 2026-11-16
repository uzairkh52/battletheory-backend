require('dotenv').config();
const mongoose = require('mongoose');
const News = require('../models/News');

const generateSlug = (text) =>
  text
    .toString()
    .normalize('NFD')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const sampleNews = [
  {
    title: 'Naval Escort Modernization and Distributed Maritime Lethality',
    category: 'Naval Strategy',
    author: 'BattleTheory Editorial',
    source: 'BattleTheory Original',
    summary:
      'How modern surface combatants are shifting from single-hull flagship reliance toward distributed sensor-shooter networks.',
    content: `<p>Modern naval warfare increasingly favors distributed lethality over concentrating high-value sensors and interceptors on a handful of large hulls. By linking smaller surface combatants, unmanned surface vessels, and maritime patrol aircraft through resilient datalinks, task forces can complicate enemy targeting solutions.</p>
<p>Historical precedent shows that escort vessels often carry disproportionate operational burden during prolonged sea-lane protection campaigns. Modular vertical launch cells, electronic warfare suites, and automated point-defense systems allow mid-sized frigates and corvettes to perform multi-role missions without unsustainable maintenance overhead.</p>`,
    tacticalAnalysis:
      'BattleTheory Assessment: In World War II convoy and carrier-screen operations, survivability depended as much on radar coordination and damage control doctrine as on raw gun caliber. Today, networked fire control plays the same force-multiplying role.',
    isPublished: true,
  },
  {
    title: 'Counter-UAS Electronic Warfare and Low-Cost Air Defense',
    category: 'Air & Missile Defense',
    author: 'BattleTheory Editorial',
    source: 'BattleTheory Original',
    summary:
      'Why cost-per-engagement economics are reshaping short-range air defense across contemporary battlefields.',
    content: `<p>The proliferation of commercial-grade and tactical unmanned aerial vehicles has exposed a sharp cost asymmetry in air defense. Expending high-value surface-to-air interceptors against inexpensive loitering munitions or reconnaissance drones quickly strains stockpiles.</p>
<p>Defense planners are therefore pairing multi-band radar and electro-optical tracking with directed energy, kinetic proximity fuzes, and directional electronic warfare. Layered defense—where low-cost effectors handle routine targets and high-end interceptors remain reserved for complex ballistic or cruise threats—is becoming standard doctrine.</p>`,
    tacticalAnalysis:
      'BattleTheory Assessment: Just as WWII anti-aircraft doctrine evolved from heavy flak batteries toward radar-laid proximity-fused fire for coastal and task-force defense, modern C-UAS relies on rapid sensor-to-shooter integration.',
    isPublished: true,
  },
  {
    title: 'Armor Survivability, Active Protection, and Battlefield Logistics',
    category: 'Armored Warfare',
    author: 'BattleTheory Editorial',
    source: 'BattleTheory Original',
    summary:
      'Balancing active protection systems, signature management, and fuel-supply sustainability for mechanized formations.',
    content: `<p>Main battle tanks and infantry fighting vehicles operate in an environment saturated with precision top-attack munitions and persistent overhead ISR. Passive composite armor alone rarely guarantees survivability without hard-kill and soft-kill active protection systems.</p>
<p>Equally decisive is sustainment. Heavier protection packages and auxiliary power units increase fuel consumption and recovery complexity, making mobile maintenance battalions and forward logistics hubs critical to maintaining operational tempo.</p>`,
    tacticalAnalysis:
      'BattleTheory Assessment: Operational history repeatedly demonstrates that mechanical reliability, spare-parts flow, and recovery capacity determine campaign endurance as decisively as frontal armor thickness.',
    isPublished: true,
  },
];

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI or MONGODB_URI missing in .env');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    for (const item of sampleNews) {
      const slug = generateSlug(item.title);
      await News.findOneAndUpdate(
        { slug },
        { $setOnInsert: { ...item, slug } },
        { upsert: true, new: true }
      );
      console.log(`Seeded / verified: ${slug}`);
    }

    console.log('Done! Original news entries are ready.');
  } catch (err) {
    console.error('Seed error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();