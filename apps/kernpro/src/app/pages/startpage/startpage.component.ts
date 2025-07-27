import { Component } from '@angular/core';
import { AboutmeComponent } from './aboutme/aboutme.component';
import { IntroBackgroundPathsComponent } from './intro-background-paths/intro-background-paths.component';
import { PhotosOfMyselfComponent } from './photos-of-myself/photos-of-myself.component';
import { SkillsComponent } from './skills/skills.component';
import { TimelineComponent } from './timeline/timeline.component';

@Component({
  selector: 'core-startpage',
  template: `
    <core-intro-background-paths></core-intro-background-paths>
    <core-aboutme></core-aboutme>
    <core-photos-of-myself></core-photos-of-myself>
    <core-skills></core-skills>
    <core-timeline></core-timeline>
  `,
  imports: [
    IntroBackgroundPathsComponent,
    AboutmeComponent,
    SkillsComponent,
    PhotosOfMyselfComponent,
    TimelineComponent,
  ],
  standalone: true,
})
export class StartpageComponent {}
