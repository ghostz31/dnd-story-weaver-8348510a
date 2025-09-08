# 🏗️ Architecture de Trame - D&D Story Weaver

> Documentation technique complète de l'architecture système

## 📋 Vue d'ensemble

Trame est une application React/TypeScript moderne pour générer des rencontres D&D, avec focus sur la performance, l'UX mobile et la maintenabilité.

---

## 🏛️ Architecture Générale

### **Framework & Outils**
- **Frontend**: React 18 + TypeScript 5.5
- **Build**: Vite 5.4 (développement ultra-rapide)
- **Styling**: Tailwind CSS + ShadCN/UI + Radix UI
- **Routing**: React Router DOM 6.26
- **State**: Context API + TanStack React Query
- **Backend**: Firebase (Auth + Firestore)

### **Structure Modulaire**

```
src/
├── components/          # Composants React
│   ├── ui/             # Composants ShadCN/Radix
│   ├── auth/           # Composants d'authentification
│   ├── layout/         # Layout et navigation
│   └── ...             # Composants métier
├── lib/                # Utilitaires et logique métier
│   ├── api.ts          # Services API externes
│   ├── firebase.ts     # Configuration Firebase
│   ├── types.ts        # Types TypeScript
│   ├── schemas.ts      # Validation Zod
│   └── ...             # Services métier
├── hooks/              # React Hooks personnalisés
├── services/           # Services d'application
├── utils/              # Utilitaires transversaux
├── pages/              # Pages principales
├── auth/               # Context d'authentification
└── test/               # Utilitaires de test
```

---

## 🎯 Design Patterns

### **Architecture Reactive**

**Context + Hooks Pattern**
```tsx
// Auth Context avec TypeScript strict
export interface AuthContextProps {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
}

// Hook personnalisé pour la logique métier
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**Service Layer Pattern**
```tsx
// Séparation claire logique métier
export class EncounterService {
  calculateDifficulty(monsters: Monster[], party: Party): Difficulty {
    // Logique métier isolée
    const totalXP = this.calculateTotalXP(monsters);
    const partyXP = this.calculatePartyXP(party);
    return this.getDifficultyLevel(totalXP, partyXP);
  }
}
```

### **Component Architecture**

**Compound Components**
```tsx
// Composant composé avec API flexible
const EncounterBuilder = {
  Root: ({children}) => <div>{children}</div>,
  MonsterSection: ({monsters, onAdd}) => { /* logique */ },
  PartySection: ({party, onUpdate}) => { /* logique */ }
};

// Utilisation
<EncounterBuilder.Root>
  <EncounterBuilder.MonsterSection monsters={monsters} onAdd={addMonster} />
  <EncounterBuilder.PartySection party={party} onUpdate={updateParty} />
</EncounterBuilder.Root>
```

**Render Props Pattern**
```tsx
// Composants configurables
const ConditionSelector = ({ children, conditions, onSelect }) => {
  return children({
    conditions: conditions,
    onConditionSelect: onSelect,
    isConditionActive: (condition) => conditions.includes(condition)
  });
};
```

---

## 🔄 Gestion d'État

### **State Hierarchy**

```
App Level (Context)
├── Auth Context          # Gestion authentification
├── Theme Context         # Gestion thème
└── Query Client          # Gestion requêtes API

Component Level (useState/useReducer)
├── Encounter State       # État rencontre courante
├── Tracker State         # État combat tracker
└── Form State            # États formulaires

Local Component State
├── UI States            # Modal ouvert/fermée
├── Loading States       # États chargement
└── Error States         # États erreur
```

### **State Management Patterns**

**useReducer pour États Complexes**
```tsx
const [encounterState, dispatch] = useReducer(encounterReducer, initialState);

// Actions typées
type EncounterAction =
  | { type: 'ADD_MONSTER'; payload: Monster }
  | { type: 'REMOVE_MONSTER'; payload: string }
  | { type: 'UPDATE_DIFFICULTY'; payload: Difficulty };

// Dispatch sécurisé
const addMonster = (monster: Monster) => {
  dispatch({ type: 'ADD_MONSTER', payload: monster });
};
```

**Optimistic Updates with React Query**
```tsx
const updateEncounter = useMutation({
  mutationFn: async (encounter: Encounter) => {
    return await api.updateEncounter(encounter.id, encounter);
  },
  // Optimistic update
  onMutate: async (updatedEncounter) => {
    await queryClient.cancelQueries(['encounters', updatedEncounter.id]);

    const previousEncounter = queryClient.getQueryData(['encounters', updatedEncounter.id]);
    queryClient.setQueryData(['encounters', updatedEncounter.id], updatedEncounter);

    return { previousEncounter };
  },
  // Rollback on error
  onError: (err, updatedEncounter, context) => {
    queryClient.setQueryData(['encounters', updatedEncounter.id], context?.previousEncounter);
  }
});
```

---

## 💾 Gestion des Données

### **Caching Strategy**

**Multi-Layer Cache**
```tsx
export class EncounterCache {
  private memoryCache: Map<string, CacheEntry>;
  private localStorage: Storage;
  private ttl: number;

