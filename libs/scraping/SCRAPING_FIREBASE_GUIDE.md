# Scraping with Firebase Storage

This guide shows you how to scrape websites and store the content in Firebase using the scraping library.

## Features

- ✅ Scrape websites using Playwright
- ✅ Store scraped content in Firestore
- ✅ Store large HTML files in Cloud Storage
- ✅ Hybrid storage (metadata in Firestore, content in Storage)
- ✅ Query scraped content by URL
- ✅ Automatic timestamping

## Installation

The Firebase Admin SDK has been installed in the scraping library:

```bash
cd libs/scraping
npm install firebase-admin
```

## Usage Examples

### 1. Simple: Scrape and Store in Firestore

```typescript
import { scrapeAndStoreInFirestore } from '@your-workspace/scraping';

// Scrape and store in Firestore
const docId = await scrapeAndStoreInFirestore('https://example.com');
console.log(`Stored with ID: ${docId}`);

// With custom collection name
const docId2 = await scrapeAndStoreInFirestore('https://example.com', 'my-scrapes');
```

### 2. Store in Cloud Storage (for large HTML files)

```typescript
import { scrapeAndStoreInCloudStorage } from '@your-workspace/scraping';

// Store in Cloud Storage
const storagePath = await scrapeAndStoreInCloudStorage('https://example.com', 'your-bucket-name.appspot.com');
console.log(`Stored at: ${storagePath}`);

// With custom file name
const storagePath2 = await scrapeAndStoreInCloudStorage(
  'https://example.com',
  'your-bucket-name.appspot.com',
  'my-custom-folder/example.html'
);
```

### 3. Hybrid Storage (Recommended for large content)

Store metadata in Firestore and full HTML in Cloud Storage:

```typescript
import { scrapeAndStoreHybrid } from '@your-workspace/scraping';

const result = await scrapeAndStoreHybrid(
  'https://example.com',
  'scraped-content', // Firestore collection
  'your-bucket-name.appspot.com' // Storage bucket
);

console.log(`Firestore ID: ${result.docId}`);
console.log(`Storage path: ${result.storagePath}`);
```

### 4. Low-Level API: Manual Control

```typescript
import {
  scraping,
  initializeFirebaseAdmin,
  storeScrapedContentInFirestore,
  ScrapedContent,
} from '@your-workspace/scraping';

// Initialize Firebase
initializeFirebaseAdmin();

// Scrape the website
const htmlContent = await scraping('https://example.com');

// Prepare data with custom metadata
const data: ScrapedContent = {
  url: 'https://example.com',
  content: htmlContent,
  timestamp: Date.now(),
  metadata: {
    title: 'Example Website',
    description: 'A demo scrape',
    category: 'tech',
    customField: 'custom-value',
  },
};

// Store in Firestore
const docId = await storeScrapedContentInFirestore('scraped-content', data);
```

### 5. Query Scraped Content

```typescript
import { getScrapedContentFromFirestore, queryScrapedContentByUrl } from '@your-workspace/scraping';

// Get by document ID
const content = await getScrapedContentFromFirestore('scraped-content', docId);

// Query by URL (returns all scrapes for that URL, ordered by timestamp)
const allScrapes = await queryScrapedContentByUrl('scraped-content', 'https://example.com');

console.log(`Found ${allScrapes.length} scrapes for this URL`);
```

## Firebase Functions Integration

### HTTP Trigger (Manual Scraping)

Deploy the scraping function and call it via HTTP:

```bash
# Deploy functions
firebase deploy --only functions

# Call the function
curl -X POST https://your-region-your-project.cloudfunctions.net/scrapeWebsite \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

### Scheduled Scraping (Cron Job)

The `scheduledScraping` function runs automatically every day at 2 AM.

To configure URLs for scheduled scraping, add documents to the `scraping-config` collection:

```javascript
// In Firebase Console or via code
db.collection('scraping-config').add({
  url: 'https://example.com',
  enabled: true,
  name: 'Example Website',
});
```

## Data Structure

### Firestore Document Structure

```typescript
{
  url: "https://example.com",
  content: "<!DOCTYPE html>...", // Full HTML or storage path
  timestamp: <server timestamp>,
  metadata: {
    title: "Page Title",
    description: "Page description",
    contentLength: "12345",
    // ... custom fields
  }
}
```

### Firestore Collections

- `scraped-content`: Default collection for scraped content
- `scraping-config`: Configuration for scheduled scraping

## Firebase Setup

### 1. Enable Firestore

```bash
firebase init firestore
```

### 2. Enable Cloud Storage (optional, for large files)

```bash
firebase init storage
```

### 3. Set Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Scraped content - read-only for clients
    match /scraped-content/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }

    // Scraping config - admin only
    match /scraping-config/{document} {
      allow read, write: if request.auth.token.admin == true;
    }
  }
}
```

### 4. Set Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /scrapes/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

## Considerations

### Firestore Limits

- Maximum document size: **1 MB**
- If your HTML content exceeds 1 MB, use Cloud Storage or the hybrid approach

### Storage Costs

- **Firestore**: $0.18/GB stored per month
- **Cloud Storage**: $0.026/GB stored per month
- Choose Cloud Storage for large HTML files to save costs

### Performance

- Firestore is better for querying and real-time updates
- Cloud Storage is better for large files and cost efficiency
- Hybrid approach combines both benefits

## Troubleshooting

### Error: "Firebase app not initialized"

Make sure to call `initializeFirebaseAdmin()` before using any Firebase functions.

### Error: "Document size exceeds limit"

Your HTML content is too large for Firestore. Use `scrapeAndStoreInCloudStorage` or `scrapeAndStoreHybrid` instead.

### Playwright Issues

If Playwright fails to launch, make sure browsers are installed:

```bash
npx playwright install
```

## Next Steps

- Add data extraction (parse HTML to extract specific data)
- Add change detection (compare new scrapes with previous ones)
- Add notification system (email when content changes)
- Add retry logic for failed scrapes
- Add rate limiting to avoid overwhelming target websites
