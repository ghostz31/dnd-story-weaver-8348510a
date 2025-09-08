# 🧩 Bibliothèque de Composants - Trame D&D Story Weaver

> Documentation complète de la bibliothèque de composants UI

## 📋 Table des Matières

- [Architecture des Composants](#architecture-des-composants)
- [Composants Core](#composants-core)
- [Composants Métier](#composants-metier)
- [Composants UI (ShadCN/Radix)](#composants-ui-shadcnradix)
- [Hooks et Logique](#hooks-et-logique)
- [Patterns et Conventions](#patterns-et-conventions)
- [Responsive Design](#responsive-design)

---

## 🏗️ Architecture des Composants

### **Structure Modulaire**

```
📁 src/components/
├── ui/                     # Composants de base ShadCN/Radix
│   ├── button.tsx         # bouton variant/rounded/flexible
│   ├── badge.tsx          # badge catégorisé
│   ├── card.tsx           # carte container
│   └── ...
├── layout/                # Composants de mise en page
│   ├── Header.tsx         # Header responsive sticky
│   └── ...
├── auth/                  # Composants d'authentification
│   ├── LoginForm.tsx      # Formulaire de connexion
│   ├── RegisterForm.tsx   # Formulaire d'inscription
│   └── ...
├── monsters/              # Composants liés aux monstres
│   ├── MonsterCard.tsx    # Carte monstre détaillée
│   ├── MonsterBrowser.tsx # Navigateur de monstres
│   └── MonsterRow.tsx     # Ligne compacte
├── encounters/            # Composants de rencontres
│   ├── EncounterBuilder.tsx    # Constructeur rencontre
│   ├── EncounterTracker.tsx    # Tracker de combat
│   └── EncounterHistory.tsx    # Historique rencontres
└── shared/                # Composants partagés
    ├── ErrorBoundary.tsx  # Gestion d'erreurs globale
    ├── LoadingSpinner.tsx # Indicateurs chargement
    └── ...
```

### **Design System**

**Principe:**
- **Composants atomiques** (`Button`, `Input`, `Badge`) → ShadCN/UI
- **Composants moléculaires** (`MonsterCard`, `PartyEditor`) → Logique métier
- **Composants complexes** (`EncounterTracker`, `EncounterBuilder`) → Features complètes

**Variant System:**
```typescript
interface ComponentVariant {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  intent?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}
```

---

## 🎯 Composants Core

### **MonsterCard - Carte Monstre Détaillée**

```tsx
interface MonsterCardProps {
  monster: Monster;
  showStats?: boolean;
  showActions?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  onSelect?: (monster: Monster) => void;
}
```

**Features:**
- ✅ Affichage multi-format (compact/détaillé)
- ✅ Traductions françaises intégrées
- ✅ Liens AideDD externes
- ✅ Cache d'images et placeholers
- ✅ Responsive adaptive
- ✅ Calc dents automatiques (CR, XP)

**Utilisation:**
```tsx
// Format compact (liste)
<MonsterCard
  monster={monster}
  variant="compact"
  size="sm"
  onSelect={handleMonsterSelect}
/>

// Format détaillé (popup/modal)
<MonsterCard
  monster={monster}
  variant="detailed"
  showActions
  showStats
/>
```

### **EncounterTracker - Tracker de Combat**

```tsx
interface EncounterTrackerProps {
  encounter: Encounter;
  variant?: 'grid' | 'list' | 'compact';
  theme?: 'light' | 'dark';
  showInitiative?: boolean;
  showConditions?: boolean;
  autoAdvance?: boolean;
  keyboardShortcuts?: boolean;
}
```

**Features Avancées:**
- ✅ **3 modes d'affichage** : Grille/Liste/Compact
- ✅ Gestion complète initiative
- ✅ Système de conditions 17 conditions D&D
- ✅ Actions rapides (dégâts/soins)
- ✅ Calcul XP et trésor automatique
- ✅ Raccourcis clavier complets
- ✅ Export résultats
- ✅ Modal détails monstres

**Modes d'Affichage:**
```typescript
// Grille (recommandé desktop >1024px)
<EncounterTracker
  encounter={encounter}
  variant="grid"
  showInitiative
  showConditions
/>

// Liste compacte (mobile first)
<EncounterTracker
  encounter={encounter}
  variant="list"
  theme="mobile-optimized"
/>

// Vue compact (tablettes)
<EncounterTracker
  encounter={encounter}
  variant="compact"
  autoAdvance
/>
```

---

## 🧩 Composants Métier

### **EncounterBuilder - Constructeur de Rencontres**

```tsx
interface EncounterBuilderProps {
  initialParty?: Party;
  environment?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | 'deadly';
  autoBalance?: boolean;
  maxMonsters?: number;
  filters?: EncounterFilters;
}
```

**Workflow Construc casts:**
1. **Ajout groupe** (joueurs/party)
2. **Sélection difficulté** (easy→deadly)
3. **Choix environnement**
4. **Génération automatique** ou manuelle
5. **Équilibrage avec règles D&D**
6. **Validation et export**

**States Managements:**
```typescript
interface BuilderState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  selectedParty: Party | null;
  selectedDifficulty: Difficulty;
  selectedEnvironment: Environment;
  selectedMonsters: Monster[];
  generatedOptions: Encounter[];
  validationErrors: ValidationError[];
}
```

### **MonsterBrowser - Navigateur de Monstres**

```tsx
interface MonsterBrowserProps {
  filters?: MonsterFilters;
  sortBy?: SortOption;
  viewMode?: 'grid' | 'list' | 'table';
  enableSearch?: boolean;
  enableFavorites?: boolean;
  showStats?: boolean;
  batchActions?: boolean;
}
```

**Features Recherche:**
- ✅ Recherche full-text avancée
- ✅ Filtres multi-critères (type, CR, taille)
- ✅ Tri personnalisable
- ✅ Favoris utilisateur
- ✅ Actions par lot
- ✅ Pagination infinie
- ✅ Cache local intelligent

**Search Syntsss:**
```typescript
// Recherche basique
<MonsterBrowser
  filters={{ name: 'dragon', type: 'Dragon' }}
  sortBy="cr"
/>

// Recherche avancée avec filtres
<MonsterBrowser
  filters={{
    cr: { min: 5, max: 15 },
    environment: ['volcan', 'montagne'],
    alignment: 'mauvais'
  }}
  viewMode="table"
  enableSearch
/>
```

---

## 🎨 Composants UI (ShadCN/Radix)

### **Systeme Design Consistent**

Toutes les composants ShadCN suivent :
- ✅ **TypeScript strict** avec interfaces complètes
- ✅ **Variants system** avec theme support
- ✅ **Radix UI primitives** pour accessibilité
- ✅ **Tailwind CSS** pour styling cohérent
- ✅ **Responsive first** design

### **Button - Composant Bouton Flexible**

```tsx
// Variants disponibles
type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonTheme = 'default' | 'mobile' | 'floating';

<Button
  variant="outline"
  size="lg"
  theme="mobile"
  onClick={handleClick}
  disabled={loading}
  className="w-full md:w-auto"
>
  Nouvelle Rencontre
</Button>
```

### **Card - Container Flexible**

```tsx
interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean | 'lift' | 'glow';
  clickable?: boolean;
}
```

**Variants Usage:**
```tsx
// Carte monstre
<Card variant="elevated" hover="lift" className="transition-all">
  <CardHeader>
    <CardTitle>{monster.name}</CardTitle>
    <CardDescription>{monster.type} • CR {monster.cr}</CardDescription>
  </CardHeader>
  <CardContent>
    <MonsterStats monster={monster} />
  </CardContent>
</Card>
```

### **Modal/Dialog System**

**Modal Management Avancé:**
```tsx
// Modal responsive avec taille adaptive
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size={isMobile ? 'fullscreen' : 'auto'}
  position="bottom-sheet-mobile"
>
  <ModalHeader>
    <ModalTitle>Créer une Rencontre</ModalTitle>
  </ModalHeader>
  <ModalContent>
    <EncounterBuilder />
  </ModalContent>
</Modal>
```

### **Form Components**

**Form Validation Integrated:**
```tsx
<FormField>
  <FormLabel>Nom du groupe</FormLabel>
  <FormControl>
    <Input
      placeholder="Mes aventuriers..."
      error={errors.name}
      validation={z.string().min(3).max(50)}
    />
  </FormControl>
  <FormMessage>{errors.name}</FormMessage>
</FormField>
```

---

## 🪝 Hooks et Logique

### **Custom Hooks Principaux**

**useEncounterState - Gestion Complexe**
```typescript
const {
  encounter,
  actions: { addMonster, removeMonster, updateInitiative },
  computed: { difficulty, totalXP },
  validation: { isValid, errors }
} = useEncounterState(initialEncounter);
```

**useEncounterOptimizations - Optimisations Performance**
```typescript
const {
  isOptimized,
  optimizedData,
  cacheStats,
  performanceMetrics
} = useEncounterOptimizations(encounter, {
  enableCache: true,
  cacheTTL: 300000,  // 5 minutes
  lazyLoadMonsters: true
});
```

---

## 📱 Responsive Design

### **Breakpoints System**

```typescript
// Breakpoints définis
const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  desktopLG: '(min-width: 1280px)',
} as const;

// Hook responsive
const useBreakpoint = (breakpoint: keyof typeof breakpoints) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(breakpoint);
    setMatches(media.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addListener(handler);
    return () => media.removeListener(handler);
  }, [breakpoint]);

  return matches;
};
```

### **Mobile-First Components**

**Examples Optimisations Mobile:**

```tsx
// Header sticky avec menu hamburger
<Header>
  <DesktopMenu /> {/* Hidden mobile */}
  <MobileMenu /> {/* Visible mobile */}
</Header>

// Modal plein écran mobile, sized desktop
<EncounterModal>
  <Mobile.Fullscreen>
    <Mobile.Content />
  </Mobile.Fullscreen>
  <Desktop.SizedModal maxWidth="600px">
    <Desktop.Content />
  </Desktop.SizedModal>
</EncounterModal>
```

---

## 🎭 Patterns et Conventions

### **Composants Composés (Compound Pattern)**

```tsx
// Composant composé pour encounters
const EncounterComposer = {
  Root: ({ children, onSave }) => (
    <div className="encounter-builder">{children}</div>
  ),

  Header: ({ title, difficulty }) => (
    <div className="header">
      <h1>{title}</h1>
      <DifficultyBadge difficulty={difficulty} />
    </div>
  ),

  MonsterSection: ({ monsters, onAdd }) => (
    <div className="section monsters">
      {monsters.map(monster => (
        <MonsterCard key={monster.id} monster={monster} />
      ))}
      <AddMonsterButton onClick={onAdd} />
    </div>
  ),

  Actions: ({ onSave, onCancel }) => (
    <div className="actions">
      <Button onClick={onCancel}>Annuler</Button>
      <Button onClick={onSave} variant="primary">Sauvegarder</Button>
    </div>
  )
};

// Utilisation claire et déclarative
<EncounterComposer.Root onSave={handleSave}>
  <EncounterComposer.Header title="Nouvelle Rencontre" difficulty="hard" />
  <EncounterComposer.MonsterSection
    monsters={selectedMonsters}
    onAdd={handleAddMonster}
  />
  <EncounterComposer.Actions
    onSave={handleSave}
    onCancel={handleCancel}
  />
</EncounterComposer.Root>
```

### **Render Props Pattern**

```tsx
// Composants configurables avec render props
const ConditionSelector = ({ children, conditions, onSelect }) => {
  return children({
    conditions,
    selectedConditions: conditions.filter(c => c.active),
    onConditionToggle: (condition) => onSelect(condition),
    isConditionSelected: (condition) => conditions.some(c => c.name === condition && c.active)
  });
};

// Utilisation flexible
<ConditionSelector conditions={encounterConditions} onSelect={handleConditionSelect}>
  {({ selectedConditions, onConditionToggle, isConditionSelected }) => (
    <div className="condition-grid">
      {CONDITIONS_DND.map(condition => (
        <ConditionButton
          key={condition.name}
          condition={condition}
          selected={isConditionSelected(condition.name)}
          onClick={() => onConditionToggle(condition)}
        />
      ))}
    </div>
  )}
</ConditionSelector>
```

---

## 🎨 Variants et Themes

### **Theme System**

**Design Tokens:**
```typescript
const theme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a'
    },
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem'
  },
  typography: {
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  }
};
```

### **Component Variants**

```typescript
// Variations systématiques
interface ComponentVariants {
  button: {
    variants: 'primary' | 'secondary' | 'outline' | 'ghost';
    sizes: 'sm' | 'md' | 'lg';
  };
  card: {
    elevations: 'flat' | 'raised' | 'elevated' | 'floating';
    styles: 'filled' | 'outlined' | 'transparent';
  };
  modal: {
    sizes: 'sm' | 'md' | 'lg' | 'fullscreen';
    positions: 'centered' | 'top' | 'bottom-sheet';
  };
}
```

---

## ♿ Accessibilité

### **ARIA Support**

**Labels et Descriptions:**
```tsx
<Button
  variant="primary"
  size="lg"
  aria-label="Créer une nouvelle rencontre avec les monstres sélectionnés"
  aria-describedby="encounter-help"
>
  Nouvelle Rencontre
</Button>
<p id="encounter-help" hidden>
  Ce bouton ouvre le constructeurs de rencontres où vous pouvez ajouter des monstres et équilibrer une rencontre.
</p>
```

**Navigation Clavier:**
```tsx
// Monster list avec navigation clavier
<MonsterList
  monsters={monsters}
  role="listbox"
  aria-label="Liste des monstres disponibles"
  onKeyDown={(e) => {
    if (e.key === 'ArrowDown') moveFocus('next');
    if (e.key === 'ArrowUp') moveFocus('previous');
    if (e.key === 'Enter') selectMonster();
  }}
>
  {monsters.map((monster, index) => (
    <MonsterItem
      key={monster.id}
      monster={monster}
      role="option"
      aria-selected={selectedIndex === index}
      tabIndex={selectedIndex === index ? 0 : -1}
    />
  ))}
</MonsterList>
```

---

## 🔄 États et Loading

### **Loading States**

**Skeleton Loading:**
```tsx
const MonsterCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded h-4 mb-2"></div>
    <div className="bg-gray-200 rounded h-3 mb-1 w-3/4"></div>
    <div className="bg-gray-200 rounded h-3 w-1/2"></div>
  </div>
);

// Utilisation
{loading ? (
  <MonsterCardSkeleton />
) : (
  <MonsterCard monster={monster} />
)}
```

**Progressive Loading:**
```tsx
const MonsterBrowser = () => {
  const {
    data,
    isLoading,
    isLoadingMore,
    hasNextPage,
    fetchNextPage
  } = useInfiniteMonsterQuery();

  return (
    <div>
      {data?.pages.map(page => (
        <MonsterList monsters={page.monsters} />
      ))}

      {isLoadingMore && <LoadingIndicator />}

      {hasNextPage && !isLoadingMore && (
        <LoadMoreButton onClick={fetchNextPage} />
      )}
    </div>
  );
};
```

---

## 📊 Composants Avancés

### **Virtualization pour Grandes Listes**

```tsx
import { FixedSizeList as List } from 'react-window';
import { memo } from 'react';

const MonsterVirtualList = memo(({ monsters, height, itemHeight }) => (
  <List
    height={height}
    itemCount={monsters.length}
    itemSize={itemHeight}
    itemData={monsters}
  >
    {MonsterVirtualRow}
  </List>
));

// Row component virtualisée
const MonsterVirtualRow = memo(({ index, style, data: monsters }) => (
  <div style={style}>
    <MonsterCard monster={monsters[index]} variant="compact" />
  </div>
));
```

### **Composants avec Refs Forward**

```tsx
// Button avec ref forwarding pour imperative API
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ ...props }))}
      {...props}
    >
      {children}
    </button>
  )
);

// Utilisation avec ref
const buttonRef = useRef<HTMLButtonElement>(null);

// Accessibilité (focus après modal close)
useEffect(() => {
  if (!modalOpen && buttonRef.current) {
    buttonRef.current.focus();
  }
}, [modalOpen]);
```

---

Cette bibliothèque de composants constitue la base solide de l'interface utilisateur de Trame, avec une attention particulière à la performance, l'accessibilité et l'expérience mobile.
