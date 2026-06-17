import { describe, it, expect } from 'vitest'
import { guerrierRef } from './references/guerrier'
import { classes } from '../../../src/data/classes'
import {
    classFeaturesByLevel, classActionsByLevel, getClassActions, getClassASILevels,
    fighterSecondWindUses,
    battleMasterDiceCount, battleMasterDieSize, battleMasterManeuversKnown,
    samuraiFightingSpirit, psiWarriorDiceCount, psiWarriorDieSize,
} from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'
import {
    getBattleMasterDiceCount as getBMDice, getBattleMasterDieSize as getBMDiceSize,
    getBattleMasterManeuversKnown as getBMManeuvers,
    getSamuraiFightingSpirit as getSamuraiFS,
    getPsiWarriorDiceCount as getPWDice, getPsiWarriorDieSize as getPWDiceSz,
    getMaxUses,
} from '../../../src/utils/feature-helpers'

const findFighterClass = () => classes.find(c => c.id === 'fighter')
const findFeatureAtLevel = (className: string, level: number) => classFeaturesByLevel[className]?.[level] || []
const getActionsAboveLevel = (className: string, minLevel: number) => getClassActions(className, minLevel)

function getFullText(dbFeature: { description: string; rules?: object[] }): string {
    return [dbFeature.description, ...(dbFeature.rules?.map(r => JSON.stringify(r).toLowerCase()) || [])].join(' ')
}

