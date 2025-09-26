import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'core-skill-info',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './skill-info.component.html',
  styleUrl: './skill-info.component.scss',
})
export class SkillInfoComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<SkillInfoComponent>);

  /**
   * Filter by skill level - generates the appropriate query
   */
  filterByLevel(level: string): void {
    if (this.data.aiSearchLoading()) {
      return;
    }

    const levelQueries: Record<string, string> = {
      beginner: $localize`:@@filter.level.beginner:Zeige mir alle Beginner-Skills`,
      intermediate: $localize`:@@filter.level.intermediate:Zeige mir alle Intermediate-Skills`,
      advanced: $localize`:@@filter.level.advanced:Zeige mir alle Advanced-Skills`,
      expert: $localize`:@@filter.level.expert:Zeige mir alle Expert-Skills`,
      master: $localize`:@@filter.level.master:Zeige mir alle Master-Skills`,
    };

    const query = levelQueries[level] || `Zeige mir alle ${level}-Skills`;
    this.data.onFilter(query);
    this.close();
  }

  /**
   * Filter by skill category - generates the appropriate query
   */
  filterByCategory(category: string): void {
    if (this.data.aiSearchLoading()) {
      return;
    }

    const categoryQueries: Record<string, string> = {
      frontend: $localize`:@@filter.category.frontend:Zeige mir alle Frontend-Skills`,
      programming: $localize`:@@filter.category.programming:Zeige mir alle Programmiersprachen`,
      styling: $localize`:@@filter.category.styling:Zeige mir alle Styling- und Design-Skills`,
      backend: $localize`:@@filter.category.backend:Zeige mir alle Backend-Skills`,
      tools: $localize`:@@filter.category.tools:Zeige mir alle Entwicklungstools`,
      ai: $localize`:@@filter.category.ai:Zeige mir alle KI-Skills`,
      automation: $localize`:@@filter.category.automation:Zeige mir alle Automatisierungs-Skills`,
    };

    const query = categoryQueries[category] || `Zeige mir alle ${category}-Skills`;
    this.data.onFilter(query);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
