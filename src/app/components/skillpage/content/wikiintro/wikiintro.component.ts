import { Component, Input, OnChanges, OnInit, signal } from '@angular/core';
import { ISkillGroups, IWikiArticle } from '../../../../../typings';
import { SkillsService } from '../../../../services/skills.service';
import { WikiintroService } from '../../../../services/wikiintro.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss'],  
  standalone: true
})
export class WikiintroComponent implements OnInit, OnChanges {
  wikiintro = signal<IWikiArticle>({});
  citeurl = signal<string>('');
  noArticle = signal<boolean>(false);
  imageurl = signal<string>('');

  @Input() wikiTitle: string;

  skillsAsync: Promise<ISkillGroups> = null;
  skillsAsyncDesynced: ISkillGroups = null;

  constructor(private wikiintroService: WikiintroService, private skillsService: SkillsService) {
    this.skillsAsync = this.skillsService.getSkillGroups$();
  }

  async ngOnInit() {
    this.skillsAsyncDesynced = await this.skillsService.getSkillGroups$();
  }

  async ngOnChanges() {
    const skillnameDecoded = decodeURI(this.wikiTitle);
    this.noArticle.set(true);
    this.citeurl.set(`https://de.wikipedia.org/wiki/${skillnameDecoded}`);
    try {
      const wikiintro = await this.wikiintroService.getWikiIntro(skillnameDecoded);
      this.wikiintro.set(wikiintro);
      if (wikiintro.thumbnail) {
        this.imageurl.set(wikiintro.thumbnail.source);
      } else {
        this.imageurl.set('');
      }
      this.noArticle.set(false);
    } catch (e) {
      this.noArticle.set(true);
      console.error(`catch triggered with exception ${e}`);
    }
  }
}