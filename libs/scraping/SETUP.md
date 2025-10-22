# 🚀 Quick Setup Guide

## 1️⃣ Get Your Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (kernpro)
3. Click ⚙️ → **Project settings** → **Service accounts**
4. Click **Generate new private key**
5. Save as `serviceAccountKey.json`

## 2️⃣ Set Environment Variable

**PowerShell (Run this in your terminal):**

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS="C:\github\kernpro\serviceAccountKey.json"
```

## 3️⃣ Update Bucket Name

Edit `libs/scraping/src/test.ts`:

```typescript
const BUCKET_NAME = 'kernpro.appspot.com'; // Your actual bucket name
```

## 4️⃣ Enable Firebase Storage

```bash
firebase init storage
```

## 5️⃣ Uncomment Test Code

In `libs/scraping/src/test.ts`, uncomment:

```typescript
exampleScrapeAndStoreHybrid().catch(console.error);
```

## 6️⃣ Run!

```bash
npx tsx libs/scraping/src/test.ts
```

## ✅ Success Output

You should see:

```
Scraping and storing with hybrid approach...
Scraping https://...
Content stored in Cloud Storage at: scrapes/...
Content stored in Firestore with ID: abc123xyz
✓ Firestore ID: abc123xyz
✓ Storage path: gs://kernpro.appspot.com/scrapes/...
```

## 🔒 Security

✅ `serviceAccountKey.json` is already in `.gitignore`  
⚠️ **Never commit this file to Git!**

## 📚 Full Documentation

- **FIREBASE_CREDENTIALS_SETUP.md** - Detailed credential setup
- **QUICK_START.md** - Usage examples
- **SCRAPING_FIREBASE_GUIDE.md** - Complete guide

## ❓ Troubleshooting

**"Could not load credentials"** → Set `GOOGLE_APPLICATION_CREDENTIALS`  
**"Permission denied"** → Check IAM roles in Firebase Console  
**"Bucket not found"** → Update `BUCKET_NAME` in test.ts
