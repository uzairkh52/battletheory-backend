const Battle = require('../models/Battle');

// @desc Get all battles
// @route GET /api/battles
const getBattles = async (req, res) => {
  try {
    const battles = await Battle.find().sort({ createdAt: -1 });
    res.status(200).json(battles);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Get single battle by ID or Slug
// @route GET /api/battles/:idOrSlug
const getBattleByIdOrSlug = async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let battle;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      battle = await Battle.findById(idOrSlug).populate('comments.author', 'username');
    } else {
      battle = await Battle.findOne({ slug: idOrSlug }).populate('comments.author', 'username');
    }

    if (!battle) {
      return res.status(404).json({ message: 'Battle record not found' });
    }

    res.status(200).json(battle);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc Create a new battle record
// @route POST /api/battles
const createBattle = async (req, res) => {
  try {
    const {
      name,
      title,
      featuredImage,
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
      featuredImage: featuredImage || '',
      year: String(year),
      location: location || 'Unknown Location',
      theater: theater || 'European',
      summary: summary || '',          // 🌟 Dedicated summary assignment fixed
      description: description || '',  // 🌟 Dedicated description assignment fixed
      coordinates: {
        lat: Number(coordinates?.lat || coordinates?.[0] || 0),
        lng: Number(coordinates?.lng || coordinates?.[1] || 0),
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

// @desc Update a battle record
// @route PUT /api/battles/:id
const updateBattle = async (req, res) => {
  try {
    const {
      name,
      title,
      featuredImage,
      year,
      location,
      theater,
      description,
      summary,
      coordinates,
      tacticalPhases,
    } = req.body;

    const battle = await Battle.findById(req.params.id);
    if (!battle) {
      return res.status(404).json({ message: 'Battle record not found' });
    }

    const battleName = name || title || battle.name;

    battle.name = battleName;
    battle.title = battleName;
    if (featuredImage !== undefined) battle.featuredImage = featuredImage;
    if (year) battle.year = String(year);
    if (location) battle.location = location;
    if (theater) battle.theater = theater;
    
    // 🌟 Independent fields update fixed
    if (summary !== undefined) battle.summary = summary;
    if (description !== undefined) battle.description = description;

    if (coordinates) {
      battle.coordinates = {
        lat: Number(coordinates.lat ?? coordinates[0] ?? battle.coordinates?.lat ?? 0),
        lng: Number(coordinates.lng ?? coordinates[1] ?? battle.coordinates?.lng ?? 0),
      };
    }
    if (tacticalPhases) {
      battle.tacticalPhases = tacticalPhases;
    }

    const updatedBattle = await battle.save();
    res.status(200).json(updatedBattle);
  } catch (error) {
    console.error('Update Battle Error:', error);
    res.status(400).json({ message: error.message });
  }
};

// @desc Delete a battle record
// @route DELETE /api/battles/:id
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

// --- BATTLE COMMENT CONTROLLERS ---

const addBattleComment = async (req, res) => {
  try {
    const battle = await Battle.findById(req.params.id);
    if (!battle) return res.status(404).json({ message: 'Battle not found' });

    const { text, parentComment } = req.body;

    const newComment = {
      author: req.user._id,
      text,
      parentComment: parentComment || null,
      likes: [],
      createdAt: new Date(),
    };

    battle.comments.push(newComment);
    await battle.save();
    await battle.populate('comments.author', 'username');

    const addedComment = battle.comments[battle.comments.length - 1];
    res.status(201).json(addedComment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const toggleLikeBattleComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user._id;

    const battle = await Battle.findOne({ 'comments._id': commentId });
    if (!battle) return res.status(404).json({ message: 'Comment not found' });

    const comment = battle.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const likeIndex = comment.likes.indexOf(userId);
    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await battle.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const editBattleComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    const battle = await Battle.findOne({ 'comments._id': commentId });
    if (!battle) return res.status(404).json({ message: 'Comment not found' });

    const comment = battle.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.text = text;
    await battle.save();
    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteBattleComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const battle = await Battle.findOne({ 'comments._id': commentId });
    if (!battle) return res.status(404).json({ message: 'Comment not found' });

    const comment = battle.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    battle.comments = battle.comments.filter(
      (c) => c._id.toString() !== commentId && c.parentComment?.toString() !== commentId
    );

    await battle.save();
    res.status(200).json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getBattles,
  getBattleByIdOrSlug,
  createBattle,
  updateBattle,
  deleteBattle,
  addBattleComment,
  toggleLikeBattleComment,
  editBattleComment,
  deleteBattleComment,
};