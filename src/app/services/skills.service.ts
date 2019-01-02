import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private COLORS = {
    SEO: '#40567B',
    HTMLCSS: '#2196f3',
    JavaScript: '#000000',
    CMS: '#00BEC1',
    BuildTools: '#6A8FCC',
    ProgrammingLanguages: '#69717F',
    BlockchainCoins: "#58bf00",
    BlockchainTechnologies: 'darkblue'
  }

  private promise: Promise<iSkillgroups> = null;

  constructor(private db: AngularFirestore) {
    let skillCollection = this.db.collection<skillFirebase>('skills');
    let angularFirestoreCollection = skillCollection.valueChanges();

    let skillGroups: iSkillgroups = {
      BlockchainCoins: [],
      BlockchainTechnologies: [],
      BuildTools: [],
      CMS: [],
      HTMLCSS: [],
      JavaScript: [],
      ProgrammingLanguages: [],
      SEO: []
    }

    this.promise = new Promise((resolve) => {
      angularFirestoreCollection.forEach(skills => {
        skills.forEach(element => {
          let color: string = this.COLORS[element.category];
          let size: number = Math.floor(element.level / 2.5);
          let word: iWord = {
            color: color,
            size: size,
            text: element.title
          }
          if (skillGroups[`${element.category}`]) {
            skillGroups[`${element.category}`].push(word);
          } else {
            console.error(`Unknown category: "${element.category}". Was there a new category added to the firebase skill database?`);
          }
        });
        resolve(skillGroups);
      });
    });
  }

  public async getSkills(): Promise<iSkillgroups> {
    return this.promise;
  }
}
