# 🤝 Guidelines de Contribution - Trame D&D Story Weaver

> Guide complet pour contribuer au développement de Trame

## 📋 Table des Matières

- [Avant de commencer](#avant-de-commencer)
- [Configuration de développement](#configuration-de-développement)
- [Workflow de développement](#workflow-de-développement)
- [Standards de code](#standards-de-code)
- [Testing](#testing)
- [Architecture & Design Patterns](#architecture--design-patterns)
- [Performance & Optimisations](#performance--optimisations)
- [Sécurité](#sécurité)
- [Documentation](#documentation)
- [Revue de code](#revue-de-code)
- [Release Process](#release-process)

---

## 🚀 Avant de Commencer

### **Prérequis Obligatoires**
- **Node.js 18+** avec **npm 8+**
- **Git** pour la gestion de version
- **VSCode** avec les extensions recommandées
- **Firebase Console** accès (pour développement)

### **Installation et Setup**
```bash
# Cloner le repository
git clone https://github.com/ghostz31/Trame.git
cd Trame

# Installer les dépendances
npm install

# Configurer les variables d'environnement
cp .env.example .env.development
# Éditer .env.development avec vos clés Firebase

# Démarrer en développement
npm run dev
```

### **Extensions VSCode Recommandées**
```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
```

---

## 🔧 Configuration de Développement

### **Structure du Projet**

```
📁 .vscode/
├── settings.json          # Configuration VSCode
├── extensions.json        # Extensions recommandées
└── launch.json           # Configuration debugging

📁 scripts/
├── develop.sh            # Script développement
├── test.sh               # Script tests
└── deploy.sh             # Script déploiement

📁 .github/
├── workflows/            # CI/CD pipelines
├── ISSUE_TEMPLATE/       # Templates issues
└── PULL_REQUEST_TEMPLATE/ # Templates PR
```

### **Variables d'Environnement**
```bash
# .env.development
VITE_FIREBASE_API_KEY=dev_key_from_firebase
VITE_FIREBASE_PROJECT_ID=trame-dev
VITE_ENVIRONMENT=development
VITE_DEBUG=true
VITE_ANALYTICS_DEBUG=true

# .env.test (pour les tests)
VITE_FIREBASE_PROJECT_ID=trame-test
VITE_ENVIRONMENT=test
VITE_DEBUG=false
```

---

## 🔄 Workflow de Développement

### **Git Flow simplifié**

```bash
# Créer une branche feature
git checkout -b feature/description-precise

# Commits atomiques et descriptifs
git commit -m "✨ Add new monster card component with responsive design"
git commit -m "🔧 Optimize encounter calculation performance"
git commit -m "🐛 Fix condition selector keyboard navigation"

# Push de la branche
git push origin feature/description-precise

# Créer Pull Request sur GitHub
```

### **Types de Commits**

| Type | Emoji | Description |
|------|-------|-------------|
| `✨` | `:sparkles:` | Nouvelle fonctionnalité |
| `🐛` | `:bug:` | Correction de bug |
| `🔧` | `:wrench:` | Configuration/Outils |
| `📝` | `:memo:` | Documentation |
| `🎨` | `:art:` | Amélioration UI/UX |
| `⚡` | `:zap:` | Performance |
| `🔒` | `:lock:` | Sécurité |
| `🔥` | `:fire:` | Suppression de code |
| `✅` | `:white_check_mark:` | Tests |
| `🚀` | `:rocket:` | Déploiement |

### **Convention de Nommage des Branches**
```
feature/add-encounter-builder      # Nouvelle fonctionnalité
fix/mobile-condition-selector     # Correction mobile
refactor/encounter-state-management # Refactorisation
docs/add-api-documentation       # Documentation
test/add-encounter-integration-tests # Tests
```

---

## 📏 Standards de Code

### **TypeScript Standards**

**Types Obligatoires**
```typescript
// ✅ Bon : interface explicite
interface EncounterProps {
  readonly encounter: Encounter;
  readonly onSave: (encounter: Encounter) => Promise<void>;
  readonly onCancel?: () => void;
  readonly showValidation?: boolean;
}

// ✅ Bon : union type pour options limitées
type Difficulty = 'easy' | 'medium' | 'hard' | 'deadly';

// ❌ Mauvais : any ou unknown utilisé à tort
interface Props {
  onClick: any; // Non ! Utiliser des types spécifiques
  data?: unknown; // Non ! Créer une interface
}
```

**Types Utilitaires**
```typescript
// Types communs réutilisables
type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
type RequireAtLeastOne<T, Keys extends keyof T> = Pick<T, Keys> & Partial<T>;
type DeepReadonly<T> = { readonly [P in keyof T]: DeepReadonly<T[P]> };

// Exemple d'usage
type FlexibleEncounter = Optional<Encounter, 'description' | 'notes'>;
type EncounterWithParty = RequireAtLeastOne<Encounter, 'party' | 'partyLevel'>;
```

### **React Best Practices**

**Composants Fonctionnels Modernes**
```tsx
// ✅ Bon : composant avec hooks
import React, { useState, useCallback, useMemo } from 'react';

const EncounterBuilder: React.FC<EncounterBuilderProps> = ({
  initialEncounter,
  onSave,
  onCancel
}) => {
  // États typés correctement
  const [encounter, setEncounter] = useState<Encounter>(
    initialEncounter || createEmptyEncounter()
  );

  // Callbacks mémorisés
  const handleSave = useCallback(async () => {
    if (!encounter.name.trim()) return;
    await onSave(encounter);
  }, [encounter, onSave]);

  // Calculs mémorisés
  const difficulty = useMemo(
    () => calculateDifficulty(encounter.monsters, encounter.party),
    [encounter.monsters, encounter.party]
  );

  return (
    <div className="encounter-builder">
      {/* JSX optimisé */}
    </div>
  );
};

export default React.memo(EncounterBuilder);
```

**Gestion d'État Performante**
```tsx
// ✅ Bon : reducer pattern pour état complexe
interface EncounterState {
  encounter: Encounter;
  validation: ValidationResult;
  isSaving: boolean;
  error: string | null;
}

type EncounterAction =
  | { type: 'ADD_MONSTER'; payload: Monster }
  | { type: 'UPDATE_PARTY'; payload: Party }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'START_SAVING' }
  | { type: 'SAVE_SUCCESS' };

const encounterReducer = (
  state: EncounterState,
  action: EncounterAction
): EncounterState => {
  switch (action.type) {
    case 'ADD_MONSTER':
      return {
        ...state,
        encounter: {
          ...state.encounter,
          monsters: [...state.encounter.monsters, action.payload]
        }
      };
    // autres cases...
    default:
      return state;
  }
};
```

### **CSS & Styling Standards**

**Tailwind CSS Organized**
```tsx
// ✅ Bon : classes organisées logiquement
<button
  className={cn(
    // Base functionality
    "inline-flex items-center justify-center",
    "rounded-md text-sm font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2",
    "disabled:pointer-events-none disabled:opacity-50",

    // Variants
    variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
    variant === "outline" && "border border-input bg-background hover:bg-accent",

    // Sizes
    size === "sm" && "h-9 px-3",
    size === "md" && "h-10 px-4 py-2",

    // Custom modifiers
    className
  )}
  {...props}
/>

// ✅ Bon : utilisation de la fonction cn() pour merging
import { cn } from '@/lib/utils';
```

**Theme & Design System**
```typescript
// tokens.ts - Design tokens centralisés
export const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    gray: {
      50: '#f9fafb',
      900: '#111827'
    }
  },
  spacing: {
    1: '0.25rem',
    2: '0.5rem',
    4: '1rem',
    8: '2rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem'
  }
} as const;
```

---

## 🧪 Testing

### **Stratégie de Test**

**Coverage Objectif:** 80% minimum

```json
{
  "jest": {
    "collectCoverageFrom": [
      "src/**/*.{ts,tsx}",
      "!src/**/*.d.ts",
      "!src/**/*.stories.{ts,tsx}"
    ],
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

### **Tests Unitaires (Jest + Testing Library)**

**Tests de Composants**
```tsx
// MonsterCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MonsterCard } from './MonsterCard';

const mockMonster: Monster = {
  id: 'dragon-adulte',
  name: 'Dragon adulte',
  cr: 15,
  xp: 13000,
  type: 'Dragon',
  size: 'TG'
};

describe('MonsterCard', () => {
  it('renders monster information correctly', () => {
    render(<MonsterCard monster={mockMonster} />);

    expect(screen.getByText('Dragon adulte')).toBeInTheDocument();
    expect(screen.getByText('CR 15')).toBeInTheDocument();
    expect(screen.getByText('13 000 PX')).toBeInTheDocument();
  });

  it('calls onSelect when clicked', async () => {
    const mockOnSelect = jest.fn();
    const user = userEvent.setup();

    render(<MonsterCard monster={mockMonster} onSelect={mockOnSelect} />);

    await user.click(screen.getByRole('button', { name: /dragon adulte/i }));

    expect(mockOnSelect).toHaveBeenCalledWith(mockMonster);
  });

  it('handles keyboard navigation', async () => {
    const mockOnSelect = jest.fn();
    render(
      <MonsterCard
        monster={mockMonster}
        onSelect={mockOnSelect}
        role="option"
      />
    );

    const card = screen.getByRole('option');
    card.focus();

    expect(card).toHaveFocus();

    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith(mockMonster);
  });
});
```

**Tests de Hooks Personnalisés**
```tsx
// useEncounterState.test.ts
import { renderHook, act } from '@testing-library/react';
import { useEncounterState } from './useEncounterState';

const mockInitialEncounter: Encounter = {
  id: 'test-encounter',
  name: 'Test Encounter',
  monsters: [],
  party: [],
  difficulty: 'easy'
};

describe('useEncounterState', () => {
  it('initializes with provided encounter', () => {
    const { result } = renderHook(() =>
      useEncounterState(mockInitialEncounter)
    );

    expect(result.current.encounter).toEqual(mockInitialEncounter);
  });

  it('adds monster correctly', () => {
    const { result } = renderHook(() =>
      useEncounterState(mockInitialEncounter)
    );

    const mockMonster: Monster = {
      id: 'goblin',
      name: 'Goblin',
      cr: 0.25,
      xp: 50,
      type: 'Humanoïde',
      size: 'P'
    };

    act(() => {
      result.current.actions.addMonster(mockMonster);
    });

    expect(result.current.encounter.monsters).toContain(mockMonster);
  });

  it('validates encounter data', () => {
    const { result } = renderHook(() =>
      useEncounterState(mockInitialEncounter)
    );

    // Should be valid initially
    expect(result.current.validation.isValid).toBe(true);

    // Add monsters without party
    act(() => {
      result.current.actions.addMonster(mockMonster);
    });

    // Should now show validation error
    expect(result.current.validation.errors.party).toBeDefined();
  });
});
```

**Tests d'API et Services**
```tsx
// EncounterService.test.ts
import { EncounterService } from './EncounterService';
import { mockMonsters, mockParty } from '../test/mocks';

describe('EncounterService', () => {
  describe('calculateDifficulty', () => {
    it('calculates easy difficulty correctly', () => {
      const result = EncounterService.calculateDifficulty(
        mockMonsters.easy,
        mockParty.level1
      );

      expect(result).toBe('easy');
    });

    it('handles large parties correctly', () => {
      const largeParty = {
        ...mockParty.level1,
        players: Array(8).fill(mockParty.level1.players[0])
      };

      const result = EncounterService.calculateDifficulty(
        mockMonsters.medium,
        largeParty
      );

      expect(result).toBe('easy'); // Party size increases threshold
    });

    it('throws on invalid input', () => {
      expect(() => {
        EncounterService.calculateDifficulty([], mockParty.level1);
      }).toThrow('Encounter must have at least one monster');
    });
  });
});
```

### **Tests d'Intégration** (avec MSW)

```typescript
// MonsterBrowser.integration.test.tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { render, screen, waitFor } from '@testing-library/react';
import { MonsterBrowser } from './MonsterBrowser';

const server = setupServer(
  rest.get('/api/monsters', (req, res, ctx) => {
    return res(ctx.json([
      { id: 'dragon', name: 'Dragon', cr: 15 },
      { id: 'goblin', name: 'Goblin', cr: 0.25 }
    ]));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('MonsterBrowser Integration', () => {
  it('loads and displays monsters from API', async () => {
    render(<MonsterBrowser />);

    // Loading state
    expect(screen.getByText('Chargement...')).toBeInTheDocument();

    // Wait for monsters to load
    await waitFor(() => {
      expect(screen.getByText('Dragon')).toBeInTheDocument();
      expect(screen.getByText('Goblin')).toBeInTheDocument();
    });

    // Verify CR display
    expect(screen.getByText('CR 15')).toBeInTheDocument();
    expect(screen.getByText('CR 0.25')).toBeInTheDocument();
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('/api/monsters', (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({ error: 'Server error' }));
      })
    );

    render(<MonsterBrowser />);

    await waitFor(() => {
      expect(screen.getByText('Erreur de chargement')).toBeInTheDocument();
    });
  });
});
```

### **Tests E2E (Playwright)**

```typescript
// encounter-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Encounter Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login if needed
    await page.goto('/auth');
    await page.fill('[placeholder="Email"]', process.env.TEST_USER_EMAIL);
    await page.fill('[placeholder="Mot de passe"]', process.env.TEST_USER_PASSWORD);
    await page.click('[type="submit"]');
    await page.waitForURL('/**');
  });

  test('creates a complete encounter', async ({ page }) => {
    // Navigate to encounter builder
    await page.goto('/encounters');

    // Add party
    await page.click('text="Ajouter un groupe"');
    await page.fill('[placeholder="Nom du groupe"]', 'Test Party');
    await page.click('text="Ajouter"');

    // Add monsters
    await page.click('text="Générer automatiquement"');
    await page.selectOption('select[aria-label="Difficulté"]', 'medium');
    await page.click('text="Générer"');

    // Verify encounter is created
    await expect(page.locator('text="Rencontre créée"')).toBeVisible();

    // Start tracker
    await page.click('text="Lancer le combat"');
    await expect(page).toHaveURL(/encounter-tracker/);
  });

  test('tracker works correctly', async ({ page }) => {
    // Assume encounter tracker page
    await page.goto('/encounter-tracker/test-encounter');

    // Check initiative
    await page.click('text="Lancer l\'initiative"');
    await expect(page.locator('.initiative-roll')).toBeVisible();

    // Add condition
    await page.click('text="Conditions"');
    await page.click('text="Étourdi"');
    await expect(page.locator('text="Étourdi"')).toBeVisible();

    // Deal damage
    await page.fill('[placeholder="Dégâts"]', '25');
    await page.click('text="Appliquer"');
    await expect(page.locator('text="-25 PV"')).toBeVisible();
  });

  test('mobile experience', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test requires mobile viewport');

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/encounter-tracker/test-encounter');

    // Verify mobile optimizations
    await expect(page.locator('.mobile-header')).toBeVisible();
    await expect(page.locator('.hamburger-menu')).toBeVisible();
  });
});
```

---

## 🏗️ Architecture & Design Patterns

### **Service Layer Pattern**

```typescript
// Service interface
interface EncounterCalculationService {
  calculateDifficulty(monsters: Monster[], party: Party): Difficulty;
  validateEncounter(encounter: Encounter): ValidationResult;
  generateBalancedEncounter(options: GeneratorOptions): Encounter;
}

// Implementation
export class EncounterService implements EncounterCalculationService {
  constructor(
    private monsterRepository: MonsterRepository,
    private partyRepository: PartyRepository,
    private rulesEngine: RulesEngine
  ) {}

  calculateDifficulty(monsters: Monster[], party: Party): Difficulty {
    // Implementation with dependency injection
  }
}
```

### **Repository Pattern**

```typescript
// Repository interface
interface MonsterRepository {
  findById(id: string): Promise<Monster | null>;
  findByCriteria(criteria: SearchCriteria): Promise<Monster[]>;
  save(monster: Monster): Promise<string>;
  update(id: string, monster: Partial<Monster>): Promise<void>;
  delete(id: string): Promise<void>;
}

// Firebase implementation
export class FirebaseMonsterRepository implements MonsterRepository {
  constructor(private db: Firestore) {}

  async findById(id: string): Promise<Monster | null> {
    const doc = await getDoc(doc(this.db, 'monsters', id));
    return doc.exists() ? mapDocToMonster(doc) : null;
  }
}
```

### **Observer Pattern pour Events**

```typescript
// Event bus system
type EncounterEvent =
  | { type: 'ENCOUNTER_CREATED'; payload: { encounter: Encounter } }
  | { type: 'MONSTER_ADDED'; payload: { monster: Monster; encounterId: string } }
  | { type: 'TURN_CHANGED'; payload: { previousTurn: number; newTurn: number } }
  | { type: 'COMBAT_STARTED'; payload: { participants: EncounterParticipant[] } };

export class EncounterEventBus {
  private listeners = new Map<EncounterEvent['type'], EncounterEventHandler[]>();

  on<T extends EncounterEvent['type']>(
    event: T,
    handler: (payload: Extract<EncounterEvent, { type: T }>['payload']) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler as any);
  }

  emit(event: EncounterEvent): void {
    const handlers = this.listeners.get(event.type);
    handlers?.forEach(handler => handler(event.payload));
  }

  off<T extends EncounterEvent['type']>(
    event: T,
    handler: (payload: Extract<EncounterEvent, { type: T }>['payload']) => void
  ): void {
    const handlers = this.listeners.get(event.type);
    if (handlers) {
      const index = handlers.indexOf(handler as any);
      if (index > -1) handlers.splice(index, 1);
    }
  }
}
```

---

## ⚡ Performance & Optimisations

### **Bundle Splitting Strategy**

**Dynamic imports stratéges**
```typescript
// Route-based splitting
const EncounterTracker = lazy(() =>
  import('./components/EncounterTracker').then(module => ({
    default: module.EncounterTracker
  }))
);

// Feature-based splitting
const TreasureGenerator = lazy(() =>
  import('./components/TreasureGenerator').then(module => ({
    default: module.TreasureGenerator
  }))
);

// Component polymorphism
import HeavyComponents from './heavy-components';

<Suspense fallback={<Skeleton />}>
  <HeavyComponents.MonsterBrowser searchQuery={search} />
</Suspense>
```

### **Memoization Patterns**

```typescript
// Components
const MonsterCard = memo<MonsterCardProps>(({ monster, showStats, onSelect }) => {
  return (
    <div className="monster-card" onClick={() => onSelect?.(monster)}>
      {/* Content */}
    </div>
  );
});

// Callbacks
const handleMonsterSelect = useCallback(
  (monster: Monster) => {
    setSelectedMonster(monster);
  },
  [] // Stable reference
);

// Memoized calculations
const monsterStats = useMemo(
  () => calculateMonsterStats(monster, environment, difficulty),
  [monster, environment, difficulty]
);

// Custom hook for complex memoization
const useOptimizedEncounter = (encounter: Encounter) => {
  const cache = useEncounterCache();

  return useMemo(() => ({
    totalXP: cache.getOrCalculate('totalXP', () =>
      EncounterService.calculateTotalXP(encounter.monsters)
    ),
    difficulty: cache.getOrCalculate('difficulty', () =>
      EncounterService.calculateDifficulty(encounter.monsters, encounter.party)
    ),
    balancedMonsterCount: encounter.monsters.length > 8 ? 'too-many' :
                          encounter.monsters.length < 2 ? 'too-few' : 'balanced'
  }), [encounter, cache]);
};
```

### **Virtual Scrolling**

```tsx
// Custom hook pour virtualization
const useVirtualScrolling = <T,>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length - 1
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    onScroll: (scrollTop: number) => setScrollTop(scrollTop)
  };
};
```

---

## 🔒 Sécurité

### **Input Validation**

**Zod Schema utilisé**
```typescript
// Security-first validation
export const secureEncounterSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom requis')
    .max(100, 'Nom trop long')
    .regex(/^[a-zA-Z0-9À-ÿ\s\-_\.]+$/, 'Caractères non autorisés'),

  monsters: z
    .array(monsterSchema)
    .min(1, 'Au moins un monstre requis')
    .max(20, 'Trop de monstres'),

  party: z.object({
    level: z
      .number()
      .min(1, 'Niveau invalide')
      .max(20, 'Niveau trop élevé'),

    players: z
      .array(playerSchema)
      .min(1, 'Au moins un joueur requis')
      .max(8, 'Trop de joueurs'),
  })
});

// Sanitization before validation
export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
    ALLOWED_ATTR: []
  });
};
```

### **API Security**

```typescript
// API client avec sécurité
export const secureApiClient = {
  get: async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
    const token = await getValidToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json',
      ...options?.headers
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new ApiError(`Request failed: ${response.statusText}`, response.status);
    }

    return response.json();
  },

  post: async <T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T> => {
    // Same pattern with additional body validation
  }
};
```

### **Rate Limiting & Abuse Prevention**

```typescript
// Rate limiter pour API calls
export class ApiRateLimiter {
  private attempts = new Map<string, number[]>();

