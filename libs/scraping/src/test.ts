// run with nx execute scraping

import { scraping } from './lib/scraping';
import { scrapeAndStoreInFirestore, scrapeAndStoreHybrid, queryScrapedContentByUrl } from './lib/scrape-and-store';

// SETUP: Set this to your service account key path or set GOOGLE_APPLICATION_CREDENTIALS environment variable
const SERVICE_ACCOUNT_PATH =
  process.env['GOOGLE_APPLICATION_CREDENTIALS'] || 'C:\\github\\kernpro\\serviceAccountKey.json'; // 👈 UPDATE THIS PATH if different
// Or set environment variable: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"

// SETUP: Replace with your Firebase Storage bucket name
const BUCKET_NAME = 'kernpro-5a9d1.firebasestorage.app'; // Your actual bucket from Firebase Console

// Example 1: Just scrape (original functionality)
async function exampleJustScrape() {
  const content = await scraping(
    'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0'
  );
  console.log('Scraped Content Length:', content.length);
  return content;
}

// Example 2: Scrape and store in Firestore
async function exampleScrapeAndStore() {
  const url =
    'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0';

  console.log('Scraping and storing in Firestore...');
  const docId = await scrapeAndStoreInFirestore(url, 'job-scrapes', SERVICE_ACCOUNT_PATH);
  console.log(`✓ Stored in Firestore with ID: ${docId}`);

  return docId;
}

// Example 3: Scrape and store using hybrid storage (recommended for large HTML)
async function exampleScrapeAndStoreHybrid() {
  const url =
    'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0';

  console.log('Scraping and storing with hybrid approach...');
  const result = await scrapeAndStoreHybrid(url, 'job-scrapes', BUCKET_NAME, SERVICE_ACCOUNT_PATH);
  console.log(`✓ Firestore ID: ${result.docId}`);
  console.log(`✓ Storage path: ${result.storagePath}`);

  return result;
}

// Example 4: Query previous scrapes
async function exampleQueryScrapes() {
  const url =
    'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0';

  console.log('Querying previous scrapes...');
  const scrapes = await queryScrapedContentByUrl('job-scrapes', url);
  console.log(`Found ${scrapes.length} previous scrapes for this URL`);

  return scrapes;
}

// Run the basic scrape example by default
// exampleJustScrape()
//   .then(() => {
//     console.log('✓ Scraping completed successfully');
//   })
//   .catch((error) => {
//     console.error('Error occurred while scraping:', error);
//   });

// Uncomment to test Firebase storage:
// NOTE: Make sure to set up credentials first! See FIREBASE_CREDENTIALS_SETUP.md

// Option 1: Store in Firestore only (no Cloud Storage setup needed)
// exampleScrapeAndStore().catch(console.error);

// Option 2: Store with hybrid approach (requires Cloud Storage setup)
// Storage bucket: kernpro-5a9d1.firebasestorage.app
exampleScrapeAndStoreHybrid().catch(console.error);

// Option 3: Query previous scrapes
// exampleQueryScrapes().catch(console.error);

export { exampleJustScrape, exampleScrapeAndStore, exampleScrapeAndStoreHybrid, exampleQueryScrapes };
