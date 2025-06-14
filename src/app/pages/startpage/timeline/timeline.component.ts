import { Component } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'core-timeline',
    templateUrl: './timeline.component.html',
    styleUrls: ['./timeline.component.scss'],
    imports: [
        MatIcon
    ],
    standalone: true
})
export class TimelineComponent {
}
