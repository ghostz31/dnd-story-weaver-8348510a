# Besace Data Schemas

TypeScript interfaces used in the Besace application. All new data must conform to these types.

## Character (`src/types/character.ts`)

```typescript
interface AbilityScores {
    str: number; dex: number; con: number
    int: number; wis: number; cha: number
}

interface Race {
    id: string; name: string; nameEn: string
    abilityBonuses: Partial<AbilityScores>
    speed: number
    size: 'Très petit' | 'Petit' | 'Moyen' | 'Grand'
    traits: string[]; languages: string[]
    subraces?: Subrace[]
}

interface Subrace {
    id: string; name: string
    abilityBonuses: Partial<AbilityScores>
    traits: string[]
}

interface CharacterClass {
    id: string; name: string; nameEn: string
    hitDie: number
    primaryAbility: keyof AbilityScores
    savingThrows: (keyof AbilityScores)[]
    skillChoices: string[]; numSkillChoices: number
    armorProficiencies: string[]
    weaponProficiencies: string[]
    startingEquipment: string[]
    spellcasting?: {
        ability: keyof AbilityScores
        cantripsKnown: number[]    // per level
        spellsKnown?: number[]     // per level
        spellSlots: number[][]     // [level][slot_level]
    }
}
```

## Spells (`src/types/spell.ts`)

```typescript
interface Spell {
    name: string; level: number; school: string
    castingTime: string; range: string
    components: string; duration: string
    classes: string[]           // French class names
    description: string
    source?: string; ritual?: boolean
}
```

Schools: Abjuration, Invocation, Divination, Enchantement, Évocation, Illusion, Nécromancie, Transmutation

## Combat (`src/types/combat.ts`)

```typescript
type DamageType = 'slashing' | 'piercing' | 'bludgeoning' | 'fire' | 'cold'
    | 'lightning' | 'thunder' | 'acid' | 'poison' | 'radiant' | 'necrotic'
    | 'force' | 'psychic'
type AttackType = 'melee' | 'ranged' | 'spell'

interface Attack {
    id: string; name: string; type: AttackType
    ability: 'str' | 'dex' | 'int' | 'wis' | 'cha'
    isProficient: boolean
    damageRoll: string; damageType: DamageType
    bonusDamage?: number; range?: string
    properties?: string[]; magical?: boolean; description?: string
}
```

## Inventory (`src/types/inventory.ts`)

```typescript
type ItemType = 'weapon' | 'armor' | 'gear' | 'consumable' | 'wondrous' | 'tool' | 'other'
type ItemRarity = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact'

interface InventoryItem {
    id: string; name: string; type: ItemType
    quantity: number; weight: number   // in lbs
    equipped: boolean; magical: boolean
    rarity?: ItemRarity; attunement?: boolean; attuned?: boolean
    description?: string; value?: number  // in gp
    // Weapon properties
    damage?: string; damageType?: string; properties?: string[]
    range?: string | { normal: number; long: number }
    versatileDamage?: string
    // Armor properties
    armorClass?: number
    armorCategory?: 'light' | 'medium' | 'heavy' | 'shield'
    addDex?: boolean; maxDex?: number; stealthDisadvantage?: boolean
}

interface Currency {
    pp: number; gp: number; ep: number; sp: number; cp: number
}
```
