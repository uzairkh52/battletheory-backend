const mongoose = require('mongoose');
const NewsCategory = require('../models/NewsCategory');
const News = require('../models/News');

const generateSlug = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Get All News Categories (with optional news count)
const getAllNewsCategories = async (req, res) => {
  try {
    const filter = req.query.all === 'true' ? {} : { isActive: true };
    const categories = await NewsCategory.find(filter).sort({ order: 1, name: 1 });

    const counts = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]);

    const countMap = new Map();
    counts.forEach((entry) => {
      if (entry._id) {
        countMap.set(String(entry._id).toLowerCase(), entry.count);
      }
    });

    const formatted = categories.map((cat) => {
      const obj = cat.toObject();
      obj.newsCount = countMap.get(obj.name.toLowerCase()) || 0;
      return obj;
    });

    res.status(200).json({ categories: formatted });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news categories', error: error.message });
  }
};

// 2. Create News Category (Admin Only)
const createNewsCategory = async (req, res) => {
  try {
    const { name, slug: customSlug, description, order, isActive } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const cleanName = name.trim();
    const slug = generateSlug(customSlug || cleanName);
    if (!slug) {
      return res.status(400).json({ message: 'Invalid category name or slug' });
    }

    const existing = await NewsCategory.findOne({
      $or: [{ slug }, { name: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }],
    });

    if (existing) {
      return res.status(409).json({ message: 'This news category already exists' });
    }

    const category = await NewsCategory.create({
      name: cleanName,
      slug,
      description: description ? String(description).trim() : '',
      order: Number.isFinite(Number(order)) ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create news category', error: error.message });
  }
};

// 3. Update News Category (Admin Only)
const updateNewsCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await NewsCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }

    const oldName = category.name;
    const payload = {};

    if (req.body.name !== undefined) {
      const cleanName = String(req.body.name).trim();
      if (!cleanName) {
        return res.status(400).json({ message: 'Category name cannot be empty' });
      }
      payload.name = cleanName;
      payload.slug = generateSlug(req.body.slug || cleanName);
    } else if (req.body.slug !== undefined) {
      payload.slug = generateSlug(req.body.slug);
    }

    if (req.body.description !== undefined) {
      payload.description = String(req.body.description).trim();
    }
    if (req.body.order !== undefined && Number.isFinite(Number(req.body.order))) {
      payload.order = Number(req.body.order);
    }
    if (req.body.isActive !== undefined) {
      payload.isActive = Boolean(req.body.isActive);
    }

    if (payload.slug) {
      const duplicate = await NewsCategory.findOne({
        slug: payload.slug,
        _id: { $ne: category._id },
      });
      if (duplicate) {
        return res.status(409).json({ message: 'Another category already uses this slug' });
      }
    }

    const updated = await NewsCategory.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    // Agar category ka naam badla hai toh existing news records ka category label bhi sync karein
    if (updated.name && updated.name !== oldName) {
      await News.updateMany({ category: oldName }, { $set: { category: updated.name } });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update news category', error: error.message });
  }
};

// 4. Delete News Category (Admin Only)
const deleteNewsCategory = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const category = await NewsCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'News category not found' });
    }

    const linkedCount = await News.countDocuments({ category: category.name });
    if (linkedCount > 0 && req.query.force !== 'true') {
      return res.status(400).json({
        message: `Cannot delete "${category.name}" because ${linkedCount} news briefing(s) use it. Reassign them first or pass ?force=true.`,
        linkedCount,
      });
    }

    await category.deleteOne();
    res.status(200).json({
      message: 'News category deleted successfully',
      id: req.params.id,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete news category', error: error.message });
  }
};

module.exports = {
  getAllNewsCategories,
  createNewsCategory,
  updateNewsCategory,
  deleteNewsCategory,
};