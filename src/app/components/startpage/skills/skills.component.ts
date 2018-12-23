import { Component } from '@angular/core';
import { iWord } from './../../../libs/wordcloud/wordcloud.component';
import { Router } from '@angular/router';
import { SkillsService } from './../../../services/skills.service';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
  , 
})
export class SkillsComponent {
  public showSEOSkills: boolean = true;
  public showHTMLCSSSkills: boolean = true;
  public showJavaScriptSkills: boolean = true;
  public showBuildToolsSkills: boolean = true;
  public showCMSSkills: boolean = true;
  public showProgrammingLanguagesSkills: boolean = true;
  public showBlockchainCoinsSkills: boolean = true;
  public showBlockchainTechnologiesSkills: boolean = true;

  public shownskills: Array<iWord> = [];

  constructor(private router: Router, private skillsService: SkillsService) {
    this.shownskills = [
      ...skillsService.SEOSkills,
      ...skillsService.HTMLCSSSkills,
      ...skillsService.JavaScriptSkills,
      ...skillsService.CMSSkills,
      ...skillsService.BuildToolsSkills,
      ...skillsService.ProgrammingLanguagesSkills,
      ...skillsService.BlockchainCoinsSkills,
      ...skillsService.BlockchainTechnologiesSkills
    ]
  };

  filterchange() {
    let _shownskills: Array<iWord> = [];
    if (this.showSEOSkills)
      _shownskills = _shownskills.concat(this.skillsService.SEOSkills);
    if (this.showHTMLCSSSkills)
      _shownskills = _shownskills.concat(this.skillsService.HTMLCSSSkills);
    if (this.showJavaScriptSkills)
      _shownskills = _shownskills.concat(this.skillsService.JavaScriptSkills);
      if (this.showCMSSkills)
        _shownskills = _shownskills.concat(this.skillsService.CMSSkills);
    if (this.showBuildToolsSkills)
      _shownskills = _shownskills.concat(this.skillsService.BuildToolsSkills);
    if (this.showProgrammingLanguagesSkills)
      _shownskills = _shownskills.concat(this.skillsService.ProgrammingLanguagesSkills);
    if (this.showBlockchainCoinsSkills)
      _shownskills = _shownskills.concat(this.skillsService.BlockchainCoinsSkills);
    if (this.showBlockchainTechnologiesSkills)
      _shownskills = _shownskills.concat(this.skillsService.BlockchainTechnologiesSkills);

    this.shownskills = _shownskills;
  }

  onLinkClick(text) {
    this.router.navigate(['skill', text]);
  }
}
