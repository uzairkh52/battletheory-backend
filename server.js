const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors());

// Base64 images ke liye 50mb limit
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
app.use('/api/news-categories', require('./routes/newsCategoryRoutes'));

app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/articles', require('./routes/articleRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));

// Global Search & Bookmarks Routes
app.use('/api/search', require('./routes/searchRoutes'));
app.use('/api/bookmarks', require('./routes/bookmarkRoutes'));

// Contact Route
app.use('/api/contact', require('./routes/contactRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));