# Plan de Refonte UI - Besace

## Analyse Comparative - Résumé

### Structures existantes analysées :
1. **D&D Beyond** - Fiche officielle numérique (tabs, sidebar, cards)
2. **Foundry VTT (Tidy 5e)** - Layout modulaire, favoris, grid/list
3. **PDFs officiels** - 3 pages: Combat, Personality, Spells
4. **Aides FR** - Simplifié, 2-3 pages, terminologie FR

---

## Principes Clés Dérivés

### Mobile-First
- Navigation par onglets en bas (comme D&D Beyond mobile)
- Accordéons pour sections longues
- Touch targets 44px minimum

### Progressive Disclosure
- Infos combat visibles en un coup d'œil
- Détails en click/tap
- Sections collapseables

### Organisation D&D 5e Standard
1. **Combat** - PV, CA, Initiatives, Actions, Attaques, Slots
2. **Stats** - Caractéristiques, Sauvegardes, Compétences
3. **Capacités** - Traits, Features, Sorts
4. **Inventaire** - Équipement, Objets, Bourse
5. **Personnalité** - Background, Notes

---

## Plan de Refonte Détaillé

### Phase 1: Structure Globale (Navigation)

#### 1.1 Bottom Navigation (Mobile-first)
```
┌─────────────────────────────────────┐
│           CONTENU ACTUEL            │
├─────┬─────┬─────┬─────┬─────┬───────┤
│ 🏠  │ ⚔️  │ ✨  │ 🎒  │ 📖  │  ⋮   │
│Accueil-Combat|Sorts|Inven|Notes|Plus│
└─────┴─────┴─────┴─────┴─────┴───────┘
```

**Onglets:**
- **Accueil** - Fiche principale condensée
- **Combat** - Attaques, jets, conditions
- **Grimoire** - Sorts, slots, préparation
- **Inventaire** - Équipement, objets
- **Plus** - Notes,背景, paramètres

### Phase 2: Fiche Principal (Accueil)

#### 2.1 Header Compact
- Avatar + Nom + Niveau
- Classe • Race
- Boutons: Niv+, Export, Menu

#### 2.2 Bloc Combat (top priority - toujours visible)
```
┌────────────────────────────────────┐
│  PV: 45/65  [████████░░]  ±  CA:18 │
│  Init:+3  Actions:1/1  Bonus:1/1    │
│  Conditions: [Charmé] [Prone]       │
└────────────────────────────────────┘
```

#### 2.3 Caractéristiques (6 cols compact)
- STR DEX CON INT WIS CHA
- Score + Mod + indicateur save

#### 2.4 Accès Rapides (2-3 liens max)
- Attaques → Combat
- Compétences → Voir toutes
- Slots → Grimoire

### Phase 3: Page Combat

#### 3.1 Attaques (优先)
- Liste attacks avec:
  - Nom, Bonus, Dégâts, Type
  - Bouton roll rapide
  - Modifier/Supprimer

#### 3.2 Conditions Tracker
- Badge conditions actives
- Click pour ajouter/retirer

#### 3.3 Ressources Combat
- Temp HP
- Slots utilisés
- Actions restantes

### Phase 4: Grimoire Réorganisé

#### 4.1 Organisation par Niveau
```
Tours de magie (4/5)
───
Niveau 1 (3/4 slots) ████
├── Boule de feu (préparé)
├── Soins
└── Bouclier
───
Niveau 2 (2/3 slots) ███
├── ...
```

#### 4.2 Filtres Visuels
- Toggle: Preparés / Tous
- Filter: École, Niveau
- Search

#### 4.3 Slot Tracker
- Visual pips (cercles)
- Click pour utiliser/réinitialiser
- Reset long rest

### Phase 5: Inventaire

#### 5.1 Sections Collapseables
- Équipements équipés
- Sac à dos (autres)
- Objets magiques (avec attunement)
- Bourse

#### 5.2 Indicateurs Visuels
- 🔪 Équipé
- ✨ Magique (rareté couleur)
- ⚓ Attunement (3 max)

---

## Comparaison Avant/Après

| Avant | Après |
|-------|-------|
| Navigation top link | Bottom nav mobile-first |
| Tout sur une page | Onglets spécialisés |
| Stats séparés | Bloc combat unifié |
| Sorts non visibles | Grimoire structuré |
| Pas de conditions | Tracker conditions |
| Pas de slots visuals | Pips visuels |

---

## Implementation Suggestion

### Step 1: Navigation
- Créer Layout avec bottom nav
- Router pour onglets

### Step 2: Fiche Accueil
- Refaire bloc combat
- Ajouter conditions
- Compacter stats

### Step 3: Grimoire
- Reformater liste spells
- Ajouter visual slots
- Améliorer filtres

### Step 4: Combat
- Améliorer attacks list
- Ajouter conditions
- Ressource tracking

### Step 5: Inventaire
- Sections collapseables
- Indicateurs magiques
- Attunement tracking

---

## Fichiers à Modifier

1. `src/components/Layout.tsx` - Ajouter bottom nav
2. `src/pages/CharacterPage.tsx` - Refaire bloc combat
3. `src/pages/SpellsPage.tsx` - Reformater grimoire  
4. `src/pages/CombatPage.tsx` - Améliorer attacks/conditions
5. `src/pages/InventoryPage.tsx` - Sections collapseables
6. Créer `src/components/BottomNav.tsx`

---

Veux-tu que je commence l'implémentation de cette refonte ?