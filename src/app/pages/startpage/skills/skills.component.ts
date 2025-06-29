import { Component, effect, linkedSignal } from '@angular/core';
import { WordcloudComponent } from '../../../components/wordcloud/wordcloud.component';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatSuffix, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SkillService } from '../../../services/skill.service';

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
            <core-word-cloud [words]="skillService.filteredSkills()"></core-word-cloud>
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
    `],
  standalone: true,
  imports: [WordcloudComponent, MatIcon, MatFormField, MatLabel, MatInput, FormsModule, MatSuffix, MatPrefix]
})
export class SkillsComponent {
  // Local signal linked to service search term
  searchTerm = linkedSignal(() => this.skillService.searchTerm());

  constructor(public skillService: SkillService) {
    // Set up two-way binding effect between local and service signals
    effect(() => {
      // Update service when local signal changes
      this.skillService.searchTerm.set(this.searchTerm());
    });
  }

  clearFilter(): void {
    this.searchTerm.set('');
  }
}