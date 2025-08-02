import { Sprite } from './types';

/**
 * Animates the removal of an SVG text element
 */
export function animateElementRemoval(element: SVGTextElement): void {
  element.style.transition = 'opacity 1s, transform 1s';
  element.style.opacity = '0';
  element.style.transform = 'translate(0, 0) rotate(0) scale(0.1)';

  setTimeout(() => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  }, 1000);
}

/**
 * Animates the entrance of a new SVG text element
 */
export function animateElementEntrance(
  element: SVGTextElement,
  word: Sprite
): void {
  // Start with invisible and small
  element.style.opacity = '0';
  element.style.fontSize = '1px';
  element.style.transform = 'translate(0, 0) rotate(0)';
  element.textContent = '';
  element.style.fill = word.color || '#000000';

  // Force layout update
  element.getBoundingClientRect();

  // Animate to visible
  setTimeout(() => {
    element.style.transition = 'opacity 1s, font-size 1s, transform 1s';
    element.style.opacity = '1';
    element.style.fontSize = word.visualSize + 'px';
    element.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`;
    element.textContent = word.text;
  }, 50);
}

/**
 * Animates the update of an existing SVG text element
 */
export function animateElementUpdate(
  element: SVGTextElement,
  word: Sprite
): void {
  element.style.transition = 'transform 1s, font-size 1s, fill 1s';
  element.style.transform = `translate(${word.x}px, ${word.y}px) rotate(${word.rotate}deg)`;
  element.style.fontSize = word.visualSize + 'px';
  element.style.fill = word.color || '#000000';
  element.textContent = word.text;
}

/**
 * Animates words out before restarting the layout
 */
export function animateWordsOut(vis: SVGGElement): Promise<void> {
  return new Promise((resolve) => {
    const existingTexts = Array.from(
      vis.querySelectorAll('text.kp-wordcloud')
    ) as SVGTextElement[];

    if (existingTexts.length > 0) {
      // Animate all words out simultaneously
      existingTexts.forEach((element) => {
        element.style.transition =
          'opacity 0.5s ease-out, transform 0.5s ease-out';
        element.style.opacity = '0';
        element.style.transform = 'translate(0px, 0px) scale(0.1)';
      });

      // Wait for animation to complete, then remove
      setTimeout(() => {
        existingTexts.forEach((element) => {
          if (element.parentNode) {
            element.parentNode.removeChild(element);
          }
        });
        resolve();
      }, 500);
    } else {
      resolve();
    }
  });
}

/**
 * Creates and configures an SVG text element for a word
 */
export function createWordElement(
  word: Sprite,
  onClickCallback: (text: string) => void
): SVGTextElement {
  const textElement = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'text'
  );
  textElement.setAttribute('text-anchor', 'middle');
  textElement.setAttribute('class', 'kp-wordcloud');
  textElement.style.pointerEvents = 'visible';
  textElement.style.cursor = 'pointer';

  // Add click handler
  textElement.addEventListener('click', () => {
    onClickCallback(word.text);
  });

  return textElement;
}
