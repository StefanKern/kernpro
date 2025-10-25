# Gemini AI Job Posting Extraction

This guide explains how to use the scraping library with Gemini AI to extract structured job posting information from job sites and store it in Firebase.

## Overview

The scraping library now includes AI-powered extraction that:

1. **Scrapes** job posting HTML from any URL using Playwright
2. **Extracts** structured data using Gemini AI following schema.org's JobPosting schema
3. **Stores** the extracted data in Firebase Firestore
4. **Optionally stores** raw HTML in Cloud Storage for reference

## Setup

### 1. Install Dependencies

The required dependencies are already installed in the scraping library:

- `@google/generative-ai` - For Gemini AI
- `firebase-admin` - For Firebase integration
- `playwright` - For web scraping

### 2. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

Set it as an environment variable:

```powershell
$env:GEMINI_API_KEY="your-api-key-here"
```

Or pass it directly to the function.

### 3. Configure Firebase

Make sure your Firebase credentials are set up (see `FIREBASE_CREDENTIALS_SETUP.md`):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

## Usage

### Basic Example: Extract Single Job Posting

```typescript
import { scrapeAndExtractJobPosting } from '@scraping';

const result = await scrapeAndExtractJobPosting(
  'https://example.com/job-posting',
  process.env.GEMINI_API_KEY,
  'job-postings', // Firestore collection name
  'your-bucket-name', // Cloud Storage bucket (optional)
  'path/to/serviceAccount.json' // Firebase credentials (optional if env var set)
);

console.log('Job Title:', result.jobPosting.title);
console.log('Company:', result.jobPosting.hiringOrganization?.name);
console.log('Skills:', result.jobPosting.skills);
console.log('Firestore ID:', result.docId);
```

### Batch Example: Extract Multiple Job Postings

```typescript
import { scrapeAndExtractJobPostingsBatch } from '@scraping';

const jobUrls = ['https://example.com/job-1', 'https://example.com/job-2', 'https://example.com/job-3'];

const results = await scrapeAndExtractJobPostingsBatch(
  jobUrls,
  process.env.GEMINI_API_KEY,
  'job-postings',
  'your-bucket-name'
);

results.forEach((result) => {
  console.log(`${result.jobPosting.title} - ${result.docId}`);
});
```

### Run the Test Examples

The library includes ready-to-use examples in `src/test.ts`:

```powershell
# Set your API key first
$env:GEMINI_API_KEY="your-api-key-here"

# Run the scraping library
nx execute scraping
```

In `test.ts`, uncomment these lines to test:

```typescript
// Extract a single job posting
exampleExtractJobPosting().catch(console.error);

// OR batch extract multiple job postings
exampleBatchExtractJobPostings().catch(console.error);
```

## Extracted Data Schema

The extracted job posting follows the [schema.org JobPosting](https://schema.org/JobPosting) format:

### Required Fields

- `title` - Job title
- `description` - Full job description

### Recommended Fields

- `hiringOrganization` - Company information
  - `name` - Company name
  - `sameAs` - Company website URL
  - `logo` - Company logo URL
- `jobLocation` - Job location
  - `address` - Postal address with city, region, country
- `employmentType` - e.g., FULL_TIME, PART_TIME, CONTRACTOR
- `datePosted` - When the job was posted
- `validThrough` - Application deadline

### Additional Fields

- `baseSalary` - Salary information
  - `currency` - e.g., USD, EUR
  - `minValue` / `maxValue` - Salary range
  - `unitText` - e.g., HOUR, MONTH, YEAR
- `skills` - Array of required skills
- `qualifications` - Education and experience requirements
- `responsibilities` - Job responsibilities
- `educationRequirements` - Required education level
- `experienceRequirements` - Required experience
- `jobBenefits` - Benefits offered
- `workHours` - Expected work hours
- `jobLocationType` - TELECOMMUTE for remote jobs
- `industry` - Industry or sector

### Metadata

- `metadata.scrapedAt` - Timestamp when scraped
- `metadata.sourceUrl` - Original job posting URL
- `metadata.extractedBy` - "gemini-ai"
- `metadata.rawHtml` - Reference to raw HTML in Cloud Storage

## Firebase Storage Structure

### Firestore Collection: `job-postings`

Each document contains the full JobPosting schema:

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "Senior Angular Developer",
  "description": "We are looking for...",
  "hiringOrganization": {
    "name": "Tech Company Inc.",
    "sameAs": "https://techcompany.com"
  },
  "jobLocation": {
    "address": {
      "addressLocality": "Vienna",
      "addressRegion": "Vienna",
      "addressCountry": "Austria"
    }
  },
  "employmentType": ["FULL_TIME"],
  "skills": ["Angular", "TypeScript", "RxJS"],
  "baseSalary": {
    "currency": "EUR",
    "minValue": 50000,
    "maxValue": 70000,
    "unitText": "YEAR"
  },
  "metadata": {
    "scrapedAt": 1729872000000,
    "sourceUrl": "https://example.com/job",
    "extractedBy": "gemini-ai",
    "rawHtml": "job-postings/example-com-job-2024-10-25.html"
  }
}
```

### Cloud Storage: Raw HTML (optional)

If you provide a bucket name, raw HTML is stored at:

```
gs://your-bucket/job-postings/sanitized-url-timestamp.html
```

## API Reference

### `scrapeAndExtractJobPosting`

Scrapes a job posting URL and extracts structured data.

**Parameters:**

- `url: string` - Job posting URL to scrape
- `geminiApiKey: string` - Google AI API key
- `collectionName?: string` - Firestore collection (default: 'job-postings')
- `bucketName?: string` - Cloud Storage bucket for raw HTML (optional)
- `serviceAccountPath?: string` - Firebase service account path (optional)

**Returns:**

```typescript
{
  docId: string;              // Firestore document ID
  storagePath?: string;       // Cloud Storage path (if bucket provided)
  jobPosting: JobPosting;     // Extracted job posting data
  extractionResult: {
    jobPosting: JobPosting;
    extractionSuccessful: boolean;
    errors?: string[];
    warnings?: string[];
  }
}
```

### `scrapeAndExtractJobPostingsBatch`

Batch process multiple job posting URLs.

**Parameters:**

- `urls: string[]` - Array of job posting URLs
- `geminiApiKey: string` - Google AI API key
- `collectionName?: string` - Firestore collection (default: 'job-postings')
- `bucketName?: string` - Cloud Storage bucket (optional)
- `serviceAccountPath?: string` - Firebase service account path (optional)

**Returns:** Array of results (same structure as single extraction)

### `GeminiJobExtractor` Class

Low-level class for direct AI extraction without Firebase storage.

```typescript
import { GeminiJobExtractor } from '@scraping';

