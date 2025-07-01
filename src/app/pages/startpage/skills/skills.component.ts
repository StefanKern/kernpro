import { Component, signal, computed, inject } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { SkillToWordcloudPipe } from './skill-to-wordcloud.pipe';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIconButton } from '@angular/material/button';
import { MatChip, MatChipSet } from '@angular/material/chips';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { SkillService, SkillWord } from '../../../services/skill.service';
import { AiSkillService, AiSkillResponse } from '../../../services/ai-skill.service';

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
    MatPrefix,
    SkillToWordcloudPipe
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
      if (searchResult.translationKey) {
        this.aiResponse.set(this.translateAiResponse(searchResult));
      } else if (searchResult.explanation) {
        this.aiResponse.set(searchResult.explanation);
      } else if (searchResult.skills.length === 0) {
        this.aiResponse.set($localize`:@@ai.no-skills-found:Ich konnte keine Skills finden, die zu dieser Anfrage passen. Versuchen Sie es mit Webtechnologien, Programmiersprachen oder Entwicklungstools.`);
      } else {
        this.aiResponse.set(``);
      }
    } catch (error) {
      console.error('AI search failed:', error);
      this.aiResponse.set($localize`:@@ai.search-error:Entschuldigung, ich habe einen Fehler beim Suchen festgestellt. Bitte versuchen Sie es erneut.`);
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
        return $localize`:@@ai.no-experience:Ich habe keine Erfahrung mit "${ params['skill'] || '' }" in meinem aktuellen Skill-Set. Meine Expertise umfasst: ${ params['skillsByCategory'] || '' }. Möchten Sie etwas über diese Technologien erfahren?`;

      case 'UNCLEAR_QUERY':
        return $localize`:@@ai.unclear-query:Ich bin mir nicht sicher, wonach Sie mit "${ params['query'] || '' }" suchen. Könnten Sie spezifischer sein? Sie können nach ${ params['categories'] || '' } Skills fragen oder nach spezifischen Technologien.`;

      case 'GIBBERISH_INPUT':
        return $localize`:@@ai.gibberish-input:Ich konnte "${ params['query'] || '' }" nicht verstehen. Bitte fragen Sie nach spezifischen Technologien oder Skill-Kategorien. Zum Beispiel könnten Sie fragen "Was sind Ihre Webentwicklungs-Skills?" oder "Kennen Sie JavaScript?".`;

      case 'NO_MATCHING_SKILLS':
        return $localize`:@@ai.no-matching-skills:Ich konnte keine Skills finden, die zu "${ params['query'] || '' }" passen. Mein aktuelles Skill-Set umfasst: ${ params['skillsByCategory'] || '' }. Fragen Sie gerne nach diesen!`;

      case 'PROGRAMMING_FALLBACK':
        return $localize`:@@ai.programming-fallback:Ich habe keine Erfahrung mit ${ params['skill'] || '' }, arbeite aber mit TypeScript, JavaScript, C# und Python. Das sind vielseitige Programmiersprachen, die für verschiedene Entwicklungsanforderungen verwendet werden können.`;

      case 'FRONTEND_FALLBACK':
        return $localize`:@@ai.frontend-fallback:Während ich nicht mit ${ params['skill'] || '' } arbeite, habe ich umfangreiche Frontend-Erfahrung mit Angular, TypeScript, JavaScript, HTML5, CSS3 und Bootstrap für moderne Webanwendungen.`;

      case 'BACKEND_FALLBACK':
        return $localize`:@@ai.backend-fallback:Ich habe keine Erfahrung mit ${ params['skill'] || '' }, arbeite aber mit Node.js, Firebase, TypeScript, JavaScript und habe etwas Erfahrung mit Python für Backend-Entwicklung und serverseitige Anwendungen.`;

      case 'STYLING_FALLBACK':
        return $localize`:@@ai.styling-fallback:Während ich ${ params['skill'] || '' } nicht verwende, habe ich starke Styling-Fähigkeiten mit CSS3, SCSS, Bootstrap und Material Design für moderne und responsive Benutzeroberflächen.`;

      case 'DEFAULT_FALLBACK':
        return $localize`:@@ai.default-fallback:Ich habe keine Erfahrung mit ${ params['skill'] || '' } in meinem aktuellen Skill-Set. Meine Expertise konzentriert sich auf moderne Webentwicklung mit Angular, TypeScript, JavaScript und verwandten Technologien. Fragen Sie gerne nach diesen Bereichen!`;

      // Handle technology-specific alternatives
      case 'JAVA_ALTERNATIVE':
        return $localize`:@@ai.java-alternative:Obwohl ich nicht extensiv mit Java arbeite, habe ich Erfahrung mit C#, TypeScript und JavaScript. TypeScript und C# bieten ähnliche objektorientierte Programmierkonzepte und statische Typisierung wie Java.`;

      case 'PHP_ALTERNATIVE':
        return $localize`:@@ai.php-alternative:Ich arbeite nicht mit PHP, aber ich habe umfangreiche Backend-Erfahrung mit Node.js unter Verwendung von JavaScript und TypeScript sowie etwas Erfahrung mit Python. Node.js bietet ähnliche serverseitige Fähigkeiten für Webanwendungen.`;

      case 'REACT_ALTERNATIVE':
        return $localize`:@@ai.react-alternative:Ich verwende React nicht, bin aber versiert mit Angular, welches ein anderes großes Frontend-Framework ist. Beide verwenden komponentenbasierte Architektur und modernes JavaScript/TypeScript für dynamische Webanwendungen.`;

      case 'VUE_ALTERNATIVE':
        return $localize`:@@ai.vue-alternative:Während ich nicht mit Vue.js arbeite, habe ich umfangreiche Erfahrung mit Angular. Beide sind komponentenbasierte Frontend-Frameworks, die beim Erstellen reaktiver Benutzeroberflächen mit TypeScript/JavaScript helfen.`;

      case 'SVELTE_ALTERNATIVE':
        return $localize`:@@ai.svelte-alternative:Ich verwende Svelte nicht, arbeite aber mit Angular für moderne Webanwendungen. Beide konzentrieren sich auf komponentenbasierte Entwicklung und bieten exzellente Entwicklererfahrungen.`;

      case 'EXPRESS_ALTERNATIVE':
        return $localize`:@@ai.express-alternative:Während ich Express.js nicht spezifisch aufliste, arbeite ich mit Node.js unter Verwendung von JavaScript und TypeScript für Backend-Entwicklung. Express ist ein verbreitetes Node.js Framework, das ich wahrscheinlich in meinen Node.js Projekten verwende.`;

      case 'DJANGO_ALTERNATIVE':
        return $localize`:@@ai.django-alternative:Ich arbeite nicht mit Django, habe aber Backend-Erfahrung mit Node.js und Firebase. Diese bieten ähnliche Fähigkeiten für serverseitige Anwendungen und APIs.`;

      case 'SPRING_ALTERNATIVE':
        return $localize`:@@ai.spring-alternative:Ich verwende das Spring Framework nicht, arbeite aber mit Node.js für Backend-Entwicklung und Firebase für Cloud-Services. Diese bieten ähnliche Backend-Fähigkeiten auf Enterprise-Niveau.`;

      case 'MONGODB_ALTERNATIVE':
        return $localize`:@@ai.mongodb-alternative:Während ich MongoDB nicht spezifisch erwähne, arbeite ich mit Firebase, welches Firestore (eine NoSQL-Datenbank) einschließt, und habe Node.js Erfahrung für Datenbankintegration.`;

      case 'MYSQL_ALTERNATIVE':
        return $localize`:@@ai.mysql-alternative:Ich arbeite nicht direkt mit MySQL, verwende aber Firebase für Datenspeicherung und Node.js für Backend-Entwicklung, welche mit verschiedenen Datenbanksystemen integriert werden können.`;

      case 'POSTGRESQL_ALTERNATIVE':
        return $localize`:@@ai.postgresql-alternative:Ich habe keine PostgreSQL-Erfahrung, arbeite aber mit Firebase für Datenspeicherung und Node.js für Backend-Services, was ähnliche Datenbank- und Server-Fähigkeiten bietet.`;

      case 'AWS_ALTERNATIVE':
        return $localize`:@@ai.aws-alternative:Ich arbeite nicht spezifisch mit AWS, verwende aber Firebase für Cloud-Services und Node.js für Backend-Entwicklung. Firebase bietet ähnliche Cloud-Infrastruktur-Fähigkeiten wie AWS.`;

      case 'AZURE_ALTERNATIVE':
        return $localize`:@@ai.azure-alternative:Während ich Azure nicht verwende, habe ich Erfahrung mit Firebase für Cloud-Services und Node.js für Backend-Entwicklung, was ähnliche Cloud-Computing-Fähigkeiten bietet.`;

      case 'DOCKER_ALTERNATIVE':
        return $localize`:@@ai.docker-alternative:Ich arbeite nicht spezifisch mit Docker, verwende aber Node.js für Backend-Entwicklung und habe Erfahrung mit Entwicklungstools wie Git und VS Code, die oft mit Containerisierungs-Workflows integriert werden.`;

      case 'TAILWIND_ALTERNATIVE':
        return $localize`:@@ai.tailwind-alternative:Ich verwende Tailwind CSS nicht, arbeite aber umfangreich mit SCSS, CSS3, Bootstrap und Material Design für das Styling von Anwendungen. Diese bieten ähnliche Fähigkeiten für moderne, responsive Designs.`;

      case 'VITE_ALTERNATIVE':
        return $localize`:@@ai.vite-alternative:Ich verwende Vite nicht spezifisch, arbeite aber mit Webpack für Module-Bundling und npm für Package-Management. Diese Tools dienen ähnlichen Zwecken im Build-Prozess.`;

      case 'ROLLUP_ALTERNATIVE':
        return $localize`:@@ai.rollup-alternative:Während ich Rollup nicht verwende, habe ich Erfahrung mit Webpack für Bundling und npm für Package-Management, was ähnliche Build-Tool-Fähigkeiten bietet.`;

      default:
        return response.explanation || $localize`:@@ai.default-error:Entschuldigung, ich konnte keine passende Antwort finden.`;
    }
  }
}