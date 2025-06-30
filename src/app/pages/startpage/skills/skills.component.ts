import { Component, effect, linkedSignal, signal } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../../../services/skill.service';
import { IWord } from '../../../typings';

@Component({
  selector: 'core-skills',
  template: `
        <div id="Skills" class="container">
            <h2 class="headline-section">
                <a href="#Skills" i18n>
                    Skills
                    <mat-icon>link</mat-icon>
                </a>
            </h2>
            
            <!-- Traditional Search -->
            <div class="search-container">
                <mat-form-field appearance="outline" class="search-field">
                    <mat-label i18n>Filter skills...</mat-label>
                    <input matInput 
                           [ngModel]="searchTerm()" 
                           (ngModelChange)="searchTerm.set($event)"
                           placeholder="Type to filter skills"
                           i18n-placeholder>
                    <mat-icon matPrefix>search</mat-icon>
                    @if (searchTerm()) {
                      <mat-icon matSuffix 
                                (click)="clearFilter()" 
                                style="cursor: pointer;"
                                title="Clear search">clear</mat-icon>
                    }
                </mat-form-field>
            </div>

            <!-- AI Search Section -->
            <div class="ai-search-container">
                <div class="ai-search-header">
                    <h3>Ask me about my skills</h3>
                    <p>Try natural language queries like "What are your web development skills?"</p>
                </div>
                
                <div class="ai-search-field">
                    <mat-form-field appearance="outline" class="search-field">
                        <mat-label>Ask about my skills...</mat-label>
                        <input matInput 
                               [ngModel]="aiQuery()" 
                               (ngModelChange)="aiQuery.set($event)"
                               (keyup.enter)="performAiSearch()"
                               placeholder="e.g., What are your web development skills?"
                               [disabled]="aiSearchLoading()">
                        <mat-icon matPrefix>psychology</mat-icon>
                        <button mat-icon-button 
                                matSuffix 
                                (click)="performAiSearch()" 
                                [disabled]="!aiQuery().trim() || aiSearchLoading()"
                                title="Search with AI">
                            @if (aiSearchLoading()) {
                                <mat-progress-spinner diameter="24"></mat-progress-spinner>
                            } @else {
                                <mat-icon>send</mat-icon>
                            }
                        </button>
                    </mat-form-field>
                </div>

                <!-- Example queries -->
                <div class="example-queries">
                    <h4>Try these examples:</h4>
                    <mat-chip-set>
                        @for (example of exampleQueries; track example) {
                            <mat-chip (click)="askExample(example)" 
                                      [disabled]="aiSearchLoading()">
                                {{example}}
                            </mat-chip>
                        }
                    </mat-chip-set>
                </div>

                <!-- AI Response -->
                @if (aiResponse()) {
                    <div class="ai-response">
                        <h4>AI Response:</h4>
                        <p>{{aiResponse()}}</p>
                        @if (aiResults().length > 0) {
                            <div class="ai-results">
                                <strong>Found {{aiResults().length}} relevant skills:</strong>
                                <div class="skill-chips">
                                    @for (skill of aiResults(); track skill.text) {
                                        <mat-chip [style.background-color]="skill.color" 
                                                  [style.color]="getContrastColor(skill.color)">
                                            {{skill.text}}
                                        </mat-chip>
                                    }
                                </div>
                            </div>
                        }
                    </div>
                }
            </div>

            <!-- Word Cloud -->
            <core-word-cloud [words]="displayWords()"></core-word-cloud>
        </div>
    `,
  styles: [`
        :host {
            display: block;
            margin: 2rem 0;
        }
        
        .search-container {
            margin: 1rem 0 2rem 0;
            display: flex;
            justify-content: center;
        }
        
        .search-field {
            width: 100%;
            max-width: 400px;
        }
        
        .search-field .mat-mdc-form-field-subscript-wrapper {
            display: none;
        }

        .ai-search-container {
            margin: 2rem 0;
            padding: 1.5rem;
            background: rgba(0, 0, 0, 0.02);
            border-radius: 8px;
            border: 1px solid rgba(0, 0, 0, 0.1);
        }

        .ai-search-header {
            text-align: center;
            margin-bottom: 1rem;
        }

        .ai-search-header h3 {
            margin: 0 0 0.5rem 0;
            color: #1976d2;
        }

        .ai-search-header p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }

        .ai-search-field {
            display: flex;
            justify-content: center;
            margin: 1rem 0;
        }

        .example-queries {
            margin: 1rem 0;
        }

        .example-queries h4 {
            margin: 0 0 0.5rem 0;
            font-size: 0.9rem;
            color: #333;
        }

        .example-queries mat-chip {
            margin: 0.2rem;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .example-queries mat-chip:hover:not([disabled]) {
            transform: scale(1.05);
        }

        .ai-response {
            margin-top: 1rem;
            padding: 1rem;
            background: #f5f5f5;
            border-radius: 4px;
        }

        .ai-response h4 {
            margin: 0 0 0.5rem 0;
            color: #1976d2;
        }

        .ai-response p {
            margin: 0 0 1rem 0;
        }

        .ai-results {
            margin-top: 1rem;
        }

        .skill-chips {
            margin-top: 0.5rem;
        }

        .skill-chips mat-chip {
            margin: 0.2rem;
            font-weight: bold;
        }
    `],
  standalone: true,
  imports: [
    WordcloudComponent,
    MatIcon,
    MatFormField,
    MatLabel,
    MatInput,
    MatIconButton,
    MatChip,
    MatChipSet,
    MatProgressSpinner,
    FormsModule,
    MatSuffix,
    MatPrefix
  ]
})
export class SkillsComponent {
  // Local signal linked to service search term
  searchTerm = linkedSignal(() => this.skillService.searchTerm());

