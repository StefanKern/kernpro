import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

export type CoverLetterTemplate =
  | 'elegant-gold'
  | 'elegant-blue'
  | 'elegant-minimal'
  | 'elegant-bold'
  | 'elegant-modern'
  | 'elegant-classic'
  | 'elegant-two-tone';

export interface CoverLetterData {
  // Personal Information
  applicantName: string;
  applicantAddress: string;
  applicantPhone: string;
  applicantEmail: string;

  // Company Information
  companyName: string;
  hiringManagerName?: string;
  companyAddress?: string;

  // Job Information
  jobTitle: string;

  // Letter Content
  date: string;
  introduction: string;
  body: string[];
  closing: string;

  // Design Options
  template?: CoverLetterTemplate;
  primaryColor?: string;
  accentColor?: string;
}

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  /**
   * Template color schemes - All variants of the elegant design
   */
  private readonly colorSchemes = {
    'elegant-gold': { primary: '#1C1C1C', accent: '#B8860B', light: '#F5F5DC' },
    'elegant-blue': { primary: '#1C1C1C', accent: '#2196f3', light: '#E3F2FD' },
    'elegant-minimal': { primary: '#2C2C2C', accent: '#757575', light: '#F5F5F5' },
    'elegant-bold': { primary: '#1C1C1C', accent: '#2196f3', light: '#BBDEFB' },
    'elegant-modern': { primary: '#263238', accent: '#2196f3', light: '#CFD8DC' },
    'elegant-classic': { primary: '#000000', accent: '#2196f3', light: '#E8EAF6' },
    'elegant-two-tone': { primary: '#1C1C1C', accent: '#2196f3', light: '#E1F5FE' },
  };

  /**
   * Generates a jsPDF document from cover letter data
   */
  private createPdfDocument(data: CoverLetterData): jsPDF {
    const template = data.template || 'elegant-gold';

    switch (template) {
      case 'elegant-blue':
        return this.createElegantBlueTemplate(data);
      case 'elegant-minimal':
        return this.createElegantMinimalTemplate(data);
      case 'elegant-bold':
        return this.createElegantBoldTemplate(data);
      case 'elegant-modern':
        return this.createElegantModernTemplate(data);
      case 'elegant-classic':
        return this.createElegantClassicTemplate(data);
      case 'elegant-two-tone':
        return this.createElegantTwoToneTemplate(data);
      case 'elegant-gold':
      default:
        return this.createElegantGoldTemplate(data);
    }
  }

  /**
   * Variant 1: Elegant Gold - Original executive style with gold accents
   */
  private createElegantGoldTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-gold');
  }

  /**
   * Variant 2: Elegant Blue - Executive style with site blue (#2196f3)
   */
  private createElegantBlueTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-blue');
  }

  /**
   * Variant 3: Elegant Minimal - Subtle gray tones
   */
  private createElegantMinimalTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-minimal');
  }

  /**
   * Variant 4: Elegant Bold - Prominent blue accents with wider borders
   */
  private createElegantBoldTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-bold', { borderWidth: 4, nameUnderlineWidth: 60 });
  }

  /**
   * Variant 5: Elegant Modern - Blue-gray contemporary palette
   */
  private createElegantModernTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-modern');
  }

  /**
   * Variant 6: Elegant Classic - Traditional with blue touches
   */
  private createElegantClassicTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-classic', { useDoubleBorder: true });
  }

  /**
   * Variant 7: Elegant Two-Tone - Contrasting header and footer colors
   */
  private createElegantTwoToneTemplate(data: CoverLetterData): jsPDF {
    return this.createElegantTemplate(data, 'elegant-two-tone', { borderWidth: 3, nameUnderlineWidth: 50 });
  }

  /**
   * Main elegant template generator - creates executive-style cover letters
   */
  private createElegantTemplate(
    data: CoverLetterData,
    templateKey: CoverLetterTemplate,
    options: {
      borderWidth?: number;
      useDoubleBorder?: boolean;
      nameUnderlineWidth?: number;
    } = {}
  ): jsPDF {
    const doc = new jsPDF();
    const colors = this.colorSchemes[templateKey];
    const leftMargin = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - 50;
    let currentY = 25;

    const borderWidth = options.borderWidth || 2;
    const nameUnderlineWidth = options.nameUnderlineWidth || 40;
    const useDoubleBorder = options.useDoubleBorder || false;

    // Top border
    doc.setFillColor(colors.accent);
    doc.rect(0, 0, pageWidth, borderWidth, 'F');

    if (useDoubleBorder) {
      doc.rect(0, borderWidth + 1, pageWidth, 1, 'F');
    }

    // Bottom border
    doc.rect(0, 297 - borderWidth, pageWidth, borderWidth, 'F');

    if (useDoubleBorder) {
      doc.rect(0, 297 - borderWidth - 2, pageWidth, 1, 'F');
    }

    // Applicant name (elegant, centered)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.primary);
    const nameWidth = doc.getTextWidth(data.applicantName);
    doc.text(data.applicantName, (pageWidth - nameWidth) / 2, currentY);
    currentY += 3;

    // Decorative line under name
    doc.setFillColor(colors.accent);
    doc.rect((pageWidth - nameUnderlineWidth) / 2, currentY, nameUnderlineWidth, 0.5, 'F');
    currentY += 8;

    // Contact info (centered, elegant)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#333333');
    const contactLine = `${data.applicantPhone}  ·  ${data.applicantEmail}`;
    const contactWidth = doc.getTextWidth(contactLine);
    doc.text(contactLine, (pageWidth - contactWidth) / 2, currentY);
    currentY += 4;

    const addressWidth = doc.getTextWidth(data.applicantAddress);
    doc.text(data.applicantAddress, (pageWidth - addressWidth) / 2, currentY);
    currentY += 15;

    // Date (left aligned from here)
    doc.setFontSize(10);
    doc.setTextColor('#000000');
    doc.text(data.date, leftMargin, currentY);
    currentY += 12;

    // Recipient
    if (data.hiringManagerName) {
      doc.text(data.hiringManagerName, leftMargin, currentY);
      currentY += 5;
    }
    doc.text(data.companyName, leftMargin, currentY);
    currentY += 5;
    if (data.companyAddress) {
      doc.text(data.companyAddress, leftMargin, currentY);
      currentY += 5;
    }
    currentY += 10;

    // Salutation
    const salutation = data.hiringManagerName ? `Dear ${data.hiringManagerName},` : 'Dear Hiring Manager,';
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(salutation, leftMargin, currentY);
    currentY += 10;

    // Body content
    doc.setFontSize(10.5);
    doc.setFont('helvetica', 'normal');

    let lines = doc.splitTextToSize(data.introduction, maxLineWidth);
    lines.forEach((line: string) => {
      if (currentY > 265) {
        doc.addPage();
        // Redraw borders on new page
        doc.setFillColor(colors.accent);
        doc.rect(0, 0, pageWidth, borderWidth, 'F');
        doc.rect(0, 297 - borderWidth, pageWidth, borderWidth, 'F');
        if (useDoubleBorder) {
          doc.rect(0, borderWidth + 1, pageWidth, 1, 'F');
          doc.rect(0, 297 - borderWidth - 2, pageWidth, 1, 'F');
        }
        currentY = 25;
      }
      doc.text(line, leftMargin, currentY);
      currentY += 5;
    });
    currentY += 3;

    data.body.forEach((paragraph) => {
      lines = doc.splitTextToSize(paragraph, maxLineWidth);
      lines.forEach((line: string) => {
        if (currentY > 265) {
          doc.addPage();
          doc.setFillColor(colors.accent);
          doc.rect(0, 0, pageWidth, borderWidth, 'F');
          doc.rect(0, 297 - borderWidth, pageWidth, borderWidth, 'F');
          if (useDoubleBorder) {
            doc.rect(0, borderWidth + 1, pageWidth, 1, 'F');
            doc.rect(0, 297 - borderWidth - 2, pageWidth, 1, 'F');
          }
          currentY = 25;
        }
        doc.text(line, leftMargin, currentY);
        currentY += 5;
      });
      currentY += 3;
    });

    lines = doc.splitTextToSize(data.closing, maxLineWidth);
    lines.forEach((line: string) => {
      if (currentY > 265) {
        doc.addPage();
        doc.setFillColor(colors.accent);
        doc.rect(0, 0, pageWidth, borderWidth, 'F');
        doc.rect(0, 297 - borderWidth, pageWidth, borderWidth, 'F');
        if (useDoubleBorder) {
          doc.rect(0, borderWidth + 1, pageWidth, 1, 'F');
          doc.rect(0, 297 - borderWidth - 2, pageWidth, 1, 'F');
        }
        currentY = 25;
      }
      doc.text(line, leftMargin, currentY);
      currentY += 5;
    });
    currentY += 8;

    doc.text('Respectfully,', leftMargin, currentY);
    currentY += 15;
    doc.setFont('helvetica', 'bold');
    doc.text(data.applicantName, leftMargin, currentY);

    return doc;
  }

  /**
   * Generates a cover letter PDF with the provided data
   */
  generateCoverLetterPdf(data: CoverLetterData, fileName = 'cover-letter.pdf'): void {
    const doc = this.createPdfDocument(data);
    doc.save(fileName);
  }

  /**
   * Generates a cover letter PDF as a jsPDF document for preview
   */
  generateCoverLetterPdfAsBlob(data: CoverLetterData): jsPDF {
    return this.createPdfDocument(data);
  }

  /**
   * Generates a cover letter with dummy data for testing
   */
  generateDummyCoverLetter(template: CoverLetterTemplate = 'elegant-gold'): void {
    const dummyData: CoverLetterData = {
      applicantName: 'John Doe',
      applicantAddress: '123 Main Street, Apt 4B, New York, NY 10001',
      applicantPhone: '+1 (555) 123-4567',
      applicantEmail: 'john.doe@email.com',

      companyName: 'Tech Innovations Inc.',
      hiringManagerName: 'Sarah Johnson',
      companyAddress: '456 Business Ave, Suite 789, San Francisco, CA 94102',

      jobTitle: 'Senior Software Engineer',

      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),

      introduction:
        'I am writing to express my strong interest in the Senior Software Engineer position at Tech Innovations Inc. ' +
        'With over 8 years of experience in full-stack development and a proven track record of delivering ' +
        'scalable solutions, I am excited about the opportunity to contribute to your innovative team.',

      body: [
        'Throughout my career, I have developed expertise in modern web technologies including Angular, React, ' +
          'Node.js, and cloud platforms such as AWS and Azure. In my current role at Digital Solutions Corp, ' +
          'I led the development of a customer-facing application that serves over 100,000 users daily, ' +
          'resulting in a 40% increase in user engagement and a 25% reduction in load times through ' +
          'performance optimization.',

        'What particularly draws me to Tech Innovations Inc. is your commitment to leveraging cutting-edge ' +
          'technology to solve real-world problems. I am impressed by your recent work on AI-powered analytics ' +
          'and would be thrilled to bring my experience in machine learning integration and data visualization ' +
          'to your projects. My background in agile methodologies and collaborative development aligns well with ' +
          'your team-oriented culture.',

        'Beyond technical skills, I pride myself on my ability to mentor junior developers and foster a ' +
          'collaborative team environment. I have conducted numerous code reviews, technical workshops, and ' +
          'onboarding sessions that have helped build stronger, more cohesive development teams. I believe ' +
          'that sharing knowledge and supporting team growth is essential to long-term success.',
      ],

      closing:
        'I am enthusiastic about the possibility of bringing my technical expertise, leadership experience, ' +
        'and passion for innovation to Tech Innovations Inc. I would welcome the opportunity to discuss how ' +
        "my background and skills can contribute to your team's success. Thank you for considering my application.",

      template: template,
    };

    this.generateCoverLetterPdf(dummyData, `cover-letter-${template}.pdf`);
  }

  /**
   * Get available templates with descriptions
   */
  getAvailableTemplates(): { value: CoverLetterTemplate; label: string; description: string }[] {
    return [
      {
        value: 'elegant-gold',
        label: 'Elegant Gold',
        description: 'Classic elegance with gold accents - timeless and prestigious',
      },
      {
        value: 'elegant-blue',
        label: 'Elegant Blue',
        description: 'Professional elegance with modern blue accents - sophisticated yet contemporary',
      },
      {
        value: 'elegant-minimal',
        label: 'Elegant Minimal',
        description: 'Refined minimalism with subtle gray tones - understated sophistication',
      },
      {
        value: 'elegant-bold',
        label: 'Elegant Bold',
        description: 'Strong elegance with prominent blue accents - confident and modern',
      },
      {
        value: 'elegant-modern',
        label: 'Elegant Modern',
        description: 'Contemporary elegance with sleek blue-gray palette - fresh and professional',
      },
      {
        value: 'elegant-classic',
        label: 'Elegant Classic',
        description: 'Traditional elegance with classic blue touches - timeless professionalism',
      },
      {
        value: 'elegant-two-tone',
        label: 'Elegant Two-Tone',
        description: 'Balanced elegance with contrasting elements - distinctive and memorable',
      },
    ];
  }
}
