const mongoose = require('mongoose');
const News = require('../models/News');

const generateSlug = (text) => {
  return text
    .toString()
    .normalize('NFD')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// 1. Get All Published News (Paginated + Category Filter)
const getAllNews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter = req.query.all === 'true' ? {} : { isPublished: true };
    if (req.query.category && req.query.category !== 'all') {
      filter.category = req.query.category;
    }

    const [news, totalNews] = await Promise.all([
      News.find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip(skip)
        .limit(limit),
      News.countDocuments(filter),
    ]);

    res.status(200).json({
      news,
      currentPage: page,
      totalPages: Math.ceil(totalNews / limit),
      hasMore: skip + news.length < totalNews,
      totalNews,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news', error: error.message });
  }
};

// 2. Get Single News By ID
const getNewsById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'News record not found' });
    }
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news item', error: error.message });
  }
};

// 3. Get Single News By Slug
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (isValidId(slug)) {
      const byId = await News.findById(slug);
      if (byId) return res.status(200).json(byId);
    }

    const newsItem = await News.findOne({ slug });
    if (!newsItem) {
      return res.status(404).json({ message: 'News report not found' });
    }

    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news by slug', error: error.message });
  }
};

// 4. Create Original News (Admin Only)
const createNews = async (req, res) => {
  try {
    const {
      title,
      summary,
      content,
      tacticalAnalysis,
      category,
      image,
      imageUrl,
      thumbnail,
      author,
      isPublished,
    } = req.body;

    if (!title || !summary || !content) {
      return res.status(400).json({ message: 'Title, summary, and content are required' });
    }

    const slug = generateSlug(title);
    if (!slug) {
      return res.status(400).json({ message: 'Invalid title for slug generation' });
    }

    const existing = await News.findOne({ slug });
    if (existing) {
      return res.status(409).json({
        message: 'A news article with this title/slug already exists',
        existingSlug: existing.slug,
      });
    }

    const newsItem = await News.create({
      title,
      slug,
      summary,
      content,
      tacticalAnalysis: tacticalAnalysis || '',
      category: category || 'Defense',
      image: image || imageUrl || thumbnail || '',
      author: author || 'BattleTheory Editorial',
      isPublished: isPublished !== undefined ? Boolean(isPublished) : true,
    });

    res.status(201).json(newsItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create news', error: error.message });
  }
};

// 5. Update News (Admin Only)
const updateNews = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'News record not found' });
    }

    const payload = { ...req.body };
    delete payload._id;
    delete payload.__v;
    delete payload.source;
    delete payload.sourceUrl;
    delete payload.link;

    if (payload.imageUrl && !payload.image) {
      payload.image = payload.imageUrl;
    }

    if (payload.title && payload.title !== newsItem.title) {
      const newSlug = generateSlug(payload.title);
      if (!newSlug) {
        return res.status(400).json({ message: 'Invalid title for slug generation' });
      }
      const duplicate = await News.findOne({ slug: newSlug, _id: { $ne: newsItem._id } });
      if (duplicate) {
        return res.status(409).json({ message: 'Another news article already uses this title' });
      }
      payload.slug = newSlug;
    }

    const updated = await News.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update news', error: error.message });
  }
};

// 6. Delete Single News (Admin Only)
const deleteNews = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const newsItem = await News.findById(req.params.id);
    if (!newsItem) {
      return res.status(404).json({ message: 'News record not found' });
    }

    await newsItem.deleteOne();
    res.status(200).json({ message: 'News record deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete news', error: error.message });
  }
};

// 7. Clear All News (Admin Only)
const clearNews = async (req, res) => {
  try {
    await News.deleteMany({});
    res.status(200).json({ message: 'All news records cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear news', error: error.message });
  }
};

module.exports = {
  getAllNews,
  getNewsById,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
  clearNews,
};