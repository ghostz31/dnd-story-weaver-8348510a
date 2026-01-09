import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createServer() {
  const app = express();
  const port = process.env.PORT || 8080;

  // CORS Configuration
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Proxy Middleware for AideDD
  app.use('/api/proxy', async (req, res) => {
    try {
      const url = req.query.url;
      
      if (!url) {
        return res.status(400).json({ error: 'URL manquante' });
      }
      
      const allowedDomains = ['www.aidedd.org', 'aidedd.org'];
      const targetUrl = new URL(url);
      
      if (!allowedDomains.includes(targetUrl.hostname)) {
        return res.status(403).json({ error: 'Domaine non autorisé' });
      }
      
      console.log(`Proxy: accès à ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const text = await response.text();
      
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      res.send(text);
    } catch (error) {
      console.error('Erreur du proxy:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des données', details: error.message });
    }
  });

  // Serve static files from 'dist' directory
  app.use(express.static(path.join(__dirname, 'dist')));

  // SPA Fallback: Serve index.html for all other routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

createServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
