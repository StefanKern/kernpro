import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { CoverLetterData, CoverLetterTemplate, PdfGeneratorService } from '../../services/pdf-generator.service';
import { SafeUrlPipe } from '../../shared/pipes/safe-url.pipe';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'core-cover-letter-editor',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    MatSelectModule,
    FormsModule,
    SafeUrlPipe,
  ],
  templateUrl: './cover-letter-editor.html',
  styleUrl: './cover-letter-editor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverLetterEditor {
  private pdfGeneratorService = inject(PdfGeneratorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Available templates
  availableTemplates = this.pdfGeneratorService.getAvailableTemplates();
  selectedTemplate = signal<CoverLetterTemplate>('elegant-gold');

  // Cover letter data
  coverLetterData = signal<CoverLetterData>(this.getDefaultCoverLetterData());
  pdfBlobUrl = signal<string | null>(null);

  // Chat interface
  chatMessages = signal<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Hello! I'm here to help you refine your cover letter. You can ask me to:\n\n• Rewrite specific sections\n• Make it more professional or casual\n• Add or remove details\n• Adjust the tone\n• Fix grammar or improve clarity\n\nWhat would you like to change?",
      timestamp: new Date(),
    },
  ]);
  userMessage = signal('');

  constructor() {
    this.generatePdfPreview();
  }

  private getDefaultCoverLetterData(): CoverLetterData {
    return {
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

      template: this.selectedTemplate(),
    };
  }

  onTemplateChange(): void {
    // Update the cover letter data with the new template
    this.coverLetterData.update((data) => ({
      ...data,
      template: this.selectedTemplate(),
    }));

    // Regenerate the PDF preview
    this.generatePdfPreview();
  }

  private generatePdfPreview(): void {
    // Generate PDF as blob URL for preview
    const doc = this.pdfGeneratorService.generateCoverLetterPdfAsBlob(this.coverLetterData());
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);

    // Revoke previous URL if exists
    const previousUrl = this.pdfBlobUrl();
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    this.pdfBlobUrl.set(url);
  }

  sendMessage(): void {
    const message = this.userMessage().trim();
    if (!message) return;

    // Add user message
    this.chatMessages.update((messages) => [
      ...messages,
      {
        role: 'user',
        content: message,
        timestamp: new Date(),
      },
    ]);

    // Clear input
    this.userMessage.set('');

    // Simulate AI response (placeholder for now)
    setTimeout(() => {
      this.chatMessages.update((messages) => [
        ...messages,
        {
          role: 'assistant',
          content: this.getSimulatedResponse(message),
          timestamp: new Date(),
        },
      ]);
    }, 1000);
  }

  private getSimulatedResponse(userMessage: string): string {
    // This is a placeholder. Later we'll integrate with actual AI
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('introduction') || lowerMessage.includes('opening')) {
      return 'I can help you improve the introduction. Would you like me to:\n\n1. Make it more impactful and attention-grabbing\n2. Add specific achievements\n3. Tailor it more to the company\n\nWhich direction would you prefer?';
    }

    if (lowerMessage.includes('shorter') || lowerMessage.includes('concise')) {
      return "I'll make the cover letter more concise. Let me work on condensing the content while maintaining the key points...";
    }

    if (lowerMessage.includes('professional') || lowerMessage.includes('formal')) {
      return 'I can adjust the tone to be more professional. Should I focus on:\n\n1. Using more formal language throughout\n2. Adding industry-specific terminology\n3. Emphasizing professional achievements\n\nLet me know your preference!';
    }

    return "I understand you want to make changes. Could you be more specific about which section you'd like me to focus on? For example:\n\n• Introduction paragraph\n• First/Second/Third body paragraph\n• Closing paragraph\n• Overall tone or style";
  }

  regeneratePdf(): void {
    this.generatePdfPreview();
  }

  downloadPdf(): void {
    this.pdfGeneratorService.generateCoverLetterPdf(this.coverLetterData(), 'cover-letter.pdf');
  }

  goBack(): void {
    // Revoke blob URL before leaving
    const url = this.pdfBlobUrl();
    if (url) {
      URL.revokeObjectURL(url);
    }
    this.router.navigate(['/scraped-sites']);
  }
}
