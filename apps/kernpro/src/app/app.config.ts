import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import env from '../../../../env.local.json';
import {
  ApplicationConfig,
  EnvironmentProviders,
  importProvidersFrom,
  Provider,
  provideZonelessChangeDetection,
} from '@angular/core';
import { getAI, provideAI } from '@angular/fire/ai';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { initializeAppCheck, provideAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { routes } from './app.routes';

// Conditionally provide App Check only in the browser
function provideAppCheckForBrowser(): Provider | EnvironmentProviders {
  if (typeof window !== 'undefined') {
    return provideAppCheck(() => {
      // recaptcha key can be found here: https://console.firebase.google.com/project/kernpro-5a9d1/appcheck/apps
      const provider = new ReCaptchaV3Provider(env.recaptcha);
      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
    });
  }
  // Return an empty provider array for SSR
  return [];
}

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([GalleryModule]),
    provideRouter(
      routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideFirebaseApp(() =>
      // config can be found here: https://console.firebase.google.com/project/kernpro-5a9d1/settings/general/web:Mzk2ODE1OWUtZDdiNy00N2UxLTkwNjEtMzU3Nzk3ODU1NTJi
      initializeApp(env.firebase)
    ),
    provideAppCheckForBrowser(),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    provideAI(() => getAI()),
  ],
};
