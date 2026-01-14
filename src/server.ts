import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch';
import path from 'path';

// Simple in-memory rate limiter
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;

function checkRateLimit(ip: string): boolean {
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
  // Utilisons le port 8081 qui est celui utilisé par Vite actuellement
  const port = Number(process.env.PORT) || 8081;

  // Liste blanche des origines autorisées
  const allowedOrigins = [
    'http://localhost:8081',
    'http://localhost:5173',
    'http://127.0.0.1:8081',
    'http://127.0.0.1:5173',
    process.env.PRODUCTION_URL
  ].filter(Boolean) as string[];

  // Configuration CORS sécurisée avec liste blanche
  app.use(cors({
    origin: (origin, callback) => {
      // Permettre les requêtes sans origin (ex: Postman, curl) en dev seulement
      if (!origin && process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      if (origin && allowedOrigins.includes(origin)) {
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
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Requis pour Vite HMR en dev
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
          "https://securetoken.googleapis.com",
          "ws://localhost:*", // Vite HMR
          "http://localhost:*"
        ],
        frameSrc: ["'self'", "https://*.firebaseapp.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
      }
    },
    crossOriginEmbedderPolicy: false, // Désactivé pour compatibilité avec ressources externes
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" } // Pour OAuth Firebase
  }));

  // Ajouter le middleware de proxy pour AideDD avec rate limiting
  app.use('/api/proxy', async (req, res): Promise<void> => {
    try {
      // Vérifier le rate limit
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!checkRateLimit(clientIp)) {
        res.status(429).json({ error: 'Trop de requêtes, réessayez plus tard' });
        return;
      }

      const url = req.query.url as string;

      if (!url) {
        res.status(400).json({ error: 'URL manquante' });
        return;
      }

      // Vérifier que l'URL est autorisée (sécurité)
      const allowedDomains = ['www.aidedd.org', 'aidedd.org'];
      let targetUrl: URL;
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

      // Bloquer les URLs avec des ports non-standard (protection SSRF)
      if (targetUrl.port && !['80', '443', ''].includes(targetUrl.port)) {
        res.status(403).json({ error: 'Port non autorisé' });
        return;
      }

      console.log(`Proxy: accès à ${url}`);

      // Faire la requête vers l'URL cible avec un timeout plus long
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

      // Lire la réponse
      const text = await response.text();

      // Définir les headers appropriés
      res.set('Content-Type', 'text/html; charset=utf-8');

      // Envoyer la réponse
      res.send(text);
    } catch (error: any) {
      console.error('Erreur du proxy:', error);
      if (error.name === 'AbortError') {
        res.status(504).json({ error: 'Timeout lors de la récupération des données' });
        return;
      }
      res.status(500).json({ error: 'Erreur lors de la récupération des données', details: error.message });
    }
  });

  // Créer le serveur Vite en mode middleware
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port: port // S'assurer que Vite utilise le même port
    },
    appType: 'spa'
  });

  // Utiliser le middleware Vite
  app.use(vite.middlewares);

  // Servir les fichiers statiques
  app.use(express.static(path.resolve(__dirname, '../public')));

  // Route pour toutes les autres requêtes - nécessaire pour le routage côté client
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../index.html'));
  });

  // Démarrer le serveur
  app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
  });
}

export { createServer };

// Ne pas démarrer le serveur si on est en mode test
if (process.env.NODE_ENV !== 'test') {
  createServer().catch((err) => {
    console.error('Erreur lors du démarrage du serveur:', err);
  });
}