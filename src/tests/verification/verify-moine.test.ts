import { describe, it, expect } from 'vitest'
import { moineRef } from './references/moine'
import { classes } from '../../../src/data/classes'
import { classFeaturesByLevel, getClassActions, getClassASILevels, monkKiPoints, monkMartialArtsDie, monkUnarmoredMovement } from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'
import { getMonkMartialArtsDie, getMonkKiPoints, getMonkUnarmoredMovement, hasMonkEvasion, hasMonkStillnessOfMind, hasMonkPurityOfBody, hasMonkDiamondSoul } from '../../../src/utils/feature-helpers'

const findClass = () => classes.find(c => c.id === 'monk')
const ff = (c: string, l: number) => classFeaturesByLevel[c]?.[l] || []
const ga = (c: string, l: number) => getClassActions(c, l)
function t(f: { description: string; rules?: object[] }): string { return [f.description, ...(f.rules?.map(r => JSON.stringify(r).toLowerCase()) || [])].join(' ') }
function kw(src: string, kws: string[], label: string) { const s = src.toLowerCase(); for (const k of kws) expect(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(s), `${label} doit contenir "${k}"`).toBe(true) }

// ── Section 1 ──
describe('Section 1 — Fiche', () => {
    const c = findClass()
    it('Existe', () => expect(c).toBeDefined())
    it('Hit d8', () => expect(c?.hitDie).toBe(8))
    it('Saves STR/DEX', () => { expect(c?.savingThrows).toContain('str'); expect(c?.savingThrows).toContain('dex') })
    it('6 skills', () => expect(c?.skillChoices.length).toBe(6))
    it('2 choix', () => expect(c?.numSkillChoices).toBe(2))
})

// ── Section 2 ──
describe('Section 2 — Progression', () => {
    const toks: Record<string, string[]> = {
        'Défense sans armure': ['défense sans armure'], 'Arts martiaux': ['arts martiaux'],
        'Ki': ['ki'], 'Déplacement sans armure': ['déplacement'],
        'Tradition monastique': ['tradition'], 'Parade de projectiles': ['déviation', 'parade'],
        'Amélioration de caractéristiques': ['amélioration', 'amelioration'], 'Chute ralentie': ['chute'],
        'Attaque supplémentaire': ['supplémentaire'], 'Frappe étourdissante': ['étourdissante', 'frappe'],
        'Frappes de ki': ['frappe'], 'Capacité de la tradition': ['tradition'],
        'Esquive totale': ['dérobade'], 'Plénitude intérieure': ['tranquillité', 'plénitude'],
        'Déplacement sans armure amélioré': ['déplacement'], 'Pureté du corps': ['pureté'],
        'Langue du soleil et de la lune': ['langue'], 'Âme de diamant': ['diamant'],
        'Jeunesse éternelle': ['jeunesse'], 'Désertion de l\'âme': ['corps vide'],
        'Perfection de l\'être': ['perfection'],
    }
    for (const e of moineRef.progression) {
        it(`Niv ${e.level} : ${e.features.join(', ')}`, () => {
            const db = ff('monk', e.level)
            for (const rf of e.features) {
                const k = toks[rf] || [rf.toLowerCase()]
                const found = db.some(f => k.some(ks => f.name.toLowerCase().includes(ks)))
                expect(found, `"${rf}" niv ${e.level} (trouvé: ${db.map(f => f.name).join(', ')})`).toBe(true)
            }
        })
    }
})

// ── Section 3 ──
describe('Section 3 — Tables', () => {
    it('monkKiPoints', () => { expect(monkKiPoints[1]).toBe(2); expect(monkKiPoints[19]).toBe(20) })
    it('monkMartialArtsDie d4→d10', () => { expect(monkMartialArtsDie[0]).toBe('d4'); expect(monkMartialArtsDie[10]).toBe('d8'); expect(monkMartialArtsDie[16]).toBe('d10') })
    it('monkUnarmoredMovement 0→9', () => { expect(monkUnarmoredMovement[1]).toBe(3); expect(monkUnarmoredMovement[9]).toBe(6); expect(monkUnarmoredMovement[17]).toBe(9) })
})

