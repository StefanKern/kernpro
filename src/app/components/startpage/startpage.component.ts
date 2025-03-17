import { Component } from '@angular/core';
import { TimelineComponent } from './timeline/timeline.component';
import { SkillsComponent } from './skills/skills.component';
import { PhotosOfMyselfComponent } from './photos-of-myself/photos-of-myself.component';
import { AboutmeComponent } from './aboutme/aboutme.component';
import { IntroComponent } from './intro/intro.component';

@Component({
    selector: 'core-startpage',
    templateUrl: './startpage.component.html',
    host: { '[id]': '"startpage"'},
    imports: [
        TimelineComponent,
        SkillsComponent,
        PhotosOfMyselfComponent,
        AboutmeComponent,
        IntroComponent
    ]
})
export class StartpageComponent {
}
