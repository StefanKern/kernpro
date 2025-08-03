import { Injectable } from '@angular/core';

export type SkillCategory = 'frontend' | 'programming' | 'styling' | 'backend' | 'tools' | 'ai' | 'automation';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export interface SkillWord {
  text: string;
  skillLevel: SkillLevel;
  category: SkillCategory;
}

export interface SkillSearchResult {
  skills: SkillWord[];
  explanation?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SkillService {
  private readonly skillWords: SkillWord[] = [
    { text: 'Angular', skillLevel: 'master', category: 'frontend' },
    { text: 'TypeScript', skillLevel: 'master', category: 'programming' },
    { text: 'JavaScript', skillLevel: 'expert', category: 'programming' },
    { text: 'HTML5', skillLevel: 'expert', category: 'frontend' },
    { text: 'CSS3', skillLevel: 'expert', category: 'styling' },
    { text: 'Node.js', skillLevel: 'advanced', category: 'backend' },
    { text: 'ChatGPT', skillLevel: 'advanced', category: 'ai' },
    { text: 'Claude', skillLevel: 'intermediate', category: 'ai' },
    { text: 'Git', skillLevel: 'advanced', category: 'tools' },
    { text: 'RxJS', skillLevel: 'advanced', category: 'frontend' },
    { text: 'GWT', skillLevel: 'master', category: 'frontend' },
    { text: 'Firebase', skillLevel: 'intermediate', category: 'backend' },
    { text: 'n8n', skillLevel: 'intermediate', category: 'automation' },
    { text: 'Agentic AI', skillLevel: 'intermediate', category: 'ai' },
    { text: 'Material Design', skillLevel: 'advanced', category: 'styling' },
    { text: 'SCSS', skillLevel: 'expert', category: 'styling' },
    { text: 'Bootstrap', skillLevel: 'expert', category: 'styling' },
    { text: 'REST API', skillLevel: 'expert', category: 'backend' },
    { text: 'ComfyUI', skillLevel: 'intermediate', category: 'ai' },
    { text: 'Flux', skillLevel: 'intermediate', category: 'ai' },
    { text: 'Webpack', skillLevel: 'intermediate', category: 'tools' },
    { text: 'npm', skillLevel: 'expert', category: 'tools' },
    { text: 'NX', skillLevel: 'advanced', category: 'tools' },
    { text: 'Helm', skillLevel: 'beginner', category: 'tools' },
    { text: 'VS Code', skillLevel: 'advanced', category: 'tools' },
    { text: 'GitLab', skillLevel: 'advanced', category: 'tools' },
    { text: 'GitLab Pipelines', skillLevel: 'advanced', category: 'tools' },
    { text: 'C#', skillLevel: 'beginner', category: 'programming' },
    { text: 'Python', skillLevel: 'intermediate', category: 'programming' },
  ];

  /**
   * Get all skills without filtering
   */
  getAllSkills(): SkillWord[] {
    return [...this.skillWords];
  }

  /**
   * Search skills by text
   * @param searchText The text to search for in skill names
   */
  searchSkillsByText(searchText: string): SkillWord[] {
    const searchLower = searchText.toLowerCase();
    return this.skillWords.filter((skill) => skill.text.toLowerCase().includes(searchLower));
  }

  /**
   * Simple synchronous search for backwards compatibility
   * @param predicate Function to test each skill
   */
  searchSkillsSync(predicate: (skill: SkillWord) => boolean): SkillWord[] {
    return this.skillWords.filter(predicate);
  }

  /**
   * Get skills by category or categories
   * @param categoryOrCategories A single category or an array of categories to filter by
   */
  getSkillsByCategory(categoryOrCategories: SkillCategory | SkillCategory[]): SkillWord[] {
    const categories = Array.isArray(categoryOrCategories) ? categoryOrCategories : [categoryOrCategories];
    return this.skillWords.filter((skill) => categories.includes(skill.category));
  }

  /**
   * Get skills by category or categories as a comma-separated string
   * @param categoryOrCategories A single category or an array of categories to filter by
   */
  getSkillsByCategoryAsString(categoryOrCategories: SkillCategory | SkillCategory[]): string {
    return this.getSkillsByCategory(categoryOrCategories)
      .map((s) => s.text)
      .join(', ');
  }

  /**
   * Get skills by multiple categories
   * @param categories Array of categories to filter by
   */
  getSkillsByCategories(categories: SkillCategory[]): SkillWord[] {
    const order: SkillLevel[] = ['master', 'expert', 'advanced', 'intermediate', 'beginner'];
    return this.skillWords
      .filter((skill) => categories.includes(skill.category))
      .sort((a, b) => order.indexOf(a.skillLevel) - order.indexOf(b.skillLevel));
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): SkillCategory[] {
    const categories = this.skillWords.map((skill) => skill.category);
    return [...new Set(categories)].sort();
  }

  /**
   * Get skills by skill level
   * @param skillLevel The skill level to filter by
   */
  getSkillsByLevel(skillLevel: SkillLevel): SkillWord[] {
    return this.skillWords.filter((skill) => skill.skillLevel === skillLevel);
  }

  /**
   * Get skills by multiple skill levels
   * @param skillLevels Array of skill levels to filter by
   */
  getSkillsByLevels(skillLevels: SkillLevel[]): SkillWord[] {
    return this.skillWords.filter((skill) => skillLevels.includes(skill.skillLevel));
  }

  /**
   * Get all available skill levels
   */
  getAvailableSkillLevels(): SkillLevel[] {
    const levels = this.skillWords.map((skill) => skill.skillLevel);
    return [...new Set(levels)].sort((a, b) => {
      const order: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }
}
