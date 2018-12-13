import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './components/app.component';
import { AboutmeComponent } from './components/startpage/aboutme/aboutme.component';
import { IntroComponent } from './components/startpage/intro/intro.component';
import { SkillsComponent } from './components/startpage/skills/skills.component';
import { ContactComponent } from './components/startpage/contact/contact.component';
import { TimelineComponent } from './components/startpage/timeline/timeline.component';
import { StartpageComponent } from './components/startpage/startpage.component';

import { D3Service } from 'd3-ng2-service';
import { WordcloudComponent } from "./libs/wordcloud/wordcloud.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { MaterialModule } from './material-module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { AppRoutingModule } from './app-routing.module';
import { PagenotfoundComponent } from './components/pagenotfound/pagenotfound.component';
import { TimelineintersectionDirective } from './directives/intersections/timelineintersection.directive';

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
    TimelineintersectionDirective
  ],
  imports: [
    CommonModule,
    NgtUniversalModule,
    FormsModule,
    MaterialModule,
    //NgbModule.forRoot(),
    BrowserAnimationsModule,
    LayoutModule,
    FlexLayoutModule,
    AppRoutingModule
  ],
  providers: [D3Service],
})
export class AppModule { }
