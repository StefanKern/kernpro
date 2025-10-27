import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

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
}

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  /**
   * Generates a jsPDF document from cover letter data
   */
  private createPdfDocument(data: CoverLetterData): jsPDF {
    const doc = new jsPDF();

    // Set up margins and initial position
    const leftMargin = 20;
    const rightMargin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - leftMargin - rightMargin;
    let currentY = 20;

    // Helper function to add text with automatic line wrapping
    const addText = (text: string, fontSize = 12, isBold = false): void => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');

      const lines = doc.splitTextToSize(text, maxLineWidth);
      lines.forEach((line: string) => {
        if (currentY > 270) {
          // Check if we need a new page
          doc.addPage();
          currentY = 20;
        }
        doc.text(line, leftMargin, currentY);
        currentY += fontSize * 0.5; // Line height
      });
      currentY += 2; // Add some spacing after paragraph
    };

    const addSpacing = (space = 5): void => {
      currentY += space;
    };

    // 1. Applicant's contact information (top right)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [data.applicantName, data.applicantAddress, data.applicantPhone, data.applicantEmail];

    contactInfo.forEach((info) => {
      doc.text(info, leftMargin, currentY);
      currentY += 5;
    });

    addSpacing(10);

    // 2. Date
    addText(data.date, 11);
    addSpacing(10);

    // 3. Recipient information
    if (data.hiringManagerName) {
      addText(data.hiringManagerName, 11);
    }
    addText(data.companyName, 11);
    if (data.companyAddress) {
      addText(data.companyAddress, 11);
    }
    addSpacing(10);

    // 4. Salutation
    const salutation = data.hiringManagerName ? `Dear ${data.hiringManagerName},` : 'Dear Hiring Manager,';
    addText(salutation, 12, true);
    addSpacing(5);

    // 5. Introduction
    addText(data.introduction, 12);
    addSpacing(5);

    // 6. Body paragraphs
    data.body.forEach((paragraph) => {
      addText(paragraph, 12);
      addSpacing(5);
    });

    // 7. Closing
    addText(data.closing, 12);
    addSpacing(5);

    // 8. Sign-off
    addText('Sincerely,', 12);
    addSpacing(15);
    addText(data.applicantName, 12, true);

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
  generateDummyCoverLetter(): void {
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
    };

    this.generateCoverLetterPdf(dummyData, 'dummy-cover-letter.pdf');
  }
}
