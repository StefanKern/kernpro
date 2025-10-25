import { VertexAI, GenerativeModel, SchemaType } from '@google-cloud/vertexai';
import { JobPosting, JobPostingExtractionResult } from './job-posting-schema';

/**
 * Service for extracting structured job posting data from HTML using Gemini AI via Vertex AI
 */
export class GeminiJobExtractor {
  private model: GenerativeModel;
  private vertexAI: VertexAI;

  /**
   * Initialize the Gemini AI extractor with Vertex AI
   * @param projectId - Google Cloud project ID (e.g., 'kernpro-5a9d1')
   * @param location - Vertex AI location (default: 'us-central1')
   * @param serviceAccountPath - Optional path to service account JSON file
   */
  constructor(projectId: string, location = 'us-central1', serviceAccountPath?: string) {
    // Set credentials if provided
    if (serviceAccountPath) {
      process.env['GOOGLE_APPLICATION_CREDENTIALS'] = serviceAccountPath;
    }

    // Initialize Vertex AI
    this.vertexAI = new VertexAI({
      project: projectId,
      location: location,
    });

    // Use gemini-2.5-pro for the highest accuracy and reasoning capabilities
    this.model = this.vertexAI.getGenerativeModel({
      model: 'gemini-2.5-pro',
      generationConfig: {
        responseMimeType: 'application/json',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        responseSchema: this.getJobPostingSchema() as any,
      },
    });
  }