  // Cache mémoire (rapide, volatile)
  getFromMemory(key: string): any {
    const entry = this.memoryCache.get(key);
    if (!entry || this.isExpired(entry)) return null;
    return entry.data;
  }

  // Cache persistence (persistant, plus lent)
  getFromStorage(key: string): any {
    const stored = this.localStorage.getItem(key);
    if (!stored) return null;
    return JSON.parse(stored);
  }

  // API call + mise en cache
  async fetchWithCache<T>(url: string, ttl: number = 300000): Promise<T> {
    const data = this.getFromMemory(url) || this.getFromStorage(url);
    if (data) return data;

    const response = await fetch(url);
    const result = await response.json();

    this.set(url, result, ttl);
    return result;
  }
}
```

**Decorative Caching**
```tsx
// Décorateur pour mise en cache automatique
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const cache = new EncounterCache();
      const key = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

      let result = encounterCache.get(key);
      if (!result) {
        result = method.apply(this, args);
        encounterCache.set(key, result, ttl);
      }

      return result;
    };
  };
}

export class DifficultyCalculator {
  @cached(300000) // 5 minutes cache
  calculateDifficulty(monsters: Monster[], party: Party): Difficulty {
    // Calculs coûteux mis en cache automatiquement
    return this.computeExpensiveOperation(monsters, party);
  }
}
```

---

## 🚀 Optimisations Performance

### **Loading Strategies**

**Code Splitting par Route**
```tsx
// Lazy loading intelligent
const EncounterTracker = lazy(() =>
  import('./components/EncounterTracker').then(module => ({
    default: module.EncounterTracker
  }))
);

// Chargement conditionnel
const HeavyComponent = lazy(() =>
  isMobile ? import('./MobileComponent') : import('./DesktopComponent')
);

// Loading avec fallback personnalisé
<Suspense fallback={<LoadingSpinner />}>
  <Route path="/encounter" component={EncounterTracker} />
</Suspense>
```

**Bundle Splitting Granulaire**
```tsx
// vendor.js - dépendances externes
// ui.js - composants UI partagés
// features.js - fonctionnalités métier
// admin.js - pages admin
// polyfills.js - compatibilités navigateurs

export const bundleConfig = {
  'ui-vendor': ['react', 'react-dom', '@radix-ui/*'],
  'features': ['firebase', 'zod', 'date-fns'],
  'admin': ['recharts', 'xlsx'],
  'polyfills': ['core-js', 'regenerator-runtime']
};
```

### **Virtualization & Memoization**

**Composant Virtualisé pour Listes Longues**
```tsx
import { FixedSizeList as List } from 'react-window';

// Liste de 1000 monstres virtualisée
const MonsterList = ({ monsters, height, itemHeight }) =>
  <List
    height={height}
    itemCount={monsters.length}
    itemSize={itemHeight}
    itemData={monsters}
  >
    {MonsterRow}
  </List>;

// Champ de rendu pour chaque élément
const MonsterRow = memo(({ index, style, data: monsters }) => (
  <div style={style}>
    <MonsterCard monster={monsters[index]} />
  </div>
));
```

**Memoization Intelligente**
```tsx
// Memoization des calculs coûteux
const difficultyMemo = useMemo(() => {
  return calculateEncounterDifficulty(monsters, party);
}, [monsters, party, encounterCache]);

// Memoization conditionnelle
const monsterCards = useMemo(() => {
  return monsters.map(monster => (
    <MonsterCard key={monster.id} monster={monster} />
  ));
}, [monsters.length]); // Sélectivité optimisée
```

---

## 🔧 Hooks Personnalisés

### **Core Hooks**

**useMobile - Responsive Design**
```tsx
export const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobileQuery = window.matchMedia('(max-width: 768px)');
      setIsMobile(mobileQuery.matches);
    };

    // Écouteur optimisé
    window.addEventListener('resize', debounce(checkMobile, 250));
    checkMobile();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};
