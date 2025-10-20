// run with nx execute scraping

import { scraping } from './lib/scraping';

scraping(
  'https://www.stepstone.at/stellenangebote--Angular-Web-Developer-m-w-d-Suedliches-Wien-IVM-Technical-Consultants--935149-inline.html?rltr=1_1_25_seorl_m_0_0_0_0_0_0'
)
  .then((content) => {
    console.log('Scraped Content:', content);
  })
  .catch((error) => {
    console.error('Error occurred while scraping:', error);
  });
