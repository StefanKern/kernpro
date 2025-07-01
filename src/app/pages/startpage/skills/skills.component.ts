import { Component, signal } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SkillService, SkillWord } from '../../../services/skill.service';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
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
  // AI search signals
  aiQuery = signal<string>('');
  aiSearchLoading = signal<boolean>(false);
  aiResponse = signal<string>('');
  aiResults = signal<SkillWord[]>([]);

  // Example queries for users to try
  exampleQueries = [
    "What are your web development skills?",
    "Show me programming languages you know",
    "What development tools do you use?",
    "What are your frontend skills?",
    "What backend technologies do you know?"
  ];

  constructor(public skillService: SkillService) {
  }

  clearFilter(): void {
    this.clearAiSearch();
  }

  displayWords() {
    // Don't show any words while AI search is loading
    if (this.aiSearchLoading()) {
      return [];
    }

    // Show AI results if available, otherwise show all skills
    const aiResults = this.aiResults();
    if (aiResults.length > 0) {
      return aiResults;
    }
    return this.skillService.getAllSkills();
  }

  async performAiSearch(): Promise<void> {
    const query = this.aiQuery().trim();
    if (!query) return;

    this.aiSearchLoading.set(true);
    this.aiResponse.set('');
    // Don't clear aiResults here to avoid showing all words during loading

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
      // On error, clear results to show all skills again
      this.aiResults.set([]);
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

  private categorizeSkills(skills: SkillWord[]): Record<string, SkillWord[]> {
    const categories: Record<string, SkillWord[]> = {
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