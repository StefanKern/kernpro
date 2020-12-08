import { Injectable } from '@angular/core';
import {IWikiArticle} from '../../typings';

@Injectable({
  providedIn: 'root'
})
export class WikiintroService {

  constructor() { }

  public async getWikiIntro(atricle): Promise<IWikiArticle> {
    const response: any = await fetch(`https://de.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|pageimages&format=json&exintro=&titles=${atricle}&pithumbsize=150`);
    const json = await response.json();
    const pages = json.query.pages;

    if(pages["-1"])
      throw "No Entries found";
    let extract = "";
    let thumbnail: any;
    for (var pagename in pages) {
      extract =  pages[pagename].extract;
      thumbnail = pages[pagename]?.thumbnail;
      break;
    }
    return {extract, thumbnail}
  }
}
