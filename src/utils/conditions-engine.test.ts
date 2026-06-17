import { describe, it, expect } from 'vitest'
import {
  getConditionModifiers,
  applyExhaustionLevel,
  getConditionDescription,
  getAllConditions,
  getConditionIcon,
  getConditionColor,
} from './conditions-engine'

describe('getConditionModifiers', () => {
  it('returns neutral modifiers for empty conditions', () => {
    const mods = getConditionModifiers([])
    expect(mods.advantageAttacks).toBe(false)
    expect(mods.disadvantageAttacks).toBe(false)
    expect(mods.canAct).toBe(true)
    expect(mods.speedMultiplier).toBe(1)
    expect(mods.speedFlat).toBeNull()
  })

  it('applies poisoned disadvantage', () => {
    const mods = getConditionModifiers(['poisoned'])
    expect(mods.disadvantageAttacks).toBe(true)
  })

  it('applies invisible advantage', () => {
    const mods = getConditionModifiers(['invisible'])
    expect(mods.advantageAttacks).toBe(true)
    expect(mods.disadvantageAgainst).toBe(true)
  })

  it('applies paralyzed effects', () => {
    const mods = getConditionModifiers(['paralyzed'])
    expect(mods.canAct).toBe(false)
    expect(mods.canReact).toBe(false)
    expect(mods.speedFlat).toBe(0)
    expect(mods.advantageAgainst).toBe(true)
    expect(mods.criticalFromMelee).toBe(true)
  })

  it('applies grappled speed reduction', () => {
    const mods = getConditionModifiers(['grappled'])
    expect(mods.speedFlat).toBe(0)
  })

  it('combines multiple conditions', () => {
    const mods = getConditionModifiers(['grappled', 'poisoned'])
    expect(mods.speedFlat).toBe(0)
    expect(mods.disadvantageAttacks).toBe(true)
  })
})

describe('applyExhaustionLevel', () => {
  it('level 0 has no effects', () => {
    const mods = applyExhaustionLevel(0)
    expect(mods.disadvantageAttacks).toBe(false)
    expect(mods.speedMultiplier).toBe(1)
    expect(mods.speedFlat).toBeNull()
  })

  it('level 1 gives disadvantage on ability checks', () => {
    const mods = applyExhaustionLevel(1)
    expect(mods.disadvantageAttacks).toBe(true)
  })

  it('level 2 halves speed', () => {
    const mods = applyExhaustionLevel(2)
    expect(mods.speedMultiplier).toBe(0.5)
  })

  it('level 5 zeroes speed', () => {
    const mods = applyExhaustionLevel(5)
    expect(mods.speedFlat).toBe(0)
  })
})

describe('getConditionDescription', () => {
  it('returns description for known conditions', () => {
    const desc = getConditionDescription('invisible')
    expect(desc).toContain('avantage')
  })

  it('returns the condition name for unknown conditions', () => {
    expect(getConditionDescription('unknown')).toBe('unknown')
  })
})

describe('getAllConditions', () => {
  it('returns all condition names', () => {
    const conditions = getAllConditions()
    expect(conditions).toContain('blinded')
    expect(conditions).toContain('poisoned')
    expect(conditions).toContain('invisible')
    expect(conditions.length).toBeGreaterThan(10)
  })
})

describe('getConditionIcon and getConditionColor', () => {
  it('returns icon for known conditions', () => {
    expect(getConditionIcon('poisoned')).toBe('☠️')
    expect(getConditionIcon('invisible')).toBe('👻')
  })

  it('returns color for known conditions', () => {
    expect(getConditionColor('poisoned')).toBe('#22c55e')
    expect(getConditionColor('invisible')).toBe('#3b82f6')
  })
})
