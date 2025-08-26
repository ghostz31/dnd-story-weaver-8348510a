# 🧪 Configuration des Tests

## Installation des Dépendances

Pour activer les tests, vous devez d'abord installer les dépendances de test :

```bash
# Installer les dépendances de test
npm install --save-dev @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest identity-obj-proxy

# Ou avec yarn
yarn add -D @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/jest jest jest-environment-jsdom ts-jest identity-obj-proxy
```

## Scripts Disponibles

Une fois les dépendances installées, vous pouvez utiliser les scripts suivants :

```bash
# Lancer tous les tests
npm run test

# Lancer les tests en mode watch (redémarre automatiquement)
npm run test:watch

# Générer un rapport de couverture
npm run test:coverage

# Lancer les tests en mode CI (pour l'intégration continue)
npm run test:ci
```

## Structure des Tests

### 📁 Organisation des Fichiers

```
src/
├── test/
│   ├── setup.ts              # Configuration globale Jest
│   ├── utils.tsx              # Utilitaires de test
│   └── __mocks__/
│       └── fileMock.js        # Mock des fichiers statiques
├── services/
│   └── __tests__/
│       └── EncounterService.enhanced.test.ts
├── components/
│   └── __tests__/
│       └── MonsterCard.test.tsx
└── hooks/
    └── __tests__/
        └── useEncounterState.test.ts
```

### 🎯 Types de Tests

#### Tests Unitaires
- **Localisation** : `src/**/*.test.ts` ou `src/**/__tests__/*.ts`
- **Objectif** : Tester les fonctions et méthodes individuelles
- **Exemple** : Tests de `EncounterService`

#### Tests de Composants
- **Localisation** : `src/components/__tests__/*.test.tsx`
- **Objectif** : Tester le rendu et l'interaction des composants React
- **Exemple** : Tests de `MonsterCard`

#### Tests d'Intégration
- **Localisation** : `src/**/*.integration.test.ts`
- **Objectif** : Tester l'interaction entre plusieurs modules
- **Exemple** : Flux complet d'une rencontre

## 🛠️ Utilitaires de Test

### Données Mock Disponibles

```typescript
import { 
  mockEncounterParticipant, 
  mockEncounter, 
  mockSessionStorage,
  mockFirebaseApi,
  mockMonsterApi 
} from '@/test/utils';

// Utilisation dans vos tests
const participant = mockEncounterParticipant;
const encounter = mockEncounter;
```

### Rendu de Composants

```typescript
import { render, screen } from '@/test/utils';
import { MonsterCard } from '../MonsterCard';

test('should render monster card', () => {
  render(<MonsterCard monster={mockMonster} />);
  expect(screen.getByText('Test Monster')).toBeInTheDocument();
});
```

## 📊 Couverture de Code

### Seuils Configurés

- **Branches** : 70%
- **Fonctions** : 70%
- **Lignes** : 70%
- **Statements** : 70%

### Générer un Rapport

```bash
npm run test:coverage
```

Le rapport sera généré dans le dossier `coverage/` avec :
- **HTML** : `coverage/lcov-report/index.html`
- **LCOV** : `coverage/lcov.info`
- **Console** : Affichage direct dans le terminal

## 🎯 Tests Existants

### ✅ EncounterService (Complet)

```bash
# Lancer uniquement les tests d'EncounterService
npm test EncounterService
```

**Fonctionnalités testées :**
- ✅ Gestion de l'initiative
- ✅ Gestion de la santé (PV)
- ✅ Gestion des conditions
- ✅ Mouvements et actions
- ✅ Calcul de difficulté
- ✅ Fonctions utilitaires
- ✅ Cas limites
- ✅ Tests d'intégration

### 🚧 MonsterCard (En cours)

```bash
# Lancer uniquement les tests de MonsterCard
npm test MonsterCard
```

**État :** Tests préparés mais désactivés en attendant les dépendances

### 📋 À Développer

- [ ] Tests pour `useEncounterState`
- [ ] Tests pour `EncounterCache`
- [ ] Tests pour `TreasureSystem`
- [ ] Tests E2E avec Playwright/Cypress

## 🔧 Configuration Jest

### Fichiers Clés

- **`jest.config.js`** : Configuration principale
- **`src/test/setup.ts`** : Setup global (mocks, etc.)
- **`tsconfig.json`** : Configuration TypeScript

### Mocks Configurés

- ✅ `window.matchMedia`
- ✅ `ResizeObserver`
- ✅ `IntersectionObserver`
- ✅ `sessionStorage` / `localStorage`
- ✅ `fetch`
- ✅ Fichiers statiques (images, CSS)

## 🚀 Bonnes Pratiques

### Nommage des Tests

```typescript
// ✅ Bon
describe('EncounterService', () => {
  describe('calculateInitiativeModifier', () => {
    test('should return correct modifier for dexterity 14', () => {
      // ...
    });
  });
});

// ❌ Éviter
test('test1', () => {
  // ...
});
```

### Structure des Tests

```typescript
describe('Component/Service Name', () => {
  // Setup/mocks
  const mockData = { /* ... */ };
  
  beforeEach(() => {
    // Réinitialisation avant chaque test
  });
  
  describe('specific functionality', () => {
    test('should do something specific', () => {
      // Arrange
      const input = mockData;
      
      // Act
      const result = someFunction(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Assertions Utiles

```typescript
// Vérifications de base
expect(value).toBe(expectedValue);
expect(value).toEqual(expectedObject);
expect(value).toBeTruthy();
expect(value).toBeFalsy();

// Vérifications de tableaux/objets
expect(array).toHaveLength(3);
expect(object).toHaveProperty('key');
expect(array).toContain('item');

// Vérifications de fonctions
expect(mockFunction).toHaveBeenCalled();
expect(mockFunction).toHaveBeenCalledWith('arg');

// Vérifications DOM (composants)
expect(screen.getByText('text')).toBeInTheDocument();
expect(screen.getByRole('button')).toBeEnabled();
```

## 🐛 Résolution de Problèmes

### Erreur : "Cannot find name 'describe'"

**Solution :** Installer `@types/jest`
```bash
npm install --save-dev @types/jest
```

### Erreur : "Cannot find module '@testing-library/react'"

**Solution :** Installer les dépendances de testing
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom
```

### Tests qui ne s'exécutent pas

**Vérifications :**
1. Les dépendances sont installées
2. Le fichier de configuration `jest.config.js` existe
3. Les tests sont dans les bons dossiers (`__tests__/` ou `*.test.ts`)

### Problèmes de Cache

```bash
# Nettoyer le cache Jest
npm test -- --clearCache

# Nettoyer le cache npm
npm cache clean --force
```

## 📈 Métriques et Monitoring

### Intégration Continue

Ajoutez à votre pipeline CI/CD :

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:ci

- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Surveillance de la Qualité

- **Couverture minimum** : 70% (configurable dans `jest.config.js`)
- **Tests obligatoires** : Fonctions critiques (EncounterService, etc.)
- **Revue de code** : Vérifier que les nouveaux composants ont des tests

---

**🎯 Objectif :** Maintenir une couverture de test élevée pour assurer la qualité et la stabilité de l'application D&D Story Weaver. 