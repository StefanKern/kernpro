# Firebase Credentials Setup

To use Firebase Admin SDK locally, you need to set up authentication credentials.

## Step 1: Download Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Go to the **Service accounts** tab
5. Click **Generate new private key**
6. Save the JSON file as `serviceAccountKey.json` in a secure location

## Step 2: Choose Your Authentication Method

### Option A: Use Environment Variable (Recommended)

Set the environment variable to point to your service account file:

**PowerShell:**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\serviceAccountKey.json"
```

To make it permanent, add to your PowerShell profile:

```powershell
notepad $PROFILE
# Add the line above to the file
```

**Command Prompt:**

```cmd
set GOOGLE_APPLICATION_CREDENTIALS=C:\path\to\serviceAccountKey.json
```

Then run your script normally:

```bash
npx tsx libs/scraping/src/test.ts
```

### Option B: Pass Path Directly in Code

Update your test.ts to pass the service account path:

```typescript
const result = await scrapeAndStoreHybrid(
  url,
  'job-scrapes',
  'your-project.appspot.com',
  './serviceAccountKey.json' // Path to service account file
);
```

**Finding Your Bucket Name:**

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Go to **Storage** in the left menu
3. If you see "Get Started", click it to create a bucket
4. Your bucket name will be displayed at the top (usually `projectid.appspot.com`)

**Or use Firebase CLI:**

```bash
firebase init storage
# Follow the prompts to create a storage bucket
```

### Option C: Store in Project Root (Not Recommended for Production)

1. Place `serviceAccountKey.json` in your project root: `C:\github\kernpro\serviceAccountKey.json`
2. Add to `.gitignore`:
   ```
   serviceAccountKey.json
   ```
3. Set environment variable:
   ```powershell
   $env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
   ```

## Step 3: Test Your Setup

Run your scraping script:

```bash
npx tsx libs/scraping/src/test.ts
```

If successful, you should see:

```
Scraping and storing with hybrid approach...
Scraping https://...
Content stored in Cloud Storage at: ...
Content stored in Firestore with ID: ...
Successfully stored content for ... Firestore ID: abc123, Storage: gs://...
```

## Important Security Notes

⚠️ **NEVER commit service account keys to version control!**

Add to your `.gitignore`:

```
serviceAccountKey.json
**/serviceAccountKey.json
*.json # Only if you don't have other important JSON files
```

## Troubleshooting

### Error: "Could not load the default credentials"

- Make sure `GOOGLE_APPLICATION_CREDENTIALS` is set correctly
- Verify the path exists and is accessible
- Try using absolute paths instead of relative paths

### Error: "Permission denied"

- Make sure your service account has the following roles:
  - **Cloud Datastore User** (for Firestore)
  - **Storage Object Admin** (for Cloud Storage)
- You can add these in Firebase Console → IAM & Admin → IAM

### Error: "Service account JSON file not found"

- Double-check the file path
- Use absolute paths in PowerShell: `C:\full\path\to\file.json`
- Make sure the file wasn't corrupted during download

## For Firebase Functions (Production)

When running in Firebase Functions, credentials are automatically provided. No setup needed!

```typescript
// In Firebase Functions, this works automatically
const result = await scrapeAndStoreHybrid(
  url,
  'job-scrapes',
  'your-project.appspot.com'
  // No serviceAccountPath needed
);
```
