# Enable Google Authentication in Firebase

## Step 1: Enable Google Sign-In Provider

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your **kernpro** project
3. Click **Authentication** in the left menu (or Build → Authentication)
4. Click **Get Started** (if not already enabled)
5. Go to the **Sign-in method** tab
6. Click on **Google** in the providers list
7. Toggle **Enable**
8. Select a **Project support email** (your email)
9. Click **Save**

## Step 2: Test the Authentication Flow

1. Start your app: `nx serve kernpro`
2. Navigate to: `http://localhost:4200/scraped-sites`
3. You should be redirected to `/login`
4. Click **Sign in with Google**
5. Sign in with your Google account
6. You'll be redirected back to `/scraped-sites` and see your scraped job sites

## Security Features Implemented

✅ **Authentication Required** - Users must sign in with Google to access scraped sites
✅ **Protected Route** - `/scraped-sites` route protected by `authGuard`
✅ **Firestore Security Rules** - Only authenticated users can read from `job-scrapes` collection
✅ **Sign Out** - Users can sign out from the scraped-sites page
✅ **Auto Redirect** - Unauthenticated users redirected to `/login`

## What's Protected

- **Route**: `/scraped-sites` requires authentication
- **Firestore**: `job-scrapes` collection requires `request.auth != null`
- **Writes**: Only Cloud Functions/Admin SDK can write to `job-scrapes`

## User Flow

1. User visits `/scraped-sites` → Redirected to `/login` (if not authenticated)
2. User clicks "Sign in with Google" → Google sign-in popup
3. User signs in → Redirected to `/scraped-sites`
4. User sees scraped job sites (only if authenticated)
5. User clicks "Sign Out" → Signed out and redirected to `/login`

## Additional Security (Optional)

If you want to restrict access to only specific email addresses:

### Option 1: Firebase Security Rules (Firestore)

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /job-scrapes/{document} {
      // Only allow your specific email
      allow read: if request.auth != null &&
                     request.auth.token.email == 'your-email@gmail.com';
      allow write: if false;
    }
  }
}
```

### Option 2: Auth Guard (Client-side)

Create an admin guard in `apps/kernpro/src/app/guards/admin.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs/operators';

const ALLOWED_EMAILS = ['your-email@gmail.com'];

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user && ALLOWED_EMAILS.includes(user.email || '')) {
        return true;
      }
      return router.createUrlTree(['/']);
    })
  );
};
```

Then update the route:

```typescript
{
  path: 'scraped-sites',
  loadComponent: () => import('./pages/scraped-sites').then((m) => m.ScrapedSites),
  title: 'Scraped Job Sites',
  canActivate: [authGuard, adminGuard], // Both guards
}
```

## Troubleshooting

### "Permission denied" error

- Make sure Google Sign-In is enabled in Firebase Console
- Make sure Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check that the user is signed in

### Sign-in popup blocked

- Allow popups in your browser for localhost
- Or use redirect method instead of popup (update `auth.service.ts`)

### Rules not working

- Wait a few seconds after deploying rules
- Check rules in Firebase Console → Firestore → Rules tab
- Test rules using the Rules Playground in Firebase Console
