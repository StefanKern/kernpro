import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { ISkillFirebase } from 'src/typings';
import { WikiintroComponent } from './wikiintro/wikiintro.component';

@Component({
  selector: 'core-skillpage',
  templateUrl: './skillpage.component.html',
  standalone: true,
  imports: [
    WikiintroComponent    
  ]
})
export class SkillpageComponent implements OnChanges {
  private db = inject(AngularFirestore);
  @Input()
  name: string;

  wikiTitle = signal<string>('');
  skillFirebase = signal<ISkillFirebase | undefined>(undefined);

  ngOnChanges(): void {
    this.wikiTitle.set('');
    this.skillFirebase.set(undefined);
    this.db.collection<ISkillFirebase>('skills', ref => ref.where("title", "==", this.name))
    .valueChanges()
    .pipe(
      map((skillFirebase: ISkillFirebase[]) => skillFirebase[0])
    ).subscribe((skillFirebase: ISkillFirebase) => {
      this.wikiTitle.set(skillFirebase.wiki_title ?? skillFirebase.title);
      this.skillFirebase.set(skillFirebase);
    });
  }
}