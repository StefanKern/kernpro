/**
 * JobPosting schema based on https://schema.org/JobPosting
 * This interface represents structured job posting data extracted by AI
 */

/**
 * Represents a physical location
 */
export interface Place {
  '@type': 'Place';
  address?: PostalAddress | string;
}

/**
 * Represents a postal address
 */
export interface PostalAddress {
  '@type': 'PostalAddress';
  streetAddress?: string;
  addressLocality?: string; // City
  addressRegion?: string; // State/Province
  postalCode?: string;
  addressCountry?: string;
}

/**
 * Represents an organization
 */
export interface Organization {
  '@type': 'Organization';
  name: string;
  sameAs?: string; // URL to the organization's website
  logo?: string; // URL to the organization's logo
}

/**
 * Represents monetary amount
 */
export interface MonetaryAmount {
  '@type': 'MonetaryAmount';
  currency?: string; // e.g., "USD", "EUR"
  value?:
    | number
    | {
        '@type': 'QuantitativeValue';
        value?: number;
        minValue?: number;
        maxValue?: number;
        unitText?: string; // e.g., "HOUR", "YEAR", "MONTH"
      };
}

/**
 * Main JobPosting schema interface
 * Based on https://schema.org/JobPosting
 */
export interface JobPosting {
  '@context': 'https://schema.org';
  '@type': 'JobPosting';

  // Required fields
  title: string; // The title of the job
  description: string; // Full description of the job

  // Highly recommended fields
  datePosted?: string; // ISO 8601 date format (e.g., "2024-01-15")
  validThrough?: string; // ISO 8601 date format - when the job posting expires
  employmentType?: string | string[]; // e.g., "FULL_TIME", "PART_TIME", "CONTRACTOR", "TEMPORARY", "INTERN", "VOLUNTEER", "PER_DIEM", "OTHER"
  hiringOrganization?: Organization;
  jobLocation?: Place | Place[];

  // Salary information
  baseSalary?: MonetaryAmount | string;

  // Additional useful fields
  identifier?: {
    '@type': 'PropertyValue';
    name?: string;
    value?: string;
  };
  directApply?: boolean;
  applicationContact?: {
    '@type': 'ContactPoint';
    contactType?: string;
    email?: string;
    telephone?: string;
  };

  // Qualifications and requirements
  educationRequirements?:
    | string
    | {
        '@type': 'EducationalOccupationalCredential';
        credentialCategory?: string;
      };
  experienceRequirements?:
    | string
    | {
        '@type': 'OccupationalExperienceRequirements';
        monthsOfExperience?: number;
      };
  skills?: string | string[]; // Required skills
  qualifications?: string; // Text description of qualifications

  // Work details
  responsibilities?: string; // Job responsibilities
  industry?: string;
  occupationalCategory?: string;
  workHours?: string;
  jobBenefits?: string;

  // Remote work
  jobLocationType?: 'TELECOMMUTE' | string; // For remote jobs

  // Application details
  url?: string; // Original job posting URL
  jobImmediateStart?: boolean;

  // Additional metadata (custom fields for our use)
  metadata?: {
    scrapedAt?: number; // Timestamp when scraped
    sourceUrl?: string; // URL where the job was found
    extractedBy?: 'gemini-ai' | string;
    confidenceScore?: number; // AI confidence in extraction (0-1)
    rawHtml?: string; // Optional: store reference to raw HTML in Cloud Storage
  };
}

/**
 * Response from Gemini AI when extracting job posting data
 */
export interface JobPostingExtractionResult {
  jobPosting: JobPosting;
  extractionSuccessful: boolean;
  errors?: string[];
  warnings?: string[];
}
