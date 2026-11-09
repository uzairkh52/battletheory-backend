const Article = require('../models/Article');
const Comment = require('../models/Comment');

// @desc    Get all articles
// @desc    Get all articles (Excluding heavy content field for lightning-fast lists)
const getArticles = async (req, res) => {
  try {
    const { tag } = req.query;
    let query = {};

    if (tag) {
      query.tags = { $regex: new RegExp(`^${tag.trim()}$`, 'i') };
    }

    // 🌟 '.select('-content')' yahan add kiya hai taake list API light rahe (No 43MB lag)
    const articles = await Article.find(query)
      .select('-content') 
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });
      
    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Get single article by ID or Slug with comments
// @route   GET /api/articles/:identifier
const getArticleByIdOrSlug = async (req, res) => {
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

    // Fetch comments related to this article
    const comments = await Comment.find({ targetId: article._id, targetType: 'Article' })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    const formattedComments = comments.map(c => {
      const obj = c.toObject();
      return {
        ...obj,
        text: obj.content || obj.text
      };
    });

    res.json({
      ...article.toObject(),
      comments: formattedComments,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Create new article
// @route   POST /api/articles
const createArticle = async (req, res) => {
  try {
    const article = new Article(req.body);
    await article.save();
    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Update existing article (PROTECTED & ADMIN ONLY)
// @route   PUT /api/articles/:id
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!updatedArticle) {
      return res.status(404).json({ message: 'Article not found' });
    }

    res.json(updatedArticle);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Delete article
// @route   DELETE /api/articles/:id
const deleteArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    await article.deleteOne();
    res.json({ message: 'Article removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Add comment to article (Supports both ID and Slug)
// @route   POST /api/articles/:identifier/comments
const addArticleComment = async (req, res) => {
  try {
    const { identifier } = req.params;

    let article;
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      article = await Article.findById(identifier);
    } 
    
    if (!article) {
      article = await Article.findOne({ 
        slug: { $regex: new RegExp(`^${identifier}$`, 'i') } 
      });
    }

    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const comment = new Comment({
      targetId: article._id,
      targetType: 'Article',
      author: req.user._id,
      content: req.body.content || req.body.text,
    });

    await comment.save();
    await comment.populate('author', 'username');

    // Refetch all updated comments for the article to return the complete state cleanly
    const comments = await Comment.find({ targetId: article._id, targetType: 'Article' })
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    const formattedComments = comments.map(c => {
      const obj = c.toObject();
      return {
        ...obj,
        text: obj.content || obj.text
      };
    });

    res.status(201).json({
      ...article.toObject(),
      comments: formattedComments,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Toggle Like on a Comment
// @route   POST /api/articles/comments/:commentId/like
const toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    const comment = await Comment.findById(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const userId = req.user._id;
    const isLiked = comment.likes.includes(userId);

    if (isLiked) {
      // Unlike
      comment.likes = comment.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      comment.likes.push(userId);
    }

    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Reply to a Comment
// @route   POST /api/articles/comments/:commentId/reply
const replyToComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const parentComment = await Comment.findById(commentId);
    
    if (!parentComment) {
      return res.status(404).json({ message: 'Parent comment not found' });
    }

    const reply = new Comment({
      targetId: parentComment.targetId,
      targetType: parentComment.targetType,
      author: req.user._id,
      content: req.body.content || req.body.text,
      parentComment: parentComment._id,
    });

    await reply.save();
    await reply.populate('author', 'username');

    res.status(201).json(reply);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// @desc    Edit a Comment
// @route   PATCH /api/articles/comments/:commentId
const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text, content } = req.body;
    const updatedText = content || text;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the author of the comment
    if (comment.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to edit this comment' });
    }

    comment.content = updatedText;
    await comment.save();

    const obj = comment.toObject();
    res.json({
      ...obj,
      text: obj.content,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// @desc    Delete a Comment and its replies
// @route   DELETE /api/articles/comments/:commentId
const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is author of the comment (or admin if you want to allow admin too)
    if (comment.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }

    // Delete the comment and any nested child replies associated with it
    await Comment.deleteMany({ $or: [{ _id: commentId }, { parentComment: commentId }] });

    res.json({ message: 'Comment and its replies removed successfully', _id: commentId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getArticles,
  getArticleByIdOrSlug,
  createArticle,
  updateArticle, // 🌟 Exported
  deleteArticle,
  addArticleComment,
  toggleCommentLike,
  replyToComment,
  editComment,
  deleteComment,
};