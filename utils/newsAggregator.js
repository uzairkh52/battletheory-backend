const Parser = require('rss-parser');
const cron = require('node-cron');
const News = require('../models/News');
const { GoogleGenAI } = require('@google/genai');

const parser = new Parser();
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// Permanent & Future-Proof Helper function to generate clean, URL-safe slugs
const generateSlug = (text) => {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')           // Quotes aur apostrophes remove karein
    .replace(/[^a-z0-9\s-]/g, '')   // Special chars, brackets, commas sab khatam
    .replace(/\s+/g, '-')           // Spaces ko dash se replace karein
    .replace(/-+/g, '-')            // Multiple dashes ko single karein
    .replace(/^-+|-+$/g, '');       // Start/End ke dashes remove karein
};

// Helper function to extract featured image from various RSS feed structures
const extractImage = (item) => {
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url;
  }
  if (item['media:content'] && item['media:content'].$&& item['media:content'].$.url) {
    return item['media:content'].$.url;
  }
  if (item['media:thumbnail'] && item['media:thumbnail'].$&& item['media:thumbnail'].$.url) {
    return item['media:thumbnail'].$.url;
  }
  
  const contentHtml = item['content:encoded'] || item.content || item.description || '';
  const imgMatch = contentHtml.match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch && imgMatch[1]) {
    return imgMatch[1];
  }
  return '';
};

// Helper function to extract category dynamically from RSS item
const extractCategory = (item, feedSource) => {
  if (item.categories && item.categories.length > 0) {
    return item.categories[0].toUpperCase();
  }
  if (feedSource.name === 'USNI News') return 'NAVAL & MARITIME';
  if (feedSource.name === 'Breaking Defense') return 'DEFENSE POLICY & TECH';
  return 'MILITARY INTELLIGENCE';
};

// Multiple Military & Defense RSS Feed Sources
const RSS_FEEDS = [
  { name: 'Defense News', url: 'https://www.defensenews.com/arc/outboundfeeds/rss/' },
  { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/' },
  { name: 'USNI News', url: 'https://news.usni.org/feed' }
];

const fetchAndSaveNews = async () => {
  try {
    console.log('🔄 Starting Multi-Source RSS News Fetch...');

    for (const feedSource of RSS_FEEDS) {
      try {
        const feed = await parser.parseURL(feedSource.url);
        
        for (const item of feed.items.slice(0, 5)) {
          const exists = await News.findOne({ link: item.link });
          
          if (!exists) {
            let aiSummary = item.contentSnippet || item.title;

            if (ai) {
              try {
                const response = await ai.models.generateContent({
                  model: 'gemini-2.5-flash',
                  contents: `Summarize this military news headline and snippet into a 2-sentence concise summary: Title: ${item.title} - Snippet: ${item.contentSnippet || ''}`,
                });
                if (response && response.text) {
                  aiSummary = response.text.trim();
                }
              } catch (aiErr) {
                console.error('AI Summary generation failed, using snippet fallback:', aiErr.message);
              }
            }

            const imageUrl = extractImage(item);
            const articleSlug = generateSlug(item.title);
            const articleCategory = extractCategory(item, feedSource);

            await News.create({
              title: item.title,
              slug: articleSlug,
              category: articleCategory,
              summary: aiSummary,
              content: item['content:encoded'] || item.content || item.description || '',
              image: imageUrl,
              source: feedSource.name,
              link: item.link,
              createdAt: item.pubDate ? new Date(item.pubDate) : new Date(),
            });
          }
        }
      } catch (feedErr) {
        console.error(`Failed to fetch feed from ${feedSource.name}:`, feedErr.message);
      }
    }
    console.log('✅ RSS News sync and save completed successfully!');
  } catch (error) {
    console.error('Error in fetchAndSaveNews:', error.message);
    throw error;
  }
};

// Cron job to run news fetch automatically (e.g., every hour)
const startNewsCron = () => {
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled automated news sync...');
    fetchAndSaveNews();
  });
};

module.exports = { fetchAndSaveNews, startNewsCron };