import { take } from 'rxjs/operators';
import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {WikiintroService} from '../../../services/wikiintro.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {SkillsService} from '../../../services/skills.service';
import {ISkillFirebase, ISkillGroups, IWikiArticle} from '../../../../typings';

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

  private skillCollection: AngularFirestoreCollection<ISkillFirebase>;
  skills: Observable<ISkillFirebase[]>;
  skillsAsync: Promise<ISkillGroups> = null;
  skillsAsyncDesynced: ISkillGroups = null;

  async test() {
    try {
      this.skills.forEach((item) => {
      });
    } catch {
      debugger;
    }
  }

  constructor(private wikiintroService: WikiintroService, private db: AngularFirestore, private skillsService: SkillsService) {
    this.skillCollection = db.collection<ISkillFirebase>('skills');
    this.skills = this.skillCollection.valueChanges();
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
