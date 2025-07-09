import { Injectable } from '@angular/core';

export type SkillCategory = 'frontend' | 'programming' | 'styling' | 'backend' | 'tools' | 'ai' | 'automation';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master';

export type SkillWord = {
  text: string;
  skillLevel: SkillLevel;
  color: string;
  category: SkillCategory;
};

export type SkillSearchResult = {
  skills: SkillWord[];
  explanation?: string;
};

@Injectable({
  providedIn: 'root'
})
export class SkillService {
  private readonly skillWords: SkillWord[] = [
    { text: 'Angular', skillLevel: 'master', color: '#DD0031', category: 'frontend' },
    { text: 'TypeScript', skillLevel: 'master', color: '#007ACC', category: 'programming' },
    { text: 'JavaScript', skillLevel: 'expert', color: '#F7DF1E', category: 'programming' },
    { text: 'HTML5', skillLevel: 'expert', color: '#E34F26', category: 'frontend' },
    { text: 'CSS3', skillLevel: 'expert', color: '#1572B6', category: 'styling' },
    { text: 'Node.js', skillLevel: 'advanced', color: '#339933', category: 'backend' },
    { text: 'ChatGPT', skillLevel: 'advanced', color: '#10A37F', category: 'ai' },
    { text: 'Claude', skillLevel: 'intermediate', color: '#D97706', category: 'ai' },
    { text: 'Git', skillLevel: 'advanced', color: '#F05032', category: 'tools' },
    { text: 'RxJS', skillLevel: 'advanced', color: '#B7178C', category: 'frontend' },
    { text: 'GWT', skillLevel: 'expert', color: '#4285F4', category: 'frontend' },
    { text: 'Firebase', skillLevel: 'intermediate', color: '#FFCA28', category: 'backend' },
    { text: 'n8n', skillLevel: 'intermediate', color: '#EA4B71', category: 'automation' },
    { text: 'Agentic AI', skillLevel: 'intermediate', color: '#8B5CF6', category: 'ai' },
    { text: 'Material Design', skillLevel: 'expert', color: '#757575', category: 'styling' },
    { text: 'SCSS', skillLevel: 'expert', color: '#CC6699', category: 'styling' },
    { text: 'Bootstrap', skillLevel: 'expert', color: '#7952B3', category: 'styling' },
    { text: 'REST API', skillLevel: 'expert', color: '#61DAFB', category: 'backend' },
    { text: 'ComfyUI', skillLevel: 'intermediate', color: '#FF6B6B', category: 'ai' },
    { text: 'Flux', skillLevel: 'intermediate', color: '#4ECDC4', category: 'ai' },
    { text: 'Webpack', skillLevel: 'intermediate', color: '#8DD6F9', category: 'tools' },
    { text: 'npm', skillLevel: 'expert', color: '#CB3837', category: 'tools' },
    { text: 'NX', skillLevel: 'advanced', color: '#143055', category: 'tools' },
    { text: 'Helm', skillLevel: 'beginner', color: '#0F1689', category: 'tools' },
    { text: 'VS Code', skillLevel: 'expert', color: '#007ACC', category: 'tools' },
    { text: 'GitLab', skillLevel: 'advanced', color: '#FC6D26', category: 'tools' },
    { text: 'GitLab Pipelines', skillLevel: 'advanced', color: '#6B46C1', category: 'tools' },
    { text: 'C#', skillLevel: 'beginner', color: '#239120', category: 'programming' },
    { text: 'Python', skillLevel: 'intermediate', color: '#3776AB', category: 'programming' }
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
    return this.skillWords.filter(skill =>
      skill.text.toLowerCase().includes(searchLower)
    );
  }

  /**
   * Get skills by color
   * @param color The color to filter by
   */
  getSkillsByColor(color: string): SkillWord[] {
    return this.skillWords.filter(skill => skill.color === color);
  }

  /**
   * Simple synchronous search for backwards compatibility
   * @param predicate Function to test each skill
   */
  searchSkillsSync(predicate: (skill: SkillWord) => boolean): SkillWord[] {
    return this.skillWords.filter(predicate);
  }

  /**
   * Get skills by category
   * @param category The category to filter by
   */
  getSkillsByCategory(category: SkillCategory): SkillWord[] {
    return this.skillWords.filter(skill =>
      skill.category === category
    );
  }

  /**
   * Get skills by multiple categories
   * @param categories Array of categories to filter by
   */
  getSkillsByCategories(categories: SkillCategory[]): SkillWord[] {
    return this.skillWords.filter(skill =>
      categories.includes(skill.category)
    );
  }

  /**
   * Get all available categories
   */
  getAvailableCategories(): SkillCategory[] {
    const categories = this.skillWords.map(skill => skill.category);
    return [...new Set(categories)].sort();
  }

  /**
   * Get skills by skill level
   * @param skillLevel The skill level to filter by
   */
  getSkillsByLevel(skillLevel: SkillLevel): SkillWord[] {
    return this.skillWords.filter(skill => skill.skillLevel === skillLevel);
  }

  /**
   * Get skills by multiple skill levels
   * @param skillLevels Array of skill levels to filter by
   */
  getSkillsByLevels(skillLevels: SkillLevel[]): SkillWord[] {
    return this.skillWords.filter(skill => skillLevels.includes(skill.skillLevel));
  }

  /**
   * Get all available skill levels
   */
  getAvailableSkillLevels(): SkillLevel[] {
    const levels = this.skillWords.map(skill => skill.skillLevel);
    return [...new Set(levels)].sort((a, b) => {
      const order: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert', 'master'];
      return order.indexOf(a) - order.indexOf(b);
    });
  }
}
