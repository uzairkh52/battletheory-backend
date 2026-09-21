const express = require('express');
const router = express.Router();
const Article = require('../models/Article');
const { protect } = require('../middleware/authMiddleware');

// GET ALL ARTICLES
router.get('/', async (req, res) => {
  try {
    const articles = await Article.find().populate('category', 'name slug').sort({ createdAt: -1 });
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET SINGLE ARTICLE BY ID OR SLUG WITH COMMENTS
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    
    let article;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(identifier).populate('category', 'name slug');
    } 
    
    if (!article) {
      article = await Article.findOne({ 
        slug: { $regex: new RegExp(`^${identifier}$`, 'i') } 
      }).populate('category', 'name slug');
    }

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Article ke related comments fetch karein
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ targetId: article._id, targetType: 'Article' })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    // Frontend rendering issue fix (c.content -> c.text fallback)
    const formattedComments = comments.map(c => {
      const obj = c.toObject();
      return {
        ...obj,
        text: obj.content || obj.text // Frontend compatibility
      };
    });

    res.json({
      ...article.toObject(),
      comments: formattedComments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE ARTICLE (PROTECTED)
router.post('/', protect, async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST COMMENT TO ARTICLE (UPDATED FOR MONGOOSE SCHEMA)
router.post('/:id/comments', async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    
    // Schema fields match: content, targetType, targetId
    const commentData = {
      content: req.body.text || req.body.content,
      targetId: req.params.id,
      targetType: 'Article',
    };

    // Attach author if authenticated
    if (req.user && req.user._id) {
      commentData.author = req.user._id;
    }

    const comment = new Comment(commentData);
    await comment.save();

    res.status(201).json(comment);
  } catch (err) {
    console.error('Comment Error:', err.message);
    res.status(400).json({ error: err.message });
  }
});

// DELETE ARTICLE BY ID (PROTECTED)
router.delete('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;