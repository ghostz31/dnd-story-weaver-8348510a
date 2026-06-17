# AGENTS.md — Besace (D&D 5e Character Manager)

## Setup

```bash
cp .env.example .env   # fill in Firebase values, or skip for test mode
npm install
```

**Test mode** bypasses Firebase entirely: `VITE_TEST_MODE=true npm run dev`. Uses a fake user (`test-user-001`) and `localStorage` instead of Firestore. Required for E2E tests and the test daemon.

Firebase emulators (optional, needs Java): `firebase emulators:start` then set `VITE_USE_FIRESTORE_EMULATOR=true`.

## Commands

| Command | What |
|---------|------|
| `npm run dev` | Vite dev server (port 5173) |
| `npm run build` | **Typecheck** (`tsc -b`) then production build |
| `npm run lint` | ESLint 9 flat config |
| `npm test` | Vitest (unit, jsdom) |
| `npm run test:watch` | Vitest watch mode |
| `npm run test:e2e` | Playwright (needs Vite on :5173 — use `VITE_TEST_MODE=true`) |
| `npm run test:daemon` | Starts Vite test mode + cycles E2E scenarios continuously |
| `npm run test:daemon:quick` | Runs daemon against existing :5173 server |
| `npm run preview` | Preview production build |

**Run a single unit test:** `npx vitest run src/utils/combat-engine.test.ts`

**No separate typecheck command** — typechecking only happens via `tsc -b` inside `npm run build`. ESLint flat config, no `--fix` script. No formatter (no Prettier).

## Architecture

```
React 19 + React Router 7 + Vite 7 + Tailwind CSS v4 (via @tailwindcss/vite)

src/
  main.tsx          → StrictMode > AuthProvider > BrowserRouter > App
  App.tsx           → Route tree (16 pages, 10 wizard steps)
  contexts/         → AuthContext, CharacterContext (1749 lines — core logic), WizardContext
  stores/           → combatStore, diceStore (Zustand 5, persisted to localStorage)
  lib/              → firebase.ts, combatSync.ts (Trame real-time sync), testStore.ts
  types/            → character.ts, combat.ts, inventory.ts, levelup.ts, spells.ts
  utils/            → combat-engine, conditions-engine, rules-engine, feat-effects, migration
  data/             → classFeatures.ts, classes.ts, races.ts, feats.ts, spells.ts
  hooks/            → useAuroraData.ts
  public/data/      → Aurora Builder JSON (spells, feats, items, invocations)
  scripts/          → Aurora XML→JSON converters & parsers
  tests/e2e/        → 9 Playwright scenarios + page objects + daemon
```

**No monorepo** — single Vite app, `"private": true`.

**tsconfig project references**: root `tsconfig.json` references `tsconfig.app.json` (React) and `tsconfig.node.json` (Vite config + scripts). `tsc -b` builds both.

## Key conventions

- **All UI and comments are in French.** Class names, spell names, feature descriptions.
- **Zustand stores use `persist` middleware** — combat and dice state survive page refresh via localStorage.
- **Combat state sync** (`combatSync.ts`): shared characters are stored in Firestore `shared_characters` collection, accessed via 6-char share codes. Supports real-time Firestore snapshot subscriptions.
- **Character data** is stored per-user in Firestore. `CharacterContext` is the single source of truth for loaded character data (1749 lines).
- **Aurora Builder data pipeline**: `scripts/convert-aurora.ts` + `scripts/parsers/` convert XML from [aurorabuilder/elements](https://github.com/aurorabuilder/elements) to JSON in `public/data/`. Run manually — no CI automation.
- **Vitest globals enabled** — `describe`, `it`, `expect` are available without imports.
- **Playwright**: Chromium only, 60s timeout, 1 retry, JSON reporter output at `tests/e2e/results.json`.

## Testing gotchas

- E2E tests **require Vite dev server running** on port 5173 (daemon handles this automatically).
- For E2E tests that need a logged-in user, set `VITE_TEST_MODE=true` before starting Vite.
- Unit tests use **jsdom** (no browser needed). No fixture setup required — character data is plain TS objects.
