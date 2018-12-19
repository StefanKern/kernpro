import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WikiintroService {

  constructor() { }

  public async getWikiIntro(atricle): Promise<string> {
    let response: any = await fetch(`https://de.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts&format=json&exintro=&titles=${atricle}`);
    const json = await response.json();
    let pages = json.query.pages;
    
    for (var pagename in pages) {
      return pages[pagename].extract;
    }
  }
}
