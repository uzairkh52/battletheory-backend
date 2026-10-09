const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { startNewsCron, fetchAndSaveNews } = require('./utils/newsAggregator');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Root Test Route
app.get('/', (req, res) => {
  res.send('Battle Theory API is running smoothly...');
});

// Authentication Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Content Routes
app.use('/api/battles', require('./routes/battleRoutes'));

// News Routes
app.use('/api/news', require('./routes/newsRoutes'));

app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// 🌟 Global Search Route (Added here)
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));
// Start Auto News Cron Job & Initial Run
startNewsCron();
fetchAndSaveNews();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));