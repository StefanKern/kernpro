# Cover Letter Template System - Quick Start Guide

## What's New

The cover letter generator now includes **7 professionally designed templates** that you can switch between instantly!

## Features

✅ **7 Professional Templates** - From classic to creative
✅ **Live Preview** - See changes immediately in PDF viewer
✅ **One-Click Switching** - Change templates with a dropdown
✅ **Automatic Regeneration** - PDF updates when you change templates
✅ **Industry-Specific** - Templates designed for different fields
✅ **Color-Coded** - Each template has its own professional color scheme

## Quick Start

### 1. Access the Editor
```
Navigate to: Job Details → "Create Cover Letter" button
Or directly: /cover-letter-editor
```

### 2. Choose Your Template
Look for the **"Template Style"** dropdown in the header (next to Download button)

Click it to see 7 options:
1. **Classic** - Traditional business letter
2. **Modern Accent** - Blue header with icons
3. **Minimalist** - Centered, elegant design
4. **Professional Blue** - Corporate with structure
5. **Two Column** - Sidebar layout
6. **Creative Bold** - Red diagonal accent
7. **Executive** - Gold borders, sophisticated

### 3. Preview & Download
- PDF updates automatically when you select a template
- Review in the left panel
- Click "Download PDF" when satisfied

## Template Selection Tips

### By Career Stage

**Entry Level / Junior**
- Modern Accent
- Minimalist
- Two Column

**Mid-Level / Experienced**
- Professional Blue
- Modern Accent
- Creative Bold (if creative field)

**Senior / Executive**
- Executive
- Professional Blue
- Classic

### By Industry

**Conservative (Finance, Law, Government)**
```
Best: Classic, Professional Blue
Avoid: Creative Bold
```

**Tech & Startups**
```
Best: Modern Accent, Two Column, Minimalist
Good: Professional Blue
```

**Creative (Design, Media, Arts)**
```
Best: Creative Bold, Minimalist
Good: Modern Accent, Two Column
```

**Corporate Business**
```
Best: Professional Blue, Executive
Good: Classic, Modern Accent
```

## Technical Details

### Template Structure
Each template is implemented as a separate method in `PdfGeneratorService`:
- `createClassicTemplate()`
- `createModernAccentTemplate()`
- `createMinimalistTemplate()`
- `createProfessionalBlueTemplate()`
- `createTwoColumnTemplate()`
- `createCreativeBoldTemplate()`
- `createExecutiveTemplate()`

### Color Schemes
Defined in `colorSchemes` object with:
- **Primary color**: Main text/headers
- **Accent color**: Decorative elements
- **Light color**: Backgrounds/subtle highlights

### Template Type
```typescript
export type CoverLetterTemplate = 
  | 'classic'
  | 'modern-accent'
  | 'minimalist'
  | 'professional-blue'
  | 'two-column'
  | 'creative-bold'
  | 'executive';
```

## Testing the Templates

### Try All Templates
To see all templates with sample data:

```typescript
// In browser console or test file
const service = inject(PdfGeneratorService);

// Generate each template
service.generateDummyCoverLetter('classic');
service.generateDummyCoverLetter('modern-accent');
service.generateDummyCoverLetter('minimalist');
service.generateDummyCoverLetter('professional-blue');
service.generateDummyCoverLetter('two-column');
service.generateDummyCoverLetter('creative-bold');
service.generateDummyCoverLetter('executive');
```

### Custom Data
```typescript
const myData: CoverLetterData = {
  applicantName: 'Your Name',
  applicantAddress: 'Your Address',
  applicantPhone: 'Your Phone',
  applicantEmail: 'your@email.com',
  companyName: 'Target Company',
  hiringManagerName: 'Hiring Manager',
  companyAddress: 'Company Address',
  jobTitle: 'Position Title',
  date: new Date().toLocaleDateString('en-US'),
  introduction: 'Your intro paragraph...',
  body: ['Paragraph 1...', 'Paragraph 2...', 'Paragraph 3...'],
  closing: 'Your closing paragraph...',
  template: 'modern-accent' // Choose your template
};

service.generateCoverLetterPdf(myData, 'my-cover-letter.pdf');
```

## Customization

### Add a New Template

1. **Add to Type Definition**
```typescript
export type CoverLetterTemplate = 
  | 'classic'
  | 'your-new-template'; // Add here
```

2. **Add Color Scheme**
```typescript
private readonly colorSchemes = {
  'your-new-template': { 
    primary: '#000000', 
    accent: '#FF0000', 
    light: '#F0F0F0' 
  },
};
```

3. **Create Template Method**
```typescript
private createYourNewTemplate(data: CoverLetterData): jsPDF {
  const doc = new jsPDF();
  const colors = this.colorSchemes['your-new-template'];
  // Your design implementation...
  return doc;
}
```

4. **Add to Switch Statement**
```typescript
private createPdfDocument(data: CoverLetterData): jsPDF {
  switch (template) {
    case 'your-new-template':
      return this.createYourNewTemplate(data);
    // ...
  }
}
```

5. **Add to Template List**
```typescript
getAvailableTemplates() {
  return [
    {
      value: 'your-new-template',
      label: 'Your Template Name',
      description: 'Description of your template'
    },
    // ...
  ];
}
```

### Modify Existing Template Colors

Edit the `colorSchemes` object:
```typescript
'modern-accent': { 
  primary: '#YOUR_COLOR',  // Main color
  accent: '#YOUR_COLOR',   // Accent color
  light: '#YOUR_COLOR'     // Background color
},
```

## Troubleshooting

### Template Not Showing
- Check that template is added to `getAvailableTemplates()`
- Verify template type is in `CoverLetterTemplate` type
- Ensure switch statement includes the case

### PDF Not Updating
- Click the refresh icon next to "PDF Preview"
- Try selecting a different template then back
- Check browser console for errors

### Download Issues
- Ensure `template` property is set in `CoverLetterData`
- Check that file name doesn't contain invalid characters
- Verify jsPDF is properly installed

## API Reference

### Methods

**`generateCoverLetterPdf(data, fileName?)`**
- Generates and downloads a PDF
- Parameters:
  - `data`: CoverLetterData object
  - `fileName`: Optional file name (default: 'cover-letter.pdf')

**`generateCoverLetterPdfAsBlob(data)`**
- Returns jsPDF document object for preview
- Parameters:
  - `data`: CoverLetterData object
- Returns: jsPDF object

**`generateDummyCoverLetter(template?)`**
- Generates test PDF with sample data
- Parameters:
  - `template`: Optional template name (default: 'classic')

**`getAvailableTemplates()`**
- Returns array of template information
- Returns: `{ value, label, description }[]`

## Resources

- 📄 **Template Guide**: `COVER_LETTER_TEMPLATES.md`
- 🎨 **Visual Examples**: `COVER_LETTER_VISUAL_EXAMPLES.md`
- 💻 **Service File**: `apps/kernpro/src/app/services/pdf-generator.service.ts`
- 🖼️ **Editor Component**: `apps/kernpro/src/app/pages/cover-letter-editor/`

## Examples Gallery

To generate all examples at once:

```typescript
const templates: CoverLetterTemplate[] = [
  'classic',
  'modern-accent',
  'minimalist',
  'professional-blue',
  'two-column',
  'creative-bold',
  'executive'
];

templates.forEach(template => {
  service.generateDummyCoverLetter(template);
});
```

This will download 7 PDFs showing each template design!

---

**Need Help?** Check the template descriptions in the dropdown or refer to the visual examples document.
