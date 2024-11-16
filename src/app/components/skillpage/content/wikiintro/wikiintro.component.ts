import { Component, inject, Input, OnChanges, signal } from '@angular/core';
import { IWikiArticle } from '../../../../../typings';
import { WikiintroService } from '../../../../services/wikiintro.service';

@Component({
  selector: 'core-wikiintro',
  templateUrl: './wikiintro.component.html',
  styleUrls: ['./wikiintro.component.scss'],  
  standalone: true
})
export class WikiintroComponent implements OnChanges {
  wikiintroService = inject(WikiintroService);
  wikiintro = signal<IWikiArticle>({});
  citeurl = signal<string>('');
  noArticle = signal<boolean>(false);
  imageurl = signal<string>('');

  @Input() wikiTitle: string;

  async ngOnChanges() {
    const skillnameDecoded = decodeURI(this.wikiTitle);
    this.noArticle.set(true);
    this.citeurl.set(`https://de.wikipedia.org/wiki/${skillnameDecoded}`);
    try {
      const wikiintro = await this.wikiintroService.getWikiIntro(skillnameDecoded);
      this.wikiintro.set(wikiintro);
      if (wikiintro.thumbnail) {
        this.imageurl.set(wikiintro.thumbnail.source);
      } else {
        this.imageurl.set('');
      }
      this.noArticle.set(false);
    } catch (e) {
      this.noArticle.set(true);
      console.error(`catch triggered with exception ${e}`);
    }
  }
}