import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, orderBy, query, doc, deleteDoc } from '@angular/fire/firestore';
import { Storage, ref, deleteObject } from '@angular/fire/storage';
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
  private storage = inject(Storage);

  /**
   * Get all scraped sites from Firestore
   * @param collectionName - The Firestore collection name (default: 'job-scrapes')
   */
  getScrapedSites(collectionName = 'job-scrapes'): Observable<ScrapedSite[]> {
    const sitesCollection = collection(this.firestore, collectionName);
    const sitesQuery = query(sitesCollection, orderBy('timestamp', 'desc'));
    return collectionData(sitesQuery, { idField: 'id' }) as Observable<ScrapedSite[]>;
  }

  /**
   * Delete a scraped site from both Firestore and Storage
   * @param siteId - The Firestore document ID
   * @param storageLocation - The Storage path (optional)
   * @param collectionName - The Firestore collection name (default: 'job-scrapes')
   */
  async deleteScrapedSite(siteId: string, storageLocation?: string, collectionName = 'job-scrapes'): Promise<void> {
    // Delete from Storage if storageLocation exists
    if (storageLocation) {
      try {
        const storageRef = ref(this.storage, storageLocation);
        await deleteObject(storageRef);
      } catch (error) {
        console.error('Error deleting from Storage:', error);
        // Continue to delete from Firestore even if Storage deletion fails
      }
    }

    // Delete from Firestore
    const docRef = doc(this.firestore, collectionName, siteId);
    await deleteDoc(docRef);
  }
}
