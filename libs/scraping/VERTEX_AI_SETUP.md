# Vertex AI Setup Guide

This guide will help you enable and configure Vertex AI for the job scraping library.

## Why Vertex AI?

The scraping library now uses **Vertex AI** instead of the Google AI Studio API. This means:

✅ **No separate API key needed** - Uses your existing Firebase service account credentials  
✅ **Same authentication** - One credential system for Firebase + AI  
✅ **Higher rate limits** - Suitable for production workloads  
✅ **Enterprise-grade** - Better monitoring, logging, and control

## Prerequisites

- ✅ Google Cloud project (you already have this: `kernpro-5a9d1`)
- ✅ Firebase service account JSON file (you already have `serviceAccountKey.json`)
- ⚠️ Vertex AI API needs to be enabled (see below)
- ⚠️ Billing must be enabled on your Google Cloud project

## Step 1: Enable Vertex AI API

### Option A: Via Google Cloud Console (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project: **kernpro-5a9d1**
3. Navigate to **Vertex AI** from the menu
4. Click **Enable Vertex AI API**
5. Wait for the API to be enabled (~30 seconds)

### Option B: Via Command Line

```powershell
# Install gcloud CLI first if you haven't: https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login

# Set your project
gcloud config set project kernpro-5a9d1

# Enable Vertex AI API
gcloud services enable aiplatform.googleapis.com
```

## Step 2: Enable Billing (if not already enabled)

