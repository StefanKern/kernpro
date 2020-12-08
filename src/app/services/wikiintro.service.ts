import { Injectable } from '@angular/core';
import {IWikiArticle} from '../../typings';

@Injectable({
  providedIn: 'root'
})
export class WikiintroService {

  constructor() { }

  public async getWikiIntro(atricle): Promise<IWikiArticle> {
    const response: any = await fetch(`https://de.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|images&format=json&exintro=&titles=${atricle}`);
    const json = await response.json();
    const pages = json.query.pages;

    if(pages["-1"])
      throw "No Entries found";
    let extract = "";
    let image = "";
    for (var pagename in pages) {
      extract =  pages[pagename].extract;
      image = pages[pagename]?.images?.[0]?.title;
      break;
    }
    return {
      extract: extract,
      image: image
    }
  }
}
