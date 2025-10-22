# scraping

A powerful web scraping library with Firebase storage integration, built with [Nx](https://nx.dev).

## Features

- 🌐 **Web Scraping**: Scrape websites using Playwright (headless browser)
- 💾 **Firebase Storage**: Store scraped content in Firestore and/or Cloud Storage
- 🔍 **Querying**: Query scraped content by URL, timestamp, and custom metadata
- ⚡ **Multiple Storage Options**: Choose between Firestore, Cloud Storage, or hybrid approach
- 🚀 **Firebase Functions Ready**: Easy integration with Cloud Functions for automated scraping

## Quick Start

```typescript
import { scrapeAndStoreInFirestore } from '@your-workspace/scraping';

// Scrape a website and store in Firebase
const docId = await scrapeAndStoreInFirestore('https://example.com');
console.log(`Stored with ID: ${docId}`);
```

## Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Get started in 5 minutes
- **[SCRAPING_FIREBASE_GUIDE.md](./SCRAPING_FIREBASE_GUIDE.md)** - Complete guide with all features

## Installation

The library includes all necessary dependencies:

- `playwright` - Web scraping
- `firebase-admin` - Firebase storage

## Usage

### Basic Scraping (without storage)

```typescript
import { scraping } from '@your-workspace/scraping';

const htmlContent = await scraping('https://example.com');
console.log(htmlContent);
```

### Store in Firestore

```typescript
import { scrapeAndStoreInFirestore } from '@your-workspace/scraping';

const docId = await scrapeAndStoreInFirestore('https://example.com');
```

### Store in Cloud Storage

```typescript
import { scrapeAndStoreInCloudStorage } from '@your-workspace/scraping';

const storagePath = await scrapeAndStoreInCloudStorage('https://example.com', 'your-project.appspot.com');
```

### Hybrid Storage (Recommended)

```typescript
import { scrapeAndStoreHybrid } from '@your-workspace/scraping';

const { docId, storagePath } = await scrapeAndStoreHybrid(
  'https://example.com',
  'scraped-content',
  'your-project.appspot.com'
);
```

## Testing

Run `nx test scraping` to execute the unit tests.

See `src/test.ts` for working examples.

## Building

Run `nx build scraping` to build the library.
