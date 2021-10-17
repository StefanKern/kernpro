import { MaterialModule } from './material-module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';

import {AppComponent} from './components/app.component';
import {ContactComponent} from './components/main-nav/contact/contact.component';

import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MainNavComponent} from './components/main-nav/main-nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {AppRoutingModule} from './app-routing.module';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {SkillpageComponent} from './components/skillpage/skillpage.component';
import {WikiintroComponent} from './components/skillpage/wikiintro/wikiintro.component';
// for firebase db
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {SidetreemenuComponent} from './components/skillpage/sidetreemenu/sidetreemenu.component';
import { ScullyLibModule } from '@scullyio/ng-lib';

import { StartPageModule } from './components/startpage/startpage.module';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient);
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
    ScullyLibModule,
    StartPageModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    MatButtonModule,
    MatButtonToggleModule
  ],
  providers: [],
})
export class AppModule { }
