import { scraping } from './scraping';
import {
  initializeFirebaseAdmin,
  storeScrapedContentInFirestore,
  storeScrapedContentInStorage,
  getScrapedContentFromFirestore,
  queryScrapedContentByUrl,
} from './firebase-storage';
import type { ScrapedContent } from './firebase-storage';
import { GeminiJobExtractor } from './gemini-extractor';
import type { JobPosting, JobPostingExtractionResult } from './job-posting-schema';

// Re-export query functions and types for convenience
export { getScrapedContentFromFirestore, queryScrapedContentByUrl };
export type { ScrapedContent, JobPosting, JobPostingExtractionResult };

/**
 * Generate a clean document ID from company name and job title
 * Format: "Company-Name-Job-Title-abc123"
 * @param companyName - The company name
 * @param jobTitle - The job title
 * @returns A sanitized document ID with random suffix for uniqueness
 */
function generateJobPostingDocId(companyName?: string, jobTitle?: string): string {
  // Generate a short random suffix for uniqueness (6 characters)
  const randomSuffix = Math.random().toString(36).substring(2, 8);

  // Sanitize company name and job title
  const sanitize = (str: string) =>
    str
      .trim()
      .replace(/[^a-z0-9\s-]/gi, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .substring(0, 50); // Limit length

  const company = companyName ? sanitize(companyName) : 'Unknown-Company';
  const title = jobTitle ? sanitize(jobTitle) : 'Job-Posting';

  return `${company}-${title}-${randomSuffix}`;
}

/**
 * Scrapes a website and stores the content in Firebase Firestore
 * @param url - The URL to scrape
 * @param collectionName - The Firestore collection name (default: 'scraped-content')
 * @param serviceAccountPath - Optional path to service account JSON file
 * @returns The document ID of the stored content
 */
export async function scrapeAndStoreInFirestore(
  url: string,
  collectionName = 'scraped-content',
  serviceAccountPath?: string
): Promise<string> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin(serviceAccountPath);

  // Scrape the website
  console.log(`Scraping ${url}...`);
  const content = await scraping(url);

  // Prepare the data
  const data: ScrapedContent = {
    url,
    content,
    timestamp: Date.now(),
    metadata: {
      contentLength: content.length.toString(),
    },
  };

  // Store in Firestore
  const docId = await storeScrapedContentInFirestore(collectionName, data);
  console.log(`Successfully stored content for ${url} with ID: ${docId}`);

  return docId;
}

/**
 * Scrapes a website and stores the HTML content in Cloud Storage
 * @param url - The URL to scrape
 * @param bucketName - The Cloud Storage bucket name
 * @param fileName - Optional custom file name (auto-generated if not provided)
 * @param serviceAccountPath - Optional path to service account JSON file
 * @returns The storage path of the stored content
 */
export async function scrapeAndStoreInCloudStorage(
  url: string,
  bucketName: string,
  fileName?: string,
  serviceAccountPath?: string
): Promise<string> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin(serviceAccountPath);

  // Scrape the website
  console.log(`Scraping ${url}...`);
  const content = await scraping(url);

  // Generate file name if not provided
  const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const finalFileName = fileName || `scrapes/${sanitizedUrl}-${timestamp}.html`;

  // Store in Cloud Storage
  const storagePath = await storeScrapedContentInStorage(bucketName, finalFileName, content);
  console.log(`Successfully stored content for ${url} at: ${storagePath}`);

  return storagePath;
}

/**
 * Scrapes a website and stores metadata in Firestore + full HTML in Cloud Storage
 * This is ideal for large HTML content that would exceed Firestore's document size limit
 * @param url - The URL to scrape
 * @param collectionName - The Firestore collection name
 * @param bucketName - The Cloud Storage bucket name
 * @param serviceAccountPath - Optional path to service account JSON file
 * @returns Object containing both the Firestore doc ID and storage path
 */
export async function scrapeAndStoreHybrid(
  url: string,
  collectionName = 'scraped-content',
  bucketName: string,
  serviceAccountPath?: string
): Promise<{ docId: string; storagePath: string }> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin(serviceAccountPath);

  // Scrape the website
  console.log(`Scraping ${url}...`);
  const content = await scraping(url);

  // Store full HTML in Cloud Storage
  const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `scrapes/${sanitizedUrl}-${timestamp}.html`;
  const storagePath = await storeScrapedContentInStorage(bucketName, fileName, content);

  // Store metadata in Firestore with reference to Cloud Storage
  const data: ScrapedContent = {
    url,
    content: storagePath, // Store storage path instead of full content
    timestamp: Date.now(),
    metadata: {
      contentLength: content.length.toString(),
      storageLocation: storagePath,
    },
  };

  const docId = await storeScrapedContentInFirestore(collectionName, data);
  console.log(`Successfully stored content for ${url}. Firestore ID: ${docId}, Storage: ${storagePath}`);

  return { docId, storagePath };
}

