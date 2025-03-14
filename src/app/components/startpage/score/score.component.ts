import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';

@Component({
    selector: 'core-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
    standalone: false
})
export class ScoreComponent implements OnInit {
  http = inject(HttpClient)
  soReputation = signal<number>(0);
  soTrackerComplete = false;
  profileLink = ''

  @HostListener('click') onClick() {
    window.location.href = this.profileLink;
  }

  ngOnInit(): void {
    this.http.get<any>('https://api.stackexchange.com/2.3/users/639035?order=desc&sort=reputation&site=stackoverflow')
      .subscribe(({ items }) => {
        this.soReputation.set(items[0]?.reputation);
        this.profileLink = items[0]?.link;
      });
  }

}
