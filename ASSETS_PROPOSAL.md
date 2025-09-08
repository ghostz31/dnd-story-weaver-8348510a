# 🎨 Plan d'Assets Visuels - Trame D&D Story Weaver

> Proposition complète d'images pour habiller le site D&D

## 🎯 **Stratégie Visuelle**

### **Palette Thématique**
- **Couleurs primaires**: Brun medieval (#8B4513), Or antique (#DAA520), Rouge sang (#8B0000)
- **Style**: Fantasy réaliste avec éléments gothiques
- **Inspiration**: Codex, parchemins anciens, armures médiévales
- **Mood**: Mystérieux, épique, immersif

### **Formats & Résolutions**
```typescript
export const IMAGE_SPECS = {
  icons: { size: '32x32px', format: 'SVG', usage: 'Buttons/actions' },
  illustrations: { size: '400x300px', format: 'PNG/WebP', usage: 'Landing pages' },
  backgrounds: { size: '1920x1080px', format: 'WebP', usage: 'Full screen' },
  thumbnails: { size: '200x150px', format: 'JPEG/WebP', usage: 'Cards/grids' },
  sprites: { size: '64x64px', format: 'PNG', usage: 'Animations/status' }
};
```

---

## 🚀 **1. Images de chargement & Brand**

### **A. Loading States**

**Emplacements**: `/public/images/loading/`
**Usage**: Écrans de chargement, skeletons, spinners

1. **Dés animé (spinner-custom.gif)**
   - Rouleaux de parchemins qui se déroulent
   - Dés qui tournent avec runes magiques
   - Sablier magique avec sable brillant

2. **Skeletons Fantasie**
   - `skeleton-monster.svg` - Silhouette de dragon stylisé
   - `skeleton-encounter.svg` - Groupe d'aventuriers esquissé
   - `skeleton-party.svg` - Table de jeu avec figurines

### **B. Logo & Branding**

**Emplacements**: `/public/images/branding/`
**Usage**: Header, footer, about page

1. **Logo amélioré**
   - Version avec parchemin déroulé
   - Avec effets magiques (particules, glow)

2. **Favicon set complet**
   - 16x16, 32x32, 64x64px versions
   - Noir/blanc, avec/ sans background

3. **Watermark subtil**
   - Discrète rune D&D pour backgrounds

---

## 🏠 **2. Page d'Accueil (Landing)**

### **A. Hero Section Background**

**Emplacement**: `/public/images/hero/`
**Proposition**: "Encounter": Aventuriers autour d'une table avec MJ

```typescript
// Suggestion: hero-background.webp (1920x800px)
const heroImage = {
  url: '/images/hero/hero-background.webp',
  alt: 'Groupe d\'aventuriers préparant une quête épique',
  overlay: 'linear-gradient(rgba(0,0,0,0.6), rgba(139,69,19,0.3))',
  fallbackColor: '#2D1810'
};
```

### **B. Feature Illustrations**

**Emplacement**: `/public/images/features/`
**3 images clés pour les fonctionnalités principales**

1. **"Créer Rencontre"**
   - MJ avec bouquin magique + dés qui flottent
   - `feature-encounter-creation.webp`

2. **"Tracker Combat"**
   - Table de jeu avec figurines, initiative roulée
   - `feature-combat-tracker.webp`

3. **"Générer Trésor"**
   - Coffre ouvert avec pièces d'or, objets magiques
   - `feature-treasure-generation.webp`

### **C. Social Proof Section**

**Emplacement**: `/public/images/testimonials/`
**Usage**: Témoignages MJ/Community**

```typescript
const testimonials = [
  {
    quote: "Enfin un tracker qui comprend les règles D&D !",
    avatar: '/images/testimonials/dm-avatar-1.webp',
    name: "Marcus le Maître",
    title: "MJ depuis 15 campagnes"
  }
];
```

---

## 🎮 **3. Interface Utilisateur**

### **A. Backgrounds Fonctionnels**

**Emplacement**: `/public/images/backgrounds/`

1. **Fond discret texture parchemin**
   ```
   URL: /images/backgrounds/parchment-texture.webp
   Usage: Backgrounds sections principales
   Pattern: Très subtil, noise paper-like
   ```

2. **Overlay mystique** (pour modales)
   ```
   URL: /images/backgrounds/mystical-overlay.webp
   Pattern: Particules magiques, runic symbols low opacity
   ```

### **B. Icônes Custom**

**Emplacement**: `/public/images/icons/`

```typescript
const customIcons = {
  // Remplacer les génériques Lucide
  encounter: '/images/icons/encounters.svg',        // 🏰 Château avec épée
  monsters: '/images/icons/monsters.svg',           // 🐉 Dragon stylisé
  treasure: '/images/icons/treasure.svg',           // 💰 Coffre runique
  dice: '/images/icons/dice-roll.svg',              // 🎲 Dés magiques
  campaign: '/images/icons/campaign.svg',           // 📖 Livre ancien
  settings: '/images/icons/settings.svg',           // ⚙️ Rune d'engrenages
  user: '/images/icons/user-avatar.svg',           // 👤 Portrait médiéval
  logout: '/images/icons/logout.svg',              // 🚪 Porte oldschool
};
```

---

## 🧙‍♂️ **4. Section Monstres**

### **A. Placeholders par Type**

**Emplacement**: `/public/images/monsters/placeholders/`

```typescript
// 14 types D&D avec placeholders uniques
const monsterPlaceholders = {
  Aberration: '/images/monsters/placeholders/aberration.webp',    // Tentacules mystiques
  Bête: '/images/monsters/placeholders/beast.webp',               // Griffes animal
  Céleste: '/images/monsters/placeholders/celestial.webp',        // Ailes angéliques
  Arificiel: '/images/monsters/placeholders/construct.webp',     // Rouages mécaniques
  Dragon: '/images/monsters/placeholders/dragon.webp',            // Écailles dorées
  Élémentaire: '/images/monsters/placeholders/elemental.webp',    // Tempête élémentaire
  Fée: '/images/monsters/placeholders/fey.webp',                  // Feuilles & fleurs magiques
  Fiélon: '/images/monsters/placeholders/fiend.webp',             // Cornes démoniaques
  Géant: '/images/monsters/placeholders/giant.webp',              // Figure colossale
  Humanoïde: '/images/monsters/placeholders/humanoid.webp',       // Armure médiévale
  Monstruosité: '/images/monsters/placeholders/monstrosity.webp', // Créature hybride
  Plante: '/images/monsters/placeholders/plant.webp',             // Racines & feuillage
  'Mort-vivant': '/images/monsters/placeholders/undead.webp',     // Squelette spectral
  Vase: '/images/monsters/placeholders/ooze.webp',               // Gelée visqueuse
};
```

### **B. États Visuels**

**Emplacement**: `/public/images/monsters/states/`

```typescript
const monsterStates = {
  loading: '/images/monsters/states/loading.webp',      // Placeholder animé
  error: '/images/monsters/states/error.webp',         // Rune brisée équipe
  empty: '/images/monsters/states/empty.webp',         // Parchemin vide
  searching: '/images/monsters/states/searching.webp',  // Loupe magique
};
```

---

## ⚔️ **5. Encounter Tracker**

### **A. États de Combat**

**Emplacement**: `/public/images/combat/`

1. **Initiative Indicators**
   ```
   active-turn.svg      - 🔥 Cercle feu autour du portrait
   waiting-turn.svg     - ❄️ Effet gel/inactif
   defeated.svg         - 💀 Crâne & tibias (mort)
   conditions/          - Dossier avec 17 images conditions
   ```

2. **Status Effects** (17 conditions D&D)
   ```typescript
   const conditionIcons = {
     aveuglé: '/images/combat/conditions/blind.webp',
     charmé: '/images/combat/conditions/charmed.webp',
     assourdi: '/images/combat/conditions/deafened.webp',
     effrayé: '/images/combat/conditions/frightened.webp',
     agrippé: '/images/combat/conditions/grappled.webp',
     entravé: '/images/combat/conditions/restrained.webp',
     étourdi: '/images/combat/conditions/stunned.webp',
     empoisonné: '/images/combat/conditions/poisoned.webp',
     paralysé: '/images/combat/conditions/paralyzed.webp',
     // ... 7 autres conditions
   };
   ```

### **B. Feedback Visuel**

**Emplacement**: `/public/images/feedback/`

```typescript
const combatFeedback = {
  hit: '/images/feedback/hit-effect.gif',              // ⚔️ Flash rouge + éclats
  miss: '/images/feedback/miss-effect.gif',           // ❌ Cercle blanc + poussière
  criticalHit: '/images/feedback/critical-hit.gif',   // 💥 Explosion d'énergie
  healing: '/images/feedback/healing-effect.gif',     // 💚 Particules vertes
  death: '/images/feedback/death-effect.gif',         // ☠️Âme qui s'envole
};
```

---

## 💰 **6. Système de Trésor**

### **A. Treasure Gallery**

**Emplacement**: `/public/images/treasure/`

```typescript
const treasureAssets = {
  // Types de trésor
  coins: '/images/treasure/coins-stack.webp',        // Pile pièces dorées
  gems: '/images/treasure/gem-collection.webp',      // Collection gemmes colorées
  jewelry: '/images/treasure/jewelry-set.webp',      // Bijoux anciens
  
  // Objets magiques catégories
  weapons: '/images/treasure/magic-weapon.webp',     // Épée lumineuse
  armor: '/images/treasure/magic-armor.webp',       // Armure runique
  potions: '/images/treasure/potion-set.webp',       // Fioles magiques
  scrolls: '/images/treasure/scroll-collection.webp', // Parchemins magiques
  wondrous: '/images/treasure/wondrous-items.webp',  // Objets étranges
  
  // Quantité variations
  individual: '/images/treasure/individual.webp',    // Petit trésor
  horde: '/images/treasure/horde.webp',              // Trésor massif
};
```

### **B. Treasure Animations**

```typescript
const treasureAnimations = {
  openingChest: '/images/treasure/opening-chest.gif',     // Coffre qui s'ouvre
  coinsSprinkle: '/images/treasure/coins-sprinkle.gif',   // Pièces qui tombent
  magicGlow: '/images/treasure/magic-glow.gif',          // Objet qui brille
};
```

---

## 📱 **7. Optimisations Mobile**

### **A. Images Responsive**

**Emplacement**: `/public/images/mobile/`

```typescript
// Images optimisées pour mobile
const mobileOptimized = {
  // Formats réduits pour mobile (50% taille desktop)
  heroBackground: {
    desktop: '/images/hero/hero-desktop.webp',    // 1920x800px
    tablet: '/images/hero/hero-tablet.webp',      // 1024x600px
    mobile: '/images/hero/hero-mobile.webp',      // 640x400px
  },

  // Quality switch selon connexion
  quality: {
    low: '/images/placeholders/low-quality.webp',     // 100KB max
    medium: '/images/hero/medium-quality.webp',       // 500KB max
    high: '/images/hero/high-quality.webp',           // Quality native
  }
};
```

---

## 🎨 **8. Avatar & Profils**

### **A. Avatars par Classe**

**Emplacement**: `/public/images/avatars/classes/`

```typescript
// 12 classes D&D avec avatars stylisés
const classAvatars = {
  barbarian: '/images/avatars/classes/barbarian.webp',    // Guerrier tribal
  bard: '/images/avatars/classes/bard.webp',             // Musicien élégant
  cleric: '/images/avatars/classes/cleric.webp',         // Prêtre avec symbole sacré
  druid: '/images/avatars/classes/druid.webp',           // Marcheur avec esprit animal
  fighter: '/images/avatars/classes/fighter.webp',       // Chevalier en armure
  monk: '/images/avatars/classes/monk.webp',             // Moine en position meditative
  paladin: '/images/avatars/classes/paladin.webp',       // Chevalier religieux
  ranger: '/images/avatars/classes/ranger.webp',         // Chasseur avec arc
  rogue: '/images/avatars/classes/rogue.webp',           // Voleur furtif
  sorcerer: '/images/avatars/classes/sorcerer.webp',     // Magicien avec orbes
  warlock: '/images/avatars/classes/warlock.webp',       // Invocateur mystérieux
  wizard: '/images/avatars/classes/wizard.webp',         // Mage avec livre ancien
};
```

### **B. Avatars Génériques**

```typescript
const genericAvatars = {
  default: '/images/avatars/default.webp',               // Portrait médiéval neutre
  anonymous: '/images/avatars/anonymous.webp',          // Masque mystère
  dm: '/images/avatars/dm.webp',                        // MJ avec échiquier DM
  guest: '/images/avatars/guest.webp',                  // Visiteur sans identité
};
```

---

## 🌟 **9. Animations & Interactions**

### **A. Micro-interactions**

**Emplacement**: `/public/images/animations/`

```typescript
const microInteractions = {
  // Boutons hover states
  buttonHover: '/images/animations/button-hover.gif',    // Légère lueur dorée
  buttonClick: '/images/animations/button-click.gif',    // Petit flash énergie
  
  // Success/error states
  successCheckmark: '/images/animations/success-check.gif', // ✓ avec particules
  errorCross: '/images/animations/error-cross.gif',        // ✗ avec explosion
  
  // Loading variations
  quickLoad: '/images/animations/quick-load.gif',        // 500ms max
  heavyLoad: '/images/animations/heavy-load.gif',        // Pour chargements lourds
  
  // Achievement unlocks
  achievementUnlock: '/images/animations/achievement.gif', // Bannière déploiement
};
```

---

## 🛡️ **10. États d'Erreur & Maintenance**

### **A. Error Pages**

**Emplacement**: `/public/images/errors/`

```typescript
const errorStates = {
  404: '/images/errors/404-quest-not-found.webp',           // Aventurier perdu
  500: '/images/errors/500-disaster-struck.webp',         // Catastrophe naturelle
  offline: '/images/errors/offline-portal-closed.webp',    // Portail magique fermé
  maintenance: '/images/errors/maintenance-ritual.webp',   // Rituel de maintenance
};
```

### **B. Placeholder Content**

```typescript
const placeholders = {
  noMonsters: '/images/placeholders/empty-monster-roster.webp',    // Liste vide
  noEncounters: '/images/placeholders/empty-encounter-log.webp',  // Pas d'historique
  noTreasure: '/images/placeholders/empty-treasure-chest.webp',    // Coffre vide
  loadingData: '/images/placeholders/loading-scroll.webp',        // Parchemin loading
};
```

---

## 📏 **Spécifications Techniques**

### **Formats & Compression**

```typescript
export const OPTIMIZATION_SPECS = {
  // Formats par usage
  icons: { format: 'SVG', compression: 'Gzip', maxSize: '2KB' },
  illustrations: { format: 'WebP', fallback: 'PNG', maxSize: '100KB' },
  photos: { format: 'WebP', fallback: 'JPEG', quality: 85, maxSize: '200KB' },
  backgrounds: { format: 'WebP', fallback: 'JPEG', quality: 90, maxSize: '300KB' },
  
  // Lazy loading strategy
  lazyLoading: {
    rootMargin: '50px',
    threshold: 0.1,
    placeholder: 'blur',
    blurDataURL: 'data:image/svg+xml;base64,...' // Very small SVG blur
  },

  // Responsive images
  responsive: {
    breakpoints: [640, 768, 1024, 1280, 1536],
    sizes: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw',
    generate: true // Auto-generate sizes
  }
};
```

### **Outil de Génération Recommandé**

**Midjourney Prompts Templates:**
```
"medieval fantasy D&D style, detailed parchment background, high quality, texture, --ar 16:9 --q 2 --v 5"

"D&D {monster_type} placeholder illustration, medieval fantasy style, white background, detailed, clean, --ar 1:1 --q 2 --v 5"

"medieval fantasy {element}, D&D style, parchment texture, high resolution, --ar 16:9 --q 2 --v 5"
```

---

## 🎯 **Priorité d'Implémentation**

### **🚨 Critique (Semaine 1)**
1. ✅ Loading states personnalisés
2. ✅ Error pages avec thème
3. ✅ Monster placeholders par type (14 images)
4. ✅ Custom icons (8-10 essentiels)

### **⭐ Important (Semaine 2)**
5. ✅ Combat states & conditions (18 images)
6. ✅ Mobile responsive versions clés
7. ✅ Treasure system visuals

### **📅 Plus tard (Mois 1+)**
8. ✅ Hero background landing
9. ✅ Feature illustrations
10. ✅ Animations & micro-interactions

---

Cette proposition garde l'identité **technique et fonctionnelle** de l'application tout en ajoutant une **dimension visuelle immersive** qui renforce l'expérience D&D sans compromettre les performances.
