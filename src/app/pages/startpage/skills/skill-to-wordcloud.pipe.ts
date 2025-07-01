import { Pipe, PipeTransform } from '@angular/core';
import { SkillWord, SkillLevel } from '../../../services/skill.service';
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

  transform(skillWords: SkillWord[]): WordcloudWord[] {
    return skillWords.map(skillWord => ({
      text: skillWord.text,
      size: this.skillLevelToSizeMap[skillWord.skillLevel],
      color: skillWord.color
    }));
  }
}
