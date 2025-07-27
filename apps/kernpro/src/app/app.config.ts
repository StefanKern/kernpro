import {
  provideHttpClient,
  withFetch,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZonelessChangeDetection,
} from '@angular/core';
import { getAI, provideAI } from '@angular/fire/ai';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import {
  initializeAppCheck,
  provideAppCheck,
  ReCaptchaV3Provider,
} from '@angular/fire/app-check';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { routes } from './app.routes';

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
      initializeApp({
        projectId: 'kernpro-b1003',
        appId: '1:994623599132:web:c514a439a8975ac4eb65d9',
        storageBucket: 'kernpro-b1003.firebasestorage.app',
        apiKey: 'AIzaSyDHMplKsO4kg7hexsMzV4I6Ct8Ml6Ma8jg',
        authDomain: 'kernpro-b1003.firebaseapp.com',
        messagingSenderId: '994623599132',
      })
    ),
    provideAppCheck(() => {
      const provider = new ReCaptchaV3Provider(
        '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MX2J'
      );
      return initializeAppCheck(undefined, {
        provider,
        isTokenAutoRefreshEnabled: true,
      });
    }),
    provideAI(() => getAI()),
  ],
};