function assertKeywordsSoft(source: string, keywords: string[], label: string): boolean {
    const src = source.toLowerCase()
    let allOk = true
    for (const kw of keywords) {
        const ok = RegExp(escapeRegex(kw.toLowerCase())).test(src)
        if (!ok) allOk = false
        expect(ok, `${label} doit contenir "${kw}"`).toBe(true)
    }
    return allOk
}
function escapeRegex(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

// ============================================================================
describe('Section 1 — Fiche de classe', () => {
    const c = findFighterClass()
    it('Existe', () => expect(c).toBeDefined())
    it(`Hit d${guerrierRef.hitDie}`, () => expect(c?.hitDie).toBe(guerrierRef.hitDie))
    it(`Nom FR`, () => expect(c?.name).toBe(guerrierRef.name))
    it('Saves STR/CON', () => { expect(c?.savingThrows).toContain('str'); expect(c?.savingThrows).toContain('con') })
    it('8 compétences, 2 choix', () => { expect(c?.skillChoices.length).toBe(8); expect(c?.numSkillChoices).toBe(2) })
    it('Pas lanceur de sorts', () => expect(c?.spellcasting).toBeUndefined())
})

// ============================================================================
describe('Section 2 — Progression', () => {
    for (const entry of guerrierRef.progression) {
        it(`Niv ${entry.level} : ${entry.features.join(', ')}`, () => {
            const db = findFeatureAtLevel('fighter', entry.level)
            for (const rf of entry.features) {
                const tokens: Record<string, string[]> = {
                    'Style de combat': ['style', 'combat'],
                    'Second souffle': ['second souffle', 'second'],
                    'Fougue': ['fougue', 'surcharge'],
                    'Archétype martial': ['archétype'],
                    'Amélioration de caractéristiques': ['amélioration', 'amelioration'],
                    'Attaque supplémentaire': ['attaque supplémentaire', 'supplémentaire'],
                    'Capacité de l\'archétype martial': ['archétype'],
                    'Inflexible': ['indomptable', 'inflexible'],
                }
                const kw = tokens[rf] || [rf.toLowerCase()]
                const found = db.some(f => kw.some(k => f.name.toLowerCase().includes(k)))
                expect(found, `"${rf}" manquant niv ${entry.level} (trouvé: ${db.map(f => f.name).join(', ')})`).toBe(true)
            }
        })
    }
})

// ============================================================================
describe('Section 3 — Tables de ressources', () => {
    it('fighterSecondWindUses : 20 élts, niv1=0 niv2+=1', () => {
        expect(fighterSecondWindUses).toHaveLength(20)
        expect(fighterSecondWindUses[0]).toBe(0)
        for (let i = 1; i < 20; i++) expect(fighterSecondWindUses[i]).toBe(1)
    })
    it('battleMasterDiceCount : niv3=4, niv10=5, niv18=6', () => {
        expect(battleMasterDiceCount[2]).toBe(4)
        expect(battleMasterDiceCount[9]).toBe(5)
        expect(battleMasterDiceCount[17]).toBe(6)
    })
    it('battleMasterDieSize : niv3=d6, niv10=d10, niv18=d12', () => {
        expect(battleMasterDieSize[2]).toBe('d6')
        expect(battleMasterDieSize[9]).toBe('d10')
        expect(battleMasterDieSize[17]).toBe('d12')
    })
    it('battleMasterManeuversKnown : niv3=3, niv7=5, niv10=7, niv15=9', () => {
        expect(battleMasterManeuversKnown[2]).toBe(3)
        expect(battleMasterManeuversKnown[6]).toBe(5)
        expect(battleMasterManeuversKnown[9]).toBe(7)
        expect(battleMasterManeuversKnown[14]).toBe(9)
    })
    it('samuraiFightingSpirit : niv3+=3', () => {
        expect(samuraiFightingSpirit[2]).toBe(3)
        expect(samuraiFightingSpirit[19]).toBe(3)
    })
    it('psiWarriorDiceCount : niv3=4, niv7=6, niv13=8', () => {
        expect(psiWarriorDiceCount[2]).toBe(4)
        expect(psiWarriorDiceCount[6]).toBe(6)
        expect(psiWarriorDiceCount[12]).toBe(8)
    })
    it('psiWarriorDieSize : niv3=d6, niv11=d8, niv17=d10', () => {
        expect(psiWarriorDieSize[2]).toBe('d6')
        expect(psiWarriorDieSize[10]).toBe('d8')
        expect(psiWarriorDieSize[16]).toBe('d10')
    })
})

describe('Section 4', () => {
    it('getBMDice N1=0, N3=4, N10=5, N18=6', () => {
        expect(getBMDice(1)).toBe(0); expect(getBMDice(3)).toBe(4)
        expect(getBMDice(10)).toBe(5); expect(getBMDice(18)).toBe(6)
    })
    it('getBMDiceSize N3=d6, N10=d10, N18=d12', () => {
        expect(getBMDiceSize(3)).toBe('d6'); expect(getBMDiceSize(10)).toBe('d10'); expect(getBMDiceSize(18)).toBe('d12')
    })
    it('getBMManeuvers N3=3, N7=5, N10=7, N15=9', () => {
        expect(getBMManeuvers(3)).toBe(3); expect(getBMManeuvers(7)).toBe(5)
        expect(getBMManeuvers(10)).toBe(7); expect(getBMManeuvers(15)).toBe(9)
    })
    it('getSamuraiFS N3=3, N20=3', () => {
        expect(getSamuraiFS(3)).toBe(3); expect(getSamuraiFS(20)).toBe(3)
    })
    it('getPWDice N3=4, N7=6, N13=8', () => {
        expect(getPWDice(3)).toBe(4); expect(getPWDice(7)).toBe(6); expect(getPWDice(13)).toBe(8)
    })
    it('getPWDiceSz N3=d6, N11=d8, N17=d10', () => {
        expect(getPWDiceSz(3)).toBe('d6'); expect(getPWDiceSz(11)).toBe('d8'); expect(getPWDiceSz(17)).toBe('d10')
    })
})

// ============================================================================
describe('Section 5 — Capacités actionnables', () => {
    for (const [key, ref] of Object.entries(guerrierRef.classActions)) {
        const actions = getActionsAboveLevel('fighter', ref.availableFrom)
        const found = actions.find(a => a.key === key)
        it(`"${key}" niv ${ref.availableFrom}`, () => expect(found).toBeDefined())
        if (found) {
            it(`"${key}" restoreOn=${ref.restoreOn}`, () => expect(found.restoreOn).toBe(ref.restoreOn))
            it(`"${key}" nom+icône+desc > 10`, () => {
                expect(found.name).toBeTruthy(); expect(found.icon).toBeTruthy()
                expect(found.description.length).toBeGreaterThan(10)
            })
        }
    }
    it('ASI = 7 niveaux (4,6,8,12,14,16,19)', () => {
        expect(getClassASILevels('fighter')).toEqual([4, 6, 8, 12, 14, 16, 19])
    })
    it('getClassActions niv 5 contient actionSurge', () => {
        expect(getClassActions('fighter', 5).some(a => a.key === 'actionSurge')).toBe(true)
    })
})

// ============================================================================
describe('Section 6 — Sous-classes', () => {
    const fighterSubs = subclasses.filter(s => s.classId === 'fighter')
    it('≥8 sous-classes', () => expect(fighterSubs.length).toBeGreaterThanOrEqual(8))

    for (const [refId, refSub] of Object.entries(guerrierRef.subclasses)) {
        describe(`${refSub.name} (${refSub.source})`, () => {
            const dbSub = fighterSubs.find(s => s.id === refId)
            if (!dbSub) { it('⚠️ ABSENT', () => expect(dbSub).toBeDefined()); return }
            it('ID', () => expect(dbSub.id).toBe(refId))
            it('Nom', () => expect(dbSub.name).toBe(refSub.name))
            it('Source', () => expect(dbSub.source).toBe(refSub.source))
            it('subclassLevel=3', () => expect(dbSub.subclassLevel).toBe(3))

            const lvlIdx: Record<number, number> = {}
            for (const [lKey, fRef] of Object.entries(refSub.features)) {
                const lvl = Math.floor(parseFloat(lKey))
                if (lvlIdx[lvl] === undefined) lvlIdx[lvl] = 0
                const idx = lvlIdx[lvl]++
                const atLvl = dbSub.features.filter(f => f.level === lvl)
                const dbf = atLvl[idx]
                const sfx = atLvl.length > 1 ? ` [${idx + 1}/${atLvl.length}]` : ''
                it(`Niv ${lvl}${sfx} : "${fRef.name}"`, () => {
                    expect(dbf, `Feature #${idx + 1} manquante`).toBeDefined()
                    expect(dbf?.name.length).toBeGreaterThan(0)
                })
                if (dbf && fRef.keywords?.length) {
                    it(`Niv ${lvl}${sfx} : mots-clés`, () => assertKeywordsSoft(getFullText(dbf), fRef.keywords!, fRef.name))
                }
                if (dbf) it(`Niv ${lvl}${sfx} : desc > 10`, () => expect(dbf.description.length).toBeGreaterThan(10))
            }
        })
    }
})

// ============================================================================
describe('Section 7 — Cohérence', () => {
    it('ID fighter cohérent', () => {
        expect(findFighterClass()?.id).toBe('fighter')
        expect(classFeaturesByLevel.fighter).toBeDefined()
        expect(classActionsByLevel.fighter).toBeDefined()
    })
    it('ASI non-décroissants', () => {
        const asi = getClassASILevels('fighter')
        for (let i = 1; i < asi.length; i++) expect(asi[i]).toBeGreaterThan(asi[i - 1])
    })
    it('getMaxUses("secondWind")', () => expect(getMaxUses('secondWind', 1)).toBe(0))
    it('getMaxUses("actionSurge")', () => { expect(getMaxUses('actionSurge', 3)).toBe(1); expect(getMaxUses('actionSurge', 18)).toBe(2) })
    it('getMaxUses("indomitable")', () => { expect(getMaxUses('indomitable', 10)).toBe(1); expect(getMaxUses('indomitable', 18)).toBe(3) })
})
