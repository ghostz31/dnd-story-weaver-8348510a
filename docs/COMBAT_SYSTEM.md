# Système de Combat V2 - Documentation

## 🎯 Objectif

Créer une interface "Combat Actions" interconnectée en temps réel avec la base de données Aurora V2. Le système résout toutes les dépendances (Race, Classe, Niveau, Équipement, Dons) pour afficher des actions prêtes à l'emploi, sans calcul mental pour l'utilisateur.

## 🏗️ Architecture

### 1. Combat Engine (`src/utils/combat-engine.ts`)

Le moteur de calcul qui résout toutes les interdépendances.

#### Algorithme de Bonus de Touche

```typescript
calculateAttackBonus(character, weapon, options) => AttackBreakdown

Total = Caractéristique de base
      + Bonus de maîtrise (si proficient)
      + Bonus magique des objets (+1, +2, +3)
      + Bonus des dons (Archery: +2)
```

**Logique de caractéristique:**
- Sorts: Utilise la caractéristique d'incantation de la classe
- Armes à distance/jet: DEX
- Armes fines: max(STR, DEX)
- Armes de mêlée: STR par défaut

**Sources de bonus magiques:**
- Bonus de l'arme (nom: "Épée longue +1")
- Bonus d'équipement (anneaux, amulettes)
- Buffs temporaires

#### Algorithme de Dégâts

```typescript
calculateDamage(character, weapon, options) => DamageBreakdown

Expression = Dés de l'arme
           + Modificateur de caractéristique
           + Bonus magique
           
Critique: Dés de l'arme lancés une fois de plus
```

**Spéciales:**
- Armes lourdes à deux mains: Pas de mod de FOR aux dégâts
- Armes fines: Même logique que pour le bonus de touche

### 2. Structure de Données: ResolvedAction

```typescript
interface ResolvedAction {
  id: string                    // ID unique de l'action
  name: string                  // Nom localisé
  nameEn: string               // Nom anglais
  
  source: {
    type: 'item' | 'feature' | 'spell' | 'race' | 'feat' | 'class'
    id: string
    name: string               // Pour affichage "Source: Épée longue"
  }
  
  actionType: 'action' | 'bonus' | 'reaction' | 'free' | 'limited'
  
  attack?: {
    bonus: number              // Total calculé
    breakdown: AttackBreakdown  // Détail de chaque source
    advantage: boolean
    disadvantage: boolean
  }
  
  damage?: {
    dice: string               // Ex: "2d6+4"
    average: number           // 11
    type: string              // "slashing"
    versatile?: string         // "1d10" si arme versatile
    breakdown: DamageBreakdown
  }
  
  range?: {
    normal: number            // mètres
    long?: number
  }
  
  resource?: {
    type: 'slot' | 'charge' | 'consumable' | 'feature'
    level?: number            // Pour les emplacements de sort
    current: number
    max: number
    resetOn: 'short' | 'long' | 'dawn' | 'never'
  }
  
  tags: ActionTag[]           // ['finesse', 'magic', 'reach']
  
  description: string
  shortDescription: string
}
```

### 3. State Management (`src/stores/combatStore.ts`)

Gestion d'état avec Zustand pour les calculs temps réel.

#### Flux de données:

```
1. character + equippedItems
   ↓
2. applyCharacterRules()  // Applique les rules Aurora
   ↓
3. generateResolvedActions()  // Calcule les actions
   ↓
4. extractResources()  // Extrait les ressources trackables
   ↓
5. resolvedActions + trackedResources
```

#### Gestion des changements:

```typescript
// Quand un item est équipé:
equipItem(item) {
  equippedItems.push(item)
  recalculateActions()  // Recalcul automatique
}

// Quand une ressource est utilisée:
consumeResource(id, amount) {
  trackedResources[id].current -= amount
  // Pas besoin de recalculer!
}
```

### 4. UI Components

#### ActionCard Component

**Hiérarchie visuelle:**

```
┌─────────────────────────────────────┐
│ ▓▓▓▓ Couleur = type d'action ▓▓▓▓▓ │  ← Indicateur primaire
├─────────────────────────────────────┤
│ Nom de l'action    [Action Bonus] │  ← Header
│ Source: Épée longue +1              │
├─────────────────────────────────────┤
│ TOUCHER    │    DÉGÂTS             │  ← Section PRIMAIRE
│   +8       │    2d6+4 (11)          │  ← Gros chiffres
│            │    tranchant           │
├─────────────────────────────────────┤
│ 📐 1.5m    │    Charges: ●●●○○     │  ← Section SECONDAIRE
├─────────────────────────────────────┤
│ [Finesse] [Magique] [Légère]       │  ← Tags TERTIAIRES
├─────────────────────────────────────┤
│ Voir les détails ▼                  │  ← Accordéon DÉTAILS
└─────────────────────────────────────┘
```

**Couleurs par type d'action:**
- Action (rouge): `#ef4444`
- Action Bonus (orange): `#f59e0b`
- Réaction (bleu): `#3b82f6`
- Action Libre (vert): `#10b981`
- Usage Limité (violet): `#8b5cf6`

