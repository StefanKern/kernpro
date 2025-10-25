// run with nx execute scraping

import { scraping } from './lib/scraping';
import {
  scrapeAndStoreInFirestore,
  scrapeAndStoreHybrid,
  queryScrapedContentByUrl,
  scrapeAndExtractJobPosting,
  scrapeAndExtractJobPostingsBatch,
} from './lib/scrape-and-store';

// SETUP: Set this to your service account key path or set GOOGLE_APPLICATION_CREDENTIALS environment variable
const SERVICE_ACCOUNT_PATH =
  process.env['GOOGLE_APPLICATION_CREDENTIALS'] || 'C:\\github\\kernpro\\serviceAccountKey.json'; // 👈 UPDATE THIS PATH if different
// Or set environment variable: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"

// SETUP: Replace with your Firebase Storage bucket name
const BUCKET_NAME = 'kernpro-5a9d1.firebasestorage.app'; // Your actual bucket from Firebase Console

// SETUP: Your Google Cloud project ID (same as Firebase project)
const PROJECT_ID = 'kernpro-5a9d1'; // 👈 UPDATE if your project ID is different

// SETUP: Vertex AI location (default: us-central1, use europe-west1 for EU, etc.)
const VERTEX_LOCATION = 'us-central1';

// Test job posting URLs
const JOB_URL =
  'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0';

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
// exampleScrapeAndStoreHybrid().catch(console.error);

// Option 3: Query previous scrapes
// exampleQueryScrapes().catch(console.error);

export { exampleJustScrape, exampleScrapeAndStore, exampleScrapeAndStoreHybrid, exampleQueryScrapes };

// ========================================
// NEW: AI-POWERED JOB POSTING EXTRACTION
// ========================================

// Example 5: Scrape and extract job posting with Gemini AI
async function exampleExtractJobPosting() {
  console.log('🤖 Scraping and extracting job posting with Gemini AI (Vertex AI)...');

  const result = await scrapeAndExtractJobPosting(
    JOB_URL,
    PROJECT_ID,
    'job-postings', // Firestore collection
    BUCKET_NAME, // Store raw HTML in Cloud Storage
    SERVICE_ACCOUNT_PATH,
    VERTEX_LOCATION
  );

  console.log('\n✓ Job Posting Extracted:');
  console.log('  Title:', result.jobPosting.title);
  console.log('  Company:', result.jobPosting.hiringOrganization?.name);
  console.log(
    '  Location:',
    Array.isArray(result.jobPosting.jobLocation)
      ? result.jobPosting.jobLocation[0]?.address
      : result.jobPosting.jobLocation?.address
  );
  console.log('  Employment Type:', result.jobPosting.employmentType);
  console.log('  Skills:', result.jobPosting.skills);
  console.log('  Firestore ID:', result.docId);
  console.log('  Raw HTML stored at:', result.storagePath);

  if (result.extractionResult.errors) {
    console.warn('\n⚠ Extraction warnings:', result.extractionResult.errors);
  }

  return result;
}

// Example 6: Batch extract multiple job postings
async function exampleBatchExtractJobPostings() {
  const jobUrls = [
    JOB_URL,
    // Add more job URLs here
  ];

  console.log(`🤖 Batch extracting ${jobUrls.length} job postings...`);

  const results = await scrapeAndExtractJobPostingsBatch(
    jobUrls,
    PROJECT_ID,
    'job-postings',
    BUCKET_NAME,
    SERVICE_ACCOUNT_PATH,
    VERTEX_LOCATION
  );

  console.log(`\n✓ Extracted ${results.length} job postings:`);
  results.forEach((result, index) => {
    console.log(`\n  ${index + 1}. ${result.jobPosting.title}`);
    console.log(`     Company: ${result.jobPosting.hiringOrganization?.name || 'N/A'}`);
    console.log(`     Firestore ID: ${result.docId}`);
    if (result.error) {
      console.error(`     ✗ Error: ${result.error}`);
    }
  });

  return results;
}

// Uncomment to test AI-powered job extraction:
// NOTE: Make sure GOOGLE_APPLICATION_CREDENTIALS is set and Vertex AI is enabled!
// Example: $env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
// Enable Vertex AI: https://console.cloud.google.com/vertex-ai

// Option 1: Extract a single job posting
exampleExtractJobPosting().catch(console.error);

// Option 2: Batch extract multiple job postings
// exampleBatchExtractJobPostings().catch(console.error);

export { exampleExtractJobPosting, exampleBatchExtractJobPostings };
