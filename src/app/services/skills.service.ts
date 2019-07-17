import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {take} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private readonly COLORS = {
    SEO: '#40567B',
    HTMLCSS: '#2196f3',
    JavaScript: '#000000',
    CMS: '#00BEC1',
    BuildTools: '#6A8FCC',
    ProgrammingLanguages: '#69717F',
    BlockchainCoins: '#58bf00',
    BlockchainTechnologies: 'darkblue'
  };


  private skillGroups$: Subject<iSkillgroups> = new Subject<iSkillgroups>();
  private skillCollection: AngularFirestoreCollection<skillFirebase>;

  constructor(private db: AngularFirestore) {
    this.skillCollection = this.db.collection<skillFirebase>('skills');

    this.createCollections();
  }

  public async getSkillGroups$(): Promise<iSkillgroups> {
    return this.skillGroups$.toPromise();
  }

  private async createCollections(): Promise<void> {
    const angularFirestoreCollection = await this.skillCollection.valueChanges()
      .pipe(
        take(1)
      ).toPromise();


    const skillGroups: iSkillgroups = {
      BlockchainCoins: [],
      BlockchainTechnologies: [],
      BuildTools: [],
      CMS: [],
      HTMLCSS: [],
      JavaScript: [],
      ProgrammingLanguages: [],
      SEO: []
    };

    angularFirestoreCollection.forEach(element => {
      const color: string = this.COLORS[element.category];
      const size: number = Math.floor(element.level / 2.5);
      const word: iWord = {
        color: color,
        size: size,
        text: element.title
      };
      if (skillGroups[`${element.category}`]) {
        skillGroups[`${element.category}`].push(word);
      } else {
        console.error(`Unknown category: "${element.category}". Was there a new category added to the firebase skill database?`);
      }
    });
    this.skillGroups$.next(skillGroups);
    this.skillGroups$.complete();

    console.log(skillGroups);
  }
}
