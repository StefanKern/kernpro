import {Component, Input, OnInit} from '@angular/core';
import {WikiintroService} from '../../../services/wikiintro.service';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {SkillsService} from '../../../services/skills.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss']
})
export class WikiintroComponent implements OnInit {
  wikiintro: iWikiarticle = {};

  @Input() skillname: string;
  skillnameDecoded = '';
  citeurl = '';
  noArticle = false;
  imageurl = '';

  private skillCollection: AngularFirestoreCollection<skillFirebase>;
  skills: Observable<skillFirebase[]>;
  skillsAsync: Promise<iSkillgroups> = null;
  skillsAsyncDesynced: iSkillgroups = null;

  async test() {
    try {
      console.log('Test start');
      console.log(this.skills);
      this.skills.forEach((item) => {
        console.log(item);
        console.log('item');
      });
    } catch {
      debugger;
    }
  }

  constructor(private wikiintroService: WikiintroService, private db: AngularFirestore, private skillsService: SkillsService) {
    // let allskills = [
    //   ...skillsService.SEOSkills,
    //   ...skillsService.HTMLCSSSkills,
    //   ...skillsService.JavaScriptSkills,
    //   ...skillsService.CMSSkills,
    //   ...skillsService.BuildToolsSkills,
    //   ...skillsService.ProgrammingLanguagesSkills,
    //   ...skillsService.BlockchainCoinsSkills,
    //   ...skillsService.BlockchainTechnologiesSkills
    // ];
    this.skillCollection = db.collection<skillFirebase>('skills');
    this.skills = this.skillCollection.valueChanges();
    this.skillsAsync = this.skillsService.getSkillGroups$();

    (async () => {
      this.skillsAsyncDesynced = await this.skillsService.getSkillGroups$();
    })();
    // allskills.forEach(element => {
    //   let category: string = "Unknown";

    //   switch (element.color) {
    //     case '#40567B':
    //       category = 'SEO';
    //       break;
    //     case '#2196f3':
    //       category = 'HTMLCSS';
    //       break;
    //     case '#000000':
    //       category = 'JavaScript';
    //       break;
    //     case '#00BEC1':
    //       category = 'CMS';
    //       break;
    //     case '#6A8FCC':
    //       category = 'BuildTools';
    //       break;
    //     case '#69717F':
    //       category = 'ProgrammingLanguages';
    //       break;
    //     case '#58bf00':
    //       category = 'BlockchainCoins';
    //       break;
    //     case '#darkblue':
    //       category = 'BlockchainTechnologies';
    //       break;

    //     default:
    //       break;
    //   }

    //   let level = element.size * 2.5;


    //   let newSkill: skillFirebase = {
    //     category: category,
    //     level: level,
    //     title: element.text
    //   }
    //   this.skillCollection.add(newSkill);
    // });
  }

  ngOnInit() {
    this.skillnameDecoded = decodeURI(this.skillname);
    this.citeurl = `https://de.wikipedia.org/wiki/${this.skillnameDecoded}`;
    (async () => {
      try {
        this.wikiintro = await this.wikiintroService.getWikiIntro(this.skillname);
        if (this.wikiintro.image) {
          let imagename = this.wikiintro.image.replace(/^Datei:/, '').replace(' ', '_');
          this.imageurl = `https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/${imagename}/220px-${imagename}`;
        }
      } catch (e) {
        this.noArticle = true;
        console.log(`catch triggered with exception ${e}`);
      }
    })();
  }
}