  // AI search signals
  aiQuery = signal<string>('');
  aiSearchLoading = signal<boolean>(false);
  aiResponse = signal<string>('');
  aiResults = signal<IWord[]>([]);

  // Example queries for users to try
  exampleQueries = [
    "What are your web development skills?",
    "Show me programming languages you know",
    "What development tools do you use?",
    "What are your frontend skills?",
    "What backend technologies do you know?"
  ];

  constructor(public skillService: SkillService) {
    // Set up two-way binding effect between local and service signals
    effect(() => {
      // Update service when local signal changes
      this.skillService.searchTerm.set(this.searchTerm());
    });
  }

  clearFilter(): void {
    this.searchTerm.set('');
    this.clearAiSearch();
  }

  displayWords() {
    // Show AI results if available, otherwise show filtered skills
    const aiResults = this.aiResults();
    if (aiResults.length > 0) {
      return aiResults;
    }
    return this.skillService.filteredSkills();
  }

  async performAiSearch(): Promise<void> {
    const query = this.aiQuery().trim();
    if (!query) return;

    this.aiSearchLoading.set(true);
    this.aiResponse.set('');
    this.aiResults.set([]);

    try {
      const results = await this.skillService.searchSkills(query);
      this.aiResults.set(results);

      // Generate a friendly response based on results
      if (results.length === 0) {
        this.aiResponse.set("I couldn't find any skills matching that query. Try asking about web technologies, programming languages, or development tools.");
      } else if (results.length === this.skillService.getAllSkills().length) {
        this.aiResponse.set("Here are all my skills! I have experience across various technologies and tools.");
      } else {
        const categories = this.categorizeSkills(results);
        const categoryText = Object.keys(categories)
          .filter(cat => categories[cat].length > 0)
          .map(cat => `${ cat } (${ categories[cat].length })`)
          .join(', ');

        this.aiResponse.set(`I found ${ results.length } relevant skills in these areas: ${ categoryText }`);
      }
    } catch (error) {
      console.error('AI search failed:', error);
      this.aiResponse.set('Sorry, I encountered an error while searching. Please try again or use the regular search.');
    } finally {
      this.aiSearchLoading.set(false);
    }
  }

  askExample(example: string): void {
    this.aiQuery.set(example);
    this.performAiSearch();
  }

  clearAiSearch(): void {
    this.aiQuery.set('');
    this.aiResponse.set('');
    this.aiResults.set([]);
  }

  getContrastColor(backgroundColor: string): string {
    // Simple contrast color calculation
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  private categorizeSkills(skills: IWord[]): Record<string, IWord[]> {
    const categories: Record<string, IWord[]> = {
      'Web Technologies': [],
      'Programming Languages': [],
      'Development Tools': [],
      'Libraries/Frameworks': [],
      'Other': []
    };

    skills.forEach(skill => {
      const skillName = skill.text;
      if (['Angular', 'HTML5', 'CSS3', 'SCSS', 'Material Design', 'REST API'].includes(skillName)) {
        categories['Web Technologies'].push(skill);
      } else if (['TypeScript', 'JavaScript'].includes(skillName)) {
        categories['Programming Languages'].push(skill);
      } else if (['Git', 'VS Code', 'Webpack', 'npm'].includes(skillName)) {
        categories['Development Tools'].push(skill);
      } else if (['RxJS', 'Firebase', 'Node.js'].includes(skillName)) {
        categories['Libraries/Frameworks'].push(skill);
      } else {
        categories['Other'].push(skill);
      }
    });

    return categories;
  }
}