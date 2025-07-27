import { ApplicationConfig, importProvidersFrom, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { GalleryModule } from '@ks89/angular-modal-gallery';
import { provideAnimations } from '@angular/platform-browser/animations';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAI, provideAI } from '@angular/fire/ai';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom([
      GalleryModule
    ]),
    provideRouter(routes,
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled'
      })
    ),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideFirebaseApp(() => initializeApp({
      projectId: "kernpro-b1003",
      appId: "1:994623599132:web:c514a439a8975ac4eb65d9",
      storageBucket: "kernpro-b1003.firebasestorage.app",
      apiKey: "AIzaSyDHMplKsO4kg7hexsMzV4I6Ct8Ml6Ma8jg",
      authDomain: "kernpro-b1003.firebaseapp.com",
      messagingSenderId: "994623599132"
    })),
    provideAI(() => getAI())
  ]
};
