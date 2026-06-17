import { describe, it, expect } from 'vitest'
import { roublardRef } from './references/roublard'
import { classes } from '../../../src/data/classes'
import {
    classFeaturesByLevel, classActionsByLevel, getClassActions, getClassASILevels,
    rogueSneakAttackDice,
} from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'
import {
    getRogueSneakAttackDice, getRogueExpertiseCount,
} from '../../../src/utils/feature-helpers'
import { getProficiencyBonus } from '../../../src/utils/rules-engine'

const findRogueClass = () => classes.find(c => c.id === 'rogue')
const findFeatureAtLevel = (className: string, level: number) => classFeaturesByLevel[className]?.[level] || []
const getActionsAboveLevel = (className: string, minLevel: number) => getClassActions(className, minLevel)

function getFullText(dbFeature: { description: string; rules?: object[] }): string {
    return [dbFeature.description, ...(dbFeature.rules?.map(r => JSON.stringify(r).toLowerCase()) || [])].join(' ')
}
function assertKeywordsSoft(source: string, keywords: string[], label: string): boolean {
    const src = source.toLowerCase()
    let allOk = true
    for (const kw of keywords) {
        const ok = RegExp(esc(kw.toLowerCase())).test(src)
        if (!ok) allOk = false
        expect(ok, `${label} doit contenir "${kw}"`).toBe(true)
    }
    return allOk
}
function esc(s: string): string { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }

// ============================================================================
describe('Section 1 — Fiche de classe', () => {
    const c = findRogueClass()
    it('Existe', () => expect(c).toBeDefined())
    it(`Hit d${roublardRef.hitDie}`, () => expect(c?.hitDie).toBe(roublardRef.hitDie))
    it(`Nom`, () => expect(c?.name).toBe(roublardRef.name))
    it('Saves DEX/INT', () => { expect(c?.savingThrows).toContain('dex'); expect(c?.savingThrows).toContain('int') })
    it('11 compétences, 4 choix', () => { expect(c?.skillChoices.length).toBeGreaterThanOrEqual(10); expect(c?.numSkillChoices).toBe(4) })
    it('Pas lanceur de sorts', () => expect(c?.spellcasting).toBeUndefined())
})

// ============================================================================
describe('Section 2 — Progression', () => {
    for (const entry of roublardRef.progression) {
        it(`Niv ${entry.level} : ${entry.features.join(', ')}`, () => {
            const db = findFeatureAtLevel('rogue', entry.level)
            for (const rf of entry.features) {
                const tokens: Record<string, string[]> = {
                    'Attaque sournoise': ['attaque sournoise', 'sournoise'],
                    'Expertise': ['expertise'],
                    'Jargon des voleurs': ['jargon'],
                    'Ruse': ['ruse'],
                    'Archétype de roublard': ['archétype'],
                    'Amélioration de caractéristiques': ['amélioration', 'amelioration'],
                    'Esquive instinctive': ['esquive instinctive', 'instinctive'],
                    'Esquive totale': ['dérobade', 'esquive totale'],
                    'Capacité de l\'archétype': ['archétype'],
                    'Savoir-faire': ['savoir-faire', 'savoir faire', 'talent'],
                    'Perception aveugle': ['perception aveugle', 'aveugle'],
                    'Esprit fuyant': ['esprit fuyant', 'fuyant', 'sagesse'],
                    'Insaisissable': ['insaisissable'],
                    'Coup de chance': ['coup de chance', 'chance'],
                }
                const kw = tokens[rf] || [rf.toLowerCase()]
                expect(db.some(f => kw.some(k => f.name.toLowerCase().includes(k))), `"${rf}" manquant niv ${entry.level} (trouvé: ${db.map(f => f.name).join(', ')})`).toBe(true)
            }
        })
    }
})

// ============================================================================
describe('Section 3 — Tables de ressources', () => {
    it('rogueSneakAttackDice : 20 éléments, 1d6→10d6', () => {
        expect(rogueSneakAttackDice).toHaveLength(20)
        expect(rogueSneakAttackDice).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10])
    })
})

