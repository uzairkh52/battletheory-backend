const router = require('express').Router();
const { globalSearch } = require('../controllers/searchController');

// GET /api/search?q=...
router.get('/', globalSearch);

module.exports = router;