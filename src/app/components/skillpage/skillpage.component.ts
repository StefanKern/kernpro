import { ISkillFirebase } from './../../../typings.d';
import { AngularFirestore } from '@angular/fire/firestore';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { mergeMap, switchMap, take, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

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
      mergeMap(routeName => this.db.collection<ISkillFirebase>('skills', ref => ref.where("title", "==", routeName)).valueChanges().pipe(take(1))),
      map((skillFirebase: ISkillFirebase[]) => skillFirebase[0])
    ).subscribe((skillFirebase: ISkillFirebase) => {
      this.skillFirebase = skillFirebase;
      this.wikiTitle = skillFirebase.wiki_title ?? skillFirebase.title;
    });
  }

  async ngOnInit() {
  }
}
