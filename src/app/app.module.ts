import { CommonModule } from '@angular/common';
import { NgModule, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from './material-module';

import { AppComponent } from './components/app.component';
import { ContactComponent } from './components/main-nav/contact/contact.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './app-routing.module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { SkillpageComponent } from './components/skillpage/skillpage.component';
import { WikiintroComponent } from './components/skillpage/wikiintro/wikiintro.component';
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
import { LngBaseComponent } from './components/lng-base/lng-base.component';
import { StartPageModule } from './components/startpage/startpage.module';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
    return new TranslateHttpLoader(httpClient);
}




import { Observable, of } from 'rxjs';

export class StaticTranslateLoader implements TranslateLoader {
  private translations: any;

  constructor() {
    this.translations = {
      en: {
        "HELLO": "Hello",
        "WELCOME": "Welcome"
      },
      fr: {
        "HELLO": "Bonjour",
        "WELCOME": "Bienvenue"
      }
    };
  }

  getTranslation(lang: string): Observable<any> {
    return of(this.translations[lang]);
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
        // TranslateModule.forRoot({
        //     loader: {
        //         provide: TranslateLoader,
        //         useFactory: HttpLoaderFactory,
        //         deps: [HttpClient]
        //     }
        // }),
        TranslateModule.forRoot({
            loader: {
              provide: TranslateLoader,
              useClass: StaticTranslateLoader
            }
          }),
        MatButtonModule,
        MatButtonToggleModule], 
        providers: [
            provideHttpClient(withFetch(),  withInterceptorsFromDi()),
            provideExperimentalZonelessChangeDetection(),
        ]
})
export class AppModule { }


