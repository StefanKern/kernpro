import { Pipe, PipeTransform } from '@angular/core';
import { SkillWord, SkillLevel, SkillCategory } from '../../../services/skill.service';
import { WordcloudWord, WordcloudWordSize } from '../../../components/wordcloud/wordcloud.component';

@Pipe({
  name: 'skillToWordcloud',
  standalone: true
})
export class SkillToWordcloudPipe implements PipeTransform {

  private skillLevelToSizeMap: Record<SkillLevel, WordcloudWordSize> = {
    'beginner': 'small',
    'intermediate': 'medium',
    'advanced': 'large',
    'expert': 'extra-large',
    'master': 'huge'
  };

  private categoryToColorMap: Record<SkillCategory, string> = {
    'frontend': '#E34F26',      // Orange-red for frontend
    'programming': '#007ACC',    // Blue for programming languages
    'styling': '#20B2AA',        // Teal for styling
    'backend': '#339933',        // Green for backend
    'tools': '#757575',          // Gray for tools
    'ai': '#8B5CF6',            // Purple for AI
    'automation': '#EA4B71'      // Red-pink for automation
  };

  transform(skillWords: SkillWord[]): WordcloudWord[] {
    return skillWords.map(skillWord => ({
      text: skillWord.text,
      size: this.skillLevelToSizeMap[skillWord.skillLevel],
      color: this.categoryToColorMap[skillWord.category]
    }));
  }
}
