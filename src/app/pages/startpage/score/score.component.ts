import { NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, inject, OnInit, signal } from '@angular/core';
import { NumberTrackerComponent } from './number-tracker.component';

interface StackOverflowUser {
  reputation: number;
  link: string;
  badge_counts?: {
    gold: number;
    silver: number;
    bronze: number;
  };
}

interface StackOverflowResponse {
  items: StackOverflowUser[];
}

@Component({
    selector: 'core-score',
    templateUrl: './score.component.html',
    styleUrls: ['./score.component.scss'],
    imports: [
      NumberTrackerComponent,
      NgIf
    ],
    standalone: true
})
export class ScoreComponent implements OnInit {
  private http = inject(HttpClient);
  soReputation = signal<number>(0);
  soTrackerComplete = signal<boolean>(false);
  profileLink = signal<string>('');

  gold = signal<number>(0);
  silver = signal<number>(0);
  bronze = signal<number>(0);

  @HostListener('click')
  onClick() {
    window.location.href = this.profileLink();
  }

  ngOnInit(): void {
    this.http.get<StackOverflowResponse>('https://api.stackexchange.com/2.3/users/639035?order=desc&sort=reputation&site=stackoverflow')
      .subscribe(({ items }) => {
        if (items[0]) {
          this.soReputation.set(items[0].reputation);
          this.profileLink.set(items[0].link);
          if (items[0].badge_counts) {
            this.gold.set(items[0].badge_counts.gold);
            this.silver.set(items[0].badge_counts.silver);
            this.bronze.set(items[0].badge_counts.bronze);
          }
        }
      });
  }
}
