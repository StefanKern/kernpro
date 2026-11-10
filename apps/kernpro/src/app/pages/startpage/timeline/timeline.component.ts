import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { TimelineintersectionDirective } from './timelineintersection.directive';

@Component({
  selector: 'core-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  imports: [MatIcon, TimelineintersectionDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: true,
})
export class TimelineComponent {}
