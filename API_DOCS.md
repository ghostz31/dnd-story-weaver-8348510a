# 📚 API Documentation - Trame D&D Story Weaver

> Documentation complète des services, utilitaires et APIs internes

## 📋 Table des Matières

- [Architecture API](#architecture-api)
- [Services Métier](#services-metier)
- [Utilitaires](#utilitaires)
- [Gestion d'État](#gestion-détat)
- [Cache System](#cache-system)
- [Hooks API](#hooks-api)
- [Firebase Integration](#firebase-integration)
- [Error Handling](#error-handling)

---

## 🏛️ Architecture API

### **Structure Principale**

L'application suit un pattern service layer avec séparation claire des responsabilités :

```
📁 Services Layer
├── Core Services        # Logique métier principale
├── Utility Services     # Services transversaux
├── API Services         # Communication externes
└── Cache Services       # Gestion cache

📁 State Management
├── Context Providers    # Contexts React
├── Hooks personnalisés  # Logique composants
└── Reducers            # Gestion état complexe

📁 Utilities
├── Type guards         # Validation TypeScript
├── Data transformers   # Transformation données
└── Helper functions    # Fonctions utilitaires
```

---

## 🎯 Services Métier

### **EncounterService - Service des Rencontres**

```typescript
export class EncounterService {
  // Calcul de difficulté selon D&D 5e
  static calculateDifficulty(
    monsters: Monster[],
    party: Party,
    options?: DifficultyOptions
  ): Difficulty {
    const totalXP = this.calculateTotalXP(monsters);
    const partyXP = this.calculatePartyXP(party);
    const multiplier = this.getEncounterMultiplier(monsters.length, party.length);

    // Application multiplicateur groupes et calcul niveau final
    return this.getDifficultyLevel(totalXP * multiplier, partyXP);
  }

  // Génération rencontre automatique
  static generateEncounters(
    partyLevel: number,
    difficulty: 'easy' | 'medium' | 'hard' | 'deadly',
    environment?: string,
    environmentFilters?: EnvironmentFilters
  ): Encouter[] {
    // Algorithme génération basé sur budget XP et contraintes
  }

  // Calcul XP ajusté pour groupes
  static calculateTotalXP(monsters: Monster[]): number {
    const baseXP = monsters.reduce((sum, monster) => sum + monster.xp, 0);
    const multiplier = this.getMultiplier(monsters.length);
    return Math.round(baseXP * multiplier);
  }

  // Validation rencontre selon règles D&D
  static validateEncounter(
    monsters: Monster[],
    party: Party
  ): ValidationResult {
    // Vérifications: difficulté, nombre monstres, équilibre, etc.
  }
}
```

**APIs Publiques :**
- `calculateDifficulty(monsters, party, options?)` → Difficulty
- `generateEncounters(partyLevel, difficulty, environment?)` → Encounter[]
- `calculateTotalXP(monsters)` → number
- `validateEncounter(monsters, party)` → ValidationResult
- `getEncounterMultiplier(monsterCount, partySize)` → number
- `calculatePartyXP(party)` → number

---

### **TreasureSystem - Système de Trésors**

```typescript
export class TreasureSystem {
  // Génération trésor automatisé selon niveau/monstres
  static generateIndividualTreasure(
    participants: EncounterParticipant[],
    difficulty: Difficulty
  ): Treasure {
    const baseValue = this.calculateBaseTreasureValue(participants, difficulty);
    const magicItems = this.selectRandomMagicItems(level, count);
    const coins = this.distributeCoins(baseValue, coinDistribution);

    return { coins, magicItems, gems, artObjects };
  }

  // Sélection objets magiques selon rareté
  static selectRandomMagicItems(
    level: number,
    count: number,
    options?: MagicItemOptions
  ): MagicItem[] {
    // Algorithme pondéré selon rareté et niveau
    // common (65%), uncommon (25%), rare (8%), very rare (2%)
  }

  // Calcul valeur de base du trésor
  static calculateBaseTreasureValue(
    participants: EncounterParticipant[],
    challengeRating: number
  ): number {
    // Formules basées sur CR des monstres vaincus
  }

  // Distribution pièces selon règles D&D
  static distributeCoins(
    value: number,
    distribution: CoinDistributionType = 'standard'
  ): CoinDistribution {
    // Standard: 50% gold, 25% silver, 13% electrum, 12% copper
    // Custom: selon paramètres utilisateur
  }
}
```

**APIs Publiques :**
- `generateIndividualTreasure(participants, difficulty)` → Treasure
- `selectRandomMagicItems(level, count, options?)` → MagicItem[]
- `calculateBaseTreasureValue(participants, cr)` → number
- `distributeCoins(value, type?)` → CoinDistribution

---

### **MonsterEnricher - Enrichissement depuis AideDD**

```typescript
export class MonsterEnricher {
  // Enrichissement données depuis AideDD API
  static async enrichMonsterData(
    basicMonster: Monster,
    options?: EnrichmentOptions
  ): Promise<EnrichedMonster> {
    // Récupération données complètes
    const aideDDData = await this.fetchAideDDData(basicMonster.name);

    // Fusion avec données locales
    return this.mergeData(basicMonster, aideDDData);
  }

  // Mise à jour cache locale
  static async updateMonsterData(
    monsterSlug: string,
    forceRefresh = false
  ): Promise<EnrichResult> {
    // Vérification cache TTL
    if (!forceRefresh && this.isCached(monsterSlug)) {
      return this.getCachedData(monsterSlug);
    }

    // Fetch depuis AideDD et mise à jour cache
  }

  // Recherche par critères multiples
  static async searchMonsters(
    criteria: SearchCriteria,
    options?: SearchOptions
  ): Promise<MonsterSearchResult> {
    // Recherche dans cache local + API externe si nécessaire
    const localResults = this.searchLocalCache(criteria);
    const remoteResults = await this.searchRemoteAPI(criteria);

    return this.mergeSearchResults(localResults, remoteResults);
  }

  // Préchargement données lourdes
  static async preloadMonsterData(
    monsterSlugs: string[],
    priority: 'low' | 'normal' | 'high' = 'normal'
  ): Promise<PreloadResult> {
    // Mise en queue selon priorité
    // Traitement en arrière-plan
    // Mise à jour cache
  }
}
```

**APIs Publiques :**
- `enrichMonsterData(basicMonster, options?)` → Promise<EnrichedMonster>
- `updateMonsterData(slug, forceRefresh?)` → Promise<EnrichResult>
- `searchMonsters(criteria, options?)` → Promise<MonsterSearchResult>
- `preloadMonsterData(slugs, priority?)` → Promise<PreloadResult>

---

## 🔧 Utilitaires

### **Type Guards & Validation**

```typescript
// Guards pour validation TypeScript
export const isValidEncounter = (data: any): data is Encounter => {
  return (
    typeof data?.name === 'string' &&
    Array.isArray(data?.monsters) &&
    data?.monsters.every(isValidMonster)
  );
};

export const isValidMonster = (data: any): data is Monster => {
  return (
    typeof data?.name === 'string' &&
    typeof data?.xp === 'number' &&
    typeof data?.cr === 'number'
  );
};

// Validation schemas avec Zod
export const monsterSchema = z.object({
  name: z.string().min(1).max(100),
  xp: z.number().min(0),
  cr: z.number().min(0).max(30),
  type: z.enum(['Aberration', 'Bête', 'Céleste', /* ... */ ]),
  size: z.enum(['TP', 'P', 'M', 'G', 'TG', 'Gig']),
  alignment: z.string().optional(),
});

/**
 * Valide et transforme les données monstres
 * @param data - Données brutes du monstre
 * @returns Données validées ou erreur
 */
export const validateMonster = (data: unknown): Monster => {
  return monsterSchema.parse(data);
};
```

---

### **Data Transformers**

```typescript
// Transformateurs de données
export const transformAideDDData = {
  /**
   * Transforme les données AideDD vers format interne
   */
  toInternalFormat: (aideDDData: any): Monster => ({
    id: generateSlug(aideDDData.nom_fr || aideDDData.name),
    name: aideDDData.nom_fr || aideDDData.name,
    originalName: aideDDData.name,
    cr: parseFloat(aideDDData.for || '0'),
    xp: parseInt(aideDDData.px || '0'),
    type: mapAideDdType(aideDDData.type),
    size: mapAideDdSize(aideDDData.taille),
    ac: parseInt(aideDDData.ca || '10'),
    hp: parseInt(aideDDData.pv.split(' ')[0] || '10'),
    speed: parseSpeed(aideDDData.vitesse),
    abilities: {
      str: parseInt(aideDDData.force || '10'),
      dex: parseInt(aideDDData.dexterite || '10'),
      con: parseInt(aideDDData.constitution || '10'),
      int: parseInt(aideDDData.intelligence || '10'),
      wis: parseInt(aideDDData.sagesse || '10'),
      cha: parseInt(aideDDData.charisme || '10'),
    }
  }),

  /**
   * Transforme vers format affichage
   */
  toDisplayFormat: (monster: Monster): DisplayMonster => ({
    ...monster,
    formattedHP: formatHP(monster.hp, monster.hitDie),
    formattedSpeed: formatSpeed(monster.speed),
    typeBadge: getTypeBadge(monster.type),
    sizeLabel: getSizeLabel(monster.size)
  })
};
```

---

### **String & Text Processing**

```typescript
export const stringUtils = {
  /**
   * Génère un slug URL-safe
   */
  createSlug: (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprime accents
      .replace(/[^a-z0-9 -]/g, '')     // Supprime caractères spéciaux
      .replace(/\s+/g, '-')            // Replace espaces par tirets
      .replace(/-+/g, '-')             // Supprime tirets multiples
      .trim();
  },

  /**
   * Tronque le texte avec ellipse intelligente
   */
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;

    // Essaye de couper aux espaces
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');

    if (lastSpace > maxLength * 0.8) {
      return truncated.substring(0, lastSpace) + '...';
    }

    return truncated.trim() + '...';
  },

  /**
   * Met en forme les noms (Titre Case intelligent)
   */
  titleCase: (text: string): string => {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};
```

---

## 💾 Cache System

### **EncounterCache - Cache intelligent**

```typescript
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export class EncounterCache {
  constructor(
    maxSize: number = 100,
    defaultTTL: number = 300000 // 5 minutes
  ) {}

  // Stockage avec TTL
  set<T>(key: string, value: T, ttl?: number): void

  // Récupération avec vérification expiration
  get<T>(key: string): T | null

  // Vérification présence (sans récupération)
  has(key: string): boolean

  // Suppression spécifique
  delete(key: string): boolean

  // Vidage complet
  clear(): void

  // Nettoyage entrées expirées
  cleanup(): void

  // Statistiques détaillées
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.entries.length > 0 ? this.totalHits / this.entries.length : 0,
      entries: entries.map(({ key, hits, age }) => ({ key, hits, age }))
    };
  }
}

// Instance globale avec nettoyage automatique
export const encounterCache = new EncounterCache();
setInterval(() => encounterCache.cleanup(), 60000); // Toutes les minutes
```

**Utilisation :**
```typescript
// Cache calcul difficulté
const difficultyKey = `difficulty:${monsterIds.join(',')}-${partyLevel}`;
encounterCache.set(difficultyKey, calculatedDifficulty, 600000); // 10 minutes

// Récupération
const cachedDifficulty = encounterCache.get(difficultyKey);
if (cachedDifficulty) {
  return cachedDifficulty;
}
```

---

### **Cache Decorators**

```typescript
/**
 * Décorateur pour mise en cache automatique
 */
export function cached(ttl?: number) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const cache = encounterCache;

    descriptor.value = function (...args: any[]) {
      const key = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;

      // Vérification cache
      let result = cache.get(key);
      if (result === null) {
        // Calcul et mise en cache
        result = method.apply(this, args);
        cache.set(key, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}

// Utilisation
export class DifficultyCalculator {
  @cached(300000) // 5 minutes cache
  calculateDifficulty(monsters: Monster[], party: Party): Difficulty {
    // Calculs coûteux mis en cache automatiquement
    return this.computeExpensiveOperation(monsters, party);
  }
}
```

---

## 🪝 Hooks API

### **Core Hooks**

**useAuth - Gestion Authentification**
```typescript
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Interface complète
interface AuthContextType {
  // État
  readonly user: User | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
```

**useEncounterState - Gestion État Complexe**
```typescript
export const useEncounterState = (initialEncounter?: Encounter) => {
  // Reducer pour état complexe
  const [state, dispatch] = useReducer(encounterReducer, initialEncounter);

  // Actions dispatchées avec useCallback pour stabilité
  const addMonster = useCallback((monster: Monster) => {
    dispatch({ type: 'ADD_MONSTER', payload: monster });
  }, []);

  // Effets secondaires
  useEffect(() => {
    saveEncounterToLocalStorage(state);
  }, [state]);

  // Retour interface propre
  return {
    encounter: state,
    actions: { addMonster, updateMonster, removeMonster, updateParty },
    computed: { difficulty, totalXP }
  };
};
```

**useMobile - Responsive Design**
```typescript
export const useMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 768px)').matches);
    };

    // Listener optimisé avec debounce
    const debouncedCheck = debounce(checkMobile, 250);
    window.addEventListener('resize', debouncedCheck);

    checkMobile(); // Vérification initiale

    return () => window.removeEventListener('resize', debouncedCheck);
  }, []);

  return isMobile;
};
```

---

### **Utility Hooks**

**useAsync - Gestion Async/Await**
```typescript
export const useAsync = <T,>(
  asyncFn: () => Promise<T>,
  immediate = true
) => {
  const [state, setState] = useState<AsyncState<T>>({
    loading: false,
    value: null,
    error: null
  });

  const execute = useCallback(async () => {
    setState({ loading: true, value: null, error: null });

    try {
      const result = await asyncFn();
      setState({ loading: false, value: result, error: null });
      return result;
    } catch (error) {
      setState({ loading: false, value: null, error });
      throw error;
    }
  }, [asyncFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { ...state, execute };
};
```

**useDebounce - Debouncing Hook**
```typescript
export const useDebounce = <T,>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
```

---

## 🔥 Firebase Integration

### **FirebaseAPI - Service Firebase Abstrait**

```typescript
export class FirebaseAPI {
  // Authentification
  static async signIn(email: string, password: string): Promise<UserCredential>

  static async signUp(email: string, password: string, displayName?: string): Promise<UserCredential>

  static async signOut(): Promise<void>

  static async resetPassword(email: string): Promise<void>

  // Firestore - Encoutres
  static async saveEncounter(encounter: Encounter): Promise<string>

  static async loadEncounter(encounterId: string): Promise<Encounter>

  static async listEncounters(userId: string): Promise<Encounter[]>

  static async deleteEncounter(encounterId: string): Promise<void>

  // Firestore - Parties
  static async saveParty(party: Party): Promise<string>

  static async loadParty(partyId: string): Promise<Party>

  static async listParties(userId: string): Promise<Party[]>

  // Real-time subscriptions
  static subscribeToEncounter(
    encounterId: string,
    callback: (encounter: Encounter) => void
  ): Unsubscribe

  static subscribeToParty(
    partyId: string,
    callback: (party: Party) => void
  ): Unsubscribe
}
```

### **Firebase Context**

```typescript
export const useFirebase = () => {
  const [firebaseState, setFirebaseState] = useState({
    isInitialized: false,
    isOnline: navigator.onLine
  });

  // Vérification connexion Firebase
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        await firebase.app().name;
        setFirebaseState(prev => ({ ...prev, isInitialized: true }));
      } catch (error) {
        console.error('Firebase initialization error:', error);
      }
    };

    initializeFirebase();
  }, []);

  // Gestion offline/online
  const handleOnline = () => setFirebaseState(prev => ({ ...prev, isOnline: true }));
  const handleOffline = () => setFirebaseState(prev => ({ ...prev, isOnline: false }));

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    ...firebaseState,
    // Méthodes
    sync: () => /** synchronisation locale -> cloud */,
    getCached: (collection: string) => /** récupération cache */,
    saveOffline: (data: any) => /** sauvegarde offline */
  };
};
```

---

## 🚨 Error Handling

### **ErrorTracker - Système de suivi d'erreurs**

```typescript
export interface ErrorContext {
  userId?: string;
  userAgent: string;
  url: string;
  timestamp: number;
  sessionId: string;
  componentStack?: string;
  additionalData?: Record<string, any>;
}

export class ErrorTracker {
  constructor(
    private reportingEndpoint: string,
    private config: ErrorTrackerConfig
  ) {}

  // Signalement erreur avec contexte
  reportError(
    error: Error,
    context: ErrorContext,
    severity: ErrorSeverity = 'error'
  ): void {
    const errorReport = {
      message: error.message,
      stack: error.stack,
      severity,
      context,
      timestamp: Date.now()
    };

    // Envoi vers endpoint selon configuration
    if (this.config.enableReporting) {
      this.sendReport(errorReport);
    }

    // Stockage local pour debug
    if (this.config.enableLocalStorage) {
      this.storeLocal(errorReport);
    }

    // Console logging si développement
    if (this.config.enableConsoleLogging) {
      console.error('Tracked Error:', errorReport);
    }
  }

  // Catégorisation erreurs
  categorizeError(error: Error): ErrorCategory {
    if (error.name === 'NetworkError') return 'network';
    if (error.name === 'ValidationError') return 'validation';
    if (error.message.includes('Firebase')) return 'firebase';
    if (error.message.includes('TypeError')) return 'javascript';
    return 'unknown';
  }
}
```

### **Global Error Boundaries**

```tsx
export class AppErrorBoundary extends Component {
  state = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Signalement à ErrorTracker
    errorTracker.reportError(error, {
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: Date.now()
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          onRetry={() => this.setState({ hasError: false, error: null, errorInfo: null })}
          onReport={(feedback) => this.reportUserFeedback(feedback)}
        />
      );
    }

    return this.props.children;
  }
}
```

---

Cette documentation constitue la référence complète pour toutes les APIs et services de l'application Trame. Chaque fonction publique est documentée avec ses paramètres, types de retour, et exemples d'utilisation.
