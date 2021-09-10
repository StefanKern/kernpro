import { MaterialModule } from './../../material-module';
import { StartpageComponent } from './startpage.component';
import { KernproLibsModule } from './../../libs/kernpro-libs.module';

import {NgModule} from '@angular/core';
import { LayoutModule } from '@angular/cdk/layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TimelineComponent } from './timeline/timeline.component';
import { SkillsComponent } from './skills/skills.component';
import { IntroComponent } from './intro/intro.component';
import { AboutmeComponent } from './aboutme/aboutme.component';

@NgModule({
  declarations: [
    AboutmeComponent,
    IntroComponent,
    SkillsComponent,
    TimelineComponent,
    StartpageComponent
  ],
  exports: [
    StartpageComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    MaterialModule,
    KernproLibsModule
  ],
  providers: [],
})
export class StartPageModule { }
