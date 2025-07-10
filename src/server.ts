import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import fetch from 'node-fetch';
import path from 'path';

async function createServer() {
  const app = express();
  // Utilisons le port 8081 qui est celui utilisé par Vite actuellement
  const port = process.env.PORT || 8081;

  // Configuration CORS plus permissive
  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Ajouter le middleware de proxy pour AideDD
  app.use('/api/proxy', async (req, res) => {
    try {
      const url = req.query.url as string;
      
      if (!url) {
        return res.status(400).json({ error: 'URL manquante' });
      }
      
      // Vérifier que l'URL est autorisée (sécurité)
      const allowedDomains = ['www.aidedd.org', 'aidedd.org'];
      const targetUrl = new URL(url);
      
      if (!allowedDomains.includes(targetUrl.hostname)) {
        return res.status(403).json({ error: 'Domaine non autorisé' });
      }
      
      console.log(`Proxy: accès à ${url}`);
      
      // Faire la requête vers l'URL cible avec un timeout plus long
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: 10000 // 10 secondes de timeout
      });
      
      // Lire la réponse
      const text = await response.text();
      
      // Définir les headers appropriés pour éviter les problèmes CORS
      res.set('Content-Type', 'text/html; charset=utf-8');
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      // Envoyer la réponse
      res.send(text);
    } catch (error) {
      console.error('Erreur du proxy:', error);
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

createServer().catch((err) => {
  console.error('Erreur lors du démarrage du serveur:', err);
}); 