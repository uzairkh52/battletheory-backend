const News = require('../models/News');
const { fetchAndSaveNews } = require('../utils/newsAggregator');

const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

// 1. Get All News (Paginated & Mixed)
// 1. Get All News (Clean Skip & Limit Pagination)
const getAllNews = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    // Direct MongoDB query sorted by newest first
    const news = await News.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalNews = await News.countDocuments();
    const hasMore = skip + news.length < totalNews;

    res.status(200).json({
      news,
      currentPage: page,
      totalPages: Math.ceil(totalNews / limit),
      hasMore,
      totalNews
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch news', error: error.message });
  }
};

// 2. Get Single News Item By ID
const getNewsById = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) return res.status(404).json({ message: 'News record not found' });
    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news item', error: error.message });
  }
};

// 3. Get Single News Item By Slug
const getNewsBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slug);
    if (isObjectId) {
      const newsItem = await News.findById(slug);
      if (newsItem) return res.status(200).json(newsItem);
    }

    let newsItem = await News.findOne({ slug });
    if (newsItem) return res.status(200).json(newsItem);

    const titleRegexPattern = slug.replace(/-/g, ' ');
    newsItem = await News.findOne({ 
      title: { $regex: new RegExp(titleRegexPattern, 'i') } 
    });

    if (!newsItem) {
      return res.status(404).json({ message: 'Intelligence briefing record not found' });
    }

    res.status(200).json(newsItem);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching news by slug', error: error.message });
  }
};

// 4. Create News
const createNews = async (req, res) => {
  try {
    const { title, summary, content, category, source, link } = req.body;
    const newsItem = await News.create({
      title,
      slug: generateSlug(title),
      summary,
      content,
      category,
      source,
      link
    });
    res.status(201).json(newsItem);
  } catch (error) {
    res.status(400).json({ message: 'Failed to create news', error: error.message });
  }
};

// 5. Update News
const updateNews = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) return res.status(404).json({ message: 'News record not found' });

    if (req.body.title && req.body.title !== newsItem.title) {
      req.body.slug = generateSlug(req.body.title);
    }

    const updated = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update news', error: error.message });
  }
};

// 6. Delete News
const deleteNews = async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id);
    if (!newsItem) return res.status(404).json({ message: 'News record not found' });

    await newsItem.deleteOne();
    res.status(200).json({ message: 'News record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete news', error: error.message });
  }
};

// 7. Manual RSS Seed Trigger
const seedRssNews = async (req, res) => {
  try {
    await fetchAndSaveNews();
    res.status(200).json({ message: 'RSS news feed successfully synced and saved with clean slugs!' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to seed RSS news', error: error.message });
  }
};

// 8. Clear all news records
const clearNews = async (req, res) => {
  try {
    await News.deleteMany({});
    res.status(200).json({ message: 'All news records deleted successfully!' });
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
  seedRssNews,
  clearNews,
};