  constructor(
    private maxAttempts: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  canMakeRequest(userId: string): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(userId) || [];

    // Clean old attempts
    const recentAttempts = userAttempts.filter(
      time => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.attempts.set(userId, recentAttempts);
    return true;
  }

  getRemainingRequests(userId: string): number {
    const userAttempts = this.attempts.get(userId) || [];
    return Math.max(0, this.maxAttempts - userAttempts.length);
  }
}
```

---

## 📖 Documentation

### **JSDoc Standards**

```typescript
/**
 * Calculates the encounter difficulty based on D&D 5e rules
 * @param monsters - Array of monsters in the encounter
 * @param party - Party information including levels and player count
 * @param options - Optional calculation parameters
 * @returns The calculated difficulty level
 * @throws {ValidationError} When input validation fails
 * @example
 * ```typescript
 * const difficulty = calculateDifficulty([
 *   { name: 'Dragon', cr: 15 },
 *   { name: 'Goblin', cr: 0.25 }
 * ], {
 *   players: 4,
 *   level: 8
 * });
 * // Returns: 'hard'
 * ```
 */
export function calculateDifficulty(
  monsters: Monster[],
  party: Party,
  options?: DifficultyOptions
): Difficulty {
  // Implementation
}
```

### **README Standards**

Chaque composant et service doit avoir un README suivant ce format:

```markdown
# MonsterCard Component

A React component for displaying monster information in D&D encounters.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `monster` | `Monster` | Yes | - | Monster data to display |
| `variant` | `'default' \| 'compact' \| 'detailed'` | No | `'default'` | Display variant |
| `showStats` | `boolean` | No | `true` | Show monster stats |
| `onSelect` | `(monster: Monster) => void` | No | - | Callback when selected |

## Usage

```tsx
import { MonsterCard } from './MonsterCard';

<MonsterCard
  monster={goblinMonster}
  variant="detailed"
  showStats={true}
  onSelect={handleMonsterSelect}
/>
```

## States

- **Loading**: Show skeleton while loading monster data
- **Error**: Show error boundary for failed loads
- **Empty**: Handle missing monster data gracefully

## Accessibility

- Keyboard navigation with Tab/Enter
- Screen reader support with ARIA labels
- Focus management for modal interactions
```

---

Cette contribution guide assure la qualité et la cohérence du développement de l'application Trame, en promouvant les meilleures pratiques et un workflow structuré pour tous les contributeurs.
