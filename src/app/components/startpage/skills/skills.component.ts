import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {SkillsService} from './../../../services/skills.service';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
  ,
})
export class SkillsComponent {
  public showSEOSkills = true;
  public showHTMLCSSSkills = true;
  public showJavaScriptSkills = true;
  public showBuildToolsSkills = true;
  public showCMSSkills = true;
  public showProgrammingLanguagesSkills = true;
  public showBlockchainCoinsSkills = true;
  public showBlockchainTechnologiesSkills = true;

  public shownskills: Array<iWord> = [];

  constructor(private router: Router, private skillsService: SkillsService) {
    (async () => {
      const skills = await this.skillsService.getSkillGroups$();
      this.shownskills = [
        ...skills.SEO,
        ...skills.HTMLCSS,
        ...skills.JavaScript,
        ...skills.CMS,
        ...skills.BuildTools,
        ...skills.ProgrammingLanguages,
        ...skills.BlockchainCoins,
        ...skills.BlockchainTechnologies
      ];
    })();
  };

  public toggleSEOSkills() {
    this.showSEOSkills = !this.showSEOSkills;
    this.filterchange();
  }

  public toggleHTMLCSSSkills() {
    this.showHTMLCSSSkills = !this.showHTMLCSSSkills;
    this.filterchange();
  }

  public toggleJavaScriptSkills() {
    this.showJavaScriptSkills = !this.showJavaScriptSkills;
    this.filterchange();
  }

  public toggleBuildToolsSkills() {
    this.showBuildToolsSkills = !this.showBuildToolsSkills;
    this.filterchange();
  }

  public toggleCMSSkills() {
    this.showCMSSkills = !this.showCMSSkills;
    this.filterchange();
  }

  public toggleProgrammingLanguagesSkills() {
    this.showProgrammingLanguagesSkills = !this.showProgrammingLanguagesSkills;
    this.filterchange();
  }

  public toggleBlockchainCoinsSkills() {
    this.showBlockchainCoinsSkills = !this.showBlockchainCoinsSkills;
    this.filterchange();
  }

  public toggleBlockchainTechnologiesSkills() {
    this.showBlockchainTechnologiesSkills = !this.showBlockchainTechnologiesSkills;
    this.filterchange();
  }


  async filterchange() {
    const skills = await this.skillsService.getSkillGroups$();
    let _shownskills: Array<iWord> = [];
    if (this.showSEOSkills) {
      _shownskills = _shownskills.concat(skills.SEO);
    }
    if (this.showHTMLCSSSkills) {
      _shownskills = _shownskills.concat(skills.HTMLCSS);
    }
    if (this.showJavaScriptSkills) {
      _shownskills = _shownskills.concat(skills.JavaScript);
    }
    if (this.showCMSSkills) {
      _shownskills = _shownskills.concat(skills.CMS);
    }
    if (this.showBuildToolsSkills) {
      _shownskills = _shownskills.concat(skills.BuildTools);
    }
    if (this.showProgrammingLanguagesSkills) {
      _shownskills = _shownskills.concat(skills.ProgrammingLanguages);
    }
    if (this.showBlockchainCoinsSkills) {
      _shownskills = _shownskills.concat(skills.BlockchainCoins);
    }
    if (this.showBlockchainTechnologiesSkills) {
      _shownskills = _shownskills.concat(skills.BlockchainTechnologies);
    }
    this.shownskills = _shownskills;
  }

  onLinkClick(text) {
    this.router.navigate(['skill', text]);
  }
}
