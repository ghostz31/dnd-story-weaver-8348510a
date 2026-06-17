import { describe, it, expect } from 'vitest'
import { calculateACFromInventory } from './combat-engine'
import type { Character } from '../types/character'
import type { InventoryItem } from '../types/inventory'

// Helper pour créer un personnage minimal
function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 'test',
    name: 'Test',
    race: { id: 'human', name: 'Humain' },
    class: { id: 'fighter', name: 'Guerrier', nameEn: 'Fighter', hitDie: 10, primaryAbility: 'str', savingThrows: ['str', 'con'], skillChoices: [], numSkillChoices: 0, armorProficiencies: [], weaponProficiencies: [], startingEquipment: [] },
    level: 1,
    abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 10, cha: 10 },
    classOptions: {},
    ...overrides,
  } as Character
}

// Helper pour créer un item d'armure
function makeArmor(ac: number, category: 'light' | 'medium' | 'heavy' | 'shield' = 'light', addDex = true, maxDex?: number): InventoryItem {
  return {
    id: 'armor-test',
    name: 'Armure test',
    type: 'armor',
    armorCategory: category,
    armorClass: ac,
    addDex,
    maxDex,
    equipped: true,
    quantity: 1,
    weight: 10,
  } as InventoryItem
}

describe('calculateACFromInventory', () => {
  it('calculates base AC without armor', () => {
    const char = makeCharacter()
    const items: InventoryItem[] = []
    expect(calculateACFromInventory(char, items)).toBe(12) // 10 + DEX 14 (+2)
  })

  it('adds shield bonus', () => {
    const char = makeCharacter()
    const items = [makeArmor(2, 'shield')]
    expect(calculateACFromInventory(char, items)).toBe(14) // 10 + 2 DEX + 2 shield
  })

  it('applies Defense fighting style when wearing armor', () => {
    const char = makeCharacter({
      classOptions: { fightingStyle: 'defense' },
    })
    const items = [makeArmor(12, 'light')]
    expect(calculateACFromInventory(char, items)).toBe(15) // 12 armor + 2 DEX + 1 Defense
  })

  it('does NOT apply Defense fighting style without armor', () => {
    const char = makeCharacter({
      classOptions: { fightingStyle: 'defense' },
    })
    const items: InventoryItem[] = []
    expect(calculateACFromInventory(char, items)).toBe(12) // 10 + 2 DEX, no +1
  })

  it('applies Barbarian unarmored defense', () => {
    const char = makeCharacter({
      class: { id: 'barbarian', name: 'Barbare', nameEn: 'Barbarian', hitDie: 12, primaryAbility: 'str', savingThrows: ['str', 'con'], skillChoices: [], numSkillChoices: 0, armorProficiencies: [], weaponProficiencies: [], startingEquipment: [] },
      abilityScores: { str: 10, dex: 14, con: 16, int: 10, wis: 10, cha: 10 },
    })
    const items: InventoryItem[] = []
    expect(calculateACFromInventory(char, items)).toBe(15) // 10 + 2 DEX + 3 CON
  })

  it('applies Monk unarmored defense', () => {
    const char = makeCharacter({
      class: { id: 'monk', name: 'Moine', nameEn: 'Monk', hitDie: 8, primaryAbility: 'dex', savingThrows: ['str', 'dex'], skillChoices: [], numSkillChoices: 0, armorProficiencies: [], weaponProficiencies: [], startingEquipment: [] },
      abilityScores: { str: 10, dex: 14, con: 10, int: 10, wis: 16, cha: 10 },
    })
    const items: InventoryItem[] = []
    expect(calculateACFromInventory(char, items)).toBe(15) // 10 + 2 DEX + 3 WIS
  })
})
