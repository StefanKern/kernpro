import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { ScrapedSitesService, ScrapedSite } from '../../services/scraped-sites.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'core-job-details',
  imports: [
    CommonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    SafeHtmlPipe,
  ],
  templateUrl: './job-details.html',
  styleUrl: './job-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobDetails {
  private scrapedSitesService = inject(ScrapedSitesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  jobPosting = signal<ScrapedSite | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.loadJobPosting();
  }

  private async loadJobPosting(): Promise<void> {
    const jobId = this.route.snapshot.paramMap.get('id');

    if (!jobId) {
      this.error.set('No job ID provided');
      this.loading.set(false);
      return;
    }

    try {
      const job = await this.scrapedSitesService.getScrapedSiteById(jobId, 'job-postings');
      if (job) {
        this.jobPosting.set(job);
      } else {
        this.error.set('Job posting not found');
      }
    } catch (err) {
      console.error('Error loading job posting:', err);
      this.error.set('Failed to load job posting');
    } finally {
      this.loading.set(false);
    }
  }

  goBack(): void {
    this.router.navigate(['/scraped-sites']);
  }

  formatTimestamp(timestamp: Date | { seconds: number; nanoseconds: number } | number | undefined): string {
    if (!timestamp) return 'N/A';

    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if (typeof timestamp === 'number') {
      return new Date(timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    if ('seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return 'N/A';
  }

  getEmploymentTypes(employmentType: string | string[] | undefined): string[] {
    if (!employmentType) return [];
    if (Array.isArray(employmentType)) {
      return employmentType;
    }
    return [employmentType];
  }

  getLocation(job: ScrapedSite): string {
    if (!job.jobLocation?.address) return 'Not specified';

    const addr = job.jobLocation.address;
    if (typeof addr === 'string') return addr;

    const parts = [
      addr.streetAddress,
      addr.addressLocality,
      addr.addressRegion,
      addr.postalCode,
      addr.addressCountry,
    ].filter(Boolean);

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
}
