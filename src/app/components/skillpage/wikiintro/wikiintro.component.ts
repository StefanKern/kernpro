import { Component, OnInit, Input } from '@angular/core';
import { WikiintroService } from './../../../services/wikiintro.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss']
})
export class WikiintroComponent implements OnInit {
  wikiintro: IWikiarticle = {};

  @Input() skillname: string;
  skillnameDecoded = "";
  citeurl = "";
  noArticle = false;
  imageurl = "";

  constructor(private wikiintroService: WikiintroService) {
  }

  ngOnInit() {
    this.skillnameDecoded = decodeURI(this.skillname);
    this.citeurl = `https://de.wikipedia.org/wiki/${this.skillnameDecoded}`;
    (async () => {
      try {
        this.wikiintro = await this.wikiintroService.getWikiIntro(this.skillname);
        if (this.wikiintro.image) {
          let imagename = this.wikiintro.image.replace(/^Datei:/, "").replace(" ", "_");
          this.imageurl = `https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/${imagename}/220px-${imagename}`;
        }
      } catch (e) {
        this.noArticle = true;
        console.log(`catch triggered with exception ${e}`);
      }
    })();
  }
}