// ── Section 4 ──
describe('Section 4 — Helpers', () => {
    it('getMonkKiPoints N1=0, N2=2, N20=20', () => { expect(getMonkKiPoints(1)).toBe(0); expect(getMonkKiPoints(2)).toBe(2); expect(getMonkKiPoints(20)).toBe(20) })
    it('getMonkMartialArtsDie', () => { expect(getMonkMartialArtsDie(1)).toBe('d4'); expect(getMonkMartialArtsDie(11)).toBe('d8') })
    it('getMonkUnarmoredMovement', () => { expect(getMonkUnarmoredMovement(6)).toBe(4.5); expect(getMonkUnarmoredMovement(18)).toBe(9) })
    it('hasMonkEvasion N7+', () => { expect(hasMonkEvasion(6)).toBe(false); expect(hasMonkEvasion(7)).toBe(true) })
    it('hasMonkStillnessOfMind N7+', () => { expect(hasMonkStillnessOfMind(7)).toBe(true) })
    it('hasMonkPurityOfBody N10+', () => { expect(hasMonkPurityOfBody(10)).toBe(true) })
    it('hasMonkDiamondSoul N14+', () => { expect(hasMonkDiamondSoul(14)).toBe(true) })
})

// ── Section 5 ──
describe('Section 5 — Actions', () => {
    for (const [k, r] of Object.entries(moineRef.classActions)) {
        const a = ga('monk', r.availableFrom).find(x => x.key === k)
        it(`"${k}" niv ${r.availableFrom}`, () => expect(a).toBeDefined())
        if (a) {
            it(`"${k}" restoreOn=${r.restoreOn}`, () => expect(a.restoreOn).toBe(r.restoreOn))
            it(`"${k}" desc>10`, () => expect(a.description.length).toBeGreaterThan(10))
        }
    }
    it('ASI = 5', () => expect(getClassASILevels('monk')).toEqual([4, 8, 12, 16, 19]))
})

// ── Section 6 ──
describe('Section 6 — Sous-classes', () => {
    const ms = subclasses.filter(s => s.classId === 'monk'); it('≥6', () => expect(ms.length).toBeGreaterThanOrEqual(6))
    for (const [rid, r] of Object.entries(moineRef.subclasses)) {
        describe(`${r.name} (${r.source})`, () => {
            const d = ms.find(s => s.id === rid)
            if (!d) { it('⚠️ ABSENT', () => expect(d).toBeDefined()); return }
            it('ID', () => expect(d.id).toBe(rid))
            it('Nom', () => expect(d.name).toBe(r.name))
            it('Source', () => expect(d.source).toBe(r.source))
            const li: Record<number, number> = {}
            for (const [lk, fr] of Object.entries(r.features)) {
                const lv = Math.floor(parseFloat(lk)); if (li[lv] === undefined) li[lv] = 0; const idx = li[lv]++
                const al = d.features.filter(f => f.level === lv); const df = al[idx]; const sfx = al.length > 1 ? ` [${idx + 1}/${al.length}]` : ''
                it(`Niv ${lv}${sfx} : "${fr.name}"`, () => { expect(df).toBeDefined(); if (df) expect(df.name.length).toBeGreaterThan(0) })
                if (df && fr.keywords?.length) it(`Niv ${lv}${sfx} : mots-clés`, () => kw(t(df), fr.keywords!, fr.name))
                if (df) it(`Niv ${lv}${sfx} : desc>10`, () => expect(df.description.length).toBeGreaterThan(10))
            }
        })
    }
})

// ── Section 7 ──
describe('Section 7 — Cohérence', () => {
    it('ID monk cohérent', () => { expect(findClass()?.id).toBe('monk'); expect(classFeaturesByLevel.monk).toBeDefined() })
    it('Ki = level à partir du niv 2', () => { for (let l = 2; l <= 20; l++) expect(getMonkKiPoints(l)).toBe(l) })
    it('MA die d4→d10', () => { expect(getMonkMartialArtsDie(4)).toBe('d4'); expect(getMonkMartialArtsDie(10)).toBe('d6'); expect(getMonkMartialArtsDie(16)).toBe('d8') })
})
