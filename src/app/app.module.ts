import { NgtUniversalModule } from '@ng-toolkit/universal';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './components/app.component';
import { AboutmeComponent } from './components/aboutme/aboutme.component';
import { IntroComponent } from './components/intro/intro.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ContactComponent } from './components/contact/contact.component';
import { LanguageComponent } from './components/language/language.component';
import { TimelineComponent } from './components/timeline/timeline.component';

import { D3Service } from 'd3-ng2-service';
import { WordcloudComponent } from "./libs/wordcloud/wordcloud.component";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

//import { MaterialModule } from './material-module';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule, MatButtonModule, MatSidenavModule, MatIconModule, MatListModule } from '@angular/material';


@NgModule({
  declarations: [
    AppComponent,
    AboutmeComponent,
    IntroComponent,
    SkillsComponent,
    ContactComponent,
    LanguageComponent,
    TimelineComponent,
    WordcloudComponent,
    MainNavComponent
  ],
  imports:[
 CommonModule,
NgtUniversalModule,
 
    
    FormsModule,
    //MaterialModule,
    //NgbModule.forRoot(),
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule
  ],
  providers: [D3Service],
})
export class AppModule { }
