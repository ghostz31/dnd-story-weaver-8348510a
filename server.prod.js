import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple in-memory rate limiter
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

async function createServer() {
  const app = express();
  const port = process.env.PORT || 8080;

  // Liste blanche des origines autorisées
  const allowedOrigins = [
    process.env.PRODUCTION_URL,
    'http://localhost:8080',
    'http://localhost:8081'
  ].filter(Boolean);

  // Configuration CORS sécurisée avec liste blanche
  app.use(cors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origin pour les outils
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Configuration Helmet pour les headers de sécurité HTTP
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:"],
        connectSrc: [
          "'self'",
          "https://*.firebaseio.com",
          "https://*.googleapis.com",
          "wss://*.firebaseio.com",
          "https://firestore.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com"
        ],
        frameSrc: ["'self'", "https://*.firebaseapp.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: []
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
  }));

  // Proxy Middleware for AideDD avec rate limiting
  app.use('/api/proxy', async (req, res) => {
    try {
      // Vérifier le rate limit
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard' });
        return;
      }

      const url = req.query.url;

      if (!url) {
        res.status(400).json({ error: 'URL manquante' });
        return;
      }

      const allowedDomains = ['www.aidedd.org', 'aidedd.org'];
      let targetUrl;
      try {
        targetUrl = new URL(url);
      } catch {
        res.status(400).json({ error: 'URL invalide' });
        return;
      }

      if (!allowedDomains.includes(targetUrl.hostname)) {
        res.status(403).json({ error: 'Domaine non autorisé' });
        return;
      }

      // Protection SSRF: bloquer les ports non-standard
      if (targetUrl.port && !['80', '443', ''].includes(targetUrl.port)) {
        res.status(403).json({ error: 'Port non autorisé' });
        return;
      }

      console.log(`Proxy: accès à ${url}`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const text = await response.text();

      res.set('Content-Type', 'text/html; charset=utf-8');
      res.send(text);
    } catch (error) {
      console.error('Erreur du proxy:', error);
      if (error.name === 'AbortError') {
        res.status(504).json({ error: 'Timeout lors de la récupération des données' });
        return;
      }
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
