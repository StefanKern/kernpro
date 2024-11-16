import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ISkillGroups, IWikiArticle } from '../../../../../typings';
import { SkillsService } from '../../../../services/skills.service';
import { WikiintroService } from '../../../../services/wikiintro.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss']
})
export class WikiintroComponent implements OnInit, OnChanges {
  wikiintro: IWikiArticle = {};

  @Input() wikiTitle: string;
  citeurl = '';
  noArticle = false;
  imageurl = '';

  skillsAsync: Promise<ISkillGroups> = null;
  skillsAsyncDesynced: ISkillGroups = null;

  constructor(private wikiintroService: WikiintroService, private db: AngularFirestore, private skillsService: SkillsService) {
    this.skillsAsync = this.skillsService.getSkillGroups$();
  }


  async ngOnInit() {
    this.skillsAsyncDesynced = await this.skillsService.getSkillGroups$();
  }

  async ngOnChanges() {
    const skillnameDecoded = decodeURI(this.wikiTitle);
    this.citeurl = `https://de.wikipedia.org/wiki/${skillnameDecoded}`;
    try {
      this.wikiintro = await this.wikiintroService.getWikiIntro(skillnameDecoded);
      if (this.wikiintro.thumbnail) {
        this.imageurl = this.wikiintro.thumbnail.source;
      } else {
        this.imageurl = "";
      }
      this.noArticle = false;
    } catch (e) {
      this.noArticle = true;
      console.error(`catch triggered with exception ${e}`);
    }
  }
}
