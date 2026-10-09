const Battle = require('../models/Battle');
const Article = require('../models/Article');
const News = require('../models/News'); // Ensure your model file is named News.js

exports.globalSearch = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const regex = new RegExp(q, 'i'); // Case-insensitive regex search

    // Parallel search across all three collections
    const [battles, articles, defenseNews] = await Promise.all([
      Battle.find({ $or: [{ title: regex }, { summary: regex }, { description: regex }] }).limit(5),
      Article.find({ $or: [{ title: regex }, { summary: regex }, { content: regex }] }).limit(5),
      News.find({ $or: [{ title: regex }, { summary: regex }, { content: regex }] }).limit(5), // Fixed: Use 'News' instead of 'DefenseNews'
    ]);

    res.status(200).json({
      success: true,
      query: q,
      results: {
        battles,
        articles,
        defenseNews,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};