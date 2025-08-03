import { animate, state, style, transition, trigger } from '@angular/animations';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, inject, Input, OnInit, PLATFORM_ID, signal } from '@angular/core';

interface PathData {
  id: number;
  d: string;
  color: string;
  width: number;
  strokeOpacity: number;
  duration?: number; // Store the duration for each path
}

@Component({
  selector: 'core-intro-background-paths',
  templateUrl: './intro-background-paths.component.html',
  styleUrls: ['./intro-background-paths.component.scss'],
  standalone: true,
  imports: [CommonModule],
  animations: [
    trigger('letterAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(100px)', opacity: 0 }),
        animate(
          '{{duration}}ms {{delay}}ms cubic-bezier(0.2, 0.7, 0.3, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
    ]),
    trigger('subtitleAnimation', [
      state('hidden', style({ opacity: 0 })),
      state('visible', style({ opacity: 1 })),
      transition('hidden => visible', [animate('800ms ease-in')]),
    ]),
  ],
})
export class IntroBackgroundPathsComponent implements OnInit {
  @Input() title: string = 'Stefan Kern';
  @Input() subtitle: string = 'Senior Web Developer';
  isPlatformBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  words: string[] = [];
  paths1: PathData[] = [];
  paths2: PathData[] = []; // Mirrored paths for top-left
  showSubtitle = signal(false);

  ngOnInit(): void {
    if (this.isPlatformBrowser) {
      this.words = this.title.split(' ');
      this.paths1 = this.generatePaths();
      this.paths2 = this.generateMirroredPaths();

      // Calculate the total delay for subtitle animation
      // It should appear after all letters have finished animating
      let totalLetters = 0;
      this.words.forEach((word) => {
        totalLetters += word.length;
      });
      // Last letter delay + letter animation duration + small extra delay
      const subtitleDelay = (this.words.length - 1) * 100 + (totalLetters - 1) * 30 + 500 + 200;

      // Set a timeout to show the subtitle after the calculated delay
      setTimeout(() => {
        this.showSubtitle.set(true);
      }, subtitleDelay);
    }
  }

  generatePaths(): PathData[] {
    // Create more paths for a better visual effect
    return Array.from({ length: 18 }, (_, i) => {
      // Pre-calculate the random duration and store it with the path data
      const duration = 20000 + Math.floor(Math.random() * 10000);

      // New path definition: start from left, flow down to bottom, then up and down
      // Start point is at the left side (x:0)
      const startX = 0;
      const startY = 200 + i * 8; // Distribute starting points vertically

      // First control point: slightly to the right and down
      const cp1x = 180 + i * 3;
      const cp1y = 240 + i * 5;

      // Second control point: further right and down
      const cp2x = 350 - i * 5;
      const cp2y = 210 + i * 3; // End point: at the bottom right, then moving up and down
      const endX = 650 - i * 4;
      const endY = 316;

      return {
        id: i, // Ensure unique IDs
        d: `M${startX} ${startY} C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
        strokeOpacity: 0.1 + i * 0.03,
        duration, // Store the pre-calculated duration
      };
    });
  }
  generateMirroredPaths(): PathData[] {
    // Create mirrored paths for right side flowing upward
    return Array.from({ length: 18 }, (_, i) => {
      // Pre-calculate the random duration and store it with the path data
      const duration = 20000 + Math.floor(Math.random() * 10000); // Mirror path definition: start from right, flow up to top and beyond
      // Start point is at the right side (moved very high up)
      const startX = 696; // Start from right edge (matching viewBox width)
      const startY = 128 - i * 8; // Move starting points very high up (was 80 + i * 4)

      // First control point: slightly to the left and up (mirroring original spacing)
      const cp1x = 516 - i * 3; // Mirror of (180 + i * 3) from right side - same spacing as original
      const cp1y = 10 - i * 5; // Move control point very high, can go negative - match original vertical spacing

      // Second control point: further left and up (mirroring original spacing)
      const cp2x = 346 + i * 5; // Mirror of (350 - i * 5) from right side - same spacing as original
      const cp2y = 50 - i * 3; // Move control point above canvas - match original vertical spacing

      // End point: at the top left and beyond, flowing into the void
      const endX = 46 + i * 4; // Mirror of (650 - i * 4) from right side - same spacing as original
      const endY = 0; // End points above canvas, flowing into void

      return {
        id: i + 72, // Ensure unique IDs (after paths1 and paths2)
        d: `M${startX} ${startY} C${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
        color: `rgba(15,23,42,${0.1 + i * 0.03})`,
        width: 0.5 + i * 0.03,
        strokeOpacity: 0.1 + i * 0.03,
        duration, // Store the pre-calculated duration
      };
    });
  }
}
