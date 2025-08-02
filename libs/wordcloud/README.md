# Wordcloud Component

The `WordcloudComponent` is an Angular standalone component for rendering interactive word clouds using D3.js. It is designed for flexibility, performance, and visual appeal, supporting up to **90 words** in a single cloud.

## 🚀 Live Demos

Try out the component with these interactive demos:

- **[Basic Word Cloud Demo](https://kern.pro/en/wordcloud/test)** - See the component in action with sample data
- **[Custom Loader Demo](https://kern.pro/en/wordcloud/test-custom-loader)** - Example with custom loading spinner

![wordcloud example](image.png)

## Features

- **Display up to 90 words**: Efficiently lays out and renders up to 90 words, adapting the layout to maximize word placement.
- **Adaptive scaling and retry logic**: Automatically scales and retries the layout up to 5 times to fit as many words as possible, ensuring optimal use of space.
- **Word size mapping**: Supports five word sizes (`small`, `medium`, `large`, `extra-large`, `huge`) for visual emphasis.
- **Custom colors**: Each word can have a custom color for enhanced visual distinction.
- **Animated transitions**: Smoothly animates word entry, update, and exit for a polished user experience.
- **Responsive SVG rendering**: Uses SVG for crisp, scalable graphics and adapts to container size.
- **Click events**: Emits a `linkclick` event when a word is clicked, allowing for interactive behavior.
- **Loading state**: Displays a loading spinner and message while data is being fetched.
- **Browser-only rendering**: Detects platform and only renders the word cloud in browser environments.
- **Placement algorithm**: Uses an Archimedean spiral and collision detection to avoid overlapping words and maximize fit.
- **Custom aspect ratio**: Default aspect ratio is 16:9 (640x360), but can be adjusted in the code.

## Installation

Install the package via npm:

```bash
npm install @kernpro/angular-wordcloud
```

## Usage

Import the component and use it in your Angular templates:

```html
<kp-wordcloud [words]="wordList" [loading]="isLoading">
  <!-- Optional: Custom loading content -->
  <div slot="loader">
    <my-custom-spinner></my-custom-spinner>
    <p>Generating word cloud...</p>
  </div>
</kp-wordcloud>
```

## Component API

### Inputs

- **`words`** (`WordcloudWord[]`): Array of word objects to display in the word cloud. Each word object should contain `text`, `size`, and optional `color` properties.
- **`loading`** (`boolean`): When `true`, shows the loading spinner and passes an empty array to the internal word cloud. When `false`, displays the actual words.

### Outputs

- **`layoutComplete`** (`void`): Emitted when the word cloud layout process is complete and all words have been positioned and rendered.

### Content Projection

The component supports custom loading content via content projection:

```html
<kp-wordcloud [words]="words" [loading]="isLoading">
  <div slot="loader">
    <!-- Your custom loading content goes here -->
    <mat-spinner diameter="40"></mat-spinner>
    <p>Creating your word cloud...</p>
  </div>
</kp-wordcloud>
```

If no custom loader is provided, a default CSS spinner with "Loading..." text will be displayed.

## Events

The word cloud emits the following events:

- **`layoutComplete`**: Fired when the word cloud has finished processing and rendering all words. This is useful for hiding loading states or triggering follow-up actions.

Note: Individual word click events are handled internally by the word cloud component.

## Word Object Structure

```typescript
type WordcloudWord = {
  text: string;
  size: 'small' | 'medium' | 'large' | 'extra-large' | 'huge';
  color?: string;
};
```

## Custom Loading Spinners

The component supports custom loading content through Angular's content projection. Use the `slot="loader"` attribute to provide your own loading UI:

```html
<kp-wordcloud [words]="words" [loading]="true">
  <div slot="loader">
    <!-- Custom spinner using Angular Material -->
    <mat-spinner diameter="50"></mat-spinner>
    <p style="margin-top: 16px; color: #666;">Processing your data...</p>
  </div>
</kp-wordcloud>
```

```html
<kp-wordcloud [words]="words" [loading]="true">
  <div slot="loader" class="custom-loader">
    <!-- Custom CSS animation -->
    <div class="pulse-loader"></div>
    <h3>Generating Word Cloud</h3>
    <p>Please wait while we process your content...</p>
  </div>
</kp-wordcloud>
```

### Default Loading State

If no custom loader is provided, the component displays a default loading state with:

- A blue CSS spinner (rotating border animation)
- "Loading..." text
- Centered layout within the word cloud container

### Loading Behavior

- When `loading` is `true`: Shows the loading content and passes an empty array to the internal word cloud
- When `loading` is `false`: Hides the loading content and displays the actual word cloud
- The loading state automatically manages the transition between loading and content display

## Limitations

- Maximum recommended word count: **90**. More words may reduce readability and placement success.
- Only supports browser environments (no server-side rendering).

## Example

```typescript
import { Component } from '@angular/core';
import { WordcloudComponent, WordcloudWord } from '@kernpro/angular-wordcloud';

@Component({
  template: `
    <kp-wordcloud [words]="words" [loading]="isLoading" (layoutComplete)="onWordCloudReady()">
      <!-- Custom loading spinner -->
      <div slot="loader" class="my-loader">
        <div class="spinner"></div>
        <p>Creating your personalized word cloud...</p>
      </div>
    </kp-wordcloud>
  `,
  imports: [WordcloudComponent],
})
export class MyComponent {
  isLoading = true;

  words: WordcloudWord[] = [
    { text: 'Angular', size: 'huge', color: '#dd0031' },
    { text: 'TypeScript', size: 'large', color: '#3178c6' },
    { text: 'Component', size: 'medium', color: '#42a5f5' },
    { text: 'Reactive', size: 'large', color: '#66bb6a' },
    { text: 'Modern', size: 'small', color: '#ff7043' },
    // ... up to 90 words total
  ];

  onWordCloudReady() {
    console.log('Word cloud has finished rendering!');
    // Perform any post-render actions here
  }
}
```

## Customization

- Adjust the aspect ratio or size by modifying the `size` property in the component.
- Change word sizes by updating the `getVisualSize` mapping.

## License

MIT