/**
 * Scrapes a job posting website, extracts structured data using Gemini AI via Vertex AI,
 * and stores both the raw HTML and extracted JobPosting data in Firebase
 * @param url - The job posting URL to scrape
 * @param projectId - Google Cloud project ID (e.g., 'kernpro-5a9d1')
 * @param collectionName - Firestore collection for job postings (default: 'job-postings')
 * @param bucketName - Cloud Storage bucket name for raw HTML
 * @param serviceAccountPath - Optional path to Firebase service account JSON file
 * @param vertexLocation - Vertex AI location (default: 'us-central1')
 * @returns Object containing Firestore doc ID, storage path, and extraction result
 */
export async function scrapeAndExtractJobPosting(
  url: string,
  projectId: string,
  collectionName = 'job-postings',
  bucketName?: string,
  serviceAccountPath?: string,
  vertexLocation = 'us-central1'
): Promise<{
  docId: string;
  storagePath?: string;
  jobPosting: JobPosting;
  extractionResult: JobPostingExtractionResult;
}> {
  // Initialize Firebase Admin
  initializeFirebaseAdmin(serviceAccountPath);

  // Step 1: Scrape the website
  console.log(`Scraping job posting from ${url}...`);
  const htmlContent = await scraping(url);
  console.log(`✓ Scraped ${htmlContent.length} characters of HTML`);

  // Step 2: Extract job posting data using Gemini AI via Vertex AI
  console.log('Extracting job posting data with Gemini AI (Vertex AI)...');
  const extractor = new GeminiJobExtractor(projectId, vertexLocation, serviceAccountPath);
  const extractionResult = await extractor.extractJobPosting(htmlContent, url);

  if (!extractionResult.extractionSuccessful) {
    console.warn('⚠ Extraction had errors:', extractionResult.errors);
  } else {
    console.log('✓ Successfully extracted job posting data');
  }

  // Step 3: Store raw HTML in Cloud Storage (optional)
  let storagePath: string | undefined;
  if (bucketName) {
    const sanitizedUrl = url.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `job-postings/${sanitizedUrl}-${timestamp}.html`;
    storagePath = await storeScrapedContentInStorage(bucketName, fileName, htmlContent);
    console.log(`✓ Stored raw HTML at: ${storagePath}`);

    // Add storage reference to metadata
    extractionResult.jobPosting.metadata = {
      ...extractionResult.jobPosting.metadata,
      rawHtml: storagePath,
    };
  }

  // Step 4: Generate a meaningful document ID
  const companyName = extractionResult.jobPosting.hiringOrganization?.name;
  const jobTitle = extractionResult.jobPosting.title;
  const customDocId = generateJobPostingDocId(companyName, jobTitle);

  // Step 5: Store JobPosting data in Firestore with custom ID
  const docId = await storeScrapedContentInFirestore(
    collectionName,
    extractionResult.jobPosting as unknown as ScrapedContent,
    customDocId
  );
  console.log(`✓ Stored job posting in Firestore with ID: ${docId}`);

  return {
    docId,
    storagePath,
    jobPosting: extractionResult.jobPosting,
    extractionResult,
  };
}

/**
 * Batch scrape and extract multiple job postings
 * @param urls - Array of job posting URLs
 * @param projectId - Google Cloud project ID (e.g., 'kernpro-5a9d1')
 * @param collectionName - Firestore collection for job postings
 * @param bucketName - Optional Cloud Storage bucket name
 * @param serviceAccountPath - Optional path to Firebase service account JSON file
 * @param vertexLocation - Vertex AI location (default: 'us-central1')
 * @returns Array of results for each URL
 */
export async function scrapeAndExtractJobPostingsBatch(
  urls: string[],
  projectId: string,
  collectionName = 'job-postings',
  bucketName?: string,
  serviceAccountPath?: string,
  vertexLocation = 'us-central1'
): Promise<
  {
    url: string;
    docId: string;
    storagePath?: string;
    jobPosting: JobPosting;
    extractionResult: JobPostingExtractionResult;
    error?: string;
  }[]
> {
  const results: {
    url: string;
    docId: string;
    storagePath?: string;
    jobPosting: JobPosting;
    extractionResult: JobPostingExtractionResult;
    error?: string;
  }[] = [];

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`\n--- Processing job posting ${i + 1}/${urls.length} ---`);

    try {
      const result = await scrapeAndExtractJobPosting(
        url,
        projectId,
        collectionName,
        bucketName,
        serviceAccountPath,
        vertexLocation
      );

      results.push({
        url,
        ...result,
      });
    } catch (error) {
      console.error(`✗ Failed to process ${url}:`, error);
      results.push({
        url,
        docId: '',
        jobPosting: {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: 'Error',
          description: 'Failed to scrape and extract',
        },
        extractionResult: {
          jobPosting: {
            '@context': 'https://schema.org',
            '@type': 'JobPosting',
            title: 'Error',
            description: 'Failed to scrape and extract',
          },
          extractionSuccessful: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    // Add delay between requests to avoid rate limiting
    if (i < urls.length - 1) {
      console.log('Waiting 2 seconds before next request...');
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return results;
}
