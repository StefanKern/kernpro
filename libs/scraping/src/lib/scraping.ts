import { chromium } from 'playwright';

export async function scraping(url: string): Promise<string> {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const page = await browser.newPage();
  try {
    // Go to the page and wait for the network to be idle, ensuring all dynamic content has loaded.
    await page.pause(); // Opens Playwright Inspector
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    // Wait a bit more for dynamic content to render
    await page.waitForTimeout(2000);
    // Get the full HTML content of the page.
    const content = await page.content();
    return content;
  } catch (error) {
    console.error(`Error fetching content from ${url}:`, error);
    throw new Error('Failed to retrieve website content.');
  } finally {
    await browser.close();
  }
}
