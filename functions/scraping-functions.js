const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * HTTP endpoint to trigger scraping
 * Usage: POST /scrapeWebsite with body: { "url": "https://example.com" }
 */
exports.scrapeWebsite = onRequest(
  {
    region: 'europe-west1',
    memory: '512MiB',
    timeoutSeconds: 300, // 5 minutes for scraping
  },
  async (req, res) => {
    // Only allow POST requests
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    const { url, collection = 'scraped-content' } = req.body;

    if (!url) {
      res.status(400).json({ error: 'URL is required' });
      return;
    }

    try {
      // Import the scraping library
      // Note: You'll need to adjust the import path based on your build setup
      const { scrapeAndStoreInFirestore } = require('../libs/scraping/src');

      const docId = await scrapeAndStoreInFirestore(url, collection);

      res.status(200).json({
        success: true,
        message: 'Content scraped and stored successfully',
        docId,
        url,
      });
    } catch (error) {
      console.error('Error scraping website:', error);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

/**
 * Scheduled function to scrape websites periodically
 * Runs every day at 2 AM
 */
exports.scheduledScraping = onSchedule(
  {
    schedule: '0 2 * * *', // Cron expression: every day at 2 AM
    timeZone: 'Europe/Berlin',
    region: 'europe-west1',
    memory: '512MiB',
    timeoutSeconds: 540, // 9 minutes
  },
  async (event) => {
    const db = admin.firestore();

    // Get list of URLs to scrape from a configuration collection
    const urlsSnapshot = await db.collection('scraping-config').get();

    const scrapingPromises = [];

    for (const doc of urlsSnapshot.docs) {
      const { url, enabled = true } = doc.data();

      if (enabled && url) {
        console.log(`Scheduling scrape for: ${url}`);
        
        // Import the scraping library
        const { scrapeAndStoreInFirestore } = require('../libs/scraping/src');
        
        scrapingPromises.push(
          scrapeAndStoreInFirestore(url, 'scraped-content').catch((error) => {
            console.error(`Failed to scrape ${url}:`, error);
            return null;
          })
        );
      }
    }

    const results = await Promise.all(scrapingPromises);
    const successCount = results.filter((r) => r !== null).length;

    console.log(
      `Scheduled scraping completed. ${successCount}/${results.length} successful`
    );
  }
);
