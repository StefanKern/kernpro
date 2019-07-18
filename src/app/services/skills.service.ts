import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {publish, share, take} from 'rxjs/operators';
import {BehaviorSubject, Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
   COLORS = {
    SEO: '#40567B',
    HTMLCSS: '#2196f3',
    JavaScript: '#000000',
    CMS: '#00BEC1',
    BuildTools: '#6A8FCC',
    ProgrammingLanguages: '#69717F',
    BlockchainCoins: '#58bf00',
    BlockchainTechnologies: 'darkblue'
  };
  private readonly skillGroups: iSkillgroups = {
    BlockchainCoins: [],
    BlockchainTechnologies: [],
    BuildTools: [],
    CMS: [],
    HTMLCSS: [],
    JavaScript: [],
    ProgrammingLanguages: [],
    SEO: []
  };

  private skillGroups$: Subject<iSkillgroups> = new BehaviorSubject<iSkillgroups>(this.skillGroups);
  private _promise = this.skillGroups$.toPromise();
  private skillCollection: AngularFirestoreCollection<skillFirebase>;

  constructor(private db: AngularFirestore) {
    this.skillCollection = this.db.collection<skillFirebase>('skills');

    this.createCollections();
  }

  public async getSkillGroups$(): Promise<iSkillgroups> {
    return this._promise;
  }

  private async createCollections(): Promise<void> {
    const angularFirestoreCollection = await this.skillCollection.valueChanges()
      .pipe(
        take(1)
      ).toPromise();

    angularFirestoreCollection.forEach(element => {
      const color: string = this.COLORS[element.category];
      const size: number = Math.floor(element.level / 2.5);
      const word: iWord = {
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
    this.skillGroups$.complete();

    console.log(this.skillGroups);
  }
}
