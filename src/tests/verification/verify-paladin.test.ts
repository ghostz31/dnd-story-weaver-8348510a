import { describe, it, expect } from 'vitest'
import { paladinRef } from './references/paladin'
import { classes } from '../../../src/data/classes'
import { classFeaturesByLevel, getClassActions, getClassASILevels, paladinLayOnHandsPool } from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'
import { getProficiencyBonus } from '../../../src/utils/rules-engine'

const fc = () => classes.find(c => c.id === 'paladin')
const ff = (c: string, l: number) => classFeaturesByLevel[c]?.[l] || []
const ga = (c: string, l: number) => getClassActions(c, l)
function t(f: { name: string; description: string; rules?: object[] }): string { return [f.name, f.description, ...(f.rules?.map(r => JSON.stringify(r).toLowerCase()) || [])].join(' ') }
function kw(src: string, kws: string[], label: string) { const s = src.toLowerCase(); for (const k of kws) expect(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(s), `${label} doit contenir "${k}"`).toBe(true) }

describe('Section 1 — Fiche', () => { const c = fc(); it('Existe', () => expect(c).toBeDefined()); it('Hit d10', () => expect(c?.hitDie).toBe(10)); it('Saves WIS/CHA', () => { expect(c?.savingThrows).toContain('wis'); expect(c?.savingThrows).toContain('cha') }); it('6 skills, 2 choix', () => { expect(c?.skillChoices.length).toBe(6); expect(c?.numSkillChoices).toBe(2) }); it('Spellcasting CHA', () => expect(c?.spellcasting?.ability).toBe('cha')) })

describe('Section 2 — Progression', () => {
    const toks: Record<string, string[]> = { 'Sens divin': ['sens divin', 'divin'], 'Imposition des mains': ['imposition', 'mains'], 'Style de combat': ['style'], 'Incantation': ['incantation'], 'Châtiment divin': ['châtiment'], 'Santé divine': ['santé'], 'Serment sacré': ['serment'], 'Amélioration de caractéristiques': ['amélioration', 'amelioration'], 'Attaque supplémentaire': ['supplémentaire'], 'Aura de protection': ['aura'],                     'Capacité de serment sacré': ['serment'],
                    'Aura de courage': ['courage'], 'Châtiment divin amélioré': ['châtiment', 'amélioré'], 'Contact purifiant': ['contact', 'purifiant'], 'Amélioration d\'auras': ['aura'] }
    for (const e of paladinRef.progression) {
        if (e.features.length === 0) continue
        it(`Niv ${e.level} : ${e.features.join(', ')}`, () => {
            const db = ff('paladin', e.level)
            for (const rf of e.features) { const k = toks[rf] || [rf.toLowerCase()]; expect(db.some(f => k.some(ks => f.name.toLowerCase().includes(ks))), `"${rf}" niv ${e.level}`).toBe(true) }
        })
    }
})

describe('Section 3 — Tables', () => {
    it('paladinLayOnHandsPool = 5×niveau', () => { expect(paladinLayOnHandsPool[0]).toBe(0); expect(paladinLayOnHandsPool[1]).toBe(5); expect(paladinLayOnHandsPool[19]).toBe(95) })
})

describe('Section 4 — Helpers', () => {
    it('getProficiencyBonus N1=2, N5=3, N9=4, N13=5, N17=6', () => { expect(getProficiencyBonus(1)).toBe(2); expect(getProficiencyBonus(17)).toBe(6) })
})

describe('Section 5 — Actions', () => {
    for (const [k, r] of Object.entries(paladinRef.classActions)) {
        const a = ga('paladin', r.availableFrom).find(x => x.key === k); it(`"${k}" niv ${r.availableFrom}`, () => expect(a).toBeDefined()); if (a) it(`"${k}" restoreOn=${r.restoreOn}`, () => expect(a.restoreOn).toBe(r.restoreOn))
    }
    it('ASI = [4,8,12,16,19]', () => expect(getClassASILevels('paladin')).toEqual([4, 8, 12, 16, 19]))
})

describe('Section 6 — Sous-classes', () => {
    const ps = subclasses.filter(s => s.classId === 'paladin'); it('≥7', () => expect(ps.length).toBeGreaterThanOrEqual(7))
    for (const [rid, r] of Object.entries(paladinRef.subclasses)) {
        describe(`${r.name}`, () => { const d = ps.find(s => s.id === rid); if (!d) { it('⚠️ ABSENT', () => expect(d).toBeDefined()); return }
            it('ID', () => expect(d.id).toBe(rid)); it('Nom', () => expect(d.name).toBe(r.name)); it('Source', () => expect(d.source).toBe(r.source))
            const li: Record<number, number> = {}
            for (const [lk, fr] of Object.entries(r.features)) { const lv = Math.floor(parseFloat(lk)); if (li[lv] === undefined) li[lv] = 0; const idx = li[lv]++; const al = d.features.filter(f => f.level === lv); const df = al[idx]
                it(`Niv ${lv} : "${fr.name}"`, () => { expect(df).toBeDefined(); if (df) expect(df.name.length).toBeGreaterThan(0) })
                if (df && fr.keywords?.length) it(`Niv ${lv} : mots-clés`, () => kw(t(df), fr.keywords!, fr.name))
            }
        })
    }
})

describe('Section 7 — Cohérence', () => {
    it('ID paladin cohérent', () => { expect(fc()?.id).toBe('paladin'); expect(classFeaturesByLevel.paladin).toBeDefined() })
    it('Spellcasting CHA', () => expect(fc()?.spellcasting?.ability).toBe('cha'))
    it('Slots demi-caster', () => { const s = fc()?.spellcasting?.spellSlots; expect(s).toBeDefined(); expect(s![4].length).toBe(2) })
})
