import { TimelineintersectionDirective } from './timeline/timelineintersection.directive';
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
import { PhotosOfMyselfComponent } from './photos-of-myself/photos-of-myself.component';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';

@NgModule({
  declarations: [
    AboutmeComponent,
    IntroComponent,
    SkillsComponent,
    TimelineComponent,
    StartpageComponent,
    PhotosOfMyselfComponent,
    TimelineintersectionDirective
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
    KernproLibsModule,

    GalleryModule,
    LightboxModule
  ],
  providers: [],
})
export class StartPageModule { }
