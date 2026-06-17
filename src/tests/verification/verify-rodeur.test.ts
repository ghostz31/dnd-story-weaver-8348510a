import { describe, it, expect } from 'vitest'
import { rodeurRef } from './references/rodeur'
import { classes } from '../../../src/data/classes'
import { classFeaturesByLevel, getClassActions, getClassASILevels } from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'

const fc = () => classes.find(c => c.id === 'ranger')
const ff = (c: string, l: number) => classFeaturesByLevel[c]?.[l] || []
const ga = (c: string, l: number) => getClassActions(c, l)
function t(f: { name: string; description: string; rules?: object[] }): string { return [f.name, f.description, ...(f.rules?.map(r => JSON.stringify(r).toLowerCase()) || [])].join(' ') }
function kw(src: string, kws: string[], label: string) { const s = src.toLowerCase(); for (const k of kws) expect(new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).test(s), `${label} doit contenir "${k}"`).toBe(true) }

describe('Section 1', () => { const c = fc(); it('Existe', () => expect(c).toBeDefined()); it('Hit d10', () => expect(c?.hitDie).toBe(10)); it('Saves STR/DEX', () => { expect(c?.savingThrows).toContain('str'); expect(c?.savingThrows).toContain('dex') }); it('8 skills, 3 choix', () => { expect(c?.skillChoices.length).toBe(8); expect(c?.numSkillChoices).toBe(3) }); it('Spellcasting WIS', () => expect(c?.spellcasting?.ability).toBe('wis')) })

describe('Section 2', () => {
    const toks: Record<string, string[]> = { 'Ennemi juré': ['ennemi', 'juré'], 'Explorateur-né': ['explorateur'], 'Style de combat': ['style'], 'Incantation': ['incantation'], 'Archétype de rôdeur': ['archétype'], 'Conscience primitive': ['conscience', 'primitive'], 'Amélioration de caractéristiques': ['amélioration', 'amelioration'], 'Attaque supplémentaire': ['supplémentaire'], 'Amélioration ennemi juré/explorateur-né': ['amélioration'], 'Capacité archétype': ['archétype'], 'Foulée camouflée': ['foulée', 'camouflée'], 'Camouflage naturel': ['camouflage'], 'Disparition': ['disparition'], 'Sens sauvages': ['sens', 'sauvage'], 'Tueur d\'ennemis': ['tueur', 'ennemi'] }
    for (const e of rodeurRef.progression) { if (e.features.length === 0) continue; it(`Niv ${e.level}`, () => { const db = ff('ranger', e.level); for (const rf of e.features) { const k = toks[rf] || [rf.toLowerCase()]; expect(db.some(f => k.some(ks => f.name.toLowerCase().includes(ks))), `"${rf}" niv ${e.level}`).toBe(true) } }) }
})

describe('Section 3 — Actions', () => {
    for (const [k, r] of Object.entries(rodeurRef.classActions)) { const a = ga('ranger', r.availableFrom).find(x => x.key === k); it(`"${k}" niv ${r.availableFrom}`, () => expect(a).toBeDefined()) }
    it('ASI', () => expect(getClassASILevels('ranger')).toEqual([4, 8, 12, 16, 19]))
})

describe('Section 4 — Sous-classes', () => {
    const rs = subclasses.filter(s => s.classId === 'ranger'); it('≥7', () => expect(rs.length).toBeGreaterThanOrEqual(7))
    for (const [rid, r] of Object.entries(rodeurRef.subclasses)) {
        describe(`${r.name}`, () => { const d = rs.find(s => s.id === rid); if (!d) { it('⚠️ ABSENT', () => expect(d).toBeDefined()); return }
            it('ID', () => expect(d.id).toBe(rid)); it('Nom', () => expect(d.name).toBe(r.name))
            for (const [lk, fr] of Object.entries(r.features)) { const lv = Math.floor(parseFloat(lk)); const df = d.features.find(f => f.level === lv); it(`Niv ${lv} : "${fr.name}"`, () => expect(df).toBeDefined()); if (df && fr.keywords?.length) it(`Niv ${lv} : mots-clés`, () => kw(t(df), fr.keywords!, fr.name)) }
        })
    }
})

describe('Section 5 — Cohérence', () => { it('ID ranger cohérent', () => { expect(fc()?.id).toBe('ranger'); expect(classFeaturesByLevel.ranger).toBeDefined() }) })
