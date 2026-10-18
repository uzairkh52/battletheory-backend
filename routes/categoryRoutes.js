const express = require('express');
const router = express.Router();
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// Get All Categories
router.get('/', getCategories);

// Create Category
router.post('/', createCategory);

// Delete Category
router.delete('/:id', deleteCategory);

module.exports = router;