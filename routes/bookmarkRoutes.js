const router = require('express').Router();
const { getUserBookmarks, toggleBookmark } = require('../controllers/bookmarkController');
const { protect } = require('../middleware/authMiddleware'); // Assuming you have an auth protection middleware

router.get('/', protect, getUserBookmarks);
router.post('/toggle', protect, toggleBookmark);

module.exports = router;