import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { BehaviorSubject, Subject } from 'rxjs';
import { ISkillGroups } from '../../typings';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
   COLORS = {
    HtmlCss: '#2196f3',
    JavaScript: '#000000',
    CMS: '#00BEC1',
    BuildTools: '#6A8FCC',
    NoneWebTechnologies: '#69717F',
    BlockchainCoins: '#58bf00',
    BlockchainTechnologies: 'darkblue'
  };
  private readonly skillGroups: ISkillGroups = {
    BlockchainCoins: [],
    BlockchainTechnologies: [],
    BuildTools: [],
    CMS: [],
    HtmlCss: [],
    JavaScript: [],
    NoneWebTechnologies: []
  };

  private skillGroups$: Subject<ISkillGroups> = new BehaviorSubject<ISkillGroups>(this.skillGroups);

  constructor(private db: AngularFirestore) {
    this.createCollections();
  }

  public async getSkillGroups$(): Promise<ISkillGroups> {
    return this.skillGroups$.toPromise();
  }

  private async createCollections(): Promise<void> {
    this.skillGroups$.complete()
    /* const skillCollection = this.db.collection<ISkillFirebase[]>('skills');
    const angularFirestoreCollection: ISkillFirebase[] = await skillCollection.get()
      .pipe(
        map((querySnapshot) => {
          // Map the query snapshot to an array of documents
          return [];
          // return querySnapshot.docs.map((doc) => doc.data()) as unkown as ISkillFirebase[];
        })
      ).toPromise();

    angularFirestoreCollection.forEach(element => {
      const color: string = this.COLORS[element.category];
      const size: number = Math.floor(element.level / 2.5);
      const word: IWord = {
        color: color,
        size: size,
        text: element.title
      };
      if (this.skillGroups[`${element.category}`]) {
        this.skillGroups[`${element.category}`].push(word);
      } else {
        console.error(`Unknown category: "${element.category}". Was there a new category added to the firebase skill database?`);
      }
    });
    this.skillGroups$.next(this.skillGroups);
    this.skillGroups$.complete();*/
  }
}