const extractor = new GeminiJobExtractor(apiKey);
const result = await extractor.extractJobPosting(htmlContent, sourceUrl);
```

## Error Handling

The extraction process handles errors gracefully:

```typescript
const result = await scrapeAndExtractJobPosting(url, apiKey);

if (!result.extractionResult.extractionSuccessful) {
  console.error('Extraction errors:', result.extractionResult.errors);
  // Still stored in Firebase with partial data
}
```

## Cost Considerations

### Gemini API Pricing

- **Gemini 1.5 Flash** (used by default): Very cost-effective
  - Input: $0.075 / 1M tokens
  - Output: $0.30 / 1M tokens
- A typical job posting extraction uses ~5,000-10,000 tokens
- **Cost per job posting**: ~$0.001-0.002 (very cheap!)

### Firebase Pricing

- **Firestore**: Pay per document read/write
- **Cloud Storage**: Pay per GB stored
- Free tier is usually sufficient for testing

## Best Practices

1. **Set Environment Variables**: Use environment variables for API keys

   ```powershell
   $env:GEMINI_API_KEY="your-key"
   $env:GOOGLE_APPLICATION_CREDENTIALS="path/to/serviceAccount.json"
   ```

2. **Rate Limiting**: The batch function includes automatic delays between requests

3. **Error Recovery**: Always check `extractionSuccessful` flag

4. **Store Raw HTML**: Provide `bucketName` to keep raw HTML for debugging

5. **Monitor Costs**: Track Gemini API usage in Google Cloud Console

## Querying Stored Data

You can query the stored job postings from Firestore:

```typescript
import { initializeFirebaseAdmin } from '@scraping';
import { getFirestore } from 'firebase-admin/firestore';

initializeFirebaseAdmin();
const db = getFirestore();

// Get all job postings
const snapshot = await db.collection('job-postings').get();
const jobs = snapshot.docs.map((doc) => doc.data());

// Query by company
const companyJobs = await db
  .collection('job-postings')
  .where('hiringOrganization.name', '==', 'Tech Company Inc.')
  .get();

// Query by skills
const angularJobs = await db.collection('job-postings').where('skills', 'array-contains', 'Angular').get();
```

## Troubleshooting

### "Gemini API key is required"

Make sure to set the `GEMINI_API_KEY` environment variable or pass it to the function.

### "Failed to initialize Firebase Admin"

Set `GOOGLE_APPLICATION_CREDENTIALS` environment variable or pass the service account path.

### Extraction errors

Check `extractionResult.errors` for details. The HTML might not contain expected job posting structure.

### Token limit exceeded

The extractor limits HTML to ~30,000 characters. For very large pages, this might truncate content.

## Next Steps

- Integrate with your job search application
- Build a dashboard to visualize extracted jobs
- Set up scheduled scraping with Firebase Functions
- Add filters and search functionality
- Create analytics on job market trends

## Support

For issues or questions, refer to:

- [Gemini API Documentation](https://ai.google.dev/docs)
- [schema.org JobPosting](https://schema.org/JobPosting)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
