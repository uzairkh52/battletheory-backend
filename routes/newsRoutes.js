const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  clearNews,
} = require('../controllers/newsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public list & Admin create
router.route('/')
  .get(getAllNews)
  .post(protect, admin, createNews);

// Protected bulk clear
router.delete('/clear', protect, admin, clearNews);

// Public detail by slug
router.get('/slug/:slug', getNewsBySlug);

// Single record operations
router.route('/:id')
  .get(getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews);

module.exports = router;