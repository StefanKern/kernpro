import { scraping } from './scraping';
import {
  initializeFirebaseAdmin,
  storeScrapedContentInFirestore,
  storeScrapedContentInStorage,
  getScrapedContentFromFirestore,
  queryScrapedContentByUrl,
} from './firebase-storage';
import type { ScrapedContent } from './firebase-storage';

// Re-export query functions and types for convenience
export { getScrapedContentFromFirestore, queryScrapedContentByUrl };
export type { ScrapedContent };

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
