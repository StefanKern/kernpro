import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Firebase Admin (call this once in your application)
export function initializeFirebaseAdmin(serviceAccountPath?: string) {
  // Check if already initialized
  try {
    // Try to get the default app
    admin.app();
    return admin;
  } catch {
    // If no app exists, initialize it
    let credential;

    if (serviceAccountPath) {
      // Use provided service account file
      const serviceAccount = JSON.parse(readFileSync(resolve(serviceAccountPath), 'utf-8'));
      credential = admin.credential.cert(serviceAccount);
    } else if (process.env['GOOGLE_APPLICATION_CREDENTIALS']) {
      // Use environment variable path
      const serviceAccount = JSON.parse(readFileSync(resolve(process.env['GOOGLE_APPLICATION_CREDENTIALS']), 'utf-8'));
      credential = admin.credential.cert(serviceAccount);
    } else {
      // Use default credentials (works in Firebase Functions automatically)
      credential = admin.credential.applicationDefault();
    }

    admin.initializeApp({
      credential,
    });
  }
  return admin;
}

export interface ScrapedContent {
  url: string;
  content: string;
  timestamp: number;
  metadata?: {
    title?: string;
    description?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

/**
 * Store scraped content in Firestore
 * @param collection - The Firestore collection name (e.g., 'scraped-content')
 * @param data - The scraped content data to store
 * @returns The document ID of the stored content
 */
export async function storeScrapedContentInFirestore(collection: string, data: ScrapedContent): Promise<string> {
  const db = admin.firestore();

  const docRef = await db.collection(collection).add({
    ...data,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log(`Content stored in Firestore with ID: ${docRef.id}`);
  return docRef.id;
}

/**
 * Store large scraped content in Cloud Storage
 * @param bucketName - The Cloud Storage bucket name
 * @param fileName - The file name to store (e.g., 'scrapes/example-com-2024-01-01.html')
 * @param content - The content to store
 * @returns The public URL of the stored file (if bucket is public) or the file path
 */
export async function storeScrapedContentInStorage(
  bucketName: string,
  fileName: string,
  content: string
): Promise<string> {
  const bucket = admin.storage().bucket(bucketName);
  const file = bucket.file(fileName);

  await file.save(content, {
    contentType: 'text/html',
    metadata: {
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  console.log(`Content stored in Cloud Storage at: ${fileName}`);
  return `gs://${bucketName}/${fileName}`;
}

/**
 * Retrieve scraped content from Firestore
 * @param collection - The Firestore collection name
 * @param docId - The document ID
 * @returns The scraped content or null if not found
 */
export async function getScrapedContentFromFirestore(
  collection: string,
  docId: string
): Promise<ScrapedContent | null> {
  const db = admin.firestore();
  const doc = await db.collection(collection).doc(docId).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as ScrapedContent;
}

/**
 * Query scraped content by URL
 * @param collection - The Firestore collection name
 * @param url - The URL to search for
 * @returns Array of matching documents
 */
export async function queryScrapedContentByUrl(collection: string, url: string): Promise<ScrapedContent[]> {
  const db = admin.firestore();
  const snapshot = await db.collection(collection).where('url', '==', url).orderBy('timestamp', 'desc').get();

  return snapshot.docs.map((doc) => doc.data() as ScrapedContent);
}
