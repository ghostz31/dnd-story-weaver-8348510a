# Page Unifiée Combat & Capacités

## 🎯 Objectif Réalisé

Fusion des pages **Combat** et **Capacités** en une seule interface unifiée avec une meilleure gestion visuelle des actions et une disposition optimisée des informations.

## 🏗️ Architecture de la Page

### Vue d'ensemble

```
┌─────────────────────────────────────────────────────┐
│ ⚡ Combat & Capacités                                │
│ NOM • Niv. X • CLASSE                               │
├─────────────────────────────────────────────────────┤
│ [CA] [INIT] [BONUS] [REPOS]                        │  ← Stats rapides
├─────────────────────────────────────────────────────┤
│ [Vue Globale] [Combat] [Capacités]                 │  ← Navigation principale
├─────────────────────────────────────────────────────┤
│                                                     │
│  SECTION COMBAT (si Vue Globale ou Combat)           │
│  ┌─────────────────────────────────────────┐        │
│  │ 🔥 Actions de Combat                    │        │
│  │ [Armes] [Actions] [Bonus] [Réactions] [Limitées]  │  ← Sous-tabs
│  ├─────────────────────────────────────────┤        │
│  │                                         │        │
│  │ ┌─ Action Card ─────────────────────┐  │        │
│  │ │ Épée longue +1           [●●●○○]  │  │        │
│  │ │ Source: Épée longue +1  • Action    │  │        │
│  │ │                                     │  │        │
│  │ │ TOUCHER      DÉGÂTS      📐 1.5m   │  │        │
│  │ │   +8         1d8+4 (8)            │  │        │
│  │ │                                     │  │        │
│  │ │ [Versatile] [Magic] [Melee]         │  │        │
│  │ │                                     │  │        │
│  │ │ [ Utiliser ] [ Détails ]            │  │        │
│  │ └─────────────────────────────────────┘  │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
│  SECTION CAPACITÉS (si Vue Globale ou Capacités)   │
│  ├─────────────────────────────────────────┤        │
│  │ ✨ Capacités & Traits                   │        │
│  │ [Tout] [Actions] [Bonus] [Réactions]   │  ← Sous-tabs
│  │ [Passives] [Traits] [Dons]            │        │
│  ├─────────────────────────────────────────┤        │
│  │                                         │        │
│  │ ┌─ Feature Card ────────────────────┐   │        │
│  │ │ Rage                      Niv. 1  │   │        │
│  │ │                      [Action]     │   │        │
│  │ │ ●●●○○  Repos long                │   │  ← Pips de ressources
│  │ │ ▼                                │   │        │
│  │ └───────────────────────────────────┘   │        │
│  │                                         │        │
│  └─────────────────────────────────────────┘        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 📐 Hiérarchie Visuelle Implémentée

### 1. Stats Rapides (Header)
```
┌─────────┬─────────┬─────────┬─────────┐
│   🛡️   │   ⚡    │   ⭐    │   🔄    │
│   CA    │  Init   │  Bonus  │  Repos  │
│   16    │   +2    │   +3    │         │
└─────────┴─────────┴─────────┴─────────┘
```

### 2. Combat Action Cards

**Section Primaire (Gros chiffres):**
```
TOUCHER          DÉGÂTS              📐 Portée
  +8             1d8+4 (8)           1.5m
```

**Section Secondaire (Ressources):**
```
●●●○○  (pips visuels)  3/5 charges  • Repos long
```

**Section Tertiaire (Tags):**
```
[Versatile] [Magique] [Mêlée] [Finesse]
```

**Code couleur par type d'action:**
- 🔴 **Action**: `border-left: 4px solid #ef4444`
- 🟠 **Bonus**: `border-left: 4px solid #f59e0b`
- 🔵 **Réaction**: `border-left: 4px solid #3b82f6`
- 🟣 **Limité**: `border-left: 4px solid #8b5cf6`

### 3. Feature Cards

**Organisation par catégorie visuelle:**
```
┌─ Rage ──────────────────────────────┐  ← Border rouge = Action
│                              Niv. 1 │
│                       [Action]      │
│ ●●●○○      Repos long               │  ← Pips cliquables
│ Description de la capacité...      │  ← Accordéon
└─────────────────────────────────────┘

┌─ Attaque sournoise ─────────────────┐  ← Border orange = Bonus
│                            Niv. 1  │
│                     [Bonus]        │
│ Passive                            │
└─────────────────────────────────────┘

┌─ Vision dans le noir ───────────────┐  ← Border violet = Trait
│                           [Trait]   │
│ Passive                            │
└─────────────────────────────────────┘
```

