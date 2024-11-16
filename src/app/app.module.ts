import { LayoutModule } from '@angular/cdk/layout';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './components/app.component';
import { ContactComponent } from './components/main-nav/contact/contact.component';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { SkillpageComponent } from './components/skillpage/content/skillpage.component';
import { MaterialModule } from './material-module';

// for firebase db
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from '../environments/environment';
import { SidetreemenuComponent } from './components/skillpage/sidetreemenu/sidetreemenu.component';

import { HttpClient, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { Observable } from 'rxjs';
import { LngBaseComponent } from './components/lng-base/lng-base.component';
import { StartPageModule } from './components/startpage/startpage.module';
import { WikiintroComponent } from './components/skillpage/content/wikiintro/wikiintro.component';

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
    AppComponent,
    ContactComponent,
    MainNavComponent,
    PagenotfoundComponent,
    SkillpageComponent,
    WikiintroComponent,
    SidetreemenuComponent,
    LngBaseComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase, 'kernpro'),
    AngularFirestoreModule,
    MaterialModule,
    StartPageModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatButtonModule,
    MatButtonToggleModule],
  providers: [
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideExperimentalZonelessChangeDetection(),
  ]
})
export class AppModule { }


