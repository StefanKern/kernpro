import { Component, signal, computed } from '@angular/core';
import { WordcloudComponent, WordcloudWord } from '@kernpro/angular-wordcloud';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'wordcloud-test-with-custom-loader',
  template: `
    <div style="padding: 2rem;">
      <h2>Wordcloud with Custom Material Design Loader</h2>

      <button (click)="loadNewWords()" [disabled]="loading()">
        {{ loading() ? 'Loading...' : 'Load New Words' }}
      </button>

      <div
        style="margin-top: 2rem; border: 1px solid #ccc; border-radius: 8px; overflow: hidden;"
      >
        <kp-wordcloud
          [words]="words()"
          [loading]="loading()"
          (layoutStarted)="onLayoutStarted()"
          (wordsAnimatedOut)="onWordsAnimatedOut()"
          (wordsAnimatedIn)="onWordsAnimatedIn()"
          (layoutComplete)="onLayoutComplete()"
        >
          <!-- Custom Material Design loader with icon -->
          <div slot="loader" class="material-loader">
            <mat-progress-spinner
              mode="indeterminate"
              diameter="50"
              color="primary"
            ></mat-progress-spinner>
            <div style="display: flex; align-items: center; margin-top: 16px;">
              <mat-icon style="margin-right: 8px;">psychology</mat-icon>
              <p>Generating word cloud...</p>
            </div>
          </div>
        </kp-wordcloud>
      </div>

      <div style="margin-top: 1rem; font-size: 14px; color: #666;">
        <h4>Event Log:</h4>
        <ul>
          @for (event of events(); track $index) {
          <li>{{ event }}</li>
          }
        </ul>
      </div>
    </div>
  `,
  styles: [
    `
      .material-loader {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
      }

      .material-loader p {
        margin: 0;
        color: #666;
        font-size: 16px;
        font-weight: 500;
      }

      button {
        padding: 12px 24px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }

      button:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      ul {
        max-height: 200px;
        overflow-y: auto;
        margin: 0;
        padding-left: 20px;
      }

      li {
        margin-bottom: 4px;
      }
    `,
  ],
  standalone: true,
  imports: [WordcloudComponent, MatProgressSpinner, MatIcon],
})
export class WordcloudTestWithCustomLoaderComponent {
  words = signal<WordcloudWord[]>([
    { text: 'Angular', size: 'huge', color: '#dd1b16' },
    { text: 'TypeScript', size: 'extra-large', color: '#007acc' },
    { text: 'JavaScript', size: 'large', color: '#f7df1e' },
    { text: 'HTML', size: 'medium', color: '#e34f26' },
    { text: 'CSS', size: 'medium', color: '#1572b6' },
  ]);

  loading = signal(false);
  events = signal<string[]>([]);

  private wordSets = [
    [
      { text: 'React', size: 'huge', color: '#61dafb' },
      { text: 'Vue.js', size: 'extra-large', color: '#4fc08d' },
      { text: 'Node.js', size: 'large', color: '#339933' },
      { text: 'Express', size: 'medium', color: '#000000' },
      { text: 'MongoDB', size: 'medium', color: '#47a248' },
    ],
    [
      { text: 'Python', size: 'huge', color: '#3776ab' },
      { text: 'Django', size: 'extra-large', color: '#092e20' },
      { text: 'Flask', size: 'large', color: '#000000' },
      { text: 'PostgreSQL', size: 'medium', color: '#336791' },
      { text: 'Docker', size: 'medium', color: '#2496ed' },
    ],
    [
      { text: 'Java', size: 'huge', color: '#ed8b00' },
      { text: 'Spring', size: 'extra-large', color: '#6db33f' },
      { text: 'Kotlin', size: 'large', color: '#7f52ff' },
      { text: 'MySQL', size: 'medium', color: '#4479a1' },
      { text: 'AWS', size: 'medium', color: '#ff9900' },
    ],
  ] as WordcloudWord[][];

  private currentSet = 0;

  loadNewWords() {
    this.loading.set(true);
    this.addEvent('Starting to load new words...');

    // Simulate async loading
    setTimeout(() => {
      this.currentSet = (this.currentSet + 1) % this.wordSets.length;
      this.words.set([...this.wordSets[this.currentSet]]);
      this.loading.set(false);
      this.addEvent('New words loaded, layout will begin...');
    }, 1500);
  }

  onLayoutStarted() {
    this.addEvent('Layout started - old words animating out');
  }

  onWordsAnimatedOut() {
    this.addEvent('Old words animated out - layout beginning');
  }

  onWordsAnimatedIn() {
    this.addEvent('New words animated in - layout complete');
  }

  onLayoutComplete() {
    this.addEvent('Layout process finished');
  }

  private addEvent(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    const newEvent = `[${timestamp}] ${message}`;

    this.events.update((currentEvents) => {
      const updatedEvents = [newEvent, ...currentEvents];
      // Keep only last 10 events
      return updatedEvents.length > 10
        ? updatedEvents.slice(0, 10)
        : updatedEvents;
    });
  }
}
