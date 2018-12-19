import { Component, OnInit } from '@angular/core';
import { WikiintroService } from './../../../services/wikiintro.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss']
})
export class WikiintroComponent implements OnInit {
  wikiintro: string = "";

  constructor(private wikiintroService: WikiintroService) { 
  }

  ngOnInit() {
    (async () => {
      try {
        this.wikiintro = await this.wikiintroService.getWikiIntro("Cardano_%28Kryptowährung%29");
      } catch (e) {
        console.log(`catch triggered with exception ${e}`);
      }
    })();
  }
}
