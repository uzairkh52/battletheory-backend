const Category = require('../models/Category');

// Get all categories (optional query filter support: ?type=article ya ?type=battle)
const getCategories = async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
};

// 🌟 Get only Article categories
const getArticleCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ type: 'article' }).sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ error: err.message || 'Failed to fetch article categories' });
  }
};

// 🌟 Get only Battle categories
const getBattleCategories = async (req, res, next) => {
  try {
    const categories = await Category.find({ type: 'battle' }).sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ error: err.message || 'Failed to fetch battle categories' });
  }
};

// Create new category (supports `type`: 'article' or 'battle')
const createCategory = async (req, res, next) => {
  try {
    const { name, slug, type } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Default to 'article' agar type na mile
    const categoryType = type || 'article';

    if (!['article', 'battle'].includes(categoryType)) {
      return res.status(400).json({ error: 'Invalid category type. Must be article or battle' });
    }

    const generatedSlug =
      slug ||
      name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');

    const existingCategory = await Category.findOne({
      $or: [{ name, type: categoryType }, { slug: generatedSlug }],
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name or slug already exists' });
    }

    const category = new Category({
      name,
      slug: generatedSlug,
      type: categoryType, // 🌟 Save category type ('article' or 'battle')
    });

    await category.save();
    return res.status(201).json(category);
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(400).json({ error: err.message || 'Failed to create category' });
  }
};

// Delete category by ID
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    return res.status(200).json({ message: 'Category deleted successfully', id });
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ error: err.message || 'Failed to delete category' });
  }
};

module.exports = {
  getCategories,
  getArticleCategories,
  getBattleCategories,
  createCategory,
  deleteCategory,
};