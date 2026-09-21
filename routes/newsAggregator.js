const Parser = require('rss-parser');
const cron = require('node-cron');
const News = require('../models/News');
const { GoogleGenAI } = require('@google/genai');

const parser = new Parser();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const fetchAndSaveNews = async () => {
  try {
    // RSS Feed for Defense/Military News
    const feed = await parser.parseURL('https://www.defensenews.com/arc/outboundfeeds/rss/');
    
    for (const item of feed.items.slice(0, 3)) { // Top 3 news
      const exists = await News.findOne({ link: item.link });
      if (!exists) {
        
        // Gemini API Prompt for Short Summary
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Summarize this military news headline and snippet into a 2-sentence Urdu-English mixed neutral bullet summary: Title: ${item.title}, Snippet: ${item.contentSnippet}`,
        });

        const aiSummary = response.text || item.contentSnippet;

        await News.create({
          title: item.title,
          link: item.link,
          summary: aiSummary,
          category: 'Military AI & Defense'
        });
        console.log(`[AUTO-NEWS] Added: ${item.title}`);
      }
    }
  } catch (error) {
    console.error('Error fetching RSS news:', error.message);
  }
};

// Cron Job: Schedule to run every 6 hours
const startNewsCron = () => {
  cron.schedule('0 */6 * * *', () => {
    console.log('Running Auto News Fetcher...');
    fetchAndSaveNews();
  });
};

module.exports = { fetchAndSaveNews, startNewsCron };