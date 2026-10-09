const express = require('express');
const router = express.Router();
const {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  seedRssNews,
  clearNews,
} = require('../controllers/newsController');
const { protect, admin } = require('../middleware/authMiddleware');

// Base routes (GET is public, POST requires Admin)
router.route('/')
  .get(getAllNews)
  .post(protect, admin, createNews);

// Manual RSS seed (Protected & Admin Only)
router.get('/seed-rss', protect, admin, seedRssNews);

// Clear Route (MUST BE BEFORE /:id aur /slug/:slug)
router.get('/clear', clearNews);

// Slug or Dynamic Fetch (MUST BE BEFORE /:id)
router.get('/slug/:slug', getNewsBySlug);

// ID Routes (GET is public, PUT & DELETE require Admin)
router.route('/:id')
  .get(getNewsById)
  .put(protect, admin, updateNews)
  .delete(protect, admin, deleteNews);

module.exports = router;