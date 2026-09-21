const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const { protect } = require('../middleware/authMiddleware');

// CREATE COMMENT (Protected)
router.post('/', protect, async (req, res) => {
  try {
    const { content, targetType, targetId } = req.body;

    if (!content || !targetType || !targetId) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const comment = new Comment({
      content,
      author: req.user._id,
      targetType,
      targetId,
    });

    await comment.save();
    
    // Populate author details for immediate frontend rendering
    await comment.populate('author', 'username');

    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET COMMENTS FOR A SPECIFIC ARTICLE OR BATTLE (Public)
router.get('/:targetId', async (req, res) => {
  try {
    const comments = await Comment.find({ targetId: req.params.targetId })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE COMMENT (Protected - Only Author or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;