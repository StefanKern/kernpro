# scraping

A powerful web scraping library with Firebase storage integration and AI-powered data extraction, built with [Nx](https://nx.dev).

## Features

- 🌐 **Web Scraping**: Scrape websites using Playwright (headless browser)
- 🤖 **AI Extraction**: Extract structured job posting data using Gemini AI via Vertex AI
- 💾 **Firebase Storage**: Store scraped content in Firestore and/or Cloud Storage
- 📋 **Schema.org Compliance**: JobPosting data follows schema.org standard
- 🔍 **Querying**: Query scraped content by URL, timestamp, and custom metadata
- ⚡ **Multiple Storage Options**: Choose between Firestore, Cloud Storage, or hybrid approach
- 📦 **Batch Processing**: Process multiple URLs efficiently
- � **Unified Authentication**: Uses same Firebase credentials for everything
- �🚀 **Firebase Functions Ready**: Easy integration with Cloud Functions for automated scraping

## Quick Start

### Basic Web Scraping

```typescript
import { scrapeAndStoreInFirestore } from '@your-workspace/scraping';

// Scrape a website and store in Firebase
const docId = await scrapeAndStoreInFirestore('https://example.com');
console.log(`Stored with ID: ${docId}`);
```

### AI-Powered Job Posting Extraction (NEW!)

```typescript
import { scrapeAndExtractJobPosting } from '@your-workspace/scraping';

// Scrape job posting and extract structured data with Gemini AI via Vertex AI
const result = await scrapeAndExtractJobPosting(
  'https://www.stepstone.at/job-posting-url',
  'kernpro-5a9d1', // Your Google Cloud project ID
  'job-postings',
  'your-bucket.appspot.com'
);

console.log('Job Title:', result.jobPosting.title);
console.log('Company:', result.jobPosting.hiringOrganization?.name);
console.log('Skills:', result.jobPosting.skills);
console.log('Salary:', result.jobPosting.baseSalary);
```

## Documentation

### Getting Started

- **[QUICK_START.md](./QUICK_START.md)** - Basic web scraping in 5 minutes
- **[QUICK_START_JOB_SCRAPER.md](./QUICK_START_JOB_SCRAPER.md)** - 🆕 AI job extraction quick start

### Complete Guides

- **[SCRAPING_FIREBASE_GUIDE.md](./SCRAPING_FIREBASE_GUIDE.md)** - Complete web scraping guide
- **[GEMINI_JOB_EXTRACTION.md](./GEMINI_JOB_EXTRACTION.md)** - 🆕 AI extraction complete guide

### Setup

- **[FIREBASE_CREDENTIALS_SETUP.md](./FIREBASE_CREDENTIALS_SETUP.md)** - Firebase authentication setup
- **[VERTEX_AI_SETUP.md](./VERTEX_AI_SETUP.md)** - 🆕 Vertex AI configuration for Gemini
- **[STORAGE_BUCKET_SETUP.md](./STORAGE_BUCKET_SETUP.md)** - Cloud Storage configuration

## Installation

The library includes all necessary dependencies:

- `playwright` - Web scraping
- `firebase-admin` - Firebase storage
- `@google-cloud/vertexai` - 🆕 Gemini AI via Vertex AI for data extraction

## Usage Examples

### 1. Basic Web Scraping (without storage)

```typescript
import { scraping } from '@your-workspace/scraping';

const htmlContent = await scraping('https://example.com');
console.log(htmlContent);
```

### 2. Store in Firestore

```typescript
import { scrapeAndStoreInFirestore } from '@your-workspace/scraping';

const docId = await scrapeAndStoreInFirestore('https://example.com');
```

### 3. Store in Cloud Storage

```typescript
import { scrapeAndStoreInCloudStorage } from '@your-workspace/scraping';

const storagePath = await scrapeAndStoreInCloudStorage('https://example.com', 'your-project.appspot.com');
```

### 4. Hybrid Storage (Recommended)

```typescript
import { scrapeAndStoreHybrid } from '@your-workspace/scraping';

const { docId, storagePath } = await scrapeAndStoreHybrid(
  'https://example.com',
  'scraped-content',
  'your-project.appspot.com'
);
```

### 5. 🆕 Extract Job Posting with AI

```typescript
import { scrapeAndExtractJobPosting } from '@your-workspace/scraping';

// Single job posting
const result = await scrapeAndExtractJobPosting(
  'https://www.stepstone.at/job-url',
  'kernpro-5a9d1', // Your Google Cloud project ID
  'job-postings',
  'your-bucket.appspot.com'
);

// Access extracted data
console.log('Title:', result.jobPosting.title);
console.log('Company:', result.jobPosting.hiringOrganization?.name);
console.log('Location:', result.jobPosting.jobLocation);
console.log('Skills:', result.jobPosting.skills);
console.log('Salary:', result.jobPosting.baseSalary);
```

### 6. 🆕 Batch Extract Multiple Jobs

```typescript
import { scrapeAndExtractJobPostingsBatch } from '@your-workspace/scraping';

const jobUrls = ['https://www.stepstone.at/job-1', 'https://www.stepstone.at/job-2', 'https://www.stepstone.at/job-3'];

const results = await scrapeAndExtractJobPostingsBatch(
  jobUrls,
  'kernpro-5a9d1', // Your Google Cloud project ID
  'job-postings',
  'your-bucket.appspot.com'
);

console.log(`Extracted ${results.length} jobs`);
```

## What Gets Extracted? (AI Job Posting)

The AI extracts structured data following [schema.org/JobPosting](https://schema.org/JobPosting):

| Field                | Description      | Example                                                                              |
| -------------------- | ---------------- | ------------------------------------------------------------------------------------ |
| `title`              | Job title        | "Senior Angular Developer"                                                           |
| `description`        | Full description | "We are looking for..."                                                              |
| `hiringOrganization` | Company info     | `{ name: "Tech Corp", sameAs: "https://..." }`                                       |
| `jobLocation`        | Location details | `{ address: { city: "Vienna", country: "Austria" } }`                                |
| `employmentType`     | Job type         | `["FULL_TIME"]`                                                                      |
| `baseSalary`         | Salary info      | `{ currency: "EUR", value: { minValue: 50000, maxValue: 70000, unitText: "YEAR" } }` |
| `skills`             | Required skills  | `["Angular", "TypeScript", "RxJS"]`                                                  |
| `qualifications`     | Requirements     | "Bachelor's degree..."                                                               |
| `responsibilities`   | Job duties       | "Design and develop..."                                                              |
| `datePosted`         | Posted date      | "2024-10-25"                                                                         |
| `validThrough`       | Deadline         | "2024-11-25"                                                                         |
| `jobLocationType`    | Remote status    | "TELECOMMUTE"                                                                        |

## Environment Setup

### For Basic Scraping

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
```

### For AI Job Extraction

````powershell
### For Basic Scraping
```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
````

### For AI Job Extraction (Vertex AI)

```powershell
# Only this is needed - uses your Firebase credentials!
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
```

**Note:** Vertex AI uses your Firebase service account credentials - no separate API key needed!  
See [VERTEX_AI_SETUP.md](./VERTEX_AI_SETUP.md) for enabling Vertex AI in Google Cloud.

## Testing

```

Get your Gemini API key: https://makersuite.google.com/app/apikey

```

## Testing

Run `nx test scraping` to execute the unit tests.

See `src/test.ts` for working examples.

## Building

Run `nx build scraping` to build the library.

```

```
