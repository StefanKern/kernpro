import { Injectable } from '@angular/core';
import { IWikiArticle } from '../../typings';

interface IWikiApiResponse {
  query: {
    pages: Record<string, {
      extract: string;
      thumbnail?: {
        source: string;
        width: number;
        height: number;
      };
    }>;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WikiintroService {
  public async getWikiIntro(article: string): Promise<IWikiArticle> {
    const response: Response = await fetch(`https://de.wikipedia.org/w/api.php?action=query&origin=*&prop=extracts|pageimages&format=json&exintro=&titles=${article}&pithumbsize=150`);
    const json: IWikiApiResponse = await response.json();
    const pages = json.query.pages;

    if (pages["-1"]) {
      throw "No Entries found";
    }

    let extract = "";
    let thumbnail: IWikiArticle['thumbnail'];
    for (const pagename in pages) {
      extract = pages[pagename].extract;
      thumbnail = pages[pagename]?.thumbnail;
      break;
    }
    return { extract, thumbnail };
  }
}