import { MaterialModule } from './material-module';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';

import {AppComponent} from './components/app.component';
import {AboutmeComponent} from './components/startpage/aboutme/aboutme.component';
import {IntroComponent} from './components/startpage/intro/intro.component';
import {SkillsComponent} from './components/startpage/skills/skills.component';
import {ContactComponent} from './components/main-nav/contact/contact.component';
import {TimelineComponent} from './components/startpage/timeline/timeline.component';
import {StartpageComponent} from './components/startpage/startpage.component';

import {WordcloudComponent} from './libs/wordcloud/wordcloud.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {MainNavComponent} from './components/main-nav/main-nav.component';
import {LayoutModule} from '@angular/cdk/layout';
import {AppRoutingModule} from './app-routing.module';
import {PagenotfoundComponent} from './components/pagenotfound/pagenotfound.component';
import {TimelineintersectionDirective} from './directives/intersections/timelineintersection.directive';
import {SkillpageComponent} from './components/skillpage/skillpage.component';
import {WikiintroComponent} from './components/skillpage/wikiintro/wikiintro.component';
// for firebase db
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {SidetreemenuComponent} from './components/skillpage/sidetreemenu/sidetreemenu.component';
import { ScullyLibModule } from '@scullyio/ng-lib';

@NgModule({
  declarations: [
    AppComponent,
    AboutmeComponent,
    IntroComponent,
    SkillsComponent,
    ContactComponent,
    TimelineComponent,
    WordcloudComponent,
    MainNavComponent,
    StartpageComponent,
    PagenotfoundComponent,
    TimelineintersectionDirective,
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
    ScullyLibModule
  ],
  providers: [],
})
export class AppModule { }
