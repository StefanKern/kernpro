import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WordcloudComponent, WordcloudWord, WordcloudWordSize } from '@kernpro/angular-wordcloud';

@Component({
  selector: 'app-wordcloud-test',
  templateUrl: './wordcloud-test.component.html',
  styleUrls: ['./wordcloud-test.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSliderModule,
    MatCardModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    WordcloudComponent,
  ],
})
export class WordcloudTestComponent implements OnInit, OnDestroy {
  private snackBar = inject(MatSnackBar);

  // Signal-based reactive state
  words = signal<WordcloudWord[]>([]);
  loading = signal(false);

  // Form controls as signals
  wordCount = signal(30);
  newWordText = signal('');
  newWordSize = signal<WordcloudWordSize>('medium');
  newWordColor = signal('#000000');

  // Computed values
  wordsCount = computed(() => this.words().length);
  displayedWords = computed(() => this.words());

  // Timeout tracking for cleanup
  private timeouts: Set<NodeJS.Timeout> = new Set();
  private isDestroyed = false;

  // Available options (static, no need for signals)
  availableSizes: WordcloudWordSize[] = ['small', 'medium', 'large', 'extra-large', 'huge'];
  availableColors = [
    '#000000',
    '#FF0000',
    '#00FF00',
    '#0000FF',
    '#FF8C00',
    '#8A2BE2',
    '#DC143C',
    '#00CED1',
    '#FFD700',
    '#32CD32',
    '#FF1493',
    '#00BFFF',
    '#FF6347',
    '#9370DB',
    '#20B2AA',
  ];

  // Sample word pools for generating test data
  private skillWords = [
    'JavaScript',
    'TypeScript',
    'Angular',
    'React',
    'Vue.js',
    'Node.js',
    'Python',
    'Java',
    'C#',
    'C++',
    'Go',
    'Rust',
    'Swift',
    'Kotlin',
    'PHP',
    'Ruby',
    'HTML',
    'CSS',
    'SASS',
    'MongoDB',
    'PostgreSQL',
    'MySQL',
    'Redis',
    'Docker',
    'Kubernetes',
    'AWS',
    'Azure',
    'Git',
    'Jenkins',
    'Linux',
    'Nginx',
    'Apache',
    'REST',
    'GraphQL',
    'Microservices',
    'Machine Learning',
    'Data Science',
    'AI',
    'Deep Learning',
    'TensorFlow',
    'PyTorch',
    'Blockchain',
    'Cybersecurity',
    'DevOps',
    'CI/CD',
    'Agile',
    'Scrum',
    'Leadership',
  ];

  private industryWords = [
    'Fintech',
    'Healthcare',
    'E-commerce',
    'Gaming',
    'EdTech',
    'SaaS',
    'Automotive',
    'Aerospace',
    'Telecommunications',
    'Banking',
    'Insurance',
    'Retail',
    'Manufacturing',
    'Energy',
    'Real Estate',
    'Media',
    'Entertainment',
    'Sports',
    'Travel',
    'Food',
  ];

  private conceptWords = [
    'Innovation',
    'Scalability',
    'Performance',
    'Security',
    'Reliability',
    'Usability',
    'Accessibility',
    'Responsiveness',
    'Optimization',
    'Integration',
    'Automation',
    'Analytics',
    'Monitoring',
    'Testing',
    'Documentation',
    'Collaboration',
    'Communication',
    'Problem Solving',
    'Critical Thinking',
    'Creativity',
    'Adaptability',
    'Teamwork',
  ];

  displayedColumns: string[] = ['text', 'size', 'color', 'actions'];

  ngOnInit() {
    this.generateTestData();
  }

  ngOnDestroy() {
    this.isDestroyed = true;
    // Clear all pending timeouts
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
  }

  private safeSetTimeout(callback: () => void, delay: number): void {
    const timeout = setTimeout(() => {
      this.timeouts.delete(timeout);
      if (!this.isDestroyed) {
        callback();
      }
    }, delay);
    this.timeouts.add(timeout);
  }

  generateTestData() {
    this.loading.set(true);
    this.words.set([]);

    const allWords = [...this.skillWords, ...this.industryWords, ...this.conceptWords];
    const shuffled = this.shuffleArray([...allWords]);

    const newWords: WordcloudWord[] = [];
    for (let i = 0; i < Math.min(this.wordCount(), shuffled.length); i++) {
      newWords.push({
        text: shuffled[i],
        size: this.getRandomSize(),
        color: this.getRandomColor(),
      });
    }
    this.words.set(newWords);

    // Simulate loading delay with safe timeout
    this.safeSetTimeout(() => {
      this.loading.set(false);
      this.showSnackBar(`Generated ${this.words().length} test words`);
    }, 500);
  }

