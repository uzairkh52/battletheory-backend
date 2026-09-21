const Battle = require('../models/Battle');

// @desc    Get all battles
// @route   GET /api/battles
const getBattles = async (req, res) => {
  try {
    const battles = await Battle.find().sort({ createdAt: -1 });
    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single battle by ID or Slug
// @route   GET /api/battles/:idOrSlug
const getBattleByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let battle;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      battle = await Battle.findById(idOrSlug);
    } else {
      battle = await Battle.findOne({ slug: idOrSlug });
    }

    if (!battle) {
      return res.status(404).json({ message: 'Battle record not found' });
    }

    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new battle record
// @route   POST /api/battles
const createBattle = async (req, res) => {
  try {
    const {
      name,
      title,
      year,
      location,
      theater,
      description,
      summary,
      coordinates,
      tacticalPhases,
    } = req.body;

    const battleName = name || title;

    if (!battleName) {
      return res.status(400).json({ message: 'Battle name is required' });
    }

    const generatedSlug =
      battleName
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now();

    const newBattle = new Battle({
      name: battleName,
      title: battleName,
      slug: generatedSlug,
      year: String(year),
      location: location || 'Unknown Location',
      theater: theater || 'European',
      description: description || summary || '',
      coordinates: {
        lat: Number(coordinates?.lat || 0),
        lng: Number(coordinates?.lng || 0),
      },
      tacticalPhases: tacticalPhases || [],
    });

    const savedBattle = await newBattle.save();
    res.status(201).json(savedBattle);
  } catch (error) {
    console.error('Create Battle Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a battle record
// @route   DELETE /api/battles/:id
const deleteBattle = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) {
      return res.status(404).json({ message: 'Battle record not found' });
    }

    await Battle.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Battle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Export ALL functions explicitly
module.exports = {
  getBattles,
  getBattleByIdOrSlug,
  createBattle,
  deleteBattle,
};