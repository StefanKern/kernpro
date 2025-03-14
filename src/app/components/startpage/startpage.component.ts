import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'core-startpage',
    templateUrl: './startpage.component.html',
    host: { '[id]': '"startpage"' },
    standalone: false
})
export class StartpageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
