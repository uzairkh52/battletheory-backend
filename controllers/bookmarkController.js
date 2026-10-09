const Bookmark = require('../models/Bookmark');

// Get all bookmarks for logged-in user
exports.getUserBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, bookmarks });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Toggle Bookmark (Add or Remove)
exports.toggleBookmark = async (req, res) => {
  try {
    const { itemType, itemId, title, slug, thumbnail, theater, year, summary } = req.body;
    const userId = req.user._id;

    if (!itemType || !itemId || !title || !slug) {
      return res.status(400).json({ success: false, message: 'Missing required bookmark fields' });
    }

    const existingBookmark = await Bookmark.findOne({ user: userId, itemType, itemId });

    if (existingBookmark) {
      // Remove bookmark if it already exists
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      return res.status(200).json({ success: true, bookmarked: false, message: 'Bookmark removed' });
    } else {
      // Add new bookmark
      const newBookmark = await Bookmark.create({
        user: userId,
        itemType,
        itemId,
        title,
        slug,
        thumbnail,
        theater,
        year,
        summary,
      });
      return res.status(201).json({ success: true, bookmarked: true, bookmark: newBookmark, message: 'Bookmark saved' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};