// ============================================================================
describe('Section 4 — Fonctions utilitaires', () => {
    describe('getRogueSneakAttackDice', () => {
        it('N1=1, N3=2, N5=3, N7=4, N9=5, N11=6, N13=7, N15=8, N17=9, N19=10, N20=10', () => {
            expect(getRogueSneakAttackDice(1)).toBe(1)
            expect(getRogueSneakAttackDice(3)).toBe(2)
            expect(getRogueSneakAttackDice(5)).toBe(3)
            expect(getRogueSneakAttackDice(7)).toBe(4)
            expect(getRogueSneakAttackDice(9)).toBe(5)
            expect(getRogueSneakAttackDice(11)).toBe(6)
            expect(getRogueSneakAttackDice(13)).toBe(7)
            expect(getRogueSneakAttackDice(15)).toBe(8)
            expect(getRogueSneakAttackDice(17)).toBe(9)
            expect(getRogueSneakAttackDice(19)).toBe(10)
            expect(getRogueSneakAttackDice(20)).toBe(10)
        })
    })
    describe('getRogueExpertiseCount', () => {
        it('N1=2, N5=2, N6=4', () => {
            expect(getRogueExpertiseCount(1)).toBe(2)
            expect(getRogueExpertiseCount(5)).toBe(2)
            expect(getRogueExpertiseCount(6)).toBe(4)
            expect(getRogueExpertiseCount(20)).toBe(4)
        })
    })
    it('Bonus maîtrise N1=+2, N5=+3, N9=+4, N13=+5, N17=+6', () => {
        expect(getProficiencyBonus(1)).toBe(2)
        expect(getProficiencyBonus(5)).toBe(3)
        expect(getProficiencyBonus(9)).toBe(4)
        expect(getProficiencyBonus(13)).toBe(5)
        expect(getProficiencyBonus(17)).toBe(6)
    })
})

// ============================================================================
describe('Section 5 — Capacités actionnables', () => {
    for (const [key, ref] of Object.entries(roublardRef.classActions)) {
        const actions = getActionsAboveLevel('rogue', ref.availableFrom)
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
    it('ASI = 6 niveaux (4,8,10,12,16,19)', () => {
        expect(getClassASILevels('rogue')).toEqual([4, 8, 10, 12, 16, 19])
    })
    it('getClassActions niv 5 contient uncannyDodge', () => {
        expect(getClassActions('rogue', 5).some(a => a.key === 'uncannyDodge')).toBe(true)
    })
})

// ============================================================================
describe('Section 6 — Sous-classes', () => {
    const rogueSubs = subclasses.filter(s => s.classId === 'rogue')
    it('≥9 sous-classes', () => expect(rogueSubs.length).toBeGreaterThanOrEqual(9))

    for (const [refId, refSub] of Object.entries(roublardRef.subclasses)) {
        describe(`${refSub.name} (${refSub.source})`, () => {
            const dbSub = rogueSubs.find(s => s.id === refId)
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
    it('ID rogue cohérent', () => {
        expect(findRogueClass()?.id).toBe('rogue')
        expect(classFeaturesByLevel.rogue).toBeDefined()
        expect(classActionsByLevel.rogue).toBeDefined()
    })
    it('Sneak attack : progression non-décroissante', () => {
        let prev = 0
        for (let l = 1; l <= 20; l++) {
            const cur = getRogueSneakAttackDice(l)
            expect(cur).toBeGreaterThanOrEqual(prev)
            prev = cur
        }
    })
    it('Sneak attack : 1d6→10d6 par paliers de 2 niveaux', () => {
        // Augmente tous les 2 niveaux impairs (1,3,5,7,9,11,13,15,17,19)
        for (let l = 1; l <= 20; l++) {
            const expected = Math.ceil(l / 2)
            expect(getRogueSneakAttackDice(l)).toBe(expected)
        }
    })
})
