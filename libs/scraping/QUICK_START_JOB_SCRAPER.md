# Quick Start: Job Posting Scraper with Gemini AI

This guide will help you quickly set up and run the job posting scraper with AI extraction.

## Prerequisites

✅ Firebase project configured (see `FIREBASE_CREDENTIALS_SETUP.md`)  
✅ Service account key file (`serviceAccountKey.json`)  
✅ Cloud Storage bucket created (see `STORAGE_BUCKET_SETUP.md`)  
✅ Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## Step 1: Set Environment Variables

Open PowerShell in the project root and run:

```powershell
# Set your Gemini API key
$env:GEMINI_API_KEY="your-gemini-api-key-here"

# Set Firebase credentials (if not already set)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

## Step 2: Test the Extraction

Open `libs/scraping/src/test.ts` and uncomment one of these lines:

```typescript
// For a single job posting:
exampleExtractJobPosting().catch(console.error);

// For multiple job postings:
// exampleBatchExtractJobPostings().catch(console.error);
```

## Step 3: Run the Scraper

```powershell
nx execute scraping
```

You should see output like:

```
🤖 Scraping and extracting job posting with Gemini AI...
Scraping https://www.stepstone.at/...
✓ Scraped 125432 characters of HTML
Extracting job posting data with Gemini AI...
✓ Successfully extracted job posting data
✓ Stored raw HTML at: job-postings/stepstone-at-...html
✓ Stored job posting in Firestore with ID: abc123xyz

✓ Job Posting Extracted:
  Title: Angular Web Developer (m/w/d)
  Company: IVM Technical Consultants
  Location: { addressLocality: 'Wien', addressCountry: 'Austria' }
  Employment Type: [ 'FULL_TIME' ]
  Skills: [ 'Angular', 'TypeScript', 'HTML', 'CSS', 'JavaScript' ]
  Firestore ID: abc123xyz
  Raw HTML stored at: job-postings/stepstone-at-...html
```

## Step 4: View Results in Firebase

### Firestore Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click "Firestore Database"
4. Look for the `job-postings` collection
5. Click on a document to see the extracted data

### Cloud Storage Console

1. In Firebase Console, click "Storage"
2. Navigate to `job-postings/` folder
3. You'll see the raw HTML files stored there

## Step 5: Use in Your Code

### Extract a Single Job Posting

```typescript
import { scrapeAndExtractJobPosting } from './lib/scrape-and-store';

async function scrapeJob(url: string) {
  const result = await scrapeAndExtractJobPosting(
    url,
    process.env.GEMINI_API_KEY!,
    'job-postings', // Firestore collection
    'kernpro-5a9d1.firebasestorage.app', // Your bucket
    'C:\\github\\kernpro\\serviceAccountKey.json'
  );

  console.log('Job Title:', result.jobPosting.title);
  console.log('Company:', result.jobPosting.hiringOrganization?.name);
  console.log('Skills:', result.jobPosting.skills);
  console.log('Salary:', result.jobPosting.baseSalary);

  return result;
}

// Use it
const jobUrl = 'https://www.stepstone.at/...';
scrapeJob(jobUrl);
```

### Extract Multiple Jobs

```typescript
import { scrapeAndExtractJobPostingsBatch } from './lib/scrape-and-store';

async function scrapeMultipleJobs(urls: string[]) {
  const results = await scrapeAndExtractJobPostingsBatch(
    urls,
    process.env.GEMINI_API_KEY!,
    'job-postings',
    'kernpro-5a9d1.firebasestorage.app'
  );

  console.log(`Extracted ${results.length} jobs`);

  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.jobPosting.title}`);
    console.log(`   Company: ${result.jobPosting.hiringOrganization?.name}`);
    console.log(`   Firestore ID: ${result.docId}`);
  });

  return results;
}

// Use it
const jobUrls = ['https://www.stepstone.at/job-1', 'https://www.stepstone.at/job-2', 'https://www.stepstone.at/job-3'];
scrapeMultipleJobs(jobUrls);
```

## What Gets Extracted?

