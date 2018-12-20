import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'core-skillpage',
  templateUrl: './skillpage.component.html',
  styleUrls: ['./skillpage.component.scss']
})
export class SkillpageComponent implements OnInit {
  name: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.paramMap.subscribe((params: ParamMap) => this.name = params.get('name'));
  }

  ngOnInit() {
  }
}
