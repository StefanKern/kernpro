import { Injectable, signal, computed } from '@angular/core';
import { IWord } from '../typings';

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly skillWords: IWord[] = [
    { text: 'Angular', size: 60, color: '#DD0031' },
    { text: 'TypeScript', size: 55, color: '#007ACC' },
    { text: 'JavaScript', size: 50, color: '#F7DF1E' },
    { text: 'HTML5', size: 45, color: '#E34F26' },
    { text: 'CSS3', size: 45, color: '#1572B6' },
    { text: 'Node.js', size: 40, color: '#339933' },
    { text: 'Git', size: 35, color: '#F05032' },
    { text: 'RxJS', size: 35, color: '#B7178C' },
    { text: 'Firebase', size: 35, color: '#FFCA28' },
    { text: 'Material Design', size: 30, color: '#757575' },
    { text: 'SCSS', size: 30, color: '#CC6699' },
    { text: 'REST API', size: 30, color: '#61DAFB' },
    { text: 'Webpack', size: 25, color: '#8DD6F9' },
    { text: 'npm', size: 25, color: '#CB3837' },
    { text: 'VS Code', size: 25, color: '#007ACC' }
  ];

  // Signal for search term
  searchTerm = signal<string>('');

  // Computed signal for filtered skills based on search term
  filteredSkills = computed(() => {
    const searchTerm = this.searchTerm();

    if (!searchTerm.trim()) {
      return [...this.skillWords];
    }

    const searchLower = searchTerm.toLowerCase();
    return this.skillWords.filter(skill =>
      skill.text.toLowerCase().includes(searchLower)
    );
  });

  /**
   * Get all skills without filtering
   */
  getAllSkills(): IWord[] {
    return [...this.skillWords];
  }

  /**
   * Get currently filtered skills
   */
  getFilteredSkills(): IWord[] {
    return this.filteredSkills();
  }

  /**
   * Get current search term
   */
  getCurrentSearchTerm(): string {
    return this.searchTerm();
  }

  /**
   * Filter skills based on search term
   * @param searchTerm The term to filter by
   */
  filterSkills(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  /**
   * Clear search and show all skills
   */
  clearFilter(): void {
    this.searchTerm.set('');
  }

  /**
   * Search for skills that match a specific criteria
   * @param predicate Function to test each skill
   */
  searchSkills(predicate: (skill: IWord) => boolean): IWord[] {
    return this.skillWords.filter(predicate);
  }

  /**
   * Get skills by size range
   * @param minSize Minimum size
   * @param maxSize Maximum size (optional)
   */
  getSkillsBySize(minSize: number, maxSize?: number): IWord[] {
    return this.skillWords.filter(skill => {
      return skill.size >= minSize && (!maxSize || skill.size <= maxSize);
    });
  }

  /**
   * Get skills by color
   * @param color The color to filter by
   */
  getSkillsByColor(color: string): IWord[] {
    return this.skillWords.filter(skill => skill.color === color);
  }
}
