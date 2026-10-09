const express = require('express');
const router = express.Router();
const {
  getArticles,
  getArticleByIdOrSlug,
  createArticle,
  updateArticle, // 🌟 Imported
  deleteArticle,
  addArticleComment,
  toggleCommentLike,
  replyToComment,
  editComment,
  deleteComment,
} = require('../controllers/articleController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET ALL ARTICLES
router.get('/', getArticles);

// GET SINGLE ARTICLE BY ID OR SLUG WITH COMMENTS
router.get('/:identifier', getArticleByIdOrSlug);

// CREATE ARTICLE (PROTECTED & ADMIN ONLY)
router.post('/', protect, admin, createArticle);

// UPDATE ARTICLE (PROTECTED & ADMIN ONLY) 🌟 Added this route
router.put('/:id', protect, admin, updateArticle);

// DELETE ARTICLE (PROTECTED & ADMIN ONLY)
router.delete('/:id', protect, admin, deleteArticle);

// POST COMMENT TO SPECIFIC ARTICLE (PROTECTED FOR LOGGED-IN USERS - Supports ID or Slug)
router.post('/:identifier/comments', protect, addArticleComment);

// LIKE / UNLIKE A COMMENT (PROTECTED)
router.post('/comments/:commentId/like', protect, toggleCommentLike);

// REPLY TO A COMMENT (PROTECTED)
router.post('/comments/:commentId/reply', protect, replyToComment);

// EDIT A COMMENT (PROTECTED)
router.patch('/comments/:commentId', protect, editComment);

// DELETE A COMMENT (PROTECTED)
router.delete('/comments/:commentId', protect, deleteComment);

module.exports = router;