The AI extracts structured data following the [schema.org JobPosting](https://schema.org/JobPosting) format:

### Core Information

- **Title**: Job title
- **Description**: Full job description
- **Company**: Organization name, website, logo
- **Location**: City, region, country
- **Employment Type**: FULL_TIME, PART_TIME, CONTRACTOR, etc.

### Compensation

- **Salary**: Currency, min/max range, unit (hourly/monthly/yearly)

### Requirements

- **Skills**: List of required skills and technologies
- **Education**: Required education level
- **Experience**: Required years/type of experience
- **Qualifications**: Detailed qualification requirements

### Additional Details

- **Responsibilities**: Main job responsibilities
- **Benefits**: Job benefits and perks
- **Work Hours**: Expected work schedule
- **Remote Work**: Whether job is remote (TELECOMMUTE)
- **Application Deadline**: validThrough date
- **Posted Date**: When the job was posted

### Metadata

- **Source URL**: Original job posting URL
- **Scraped Timestamp**: When the data was extracted
- **Raw HTML Reference**: Link to stored HTML in Cloud Storage

## Querying Extracted Jobs

### Get All Jobs

```typescript
import { initializeFirebaseAdmin } from './lib/firebase-storage';
import { getFirestore } from 'firebase-admin/firestore';

initializeFirebaseAdmin();
const db = getFirestore();

const jobs = await db.collection('job-postings').get();
jobs.forEach((doc) => {
  const job = doc.data();
  console.log(`${job.title} at ${job.hiringOrganization?.name}`);
});
```

### Search by Skills

```typescript
// Find Angular jobs
const angularJobs = await db.collection('job-postings').where('skills', 'array-contains', 'Angular').get();

console.log(`Found ${angularJobs.size} Angular jobs`);
```

### Search by Company

```typescript
const companyJobs = await db
  .collection('job-postings')
  .where('hiringOrganization.name', '==', 'IVM Technical Consultants')
  .get();
```

### Search by Location

```typescript
const viennaJobs = await db.collection('job-postings').where('jobLocation.address.addressLocality', '==', 'Wien').get();
```

## Common Job Sites to Scrape

The scraper works with most job posting websites:

- **StepStone.at**: ✅ Tested and working
- **LinkedIn**: ✅ Should work (requires login)
- **Indeed**: ✅ Should work
- **Monster**: ✅ Should work
- **Karriere.at**: ✅ Should work
- **Company career pages**: ✅ Should work

## Costs

### Gemini API

- **Model**: gemini-1.5-flash (fast and cheap)
- **Cost per job**: ~$0.001-0.002 (very low!)
- **1000 jobs**: ~$1-2

### Firebase

- **Firestore**: ~$0.06 per 100k writes
- **Cloud Storage**: ~$0.026 per GB/month
- **Free tier**: Usually sufficient for testing

## Tips

1. **Start with one URL** to test before batch processing
2. **Check extraction errors** using `extractionResult.errors`
3. **Store raw HTML** by providing bucket name (helpful for debugging)
4. **Add delays** between requests to avoid rate limiting (built-in for batch)
5. **Monitor API usage** in Google Cloud Console

## Troubleshooting

### Error: "Gemini API key is required"

```powershell
$env:GEMINI_API_KEY="your-key-here"
```

### Error: "Failed to initialize Firebase"

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

### Playwright browser issues

Make sure Playwright browsers are installed:

```powershell
npx playwright install chromium
```

### Extraction not accurate

- The AI does its best with the HTML structure
- Check `extractionResult.errors` for specific issues
- Some sites may have unusual HTML that's hard to parse
- Raw HTML is stored in Cloud Storage for manual review

## Next Steps

1. ✅ Test with a single job posting
2. ✅ Verify data in Firebase Console
3. ✅ Test batch extraction with multiple URLs
4. 📋 Build a UI to display extracted jobs
5. 📋 Add scheduled scraping with Firebase Functions
6. 📋 Create analytics and trends dashboard
7. 📋 Set up notifications for new jobs matching criteria

## Need Help?

See the full documentation:

- `GEMINI_JOB_EXTRACTION.md` - Complete guide
- `FIREBASE_CREDENTIALS_SETUP.md` - Firebase setup
- `STORAGE_BUCKET_SETUP.md` - Cloud Storage setup
- [Gemini API Docs](https://ai.google.dev/docs)
- [schema.org JobPosting](https://schema.org/JobPosting)
