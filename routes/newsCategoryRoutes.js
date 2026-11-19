const express = require('express');
const router = express.Router();
const {
  getAllNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
} = require('../controllers/newsCategoryController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
  .get(getAllNewsCategories)
  .post(protect, admin, createNewsCategory);

router.route('/:id')
  .put(protect, admin, updateNewsCategory)
  .delete(protect, admin, deleteNewsCategory);

module.exports = router;