# Tâches de Sécurité - Phase 1

## Phase 1: Actions Immédiates

- [x] SEC-001: Externaliser les clés Firebase
  - [x] Créer fichier `.env` avec variables Firebase
  - [x] Ajouter `.env` au `.gitignore`
  - [x] Modifier `src/firebase/firebase.ts` pour utiliser `import.meta.env`
  - [x] Créer `.env.example` documentant les variables requises

- [x] SEC-002: Restreindre CORS
  - [x] Modifier `src/server.ts` avec liste blanche d'origines

- [x] SEC-003: Sécuriser le Proxy
  - [x] Rate limiting ajouté (in-memory, 100 req/15 min)
  - [x] Protection SSRF (blocage ports non-standard)

## Vérification

- [x] Build de production réussi
