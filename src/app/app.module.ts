import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';

// for firebase db
import { AngularFireModule } from '@angular/fire/compat';
import { environment } from '../environments/environment';

import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { RouterOutlet } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable } from 'rxjs';
import { AppComponent } from './components/app.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { StartPageModule } from './components/startpage/startpage.module';

// AoT requires an exported function for factories
function HttpLoaderFactory(httpClient: HttpClient) {
  if (isPlatformBrowser(this.platformId)) {
    return new TranslateHttpLoader(httpClient);
  } else {
    // workaround for loading resurces in the prerendering... (forgot SO link)
    return new CustomTranslateLoader(httpClient, 'http://localhost:4200/assets/i18n/');
  }
}

class CustomTranslateLoader implements TranslateLoader {
  constructor(private http: HttpClient, private prefix: string = '/assets/i18n/', private suffix: string = '.json') { }

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.prefix}${lang}${this.suffix}`);
  }
}


@NgModule({
  declarations: [
    PagenotfoundComponent,
    AppComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'kernpro'),
    StartPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MainNavComponent,
    RouterOutlet
  ],
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideExperimentalZonelessChangeDetection(),
  ]
})
export class AppModule { }


