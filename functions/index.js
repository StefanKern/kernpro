const { onRequest } = require('firebase-functions/v2/https');
const express = require('express');
const { join } = require('path');

const app = express();

// Serve static files from the Angular app
app.use(express.static(join(__dirname, '../dist/kernpro/browser')));

// Language redirect middleware
app.get('/', (req, res) => {
  const acceptLanguage = req.headers['accept-language'] || '';
  // Check if German is one of the preferred languages
  const prefersGerman = acceptLanguage.toLowerCase().includes('de');

  if (prefersGerman) {
    res.redirect(302, '/de');
  } else {
    res.redirect(302, '/en');
  }
});

// Handle all other routes for SSR
app.get('*', async (req, res) => {
  try {
    // Serve the index.html for all routes
    res.sendFile(join(__dirname, '../dist/kernpro/browser/index.html'));
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

exports.ssrApp = onRequest(
  {
    region: 'europe-west1',
    memory: '256MiB',
  },
  app
);
