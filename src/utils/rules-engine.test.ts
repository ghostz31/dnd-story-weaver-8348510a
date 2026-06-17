import { describe, it, expect } from 'vitest'
import {
  getProficiencyBonus,
  getAbilityModifier,
  evaluateExpression,
  calculateInitiative,
  calculateAC,
  applyRules,
} from './rules-engine'
import type { Character } from '../types/character'

function makeCharacter(partial: Partial<Character> = {}): Character {
  return {
    id: 'test',
    name: 'Test',
    race: { id: 'human', name: 'Humain', nameEn: 'Human', abilityBonuses: {}, speed: 30, size: 'Moyen', traits: [], languages: [] },
    class: { id: 'fighter', name: 'Guerrier', nameEn: 'Fighter', hitDie: 10, primaryAbility: 'str', savingThrows: ['str', 'con'], skillChoices: [], numSkillChoices: 2, armorProficiencies: [], weaponProficiencies: [], startingEquipment: [] },
    level: 5,
    background: '',
    alignment: '',
    abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 },
    hp: { current: 45, max: 45, temp: 0 },
    ac: 16,
    initiative: 2,
    speed: 30,
    proficiencyBonus: 3,
    actionsPerTurn: 1,
    bonusActionsPerTurn: 1,
    reactionsPerTurn: 1,
    skillProficiencies: [],
    savingThrowProficiencies: [],
    languages: [],
    toolProficiencies: [],
    equipment: [],
    currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 },
    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    backstory: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  }
}

describe('getProficiencyBonus', () => {
  it('returns +2 at level 1', () => {
    expect(getProficiencyBonus(1)).toBe(2)
  })

  it('returns +3 at level 5', () => {
    expect(getProficiencyBonus(5)).toBe(3)
  })

  it('returns +4 at level 9', () => {
    expect(getProficiencyBonus(9)).toBe(4)
  })

  it('returns +6 at level 17', () => {
    expect(getProficiencyBonus(17)).toBe(6)
  })
})

describe('getAbilityModifier', () => {
  it('returns 0 for score 10', () => {
    expect(getAbilityModifier(10)).toBe(0)
  })

  it('returns +3 for score 16', () => {
    expect(getAbilityModifier(16)).toBe(3)
  })

  it('returns -1 for score 8', () => {
    expect(getAbilityModifier(8)).toBe(-1)
  })

  it('returns +5 for score 20', () => {
    expect(getAbilityModifier(20)).toBe(5)
  })
})

describe('evaluateExpression', () => {
  it('evaluates simple math', () => {
    expect(evaluateExpression('2 + 3', { character: makeCharacter(), source: 'test', sourceId: 'test' })).toBe(5)
  })

  it('evaluates level variable', () => {
    const ctx = { character: makeCharacter({ level: 10 }), source: 'test', sourceId: 'test' }
    expect(evaluateExpression('$(level) + 5', ctx)).toBe(15)
  })

  it('evaluates proficiency variable', () => {
    const ctx = { character: makeCharacter({ level: 5 }), source: 'test', sourceId: 'test' }
    expect(evaluateExpression('$(proficiency)', ctx)).toBe(3)
  })

  it('evaluates ability modifier', () => {
    const ctx = { character: makeCharacter({ abilityScores: { str: 16, dex: 14, con: 14, int: 10, wis: 12, cha: 8 } }), source: 'test', sourceId: 'test' }
    expect(evaluateExpression('$(str:modifier)', ctx)).toBe(3)
    expect(evaluateExpression('$(cha:modifier)', ctx)).toBe(-1)
  })
})

describe('calculateInitiative', () => {
  it('returns DEX modifier', () => {
    const char = makeCharacter({ abilityScores: { str: 10, dex: 16, con: 10, int: 10, wis: 10, cha: 10 } })
    expect(calculateInitiative(char)).toBe(3)
  })
})

describe('calculateAC', () => {
  it('returns character AC', () => {
    const char = makeCharacter({ ac: 18 })
    expect(calculateAC(char)).toBe(18)
  })

  it('defaults to 10 when no AC set', () => {
    const char = makeCharacter({ ac: 0 })
    expect(calculateAC(char)).toBe(10)
  })
})

describe('applyRules', () => {
  it('applies grant rules for skills', () => {
    const char = makeCharacter()
    const result = applyRules([
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_PERCEPTION' }
    ], { character: char, source: 'test', sourceId: 'test' })

    expect(result.success).toBe(true)
    expect(char.skillProficiencies).toContain('perception')
  })

  it('applies stat rules for speed', () => {
    const char = makeCharacter({ speed: 30 })
    const result = applyRules([
      { type: 'stat', stat: 'speed', value: 3 }
    ], { character: char, source: 'test', sourceId: 'test' })

    expect(result.success).toBe(true)
    expect(char.speed).toBe(33)
  })

  it('applies stat rules for ability scores', () => {
    const char = makeCharacter({ abilityScores: { str: 14, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
    const result = applyRules([
      { type: 'stat', stat: 'str', value: 2 }
    ], { character: char, source: 'test', sourceId: 'test' })

    expect(result.success).toBe(true)
    expect(char.abilityScores.str).toBe(16)
  })

  it('caps ability scores at 20', () => {
    const char = makeCharacter({ abilityScores: { str: 19, dex: 10, con: 10, int: 10, wis: 10, cha: 10 } })
    applyRules([
      { type: 'stat', stat: 'str', value: 4 }
    ], { character: char, source: 'test', sourceId: 'test' })

    expect(char.abilityScores.str).toBe(20)
  })

  it('applies language grants', () => {
    const char = makeCharacter()
    applyRules([
      { type: 'grant', targetType: 'language', targetId: 'Elvish' }
    ], { character: char, source: 'test', sourceId: 'test' })

    expect(char.languages).toContain('Elvish')
  })
})