  addWord() {
    if (!this.newWordText().trim()) {
      this.showSnackBar('Please enter a word');
      return;
    }

    if (this.words().some((w) => w.text.toLowerCase() === this.newWordText().toLowerCase())) {
      this.showSnackBar('Word already exists');
      return;
    }

    this.words.update((current) => [
      ...current,
      {
        text: this.newWordText().trim(),
        size: this.newWordSize(),
        color: this.newWordColor(),
      },
    ]);

    this.newWordText.set('');
    this.showSnackBar('Word added successfully');
  }

  removeWord(index: number) {
    this.words.update((current) => current.filter((_, i) => i !== index));
    this.showSnackBar('Word removed');
  }

  editWord(index: number, field: keyof WordcloudWord, value: any) {
    this.words.update((current) => {
      const updatedWords = [...current];
      updatedWords[index] = { ...updatedWords[index], [field]: value };
      return updatedWords;
    });
  }

  onTextEdit(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.editWord(index, 'text', target.value);
    }
  }

  onColorEdit(index: number, event: Event) {
    const target = event.target as HTMLInputElement;
    if (target && target.value) {
      this.editWord(index, 'color', target.value);
    }
  }

  clearAll() {
    this.words.set([]);
    this.showSnackBar('All words cleared');
  }

  refreshWordcloud() {
    this.loading.set(true);
    // Force re-render by creating new array reference
    this.words.update((current) => [...current]);

    this.safeSetTimeout(() => {
      this.loading.set(false);
      this.showSnackBar('Wordcloud refreshed');
    }, 100);
  }

  addRandomWords(count: number = 5) {
    const allWords = [...this.skillWords, ...this.industryWords, ...this.conceptWords];
    const existingTexts = new Set(this.words().map((w) => w.text.toLowerCase()));
    const availableWords = allWords.filter((word) => !existingTexts.has(word.toLowerCase()));

    if (availableWords.length === 0) {
      this.showSnackBar('No more unique words available');
      return;
    }

    const shuffled = this.shuffleArray(availableWords);
    const newWords = shuffled.slice(0, Math.min(count, shuffled.length)).map((text) => ({
      text,
      size: this.getRandomSize(),
      color: this.getRandomColor(),
    }));

    this.words.update((current) => [...current, ...newWords]);
    this.showSnackBar(`Added ${newWords.length} random words`);
  }

  removeRandomWords(count: number = 5) {
    if (this.words().length === 0) {
      this.showSnackBar('No words to remove');
      return;
    }

    const toRemove = Math.min(count, this.words().length);
    const shuffled = this.shuffleArray([...this.words()]);
    this.words.set(shuffled.slice(toRemove));
    this.showSnackBar(`Removed ${toRemove} random words`);
  }

  randomizeColors() {
    this.words.update((current) =>
      current.map((word) => ({
        ...word,
        color: this.getRandomColor(),
      }))
    );
    this.showSnackBar('Colors randomized');
  }

  randomizeSizes() {
    this.words.update((current) =>
      current.map((word) => ({
        ...word,
        size: this.getRandomSize(),
      }))
    );
    this.showSnackBar('Sizes randomized');
  }

  exportData() {
    const dataStr = JSON.stringify(this.words(), null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'wordcloud-data.json';
    link.click();
    URL.revokeObjectURL(url);
    this.showSnackBar('Data exported');
  }

  importData(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data) && data.every(this.isValidWord.bind(this))) {
          this.words.set(data);
          this.showSnackBar(`Imported ${data.length} words`);
        } else {
          this.showSnackBar('Invalid file format');
        }
      } catch (error) {
        this.showSnackBar('Error reading file');
      }
    };

    reader.readAsText(file);
    input.value = ''; // Reset input
  }

  private isValidWord(word: any): word is WordcloudWord {
    return (
      typeof word === 'object' &&
      typeof word.text === 'string' &&
      this.availableSizes.includes(word.size) &&
      (typeof word.color === 'string' || word.color === undefined)
    );
  }

  private getRandomSize(): WordcloudWordSize {
    const weights = {
      small: 30,
      medium: 35,
      large: 20,
      'extra-large': 10,
      huge: 5,
    };

    const random = Math.random() * 100;
    let cumulative = 0;

    for (const [size, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (random <= cumulative) {
        return size as WordcloudWordSize;
      }
    }

    return 'medium';
  }

  private getRandomColor(): string {
    return this.availableColors[Math.floor(Math.random() * this.availableColors.length)];
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private showSnackBar(message: string) {
    if (this.isDestroyed) {
      return; // Don't show snackbar if component is destroyed
    }

    try {
      this.snackBar.open(message, 'Close', {
        duration: 3000,
        horizontalPosition: 'right',
        verticalPosition: 'top',
      });
    } catch (error) {
      // Silently handle cases where injector is destroyed
      console.warn('Failed to show snackbar - component may be destroyed:', error);
    }
  }

  onWordClick(word: string) {
    this.showSnackBar(`Clicked: ${word}`);
  }
}
