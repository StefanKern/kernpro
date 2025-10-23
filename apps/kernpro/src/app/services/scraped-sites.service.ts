import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, orderBy, query } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface ScrapedSite {
  id?: string;
  url: string;
  content: string; // Storage path or full content
  timestamp: Date | { seconds: number; nanoseconds: number };
  metadata?: {
    title?: string;
    description?: string;
    contentLength?: string;
    storageLocation?: string;
    [key: string]: string | number | boolean | undefined;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ScrapedSitesService {
  private firestore = inject(Firestore);

  /**
   * Get all scraped sites from Firestore
   * @param collectionName - The Firestore collection name (default: 'job-scrapes')
   */
  getScrapedSites(collectionName = 'job-scrapes'): Observable<ScrapedSite[]> {
    const sitesCollection = collection(this.firestore, collectionName);
    const sitesQuery = query(sitesCollection, orderBy('timestamp', 'desc'));
    return collectionData(sitesQuery, { idField: 'id' }) as Observable<ScrapedSite[]>;
  }
}
