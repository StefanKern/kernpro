import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  // Whitelist of allowed HTML tags - only basic formatting
  private readonly ALLOWED_TAGS = [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'a',
    'span',
    'div',
  ];

  // Whitelist of allowed attributes - very restrictive
  private readonly ALLOWED_ATTR = ['href', 'target', 'rel'];

  transform(html: string | null | undefined): SafeHtml {
    if (!html) {
      return '';
    }

    // First, use DOMPurify to sanitize and remove dangerous content
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: this.ALLOWED_TAGS,
      ALLOWED_ATTR: this.ALLOWED_ATTR,
      ALLOW_DATA_ATTR: false, // Don't allow data-* attributes
      ALLOW_UNKNOWN_PROTOCOLS: false, // Only allow http, https, mailto, etc.
    });

    // Then, use Angular's sanitizer to mark it as safe
    return this.sanitizer.bypassSecurityTrustHtml(cleanHtml);
  }
}
