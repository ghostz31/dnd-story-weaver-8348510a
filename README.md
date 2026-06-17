# Besace — Gestionnaire de personnages D&D 5e

Application web pour créer et gérer des personnages pour Donjons & Dragons 5e.
Communique avec [Trame](../Trame) (gestionnaire de rencontres) via la collection
Firestore `shared_characters` pour le combat en temps réel.

## Fonctionnalités

- Création de personnages guidée (wizard 10 étapes : race, classe, capacités, sorts, équipement…)
- Feuille de personnage complète avec calculs automatiques (CA, initiative, bonus de maîtrise)
- Gestion du niveau supérieur (ASI, choix de sous-classe, nouveaux sorts)
- Système de combat avec actions, bonus, réactions, conditions, épuisement
- Gestion de l'inventaire avec objets magiques (Aurora Builder)
- Lanceur de dés persistant
- Partage de personnages via codes courts pour sync combat avec Trame
- Mode test (sans Firebase) pour E2E

## Stack technique

- React 19 + TypeScript + Vite 7
- Tailwind CSS v4 (via `@tailwindcss/vite`)
- React Router v7
- Zustand 5 (state persisté localStorage)
- Firebase 12 (Auth + Firestore)
- Vitest (unitaires) + Playwright (E2E)

## Installation

```bash
cp .env.example .env   # renseigner les variables Firebase, ou skip pour le test mode
npm install
```

**Mode test** (sans Firebase) : `VITE_TEST_MODE=true npm run dev`
Utilise un user factice (`test-user-001`) et `localStorage` au lieu de Firestore.

Émulateurs Firebase (optionnel, nécessite Java) :
```bash
firebase emulators:start
VITE_USE_FIRESTORE_EMULATOR=true npm run dev
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | Typecheck (`tsc -b`) + build production |
| `npm run lint` | ESLint 9 flat config |
| `npm test` | Vitest (unitaires, jsdom) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright (nécessite Vite sur :5173 + `VITE_TEST_MODE=true`) |
| `npm run test:daemon` | Vite test mode + cycles E2E en continu |
| `npm run preview` | Preview du build production |

**Tester un fichier unitaire :** `npx vitest run src/utils/combat-engine.test.ts`

## Architecture

```
src/
  main.tsx          → StrictMode > AuthProvider > BrowserRouter > App
  App.tsx           → Route tree (11 pages + 10 étapes wizard)
  contexts/         → AuthContext, CharacterContext, WizardContext
  stores/           → combatStore, diceStore (Zustand 5, persisté localStorage)
  lib/              → firebase.ts, combatSync.ts (sync Trame), dataStore.ts
  types/            → character, combat, inventory, levelup, spells, aurora-v2
  utils/            → combat-engine, conditions-engine, rules-engine, feat-effects
  data/             → classFeatures, classes, races, feats, subclasses, spells
  hooks/            → useAuroraData, useSettings, useDarkMode
  components/       → composants UI + ui/ (primitives) + combat/ + spells/
  pages/            → HomePage, CharacterPage, CombatSheetPage, InventoryPage, ...
  pages/wizard/     → 10 étapes (NameStep, RaceStep, ClassStep, ...)

public/data/        → Aurora Builder JSON (spells, feats, items, invocations)
scripts/            → convert-aurora.ts + parsers/ (XML Aurora → JSON)
tests/e2e/          → 9 scénarios Playwright + page objects + daemon
```

## Conventions clés

- **Toute l'UI et les commentaires sont en français**
- **Zustand `persist`** : combat et dés survivent au refresh via localStorage
- **CharacterContext** est la source de vérité du personnage chargé
- **Sync combat** : les personnages partagés sont dans Firestore `shared_characters`,
  accessibles via codes de 6 caractères
- **Pipeline Aurora Builder** : `scripts/convert-aurora.ts` convertit le XML depuis
  [aurorabuilder/elements](https://github.com/aurorabuilder/elements) vers JSON dans `public/data/`

## Licence

MIT