  /**
   * Define the JSON schema for Gemini to extract JobPosting data
   * This follows schema.org JobPosting structure
   */
  private getJobPostingSchema() {
    return {
      type: SchemaType.OBJECT,
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'The title of the job position',
          nullable: false,
        },
        description: {
          type: SchemaType.STRING,
          description: 'Full description of the job including responsibilities and requirements',
          nullable: false,
        },
        datePosted: {
          type: SchemaType.STRING,
          description: 'Date when the job was posted in ISO 8601 format (YYYY-MM-DD)',
          nullable: true,
        },
        validThrough: {
          type: SchemaType.STRING,
          description: 'Expiration date of the job posting in ISO 8601 format (YYYY-MM-DD)',
          nullable: true,
        },
        employmentType: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'Type of employment (e.g., FULL_TIME, PART_TIME, CONTRACTOR)',
          nullable: true,
        },
        hiringOrganization: {
          type: SchemaType.OBJECT,
          properties: {
            name: {
              type: SchemaType.STRING,
              description: 'Name of the hiring company/organization',
            },
            sameAs: {
              type: SchemaType.STRING,
              description: 'URL to the organization website',
              nullable: true,
            },
            logo: {
              type: SchemaType.STRING,
              description: 'URL to the organization logo',
              nullable: true,
            },
          },
          nullable: true,
        },
        jobLocation: {
          type: SchemaType.OBJECT,
          properties: {
            address: {
              type: SchemaType.OBJECT,
              properties: {
                streetAddress: {
                  type: SchemaType.STRING,
                  nullable: true,
                },
                addressLocality: {
                  type: SchemaType.STRING,
                  description: 'City',
                  nullable: true,
                },
                addressRegion: {
                  type: SchemaType.STRING,
                  description: 'State or province',
                  nullable: true,
                },
                postalCode: {
                  type: SchemaType.STRING,
                  nullable: true,
                },
                addressCountry: {
                  type: SchemaType.STRING,
                  nullable: true,
                },
              },
              nullable: true,
            },
          },
          nullable: true,
        },
        baseSalary: {
          type: SchemaType.OBJECT,
          properties: {
            currency: {
              type: SchemaType.STRING,
              description: 'Currency code (e.g., USD, EUR)',
              nullable: true,
            },
            minValue: {
              type: SchemaType.NUMBER,
              nullable: true,
            },
            maxValue: {
              type: SchemaType.NUMBER,
              nullable: true,
            },
            unitText: {
              type: SchemaType.STRING,
              description: 'HOUR, MONTH, YEAR, etc.',
              nullable: true,
            },
          },
          nullable: true,
        },
        skills: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.STRING,
          },
          description: 'List of required skills and technologies',
          nullable: true,
        },
        qualifications: {
          type: SchemaType.STRING,
          description: 'Educational and experience qualifications',
          nullable: true,
        },
        responsibilities: {
          type: SchemaType.STRING,
          description: 'Main job responsibilities',
          nullable: true,
        },
        educationRequirements: {
          type: SchemaType.STRING,
          description: 'Required education level',
          nullable: true,
        },
        experienceRequirements: {
          type: SchemaType.STRING,
          description: 'Required years or type of experience',
          nullable: true,
        },
        jobBenefits: {
          type: SchemaType.STRING,
          description: 'Benefits offered with the position',
          nullable: true,
        },
        workHours: {
          type: SchemaType.STRING,
          description: 'Expected work hours',
          nullable: true,
        },
        jobLocationType: {
          type: SchemaType.STRING,
          description: 'TELECOMMUTE for remote jobs, or empty for on-site',
          nullable: true,
        },
        industry: {
          type: SchemaType.STRING,
          description: 'Industry or sector',
          nullable: true,
        },
        url: {
          type: SchemaType.STRING,
          description: 'URL to the original job posting',
          nullable: true,
        },
      },
      required: ['title', 'description'],
    };
  }

  /**
   * Extract job posting information from HTML content using Gemini AI
   * @param htmlContent - Raw HTML content of the job posting page
   * @param sourceUrl - Optional URL of the source page for metadata
   * @returns Structured JobPosting data
   */
  async extractJobPosting(htmlContent: string, sourceUrl?: string): Promise<JobPostingExtractionResult> {
    try {
      // Create a prompt for Gemini to extract job posting data
      const prompt = this.createExtractionPrompt(htmlContent, sourceUrl);

      // Generate structured output
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      // Get the text content from the first candidate
      const textContent = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const extractedData = JSON.parse(textContent);

      // Build the complete JobPosting object
      const jobPosting: JobPosting = {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        ...extractedData,
        metadata: {
          scrapedAt: Date.now(),
          sourceUrl: sourceUrl,
          extractedBy: 'gemini-ai',
        },
      };

      // Validate required fields
      const errors: string[] = [];
      if (!jobPosting.title) {
        errors.push('Missing required field: title');
      }
      if (!jobPosting.description) {
        errors.push('Missing required field: description');
      }

      return {
        jobPosting,
        extractionSuccessful: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      console.error('Error extracting job posting with Gemini AI:', error);

      // Return a minimal JobPosting with error information
      return {
        jobPosting: {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: 'Extraction Failed',
          description: 'Failed to extract job posting data from HTML',
          metadata: {
            scrapedAt: Date.now(),
            sourceUrl: sourceUrl,
            extractedBy: 'gemini-ai',
          },
        },
        extractionSuccessful: false,
        errors: [error instanceof Error ? error.message : 'Unknown error occurred'],
      };
    }
  }

  /**
   * Create the extraction prompt for Gemini
   */
  private createExtractionPrompt(htmlContent: string, sourceUrl?: string): string {
    return `You are an expert at extracting structured job posting information from HTML content.

Analyze the following HTML content and extract all relevant job posting information according to the schema.org JobPosting format.

${sourceUrl ? `Source URL: ${sourceUrl}\n` : ''}

Instructions:
1. Extract the job title, full description, and all available details
2. Identify the hiring organization name and website if available
3. Extract location information (city, state/region, country)
4. Find salary information if mentioned (range, currency, time unit)
5. Determine employment type (FULL_TIME, PART_TIME, CONTRACTOR, etc.)
6. Extract required skills, qualifications, and experience
7. Identify job benefits, work hours, and whether it's remote (TELECOMMUTE)
8. Extract posting date and expiration date if available
9. Use ISO 8601 date format (YYYY-MM-DD) for all dates
10. For employment types, use these exact values: FULL_TIME, PART_TIME, CONTRACTOR, TEMPORARY, INTERN, VOLUNTEER, PER_DIEM, OTHER
11. If information is not available, leave the field empty/null

Be thorough and accurate. Extract as much information as possible from the HTML.

HTML Content:
${htmlContent}`;
  }

  /**
   * Batch extract multiple job postings
   * @param htmlContents - Array of HTML contents
   * @param sourceUrls - Optional array of source URLs
   * @returns Array of extraction results
   */
  async extractJobPostingsBatch(htmlContents: string[], sourceUrls?: string[]): Promise<JobPostingExtractionResult[]> {
    const results: JobPostingExtractionResult[] = [];

    for (let i = 0; i < htmlContents.length; i++) {
      const html = htmlContents[i];
      const url = sourceUrls?.[i];

      console.log(`Extracting job posting ${i + 1}/${htmlContents.length}...`);
      const result = await this.extractJobPosting(html, url);
      results.push(result);

      // Add a small delay to avoid rate limiting
      if (i < htmlContents.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return results;
  }
}

/**
 * Helper function to create a Gemini extractor instance with Vertex AI
 * @param projectId - Google Cloud project ID
 * @param location - Vertex AI location (default: 'us-central1')
 * @param serviceAccountPath - Optional path to service account JSON file
 * @returns GeminiJobExtractor instance
 */
export function createGeminiExtractor(
  projectId: string,
  location = 'us-central1',
  serviceAccountPath?: string
): GeminiJobExtractor {
  return new GeminiJobExtractor(projectId, location, serviceAccountPath);
}
