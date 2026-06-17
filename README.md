# Trame — Gestionnaire de rencontres D&D 5e

Application web pour créer et gérer des rencontres pour Donjons & Dragons 5e.
Communique avec [Besace](../besace) (gestionnaire de personnages) via la collection
Firestore `shared_characters` pour le combat en temps réel.

## Fonctionnalités

- Création de rencontres équilibrées pour vos parties
- Suivi des joueurs et de leurs personnages (import D&D Beyond)
- Base de données complète de monstres en français (scrapée depuis AideDD)
- Système de combat avec initiative, conditions et suivi des points de vie
- Génération aléatoire d'encounters basée sur le niveau des joueurs
- Partage de rencontres/monstres via codes courts
- Synchronisation temps réel avec Besace pour le combat partagé

## Stack technique

- React 18 + TypeScript + Vite 5
- Tailwind CSS v3 + shadcn/ui
- React Router v6
- Firebase (Auth + Firestore)
- Express (serveur proxy AideDD en production)
- Vitest (tests unitaires)

## Installation

```bash
cp .env.example .env   # renseigner les variables Firebase
npm install
npm run dev            # http://localhost:8080
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement Vite |
| `npm run build` | Build production (`vite build`) |
| `npm run lint` | ESLint 9 flat config |
| `npm test` | Vitest (unitaires, jsdom) |
| `npm run scrape` | Scrape les monstres AideDD → `public/data/` |
| `npm run scrape:spells` | Scrape les sorts AideDD |

## Architecture

```
src/
  main.tsx             → StrictMode > AuthProvider > BrowserRouter > App
  App.tsx              → Route tree (14 routes, ProtectedRoute)
  auth/                → AuthContext (Firebase Auth)
  firebase/            → firebase.ts (init Firebase)
  components/          → composants métier + ui/ (shadcn primitives)
  hooks/               → useEncounterManager, useMonsters, useBesaceSync, ...
  lib/                 → firebaseApi, api (AideDD), monsterEnricher, schemas (Zod)
  pages/               → SharedMonsterPage, SharedEncounterPage, LegalPages, ...
  scripts/             → scraping AideDD (monstres, sorts, objets magiques)
  server.ts            → serveur Express (proxy AideDD, dev only)
public/data/           → JSON monstres/sorts/objets (scrapés)
```

## Déploiement

- **Netlify** (SPA statique) : `netlify.toml` à la racine
- **Docker** (avec proxy AideDD) : `Dockerfile` + `docker-compose.yml`

## Licence

MIT
