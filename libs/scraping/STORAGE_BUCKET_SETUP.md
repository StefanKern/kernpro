# 🔧 Firebase Storage Bucket Setup

## Problem: "The specified bucket does not exist"

This means you haven't created a Firebase Storage bucket yet.

## Solution: Create Your Storage Bucket

### Option 1: Using Firebase Console (Easiest)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (kernpro)
3. Click **Storage** in the left menu
4. Click **Get Started**
5. Choose security rules (start in test mode for development)
6. Select a location (europe-west1 recommended for you)
7. Click **Done**

Your bucket will be created as `projectid.appspot.com` or `projectid.firebasestorage.app`

### Option 2: Using Firebase CLI

```bash
firebase init storage
```

Follow the prompts to create your storage bucket.

### Option 3: Just Use Firestore (No Storage Needed)

If you don't need Cloud Storage, just use Firestore-only storage:

```typescript
// Instead of hybrid approach
await scrapeAndStoreInFirestore(url, 'job-scrapes', SERVICE_ACCOUNT_PATH);
```

**Note:** Firestore has a 1 MB document size limit. Your current scraped content is ~618 KB, so it fits!

## How to Find Your Bucket Name

After creating storage:

1. Go to Firebase Console → **Storage**
2. Your bucket name is shown at the top
3. Update `BUCKET_NAME` in `test.ts`:

```typescript
const BUCKET_NAME = 'your-actual-bucket-name.appspot.com';
```

## Quick Test

### Test 1: Firestore Only (No Storage Setup Needed)

```typescript
// In test.ts, use this instead:
exampleScrapeAndStore().catch(console.error);
```

Run:

```bash
npx tsx libs/scraping/src/test.ts
```

✅ **This should work immediately** (no storage bucket required)

### Test 2: Hybrid Storage (After Creating Bucket)

1. Create storage bucket (see above)
2. Update `BUCKET_NAME` in test.ts
3. Run:

```typescript
exampleScrapeAndStoreHybrid().catch(console.error);
```

## Recommended Approach

For your job scraping use case (618 KB HTML):

1. **Start with Firestore-only** - It's simpler and your content fits
2. **Upgrade to hybrid later** - If you need to store larger pages or save costs

```typescript
// Simple start (Firestore only)
const docId = await scrapeAndStoreInFirestore('https://example.com', 'job-scrapes');
```

Later, if needed:

```typescript
// Upgrade to hybrid (cheaper, no size limits)
const { docId, storagePath } = await scrapeAndStoreHybrid(
  'https://example.com',
  'job-scrapes',
  'your-bucket-name.appspot.com'
);
```