**Couleurs des tags:**
- Finesse (rose): `#ec4899`
- Lourde (rouge foncé): `#dc2626`
- Légère (vert lime): `#84cc16`
- 2M (orange): `#f97316`
- Polyvalente (cyan): `#06b6d4`
- Magique (violet): `#a855f7`

## 📦 Modèle de Données: ResolvedAction

Le modèle aplati pour l'UI contient toutes les valeurs calculées:

```json
{
  "id": "weapon_ID_PHB_WEAPON_LONGSWORD",
  "name": "Épée longue +1",
  "nameEn": "Longsword +1",
  "source": {
    "type": "item",
    "id": "ID_PHB_WEAPON_LONGSWORD",
    "name": "Épée longue +1"
  },
  "actionType": "action",
  "attack": {
    "bonus": 8,
    "breakdown": {
      "baseAbility": {
        "ability": "str",
        "modifier": 3,
        "label": "Force"
      },
      "proficiency": {
        "has": true,
        "bonus": 3,
        "label": "Maîtrise (+3)"
      },
      "magicBonus": {
        "total": 1,
        "items": [{"name": "Épée longue +1", "bonus": 1}]
      },
      "featBonus": {
        "total": 1,
        "feats": [{"name": "Maître d'armes", "bonus": 1}]
      },
      "conditional": {
        "advantage": [],
        "disadvantage": []
      }
    },
    "advantage": false,
    "disadvantage": false
  },
  "damage": {
    "dice": "1d8+4",
    "average": 8,
    "type": "slashing",
    "versatile": "1d10",
    "breakdown": {
      "ability": {"modifier": 3, "added": true, "label": "STR"},
      "weapon": {"dice": "1d8"},
      "magic": {"bonus": 1}
    }
  },
  "range": {"normal": 1.5},
  "tags": ["versatile", "magic", "melee"],
  "description": "...",
  "shortDescription": "Attaque avec Épée longue +1"
}
```

## 🔄 State Management: Rafraîchissement

### Déclencheurs de recalcul:

1. **Changement d'équipement** (équipé/déséquipé)
   - `equipItem()` → `recalculateActions()`
   
2. **Changement de niveau**
   - `initializeCombat()` avec nouveau niveau
   
3. **Changement de caractéristiques (ASI)**
   - `applyCharacterRules()` recalcule tout

### Préservation des ressources:

```typescript
recalculateActions() {
  // 1. Générer nouvelles actions
  const newActions = generateResolvedActions(...)
  
  // 2. Fusionner ressources existantes
  const mergedResources = {
    ...newResources,
    // Préserver l'état actuel
    current: Math.min(existing.current, new.max)
  }
}
```

## 🎮 Utilisation

### Initialiser le combat:

```typescript
const { initializeCombat } = useCombatStore()

useEffect(() => {
  initializeCombat(character, equippedItems)
}, [character])
```

### Afficher les actions:

```typescript
const actions = useCombatActions() // Filtré par catégorie sélectionnée

return (
  <div className="space-y-3">
    {actions.map(action => (
      <ActionCard 
        key={action.id} 
        action={action}
        onUse={() => handleUseAction(action)}
      />
    ))}
  </div>
)
```

### Utiliser une ressource:

```typescript
const { use: consumeResource } = useResourceTracker('rage')

const canRage = consumeResource(1) // true si assez de charges
```

### Repos:

```typescript
const { restoreAllResources } = useCombatStore()

// Repos court: restore les ressources "short"
restoreAllResources('short')

// Repos long: restore toutes les ressources sauf "never"
restoreAllResources('long')
```

## 📁 Fichiers Créés

| Fichier | Description | Lignes |
|---------|-------------|--------|
| `src/utils/combat-engine.ts` | Moteur de calcul des bonus et dégâts | 445 |
| `src/stores/combatStore.ts` | State management Zustand | 267 |
| `src/components/combat/ActionCard.tsx` | Composant carte d'action | 298 |
| `src/pages/CombatPageV2.tsx` | Page de combat complète | 292 |
| `src/combat-system/index.ts` | Exports du système | 39 |

**Total: 1,341 lignes de code**

## 🚀 Fonctionnalités Clés

- ✅ Calcul automatique du bonus de touche avec toutes les sources
- ✅ Calcul des dégâts avec expression complète (dés + mods)
- ✅ Détection automatique de la caractéristique appropriée
- ✅ Support des armes fines, lourdes, à distance
- ✅ Bonus magiques des objets (+1, +2, +3)
- ✅ Bonus de dons (Archery +2, etc.)
- ✅ Traçabilité de la source de chaque bonus
- ✅ UI hiérarchisée avec couleurs par type
- ✅ Trackers de ressources visuels (pips)
- ✅ Recalcul automatique sur changement d'équipement
- ✅ Restauration des ressources (repos court/long)
- ✅ Persistance de l'état des ressources

## 🔧 Intégration avec Aurora V2

Le système utilise les données Aurora:

```
Données Aurora → Combat Engine → ResolvedActions → UI
     (JSON)        (Calcul)        (Aplati)      (Affichage)
```

Les rules Aurora (`GrantRule`, `StatRule`) sont appliquées via `applyCharacterRules()` avant le calcul des actions de combat.
