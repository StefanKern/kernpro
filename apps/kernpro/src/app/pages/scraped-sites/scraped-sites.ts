import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScrapedSitesService, ScrapedSite } from '../../services/scraped-sites.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'core-scraped-sites',
  imports: [CommonModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './scraped-sites.html',
  styleUrl: './scraped-sites.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScrapedSites {
  private scrapedSitesService = inject(ScrapedSitesService);
  private authService = inject(AuthService);
  private router = inject(Router);

  scrapedSites$: Observable<ScrapedSite[]> = this.scrapedSitesService.getScrapedSites('job-scrapes');

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  formatTimestamp(timestamp: Date | { seconds: number; nanoseconds: number } | undefined): string {
    if (!timestamp) return 'N/A';

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }

    if ('seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleString();
    }

    return 'N/A';
  }

  formatBytes(bytes: string | undefined): string {
    if (!bytes) return 'N/A';
    const numBytes = parseInt(bytes, 10);
    if (numBytes < 1024) return numBytes + ' B';
    if (numBytes < 1024 * 1024) return (numBytes / 1024).toFixed(2) + ' KB';
    return (numBytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  getHostname(url: string): string {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  openUrl(url: string): void {
    window.open(url, '_blank');
  }

  async deleteSite(site: ScrapedSite): Promise<void> {
    if (!site.id) return;

    if (confirm(`Are you sure you want to delete this scraped site from ${this.getHostname(site.url)}?`)) {
      try {
        await this.scrapedSitesService.deleteScrapedSite(site.id, site.metadata?.storageLocation, 'job-scrapes');
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete the scraped site. Please try again.');
      }
    }
  }
}
