import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'core-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss']
})
export class ScoreComponent implements OnInit {
  SOReputation: number = 0;
  soTrackerComplete = false;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.http.get<any>('https://api.stackexchange.com/2.3/users/639035?order=desc&sort=reputation&site=stackoverflow')
    .subscribe((result) => this.SOReputation = result.items[0]?.reputation);
  }

}
