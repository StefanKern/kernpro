# Quick Start: Store Scraped Content in Firebase

## 🚀 Quick Examples

### Option 1: Store in Firestore (Best for small-medium content)

```typescript
import { scrapeAndStoreInFirestore } from './lib/scrape-and-store';

const docId = await scrapeAndStoreInFirestore(
  'https://example.com',
  'scraped-content' // Firestore collection name
);

console.log(`Stored with ID: ${docId}`);
```

**Pros:** Easy to query, real-time updates, built-in indexing  
**Cons:** 1 MB document size limit  
**Cost:** $0.18/GB/month

---

### Option 2: Store in Cloud Storage (Best for large HTML files)

```typescript
import { scrapeAndStoreInCloudStorage } from './lib/scrape-and-store';

const storagePath = await scrapeAndStoreInCloudStorage(
  'https://example.com',
  'your-project.appspot.com' // Your Firebase Storage bucket
);

console.log(`Stored at: ${storagePath}`);
```

**Pros:** No size limits, cheaper storage  
**Cons:** Harder to query, no real-time updates  
**Cost:** $0.026/GB/month

---

### Option 3: Hybrid (RECOMMENDED - Best of both worlds)

```typescript
import { scrapeAndStoreHybrid } from './lib/scrape-and-store';

const result = await scrapeAndStoreHybrid(
  'https://example.com',
  'scraped-content', // Firestore collection
  'your-project.appspot.com' // Storage bucket
);

// Metadata stored in Firestore for easy querying
// Full HTML stored in Cloud Storage for cost efficiency
console.log(`Firestore ID: ${result.docId}`);
console.log(`Storage: ${result.storagePath}`);
```

**Pros:** Easy to query (Firestore metadata) + cheap storage (Cloud Storage HTML)  
**Cons:** Two storage locations to manage  
**Best for:** Production use with large HTML content

---

## 📋 Setup Checklist

### 1. Dependencies

✅ Already installed: `firebase-admin` in `libs/scraping`

### 2. Firebase Configuration

Make sure your Firebase project is initialized:

```bash
firebase init firestore  # Enable Firestore
firebase init storage    # Enable Cloud Storage (for options 2 & 3)
```

### 3. Service Account (for local development)

Download your service account key from Firebase Console:

1. Go to Project Settings → Service Accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` (don't commit this!)
4. Set environment variable:

```bash
# PowerShell
$env:GOOGLE_APPLICATION_CREDENTIALS="path\to\serviceAccountKey.json"

# Or in your code
import * as admin from 'firebase-admin';
import * as serviceAccount from './serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
```

### 4. Deploy to Firebase Functions

Functions are automatically initialized in Firebase Functions environment.

---

## 🎯 Your Use Case

Based on your job scraping URL, here's what I recommend:

```typescript
import { scrapeAndStoreHybrid } from './lib/scrape-and-store';

// Scrape a job posting and store it
async function scrapeJobPosting(jobUrl: string) {
  const result = await scrapeAndStoreHybrid(
    jobUrl,
    'job-scrapes', // Collection for job postings
    'kernpro.appspot.com' // Your Firebase Storage bucket
  );

  return result;
}

// Usage
const jobUrl = 'https://www.stepstone.at/stellenangebote--Angular-Web-Developer...';
const { docId, storagePath } = await scrapeJobPosting(jobUrl);

console.log(`Job scraped! Firestore ID: ${docId}`);
```

This stores:

- **In Firestore:** URL, timestamp, content length, storage reference (queryable)
- **In Cloud Storage:** Full HTML content (cheap, unlimited size)

---

## 🔍 Query Scraped Content

```typescript
import { queryScrapedContentByUrl } from './lib/scrape-and-store';

// Get all scrapes for a specific URL
const scrapes = await queryScrapedContentByUrl('job-scrapes', jobUrl);

console.log(`Found ${scrapes.length} previous scrapes`);
console.log(`Latest scrape: ${scrapes[0].timestamp}`);
```

---

## 📊 Firestore Structure

Your data will look like this:

```
job-scrapes/
  └── abc123xyz (auto-generated ID)
      ├── url: "https://www.stepstone.at/..."
      ├── content: "gs://kernpro.appspot.com/scrapes/..."
      ├── timestamp: 2025-10-21T10:30:00Z
      └── metadata:
          ├── contentLength: "45678"
          └── storageLocation: "gs://kernpro.appspot.com/scrapes/..."
```

---

## 🚨 Common Issues

### "Firebase app not initialized"

```typescript
import { initializeFirebaseAdmin } from './lib/firebase-storage';
initializeFirebaseAdmin(); // Call this once at startup
```

### "Document too large" (> 1 MB)

Use `scrapeAndStoreInCloudStorage` or `scrapeAndStoreHybrid` instead of `scrapeAndStoreInFirestore`.

### "Permission denied"

Check your Firestore/Storage security rules. For Cloud Functions, they should have admin access automatically.

---

## 📚 Full Documentation

See `SCRAPING_FIREBASE_GUIDE.md` for complete documentation including:

- Security rules
- Firebase Functions integration
- Scheduled scraping
- Advanced queries
- Cost optimization
