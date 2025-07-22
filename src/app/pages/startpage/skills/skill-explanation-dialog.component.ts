import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'skill-explanation-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  template: `
    <div class="skill-explanation-dialog">
      <mat-dialog-content>
        <div class="explanation-content">
          <div class="columns-container">
            <div class="column">
              <div class="skill-levels">
                <h4 i18n>Skill-Level (Größe):</h4>
                <ul>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="level-indicator small">●</span> 
                      <strong i18n>Beginner</strong>
                    </div>
                    <mat-chip (click)="filterByLevel('beginner')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.level.beginner">Zeige mir alle Beginner-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="level-indicator medium">●</span> 
                      <strong i18n>Intermediate</strong>
                    </div>
                    <mat-chip (click)="filterByLevel('intermediate')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.level.intermediate">Zeige mir alle Intermediate-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="level-indicator large">●</span> 
                      <strong i18n>Advanced</strong>
                    </div>
                    <mat-chip (click)="filterByLevel('advanced')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.level.advanced">Zeige mir alle Advanced-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="level-indicator extra-large">●</span> 
                      <strong i18n>Expert</strong>
                    </div>
                    <mat-chip (click)="filterByLevel('expert')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.level.expert">Zeige mir alle Expert-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="level-indicator huge">●</span> 
                      <strong i18n>Master</strong>
                    </div>
                    <mat-chip (click)="filterByLevel('master')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.level.master">Zeige mir alle Master-Skills</span>
                    </mat-chip>
                  </li>
                </ul>
              </div>
            </div>

            <div class="column">
              <div class="skill-categories">
                <h4 i18n>Skill-Kategorien (Farbe):</h4>
                <ul>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator frontend">●</span> 
                      <strong i18n>Frontend</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('frontend')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.frontend">Zeige mir alle Frontend-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator programming">●</span> 
                      <strong i18n>Programming</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('programming')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.programming">Zeige mir alle Programmiersprachen</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator styling">●</span> 
                      <strong i18n>Styling</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('styling')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.styling">Zeige mir alle Styling- und Design-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator backend">●</span> 
                      <strong i18n>Backend</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('backend')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.backend">Zeige mir alle Backend-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator tools">●</span> 
                      <strong i18n>Tools</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('tools')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.tools">Zeige mir alle Entwicklungstools</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator ai">●</span> 
                      <strong i18n>AI</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('ai')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.ai">Zeige mir alle KI-Skills</span>
                    </mat-chip>
                  </li>
                  <li class="filter-item" [class.disabled]="data.aiSearchLoading()">
                    <div class="content-wrapper">
                      <span class="category-indicator automation">●</span> 
                      <strong i18n>Automation</strong>
                    </div>
                    <mat-chip (click)="filterByCategory('automation')" [disabled]="data.aiSearchLoading()" class="filter-chip">
                      <span i18n="@@filter.category.automation">Zeige mir alle Automatisierungs-Skills</span>
                    </mat-chip>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </mat-dialog-content>
      
      <mat-dialog-actions align="end">
        <button mat-button (click)="close()" i18n>Schließen</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .skill-explanation-dialog {
      .explanation-content {
        padding: 0.5rem;
        
        .columns-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          
          @media (max-width: 768px) {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        
        .column {
          min-width: 0; // Prevent flex item overflow
        }
        
        .skill-levels, .skill-categories {
          h4 {
            color: #333;
            margin-bottom: 1rem;
            font-weight: 600;
            font-size: 1.1rem;
          }
          
          ul {
            list-style: none;
            padding: 0;
            margin: 0;
            
            li.filter-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 0.75rem;
              margin-bottom: 0.5rem;
              border-radius: 8px;
              background: #f8f9fa;
              transition: all 0.2s ease;
              
              &.disabled {
                opacity: 0.6;
              }
              
              .content-wrapper {
                display: flex;
                align-items: center;
                flex: 1;
              }
              
              .level-indicator, .category-indicator {
                font-size: 1.2rem;
                margin-right: 0.75rem;
                flex-shrink: 0;
                
                &.small { font-size: 0.8rem; }
                &.medium { font-size: 1rem; }
                &.large { font-size: 1.4rem; }
                &.extra-large { font-size: 1.6rem; }
                &.huge { font-size: 1.8rem; }
                
                &.frontend { color: #007bff; }
                &.programming { color: #28a745; }
                &.styling { color: #dc3545; }
                &.backend { color: #6f42c1; }
                &.tools { color: #fd7e14; }
                &.ai { color: #20c997; }
                &.automation { color: #6c757d; }
              }
              
              strong {
                margin-right: 0.5rem;
                flex-shrink: 0;
              }
              
              .filter-chip {
                margin-left: 1rem;
                font-size: 0.8rem;
              }
            }
          }
        }
      }
      
      mat-dialog-actions {
        padding: 1rem 1.5rem;
        
        button {
          min-width: 100px;
        }
      }
    }
  `]
})
export class SkillExplanationDialogComponent {
  data = inject(MAT_DIALOG_DATA);
  dialogRef = inject(MatDialogRef<SkillExplanationDialogComponent>);

  /**
   * Filter by skill level - generates the appropriate query
   */
  filterByLevel(level: string): void {
    if (this.data.aiSearchLoading()) {
      return;
    }

    const levelQueries: Record<string, string> = {
      'beginner': $localize`:@@filter.level.beginner:Zeige mir alle Beginner-Skills`,
      'intermediate': $localize`:@@filter.level.intermediate:Zeige mir alle Intermediate-Skills`,
      'advanced': $localize`:@@filter.level.advanced:Zeige mir alle Advanced-Skills`,
      'expert': $localize`:@@filter.level.expert:Zeige mir alle Expert-Skills`,
      'master': $localize`:@@filter.level.master:Zeige mir alle Master-Skills`
    };

    const query = levelQueries[level] || `Zeige mir alle ${ level }-Skills`;
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
      'frontend': $localize`:@@filter.category.frontend:Zeige mir alle Frontend-Skills`,
      'programming': $localize`:@@filter.category.programming:Zeige mir alle Programmiersprachen`,
      'styling': $localize`:@@filter.category.styling:Zeige mir alle Styling- und Design-Skills`,
      'backend': $localize`:@@filter.category.backend:Zeige mir alle Backend-Skills`,
      'tools': $localize`:@@filter.category.tools:Zeige mir alle Entwicklungstools`,
      'ai': $localize`:@@filter.category.ai:Zeige mir alle KI-Skills`,
      'automation': $localize`:@@filter.category.automation:Zeige mir alle Automatisierungs-Skills`
    };

    const query = categoryQueries[category] || `Zeige mir alle ${ category }-Skills`;
    this.data.onFilter(query);
    this.close();
  }

  close(): void {
    this.dialogRef.close();
  }
}
