import { Component, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, mergeMap, tap } from 'rxjs/operators';
import { ISkillFirebase } from 'src/typings';

@Component({
  selector: 'core-skillpage',
  templateUrl: './skillpage.component.html'
})
export class SkillpageComponent {
  wikiTitle = signal<string>('');
  skillFirebase = signal<ISkillFirebase | undefined>(undefined);

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore
  ) {
    this.route.paramMap.pipe(
      tap(() => {
        this.wikiTitle.set('');
        this.skillFirebase.set(undefined);
      }),
      map((params: ParamMap) => params.get('name')),
      mergeMap(routeName => this.db.collection<ISkillFirebase>('skills', ref => ref.where("title", "==", routeName)).valueChanges()),
      map((skillFirebase: ISkillFirebase[]) => skillFirebase[0])
    ).subscribe((skillFirebase: ISkillFirebase) => {
      this.skillFirebase.set(skillFirebase);
      this.wikiTitle.set(skillFirebase.wiki_title ?? skillFirebase.title);
    });
  }
}