const Parser = require('rss-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables safely
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const News = require('../models/News');
const parser = new Parser();

// Gemini API Setup
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

/**
 * Summarize military news using Gemini API with graceful fallback
 */
const summarizeText = async (text) => {
  if (!genAI || !apiKey) {
    console.warn('⚠️ GEMINI_API_KEY missing. Using fallback excerpt.');
    return text.slice(0, 150) + '...';
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `Summarize this military defense news into 2 concise sentences:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini AI Warning:', error.message);
    // Fallback: If Gemini hits quota or rate limit, server won't crash
    return text.slice(0, 150) + '...';
  }
};

/**
 * Fetch news from RSS feed and save to MongoDB
 */
const fetchAndSaveNews = async () => {
  try {
    // Defense News RSS Feed URL
    const feed = await parser.parseURL('https://www.defensenews.com/arc/outboundfeeds/rss/');
    
    // Process top 5 articles
    for (const item of feed.items.slice(0, 5)) {
      const exists = await News.findOne({ link: item.link });
      
      if (!exists) {
        const summary = await summarizeText(item.contentSnippet || item.title);
        
        await News.create({
          title: item.title,
          link: item.link,
          summary: summary,
          publishedAt: item.pubDate ? new Date(item.pubDate) : new Date()
        });
        console.log(`✅ Saved News: ${item.title}`);
      }
    }
    console.log('✅ RSS News Aggregator execution completed.');
  } catch (err) {
    console.error('Error fetching RSS news:', err.message);
  }
};

/**
 * Auto Cron Job (Runs every 30 minutes)
 */
const startNewsCron = () => {
  // 30 minutes interval
  setInterval(fetchAndSaveNews, 30 * 60 * 1000);
};

module.exports = { startNewsCron, fetchAndSaveNews };