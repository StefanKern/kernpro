import { enableProdMode, importProvidersFrom, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/components/app.component';
import { AngularFireModule } from '@angular/fire/compat';
import { provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { AppRoutingModule } from './app/app-routing.module';
import { GalleryModule } from '@ks89/angular-modal-gallery';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent,
   {
    providers: [
      importProvidersFrom(
        AppRoutingModule,
        GalleryModule,
        AngularFireModule.initializeApp(environment.firebase, 'kernpro'),
      ),
      provideHttpClient(withFetch(), withInterceptorsFromDi()),
      provideExperimentalZonelessChangeDetection(),
    ]
})
  .catch(err => console.error(err));