```

**useEncounterState - Gestion Complexe**
```tsx
export const useEncounterState = (initialEncounter?: Encounter) => {
  const [state, dispatch] = useReducer(encounterReducer, initialEncounter);

  // Actions dispatchées
  const addMonster = useCallback((monster: Monster) => {
    dispatch({ type: 'ADD_MONSTER', payload: monster });
  }, []);

  const updateMonster = useCallback((id: string, updates: Partial<Monster>) => {
    dispatch({ type: 'UPDATE_MONSTER', payload: { id, updates } });
  }, []);

  // Effets secondaires
  useEffect(() => {
    saveEncounterToLocalStorage(state);
  }, [state]);

  return {
    encounter: state,
    actions: { addMonster, updateMonster, removeMonster, updateParty },
    computed: { difficulty, totalXP }
  };
};
```

### **Utility Hooks**

**useAsync - Gestion Async/Await**
```tsx
export const useAsync = (asyncFn: () => Promise<any>, immediate = true) => {
  const [state, setState] = useState({
    loading: false,
    value: null,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ loading: true, value: null, error: null });

    try {
      const response = await asyncFn();
      setState({ loading: false, value: response, error: null });
      return response;
    } catch (error) {
      setState({ loading: false, value: null, error });
      throw error;
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) execute();
  }, [execute, immediate]);

  return { ...state, execute };
};
```

---

## 📊 Monitoring & Performance

### **Performance Monitoring**

**Bundle Size Tracking**
```tsx
export const performanceMonitor = {
  recordBundleSize() {
    if ('performance' in window) {
      const resources = performance.getEntriesByType('resource');

      resources.forEach(resource => {
        if (resource.name.includes('.js')) {
          this.metrics.bundleSizes[resource.name] = resource.transferSize;
        }
      });
    }
  },

  measureRender(componentName: string) {
    const startMark = `${componentName}-start`;
    const endMark = `${componentName}-end`;

    performance.mark(startMark);

    return {
      end() {
        performance.mark(endMark);
        performance.measure(componentName, startMark, endMark);

        const measure = performance.getEntriesByName(componentName)[0];
        return measure.duration;
      }
    };
  }
};
```

**Error Boundary System**
```tsx
// Error boundary multiple niveaux
export class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    errorTracker.reportError(error, {
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

---

## 🔄 Métriques et Analytics

### **System Metrics**

```tsx
export const metricsCollector = {
  user: {
    sessionStart: Date.now(),
    deviceType: 'desktop|mobile|tablet',
    browserName: 'chrome|firefox|safari',
    screenResolution: '1920x1080'
  },

  performance: {
    bundleSizes: {},      // Taille des bundles
    renderTimes: [],      // Temps de rendu moyen
    apiCallTimes: [],     // Latences API
    cacheHitRates: []     // Taux succès cache
  },

  usage: {
    featuresUsed: [],     // Fonctionnalités utilisées
    encounterCounts: {},  // Statistiques rencontres
    errorCounts: {}       // Compteurs erreurs
  },

  exportToJSON() {
    return JSON.stringify(this, null, 2);
  }
};
```

---

## 🔐 Sécurité

### **Authentication Flow**

```tsx
export const securityConfig = {
  // Firebase Auth avec mesures de sécurité
  auth: {
    signOutOnInactivity: 30 * 60 * 1000, // 30 minutes
    maxFailedAttempts: 5,
    lockoutDuration: 15 * 60 * 1000,    // 15 minutes
    requireHttps: true
  },

  // Headers security pour les API calls
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000',
    'X-Frame-Options': 'DENY',
    'Content-Security-Policy': "..."
  },

  // Sanitization pour les inputs utilisateur
  sanitizeInput(input: string): string {
    return DOMPurify.sanitize(input, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong'],
      ALLOWED_ATTR: []
    });
  }
};
```

---

## 🧪 Tests & Qualité

### **Testing Strategy**

```tsx
// Configuration Jest complète
export const jestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{ts,tsx}',
    '!src/**/__generated__/**'
  ],
  coverageTarget: 80,
  coverageDirectory: '.coverage'
};
```

**Test Examples**
```tsx
// Test Hook personnalisé
describe('useMobile', () => {
  it('should return true on mobile viewport', () => {
    // Setup mobile viewport
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: query === '(max-width: 768px)',
        addListener: jest.fn(),
        removeListener: jest.fn()
      }))
    });

    const { result } = renderHook(() => useMobile());
    expect(result.current).toBe(true);
  });
});

// Test Cache System
describe('EncounterCache', () => {
  let cache: EncounterCache;

  beforeEach(() => {
    cache = new EncounterCache();
  });

  it('should store and retrieve values', () => {
    cache.set('test', 'value', 5000);
    expect(cache.get('test')).toBe('value');
  });

  it('should expire values after TTL', async () => {
    cache.set('test', 'value', 100);
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cache.get('test')).toBeNull();
  });
});
```

---

## 🚀 Déploiement & CD/CI

### **Build Process**

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:ci

      - name: Build application
        run: npm run build

      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: https://trame-app.com
          configPath: .lighthouserc.json
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### **Environment Configurations**

**Development**
```env
# .env.development
VITE_API_BASE_URL=https://dev-api.trame-app.com
VITE_FIREBASE_PROJECT_ID=trame-dev
VITE_ENVIRONMENT=development
VITE_DEBUG=true
```

**Production**
```env
# .env.production
VITE_API_BASE_URL=https://api.trame-app.com
VITE_FIREBASE_PROJECT_ID=trame-prod
VITE_ENVIRONMENT=production
VITE_DEBUG=false
```

---

Cette architecture évolutive assure la scalabilité et maintenabilité de l'application sur le long terme, tout en offrant une expérience utilisateur optimale sur tous les appareils.
