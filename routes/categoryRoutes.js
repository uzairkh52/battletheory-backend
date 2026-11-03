const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const {
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// 🌟 Get All Categories (General)
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌟 Get ONLY Article Categories (/api/categories/articles)
router.get('/articles', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'article' }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🌟 Get ONLY Battle Categories (/api/categories/battles)
router.get('/battles', async (req, res) => {
  try {
    const categories = await Category.find({ type: 'battle' }).sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create Category (req.body mein `type: "article"` ya `"battle"` pass karein)
router.post('/', createCategory);

// Delete Category
router.delete('/:id', deleteCategory);

module.exports = router;