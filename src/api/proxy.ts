// Cette API sert de proxy pour contourner les problèmes CORS
// lors de la récupération des données depuis des sources externes comme AideDD

import express from 'express';
import fetch from 'node-fetch';
import cors from 'cors';

const router = express.Router();

// Middleware pour les CORS
router.use(cors());

// Route de proxy pour contourner les problèmes CORS
router.get('/', async (req, res) => {
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
    
    // Faire la requête vers l'URL cible
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });
    
    // Lire la réponse
    const text = await response.text();
    
    // Définir les headers appropriés
    res.set('Content-Type', 'text/html; charset=utf-8');
    
    // Envoyer la réponse
    res.send(text);
  } catch (error) {
    console.error('Erreur du proxy:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des données' });
  }
});

export default router; 