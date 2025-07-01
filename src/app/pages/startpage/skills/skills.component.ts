import { Component, signal, computed, inject } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SkillService, SkillWord } from '../../../services/skill.service';
import { AiSkillService } from '../../../services/ai-skill.service';

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
  // Inject services
  skillService = inject(SkillService);
  aiSkillService = inject(AiSkillService);

  // AI search signals
  aiQuery = signal<string>('');
  aiSearchLoading = signal<boolean>(false);
  aiResponse = signal<string>('');
  aiResults = signal<SkillWord[]>([]);

  // Example queries for users to try - now using AI service examples
  exampleQueries = this.aiSkillService.getSearchExamples();

  clearFilter(): void {
    this.clearAiSearch();
  }

  // Computed signal that automatically updates when dependencies change
  displayWords = computed(() => {
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
  });

  async performAiSearch(): Promise<void> {
    const query = this.aiQuery().trim();
    if (!query) return;

    this.aiSearchLoading.set(true);
    this.aiResponse.set('');
    // Don't clear aiResults here to avoid showing all words during loading

    try {
      const searchResult = await this.aiSkillService.searchSkills(query);
      this.aiResults.set(searchResult.skills);

      // Generate a friendly response based on results
      if (searchResult.explanation) {
        this.aiResponse.set(searchResult.explanation);
      } else if (searchResult.skills.length === 0) {
        this.aiResponse.set("I couldn't find any skills matching that query. Try asking about web technologies, programming languages, or development tools.");
      } else {
        this.aiResponse.set(``);
      }
    } catch (error) {
      console.error('AI search failed:', error);
      this.aiResponse.set('Sorry, I encountered an error while searching. Please try again.');
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
}