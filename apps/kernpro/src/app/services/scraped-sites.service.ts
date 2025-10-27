import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, query, doc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Storage, ref, deleteObject } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ScrapedSite {
  id?: string;
  '@context'?: 'https://schema.org';
  '@type'?: 'JobPosting';

  // JobPosting fields
  title: string;
  description: string;
  datePosted?: string;
  validThrough?: string;
  employmentType?: string | string[];
  hiringOrganization?: {
    '@type'?: 'Organization';
    name: string;
    sameAs?: string;
    logo?: string;
  };
  jobLocation?: {
    '@type'?: 'Place';
    address?: {
      '@type'?: 'PostalAddress';
      streetAddress?: string;
      addressLocality?: string;
      addressRegion?: string;
      postalCode?: string;
      addressCountry?: string;
    };
  };
  baseSalary?: {
    '@type'?: 'MonetaryAmount';
    currency?: string;
    minValue?: number;
    maxValue?: number;
    unitText?: string;
  };
  skills?: string | string[];
  qualifications?: string;
  responsibilities?: string;
  educationRequirements?: string;
  experienceRequirements?: string;
  jobBenefits?: string;
  workHours?: string;
  jobLocationType?: string;
  industry?: string;
  url?: string;

  // Metadata
  timestamp?: Date | { seconds: number; nanoseconds: number };
  metadata?: {
    scrapedAt?: number;
    sourceUrl?: string;
    extractedBy?: string;
    rawHtml?: string;
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
   * @param collectionName - The Firestore collection name (default: 'job-postings')
   */
  getScrapedSites(collectionName = 'job-postings'): Observable<ScrapedSite[]> {
    const sitesCollection = collection(this.firestore, collectionName);
    const sitesQuery = query(sitesCollection);
    return (collectionData(sitesQuery, { idField: 'id' }) as Observable<ScrapedSite[]>).pipe(
      map((sites) => {
        // Sort by timestamp (most recent first)
        return sites.sort((a, b) => {
          const timeA = this.getTimestamp(a);
          const timeB = this.getTimestamp(b);
          return timeB - timeA;
        });
      })
    );
  }

  /**
   * Get a single scraped site by ID
   * @param siteId - The Firestore document ID
   * @param collectionName - The Firestore collection name (default: 'job-postings')
   */
  async getScrapedSiteById(siteId: string, collectionName = 'job-postings'): Promise<ScrapedSite | null> {
    const docRef = doc(this.firestore, collectionName, siteId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as ScrapedSite;
    }

    return null;
  }

  /**
   * Extract timestamp from different possible locations
   */
  private getTimestamp(site: ScrapedSite): number {
    // Check metadata.scrapedAt (new format)
    if (site.metadata?.scrapedAt) {
      return site.metadata.scrapedAt;
    }

    // Check timestamp field (old format or Firestore timestamp)
    if (site.timestamp) {
      if (typeof site.timestamp === 'number') {
        return site.timestamp;
      }
      if (site.timestamp instanceof Date) {
        return site.timestamp.getTime();
      }
      if ('seconds' in site.timestamp) {
        return site.timestamp.seconds * 1000;
      }
    }

    return 0;
  }

  /**
   * Delete a scraped site from both Firestore and Storage
   * @param siteId - The Firestore document ID
   * @param storageLocation - The Storage path (optional)
   * @param collectionName - The Firestore collection name (default: 'job-postings')
   */
  async deleteScrapedSite(siteId: string, storageLocation?: string, collectionName = 'job-postings'): Promise<void> {
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