Vertex AI requires billing to be enabled (even though there's a free tier):

1. Go to [Google Cloud Console - Billing](https://console.cloud.google.com/billing)
2. Select your project: **kernpro-5a9d1**
3. Link a billing account (or create one if you don't have it)
4. Add a payment method

**Don't worry about costs:**

- You get $300 free credits for new accounts
- Gemini pricing is very affordable (~$0.001-0.002 per job)
- You can set budget alerts to avoid surprises

## Step 3: Grant Permissions to Service Account

Your service account needs permissions to use Vertex AI:

1. Go to [IAM & Admin](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account (it should look like: `firebase-adminsdk-xxxxx@kernpro-5a9d1.iam.gserviceaccount.com`)
3. Click **Edit** (pencil icon)
4. Click **Add Another Role**
5. Add these roles:
   - **Vertex AI User** (`roles/aiplatform.user`)
   - **Service Account Token Creator** (`roles/iam.serviceAccountTokenCreator`) - if not already added
6. Click **Save**

### Option B: Via Command Line

```powershell
# Replace with your actual service account email
$SERVICE_ACCOUNT="firebase-adminsdk-xxxxx@kernpro-5a9d1.iam.gserviceaccount.com"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding kernpro-5a9d1 `
  --member="serviceAccount:$SERVICE_ACCOUNT" `
  --role="roles/aiplatform.user"
```

## Step 4: Verify Setup

Test that everything works:

```powershell
# Set environment variable (if not already set)
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"

# Run a test (uncomment in test.ts first)
nx execute scraping
```

## Configuration

### Environment Variables

```powershell
# Required: Path to service account JSON
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

### Code Configuration

The library is already configured with these defaults:

```typescript
const PROJECT_ID = 'kernpro-5a9d1'; // Your Google Cloud project ID
const VERTEX_LOCATION = 'us-central1'; // Vertex AI location
const SERVICE_ACCOUNT_PATH = process.env['GOOGLE_APPLICATION_CREDENTIALS'];
```

## Vertex AI Locations

You can choose different locations for Vertex AI based on your needs:

| Location          | Region        | Best For                      |
| ----------------- | ------------- | ----------------------------- |
| `us-central1`     | Iowa, USA     | Default, lowest latency in US |
| `us-east4`        | Virginia, USA | East coast US                 |
| `europe-west1`    | Belgium       | EU data residency             |
| `europe-west4`    | Netherlands   | EU data residency             |
| `asia-northeast1` | Tokyo         | Asia Pacific                  |

**For Austria/EU users**, consider using `europe-west1` or `europe-west4` for data residency.

To change location, update in `test.ts`:

```typescript
const VERTEX_LOCATION = 'europe-west1'; // EU location
```

## Pricing

### Gemini Models via Vertex AI

| Model                    | Input (per 1M tokens) | Output (per 1M tokens) |
| ------------------------ | --------------------- | ---------------------- |
| **gemini-2.0-flash-exp** | $0.075                | $0.30                  |
| **gemini-1.5-flash**     | $0.075                | $0.30                  |
| **gemini-1.5-pro**       | $1.25                 | $5.00                  |

### Cost Examples for Job Scraping

Typical job posting: ~5,000-10,000 input tokens, ~500-1,000 output tokens

| Jobs        | Model                | Estimated Cost |
| ----------- | -------------------- | -------------- |
| 100 jobs    | gemini-2.0-flash-exp | ~$0.10         |
| 1,000 jobs  | gemini-2.0-flash-exp | ~$1.00         |
| 10,000 jobs | gemini-2.0-flash-exp | ~$10.00        |

**Very affordable!** 🎉

### Set Budget Alerts

1. Go to [Budgets & Alerts](https://console.cloud.google.com/billing/budgets)
2. Click **Create Budget**
3. Set a monthly budget (e.g., $10)
4. Set alert thresholds (e.g., 50%, 90%, 100%)
5. Add email notifications

## Usage

### Basic Usage

```typescript
import { scrapeAndExtractJobPosting } from './lib/scrape-and-store';

const result = await scrapeAndExtractJobPosting(
  'https://job-url.com',
  'kernpro-5a9d1', // Project ID
  'job-postings', // Firestore collection
  'your-bucket.appspot.com', // Cloud Storage bucket
  'C:\\path\\to\\serviceAccountKey.json', // Service account
  'us-central1' // Vertex AI location
);
```

### With Environment Variables

```typescript
const result = await scrapeAndExtractJobPosting(
  jobUrl,
  'kernpro-5a9d1',
  'job-postings',
  'kernpro-5a9d1.firebasestorage.app',
  process.env.GOOGLE_APPLICATION_CREDENTIALS,
  'us-central1'
);
```

## Troubleshooting

### Error: "Vertex AI API not enabled"

**Solution:** Enable the API at https://console.cloud.google.com/vertex-ai

### Error: "Permission denied"

**Solution:** Grant your service account the "Vertex AI User" role:

```powershell
gcloud projects add-iam-policy-binding kernpro-5a9d1 `
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@kernpro-5a9d1.iam.gserviceaccount.com" `
  --role="roles/aiplatform.user"
```

### Error: "Billing not enabled"

**Solution:** Enable billing at https://console.cloud.google.com/billing

### Error: "Could not load credentials"

**Solution:** Set the environment variable:

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

### Error: "Invalid project ID"

**Solution:** Verify your project ID at https://console.cloud.google.com/

## Monitoring & Logging

### View API Usage

1. Go to [Vertex AI Dashboard](https://console.cloud.google.com/vertex-ai)
2. View metrics for:
   - API calls
   - Token usage
   - Costs
   - Latency

### View Logs

1. Go to [Logs Explorer](https://console.cloud.google.com/logs)
2. Filter by: `resource.type="aiplatform.googleapis.com/Endpoint"`
3. View detailed request/response logs

## Benefits vs Google AI Studio API

| Feature          | Google AI Studio | Vertex AI               |
| ---------------- | ---------------- | ----------------------- |
| Authentication   | Separate API key | Firebase credentials ✅ |
| Rate Limits      | 15-60 req/min    | Thousands req/min ✅    |
| Free Tier        | Yes (limited)    | No (pay per use)        |
| Production Ready | Limited          | Yes ✅                  |
| Monitoring       | Basic            | Advanced ✅             |
| SLA              | No               | Yes ✅                  |
| Data Residency   | No control       | Regional ✅             |

## Next Steps

1. ✅ Enable Vertex AI API
2. ✅ Enable billing
3. ✅ Grant service account permissions
4. ✅ Test with a single job posting
5. 📋 Set up budget alerts
6. 📋 Monitor usage and costs
7. 📋 Deploy to production

## Support Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Gemini API Guide](https://cloud.google.com/vertex-ai/generative-ai/docs/model-reference/gemini)
- [Pricing Calculator](https://cloud.google.com/products/calculator)
- [Vertex AI Quotas](https://cloud.google.com/vertex-ai/docs/quotas)

---

**You're all set!** 🚀 Your scraping library now uses the same credentials as Firebase, making everything unified and production-ready.
