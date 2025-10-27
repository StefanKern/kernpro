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

  scrapedSites$: Observable<ScrapedSite[]> = this.scrapedSitesService.getScrapedSites('job-postings');

  async signOut(): Promise<void> {
    await this.authService.signOut();
    this.router.navigate(['/login']);
  }

  formatTimestamp(timestamp: Date | { seconds: number; nanoseconds: number } | number | undefined): string {
    if (!timestamp) return 'N/A';

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString();
    }

    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleString();
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

  getHostname(url: string | undefined): string {
    if (!url) return 'Unknown';
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  }

  getEmploymentTypes(employmentType: string | string[] | undefined): string {
    if (!employmentType) return 'Not specified';
    if (Array.isArray(employmentType)) {
      return employmentType.join(', ');
    }
    return employmentType;
  }

  getLocation(site: ScrapedSite): string {
    if (!site.jobLocation?.address) return 'Not specified';

    const addr = site.jobLocation.address;
    if (typeof addr === 'string') return addr;

    const parts = [addr.addressLocality, addr.addressRegion, addr.addressCountry].filter(Boolean);

    return parts.length > 0 ? parts.join(', ') : 'Not specified';
  }

  getSalary(
    salary: ScrapedSite['baseSalary']
  ): { min?: number; max?: number; currency?: string; unit?: string } | null {
    if (!salary) return null;

    return {
      min: salary.minValue,
      max: salary.maxValue,
      currency: salary.currency || 'USD',
      unit: salary.unitText,
    };
  }

  getSkills(skills: string | string[] | undefined): string[] {
    if (!skills) return [];
    if (Array.isArray(skills)) return skills;
    return [skills];
  }

  async deleteSite(site: ScrapedSite): Promise<void> {
    if (!site.id) return;

    const displayName = site.title || this.getHostname(site.url || site.metadata?.sourceUrl);
    if (confirm(`Are you sure you want to delete "${displayName}"?`)) {
      try {
        await this.scrapedSitesService.deleteScrapedSite(
          site.id,
          site.metadata?.storageLocation || site.metadata?.rawHtml,
          'job-postings'
        );
      } catch (error) {
        console.error('Error deleting site:', error);
        alert('Failed to delete the job posting. Please try again.');
      }
    }
  }
}
