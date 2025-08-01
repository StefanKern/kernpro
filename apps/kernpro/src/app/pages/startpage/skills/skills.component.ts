import { Component, signal, computed, inject } from '@angular/core';
import { SkillToWordcloudPipe } from './skill-to-wordcloud.pipe';
import { MatIcon } from '@angular/material/icon';
import {
  MatFormField,
  MatLabel,
  MatSuffix,
  MatPrefix,
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatChip } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { SkillService, SkillWord } from '../../../services/skill.service';
import {
  AiSkillService,
  AiSkillResponse,
} from '../../../services/ai-skill.service';
import { SkillExplanationDialogComponent } from './skill-explanation-dialog.component';
import { WordcloudComponent } from '@kernpro/wordcloud';

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
    MatProgressSpinner,
    FormsModule,
    MatSuffix,
    MatPrefix,
    SkillToWordcloudPipe,
  ],
})
export class SkillsComponent {
  // Inject services
  skillService = inject(SkillService);
  aiSkillService = inject(AiSkillService);
  dialog = inject(MatDialog);

  // AI search signals
  aiQuery = signal<string>('');
  aiSearchLoading = signal<boolean>(false);
  aiResponse = signal<string>('');
  aiResults = signal<SkillWord[]>([]);

  // Example queries for users to try - translated locally
  exampleQueries = [
    $localize`:@@skills.example-frontend:Zeige mir Frontend-Entwicklungs-Skills`,
    $localize`:@@skills.example-ai:Was sind deine KI-Skills?`,
    $localize`:@@skills.example-tools:Welche Tools verwendest du für die Entwicklung?`,
    $localize`:@@skills.example-csharp:Kennst du C#?`,
    $localize`:@@skills.example-react:Kannst du mit React arbeiten?`,
    $localize`:@@skills.example-styling:Was sind meine Styling- und Design-Skills?`,
  ];

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
      if (searchResult.translationKey) {
        this.aiResponse.set(this.translateAiResponse(searchResult));
      } else if (searchResult.explanation) {
        this.aiResponse.set(searchResult.explanation);
      } else if (searchResult.skills.length === 0) {
        this.aiResponse.set(
          $localize`:@@ai.no-skills-found:Ich konnte keine Skills finden, die zu dieser Anfrage passen. Versuchen Sie es mit Webtechnologien, Programmiersprachen oder Entwicklungstools.`
        );
      } else {
        this.aiResponse.set(``);
      }
    } catch (error) {
      console.error('AI search failed:', error);
      this.aiResponse.set(
        $localize`:@@ai.search-error:Entschuldigung, ich habe einen Fehler beim Suchen festgestellt. Bitte versuchen Sie es erneut.`
      );
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

  /**
   * Translate AI response based on translation key and parameters
   */
  private translateAiResponse(response: AiSkillResponse): string {
    if (!response.translationKey) {
      return response.explanation || '';
    }

    const params = response.translationParams || {};

    // Handle different translation keys with proper i18n extraction
    switch (response.translationKey) {
      case 'NO_EXPERIENCE_WITH_SKILL':
        return $localize`:@@ai.no-experience:Ich habe keine Erfahrung mit "${
          params['skill'] || ''
        }" in meinem aktuellen Skill-Set. Meine Expertise umfasst: ${
          params['skillsByCategory'] || ''
        }. Möchten Sie etwas über diese Technologien erfahren?`;

      case 'UNCLEAR_QUERY':
        return $localize`:@@ai.unclear-query:Ich bin mir nicht sicher, wonach Sie mit "${
          params['query'] || ''
        }" suchen. Könnten Sie spezifischer sein? Sie können nach ${
          params['categories'] || ''
        } Skills fragen oder nach spezifischen Technologien.`;

      case 'GIBBERISH_INPUT':
        return $localize`:@@ai.gibberish-input:Ich konnte "${
          params['query'] || ''
        }" nicht verstehen. Bitte fragen Sie nach spezifischen Technologien oder Skill-Kategorien. Zum Beispiel könnten Sie fragen "Was sind Ihre Webentwicklungs-Skills?" oder "Kennen Sie JavaScript?".`;

      case 'NO_MATCHING_SKILLS':
        return $localize`:@@ai.no-matching-skills:Ich konnte keine Skills finden, die zu "${
          params['query'] || ''
        }" passen. Mein aktuelles Skill-Set umfasst: ${
          params['skillsByCategory'] || ''
        }. Fragen Sie gerne nach diesen!`;

      // Category-based fallback messages
      case 'PROGRAMMING_FALLBACK': {
        const programmingSkills =
          this.skillService.getSkillsByCategoryAsString('programming');
        return $localize`:@@ai.programming-fallback:Ich habe keine Erfahrung mit ${
          params['skill'] || ''
        }, arbeite aber mit ${programmingSkills}. Das sind vielseitige Programmiersprachen, die für verschiedene Entwicklungsanforderungen verwendet werden können.`;
      }

      case 'FRONTEND_FALLBACK': {
        const frontendSkills = this.skillService.getSkillsByCategoryAsString([
          'frontend',
          'programming',
          'styling',
        ]);
        return $localize`:@@ai.frontend-fallback:Während ich nicht mit ${
          params['skill'] || ''
        } arbeite, habe ich umfangreiche Frontend-Erfahrung mit ${frontendSkills} für moderne Webanwendungen.`;
      }

      case 'BACKEND_FALLBACK': {
        const backendSkills = this.skillService.getSkillsByCategoryAsString([
          'backend',
          'programming',
        ]);
        return $localize`:@@ai.backend-fallback:Ich habe keine Erfahrung mit ${
          params['skill'] || ''
        }, arbeite aber mit ${backendSkills} für Backend-Entwicklung und serverseitige Anwendungen.`;
      }

      case 'STYLING_FALLBACK': {
        const stylingSkills =
          this.skillService.getSkillsByCategoryAsString('styling');
        return $localize`:@@ai.styling-fallback:Während ich ${
          params['skill'] || ''
        } nicht verwende, habe ich starke Styling-Fähigkeiten mit ${stylingSkills} für moderne und responsive Benutzeroberflächen.`;
      }

      case 'TOOLS_FALLBACK': {
        const toolsSkills =
          this.skillService.getSkillsByCategoryAsString('tools');
        return $localize`:@@ai.tools-fallback:Ich arbeite nicht mit ${
          params['skill'] || ''
        }, verwende aber eine Vielzahl von Entwicklungstools wie ${toolsSkills} für effiziente Entwicklungsworkflows.`;
      }

      case 'AI_FALLBACK': {
        const aiSkills = this.skillService.getSkillsByCategoryAsString('ai');
        return $localize`:@@ai.ai-fallback:Während ich ${
          params['skill'] || ''
        } nicht verwende, habe ich Erfahrung mit ${aiSkills} für KI-Integration und generative KI-Anwendungen.`;
      }

      case 'AUTOMATION_FALLBACK': {
        const automationSkills =
          this.skillService.getSkillsByCategoryAsString('automation');
        return $localize`:@@ai.automation-fallback:Ich habe keine Erfahrung mit ${
          params['skill'] || ''
        }, arbeite aber mit ${automationSkills} für Workflow-Automatisierung und verbinde verschiedene Services und APIs.`;
      }

      case 'DEFAULT_FALLBACK': {
        const allSkills =
          this.skillService.getSkillsByCategoryAsString('automation');
        return $localize`:@@ai.default-fallback:Ich habe keine Erfahrung mit ${
          params['skill'] || ''
        } in meinem aktuellen Skill-Set. Meine Expertise umfasst: ${allSkills}. Fragen Sie gerne nach diesen Bereichen!`;
      }

      default:
        return (
          response.explanation ||
          $localize`:@@ai.default-error:Entschuldigung, ich konnte keine passende Antwort finden.`
        );
    }
  }

  openSkillExplanation(): void {
    this.dialog.open(SkillExplanationDialogComponent, {
      width: '900px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: {
        onFilter: (query: string) => {
          this.aiQuery.set(query);
          this.performAiSearch();
        },
        aiSearchLoading: this.aiSearchLoading,
      },
    });
  }
}