## 📁 Fichiers Modifiés/Créés

### Nouveau Fichier
**`src/pages/CombatFeaturesPage.tsx`** (588 lignes)
- Page unifiée complète
- Navigation par onglets (Vue Globale / Combat / Capacités)
- Sous-navigation par catégories
- Gestion des ressources avec pips visuels
- Modal de repos court/long
- Organisation optimale des capacités

### Modifications

**`src/App.tsx`**
- Ajout de l'import `CombatFeaturesPage`
- Ajout de la route `/combat-features`

**`src/components/BottomNav.tsx`**
- Remplacement des items séparés "Combat" + "Capacités" par un seul item "Combat" pointant vers `/combat-features`
- Nouvelle icône `BoltIcon` pour le bouton unifié
- Navigation simplifiée: Accueil → Perso → **Combat** → Sorts → Sac

## 🎮 Fonctionnalités Clés

### 1. Navigation Intelligente

**3 Modes de Vue:**
- **Vue Globale** (`viewMode: 'all'`): Affiche Combat ET Capacités
- **Combat** (`viewMode: 'combat'`): Uniquement les actions de combat
- **Capacités** (`viewMode: 'features'`): Uniquement les capacités/traits

**Sous-catégories Combat:**
- Armes (équipement)
- Actions
- Actions Bonus
- Réactions
- Limitées (avec ressources)

**Sous-catégories Capacités:**
- Tout
- Actions (capacités de classe)
- Actions Bonus
- Réactions
- Passives
- Traits (raciaux)
- Dons

### 2. Gestion des Ressources

**Trackers Visuels (Pips):**
```typescript
● ● ● ○ ○  (3/5 charges utilisées)
↑ ↑ ↑     (actives = couleur primaire)
      ↑ ↑ (vides = gris)
```

- Cliquer sur un pip vide → Utilise une charge
- Affichage du type de repos nécessaire
- Intégration avec `trackedResources` du store

### 3. Recalcul Automatique

Le système détecte automatiquement les changements et recalcule:
```typescript
// Quand équipement change
recalculateActions() → resolvedActions

// Quand ressource utilisée
consumeResource(id, 1) → Met à jour uniquement les pips
```

### 4. Répos Intégré

**Modal de Repos:**
```
┌─ Repos ──────────────────────────────┐
│                                      │
│ [☀️] Repos court                    │
│     1 heure • Ressources limitées     │
│                                      │
│ [🌙] Repos long                     │
│     8 heures • Toutes ressources    │
│                                      │
└──────────────────────────────────────┘
```

- **Repos court**: Restore uniquement les ressources marquées `"short"`
- **Repos long**: Restore toutes les ressources sauf `"never"`

## 🎨 Design System

### Couleurs par Type

| Type | Hex | Utilisation |
|------|-----|-------------|
| Action | `#ef4444` | Attaques, Actions de classe |
| Bonus | `#f59e0b` | Actions bonus, Furie |
| Réaction | `#3b82f6` | Esquive, Contre-attaque |
| Passive | `#10b981` | Traits toujours actifs |
| Trait | `#8b5cf6` | Traits raciaux |
| Don | `#ec4899` | Feats |
| Limité | `#8b5cf6` | Rage, Ki, etc. |

### Espace et Hiérarchie

```
Header (stats rapides):  p-4
Section headers:         text-lg font-bold
Action cards:           p-4, gap-3, border-left-4px
Feature cards:          p-3, gap-2, border-left-3px
Tags:                   text-[10px], px-2, py-0.5
```

## 🔄 Intégration avec le Combat Engine

La page utilise le système Aurora V2:

```
Character + Equipped Items
        ↓
applyCharacterRules()      ← Applique rules Aurora
        ↓
generateResolvedActions()  ← Calcule bonus/dégâts
        ↓
CombatFeaturesPage         ← Affiche dans UI unifiée
```

## 📱 Responsive

**Mobile (default):**
- Stats rapides: grid-cols-4
- Navigation: icones + labels courts
- Cards: full width

**Desktop (md+):**
- Navigation: labels complets
- Sections: peuvent être side-by-side en mode "all"

## ✅ Livrable

**Fichier principal:** `src/pages/CombatFeaturesPage.tsx` (588 lignes)

**Routes:**
- URL: `/combat-features`
- Navigation: Via bouton "Combat" dans la bottom nav

**Anciennes pages conservées:**
- `/combat` → CombatPage (original)
- `/features` → FeaturesPage (original)

La nouvelle page est accessible via la navigation principale et remplace l'expérience précédente par une interface unifiée et plus lisible ! 🎉
