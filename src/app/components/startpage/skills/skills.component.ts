import {Component, inject, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {SkillsService} from './../../../services/skills.service';
import {IWord} from '../../../../typings';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { WordcloudComponent } from 'src/app/libs/wordcloud/wordcloud.component';

@Component({
  selector: 'core-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
  imports: [
    MatIconModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    WordcloudComponent
  ]
})
export class SkillsComponent implements OnInit {
  private fb = inject(FormBuilder);
  public skillsForm: FormGroup;
  public shownskills = signal<IWord[]>([]);

  constructor(private router: Router, private skillsService: SkillsService) {
  };

  async ngOnInit(): Promise<void> {
  this.skillsForm = this.fb.group({
    showHtmlCssSkills: [true],
    showJavaScriptSkills: [true],
    showBuildToolsSkills: [true],
    showCMSSkills: [true],
    showNoneWebTechnologiesSkills: [true],
    showBlockchainCoinsSkills: [true],
    showBlockchainTechnologiesSkills: [true]
  });

  const skills = await this.skillsService.getSkillGroups$();
  this.shownskills.set([
    ...skills.HtmlCss,
    ...skills.JavaScript,
    ...skills.CMS,
    ...skills.BuildTools,
    ...skills.NoneWebTechnologies,
    ...skills.BlockchainCoins,
    ...skills.BlockchainTechnologies
  ]);

  this.skillsForm.valueChanges.subscribe((values) => {
    
  let _shownskills: IWord[] = [];
  if (values.showHtmlCssSkills) {
    _shownskills = _shownskills.concat(skills.HtmlCss);
  }
  if (values.showJavaScriptSkills) {
    _shownskills = _shownskills.concat(skills.JavaScript);
  }
  if (values.showCMSSkills) {
    _shownskills = _shownskills.concat(skills.CMS);
  }
  if (values.showBuildToolsSkills) {
    _shownskills = _shownskills.concat(skills.BuildTools);
  }
  if (values.showNoneWebTechnologiesSkills) {
    _shownskills = _shownskills.concat(skills.NoneWebTechnologies);
  }
  if (values.showBlockchainCoinsSkills) {
    _shownskills = _shownskills.concat(skills.BlockchainCoins);
  }
  if (values.showBlockchainTechnologiesSkills) {
    _shownskills = _shownskills.concat(skills.BlockchainTechnologies);
  }
  this.shownskills.set(_shownskills);
  });
  }

  async filterchange(): Promise<void> {
    await this.skillsService.getSkillGroups$();
  }

  onLinkClick(text) {
    // TODO: check that navigation works again
    this.router.navigate(['skill', text]);
  }
}
