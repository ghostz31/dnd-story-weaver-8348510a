# Plan de Refonte Besace - Inspiré d'Aurora Builder

## Vue d'ensemble

Ce document détaille la refonte complète de Besace pour intégrer les meilleures pratiques d'Aurora Builder :
- Données SRD complètes (300+ sorts, races, classes)
- Système d'IDs unique pour références croisées
- Moteur de validation (prérequis, compétences, équipement)
- Wizard de création amélioré avec validation temps réel

---

## Phase 1 : Importation des Données Aurora (Prioritaire)

### 1.1 Créer le convertisseur XML → JSON

**Fichiers à créer :**
- `scripts/convert-aurora.ts` - Script principal de conversion
- `scripts/parsers/parse-spells.ts` - Parser des sorts
- `scripts/parsers/parse-races.ts` - Parser des races
- `scripts/parsers/parse-classes.ts` - Parser des classes
- `scripts/parsers/parse-items.ts` - Parser de l'équipement

**Sources Aurora :**
- `spells.xml` → `public/data/spells-aurora.json`
- `races/*.xml` → Enrichissement de `src/data/races.ts`
- `classes/*.xml` → Enrichissement de `src/data/classes.ts`
- `items/*.xml` → Création de `src/data/items-aurora.ts`

### 1.2 Nouveaux Types de Données

**SpellV2 (enrichi) :**
```typescript
interface SpellV2 {
  id: string              // "ID_PHB_SPELL_FIREBALL"
  name: string
  nameEn: string
  source: string
  
  // Mécaniques détaillées
  level: number
  school: 'abjuration' | 'conjuration' | 'divination' | 'enchantment' | 'evocation' | 'illusion' | 'necromancy' | 'transmutation'
  castingTime: {
    type: 'action' | 'bonus' | 'reaction' | 'minute' | 'hour'
    value?: number
    condition?: string
  }
  range: {
    type: 'self' | 'touch' | 'ranged' | 'unlimited'
    distance?: number
    unit?: 'feet' | 'miles'
    area?: {
      shape: 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder'
      size: number
    }
  }
  components: {
    verbal: boolean
    somatic: boolean
    material?: {
      text: string
      consumed?: boolean
      cost?: number
    }
  }
  duration: {
    type: 'instant' | 'timed' | 'permanent' | 'special'
    concentration?: boolean
    time?: string
  }
  
  // Contenu
  description: {
    short: string
    full: string
    higherLevels?: string
  }
  
  // Listes de classes
  spellLists: string[]
  keywords: string[]
}
```

---

## Phase 2 : Système d'IDs et Références

### 2.1 Fichier de Références Central

**Fichier :** `src/data/references.ts`

Contient toutes les références standardisées :
- Compétences (SKILL_*)
- Sauvegardes (SAVE_*)
- Traits raciaux (TRAIT_*)
- Dons (FEAT_*)
- Équipement (WEAPON_*, ARMOR_*, ITEM_*)
- Capacités de classe (FEATURE_*)

### 2.2 Système de Rules Déclaratif

**Fichier :** `src/types/rules.ts`

```typescript
type Rule = GrantRule | SelectRule | StatRule | PrerequisiteRule

interface GrantRule {
  type: 'grant'
  targetType: 'proficiency' | 'language' | 'trait' | 'spell'
  targetId: string
  level?: number
}

interface SelectRule {
  type: 'select'
  name: string
  targetType: 'skill' | 'language' | 'spell' | 'trait'
  count: number
  options: string[]
  level?: number
}

interface StatRule {
  type: 'stat'
  stat: AbilityScore
  value: number
  bonus?: 'racial' | 'feat' | 'item'
}
```

---

## Phase 3 : Moteur de Validation

### 3.1 Validateur de Personnage

**Fichier :** `src/utils/validation.ts`

Fonctionnalités :
- Validation des prérequis de classe (scores minimums)
- Validation du nombre de compétences maîtrisées
- Validation de l'équipement (slots, prérequis Force/Dex)
- Calcul automatique de l'AC

### 3.2 Moteur de Rules

**Fichier :** `src/utils/rules-engine.ts`

Applique automatiquement les rules (Grant, Select, Stat) lors de la création/modification du personnage.

---

## Phase 4 : Refonte du Wizard

### 4.1 Améliorations par Étape

**RaceStep :**
- Cards avec preview des traits
- Sélection de sous-race
- Panel de description contextuelle

**AbilitiesStep :**
- 3 méthodes : Roll (4d6), Point Buy (27 pts), Standard Array
- Validation en temps réel
- Suggestions basées sur la classe

**ProficiencyStep :**
- Compteur visuel max/max
- Validation stricte
- Compétences recommandées par classe

**SpellsStep :**
- Filtres (niveau, école, recherche)
- Mode "Connus" vs "Préparés"
- Icônes composantes/concentration/rituel

**EquipmentStep :**
- Slots visuels (main principale, secondaire, armure)
- Calcul AC automatique
- Prérequis d'équipement

---

## Phase 5 : Intégration et Tests

### 5.1 Tests Unitaires
- Parser Aurora
- Moteur de rules
- Validation

### 5.2 Tests d'Intégration
- Wizard complet
- Création de personnage types

### 5.3 Migration des Données
- Script de migration des personnages existants

---

## Calendrier Estimé

| Phase | Durée | Priorité |
|-------|-------|----------|
| 1 - Données | 4h | 🔴 Haute |
| 2 - IDs/Rules | 3h | 🔴 Haute |
| 3 - Validation | 3h | 🟡 Moyenne |
| 4 - Wizard | 5h | 🟡 Moyenne |
| 5 - Tests | 2h | 🟢 Basse |

**Total : ~17 heures de développement**

---

## Fichiers Prioritaires à Modifier

### Création (nouveaux)
1. `scripts/convert-aurora.ts`
2. `src/data/references.ts`
3. `src/types/rules.ts`
4. `src/utils/rules-engine.ts`
5. `src/utils/validation.ts`

### Modification (existants)
1. `src/data/spells.ts` → Migration vers SpellV2
2. `src/data/races.ts` → Enrichissement avec Rules
3. `src/data/classes.ts` → Enrichissement avec progression niveau par niveau
4. `src/pages/wizard/*` → Amélioration UI/UX

---

## Décisions à Prendre

1. **Importer toutes les données SRD ou sélection ?**
   - Option A : Tout importer (300+ sorts, toutes les races/classes)
   - Option B : Sélection "essentiels" uniquement

2. **Remplacer ou enrichir les données existantes ?**
   - Option A : Remplacer totalement (breaking change)
   - Option B : Garder compatibilité avec migration

3. **Validation stricte ou permissive ?**
   - Option A : Bloquer si invalide (comme Aurora)
   - Option B : Avertir mais permettre (actuel)

---

*Document créé le : 16 Avril 2026*
*Prochaine étape : Commencer l'implémentation Phase 1*
