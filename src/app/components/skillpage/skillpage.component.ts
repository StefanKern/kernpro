import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { ISkillFirebase } from './../../../typings.d';

@Component({
  selector: 'core-skillpage',
  templateUrl: './skillpage.component.html',
  styleUrls: ['./skillpage.component.scss']
})
export class SkillpageComponent implements OnInit {
  wikiTitle: string;
  skillFirebase: ISkillFirebase

  constructor(
    private route: ActivatedRoute,
    private db: AngularFirestore
  ) {
    this.route.paramMap.pipe(
      tap(() => {this.wikiTitle = "", this.skillFirebase = undefined}),
      map((params: ParamMap) => params.get('name')),
      mergeMap(routeName => this.db.collection<ISkillFirebase>('skills', ref => ref.where("title", "==", routeName)).valueChanges()),
      map((skillFirebase: ISkillFirebase[]) => skillFirebase[0]),
      take(1)
    ).subscribe((skillFirebase: ISkillFirebase) => {
      this.skillFirebase = skillFirebase;
      this.wikiTitle = skillFirebase.wiki_title ?? skillFirebase.title;
    });
  }

  async ngOnInit() {
  }
}
