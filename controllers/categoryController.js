const Category = require('../models/Category');

// Get all categories
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    return res.status(200).json(categories);
  } catch (err) {
    if (typeof next === 'function') return next(err);
    return res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
};

// Create new category
const createCategory = async (req, res, next) => {
  try {
    const { name, slug } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
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
      $or: [{ name }, { slug: generatedSlug }],
    });

    if (existingCategory) {
      return res.status(400).json({ error: 'Category with this name or slug already exists' });
    }

    const category = new Category({
      name,
      slug: generatedSlug,
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
  createCategory,
  deleteCategory,
};