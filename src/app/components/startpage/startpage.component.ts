import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'core-startpage',
  templateUrl: './startpage.component.html',
  host: {'[id]': '"startpage"'}
})
export class StartpageComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
