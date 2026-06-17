/**
 * Vérification exhaustive du Barbare — 100% des spécificités
 *
 * Chaque feature de sous-classe est vérifiée contre les données AideDD
 * avec des assertions de mots-clés mécaniques (keywords/forbidden).
 */
import { describe, it, expect } from 'vitest'
import { barbareRef } from './references/barbare'
import { classes } from '../../../src/data/classes'
import {
    classFeaturesByLevel,
    classActionsByLevel,
    getClassActions,
    getClassASILevels,
    barbarianRages,
    barbarianRageDamage,
    barbarianFastMovement,
    barbarianBrutalCriticalDice,
} from '../../../src/data/classFeatures'
import { subclasses } from '../../../src/data/subclasses'
import {
    getBarbarianRageCount,
    getBarbarianRageDamageBonus,
    getBarbarianFastMovement,
    getBarbarianBrutalCriticalDice,
    formatResourceMax,
    normalizeClassId,
} from '../../../src/utils/feature-helpers'
import { getProficiencyBonus } from '../../../src/utils/rules-engine'

// ─── HELPERS ───────────────────────────────────────────────

const findBarbarianClass = () => classes.find(c => c.id === 'barbarian')
const findFeatureAtLevel = (className: string, level: number) => classFeaturesByLevel[className]?.[level] || []
const getActionsAboveLevel = (className: string, minLevel: number) => getClassActions(className, minLevel)

/** Vérifie que le texte contient chaque mot-clé (match souple) */
function assertKeywordsSoft(source: string, keywords: string[], label: string): boolean {
    const src = source.toLowerCase()
    let allOk = true
    for (const kw of keywords) {
        const kwLow = kw.toLowerCase()
        const found = new RegExp(escapeRegex(kwLow)).test(src)
        if (!found) allOk = false
        expect(found, `${label} doit contenir "${kw}"`).toBe(true)
    }
    return allOk
}

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Construit le fullText à partir de la description + rules JSON (stringifiées en minuscules) */
function getFullText(dbFeature: { description: string; rules?: object[] }): string {
    return [
        dbFeature.description,
        ...(dbFeature.rules?.map(r => JSON.stringify(r).toLowerCase()) || []),
    ].join(' ')
}

// ============================================================================
// SECTION 1 — Fiche de classe
// ============================================================================

describe('Section 1 — Fiche de classe (classes.ts)', () => {
    const barbClass = findBarbarianClass()

    it('La classe existe', () => expect(barbClass).toBeDefined())
    it(`Hit die = d${barbareRef.hitDie}`, () => expect(barbClass?.hitDie).toBe(barbareRef.hitDie))
    it(`Nom = ${barbareRef.name}`, () => expect(barbClass?.name).toBe(barbareRef.name))
    it(`Caractéristique principale = ${barbareRef.primaryAbility.toUpperCase()}`, () => expect(barbClass?.primaryAbility).toBe(barbareRef.primaryAbility))
    it(`Jets de sauvegarde = ${barbareRef.savingThrows.join(', ')}`, () => {
        expect(barbClass?.savingThrows).toEqual(expect.arrayContaining(barbareRef.savingThrows))
        expect(barbClass?.savingThrows).toHaveLength(2)
    })
    it(`${barbareRef.skillChoices.length} compétences disponibles`, () => expect(barbClass?.skillChoices.length).toBe(barbareRef.skillChoices.length))
    it(`${barbareRef.numSkillChoices} compétences à choisir`, () => expect(barbClass?.numSkillChoices).toBe(barbareRef.numSkillChoices))
    it('Pas d\'incantation (non-lanceur)', () => expect(barbClass?.spellcasting).toBeUndefined())
    it('Maîtrises d\'armures incluent les boucliers', () => {
        const hasShield = barbClass?.armorProficiencies.some(a => a.toLowerCase().includes('bouclier') || a.toLowerCase().includes('shield'))
        expect(hasShield).toBe(true)
    })
    it('Maîtrises d\'armes ≥ 2', () => expect(barbClass?.weaponProficiencies.length).toBeGreaterThanOrEqual(2))
})

// ============================================================================
// SECTION 2 — Progression 1→20
// ============================================================================

describe('Section 2 — Progression niveau par niveau', () => {
    describe.each(barbareRef.progression)('Niveau $level', (entry) => {
        it(`Bonus maîtrise = +${entry.proficiencyBonus}`, () => {
            expect(getProficiencyBonus(entry.level)).toBe(entry.proficiencyBonus)
        })

        it(`Capacités : ${entry.features.join(', ')}`, () => {
            const levelFeatures = findFeatureAtLevel('barbarian', entry.level)
            for (const refFeature of entry.features) {
                const tokens: Record<string, string[]> = {
                    'Rage': ['rage'],
                    'Défense sans armure': ['défense sans armure', 'defense sans armure'],
                    'Attaque téméraire': ['attaque téméraire', 'temeraire'],
                    'Sens du danger': ['sens du danger'],
                    'Voie primitive': ['voie primitive', 'voie'],
                    'Amélioration de caractéristiques': ['amélioration', 'amelioration'],
                    'Attaque supplémentaire': ['attaque supplémentaire', 'supplementaire'],
                    'Déplacement rapide': ['déplacement rapide'],
                    'Capacité de voie': ['capacité de voie', 'capacité de la voie'],
                    'Instinct sauvage': ['instinct sauvage'],
                    'Critique brutal': ['critique brutal', 'brutal'],
                    'Rage implacable': ['rage implacable', 'implacable'],
                    'Rage persistante': ['rage persistante', 'persistante'],
                    'Puissance indomptable': ['puissance indomptable'],
                    'Champion primitif': ['champion primitif'],
                }
                const keywords = tokens[refFeature] || [refFeature.toLowerCase()]
                const found = levelFeatures.some(f => keywords.some(k => f.name.toLowerCase().includes(k)))
                expect(found, `Feature "${refFeature}" manquante au niveau ${entry.level}`).toBe(true)
            }
        })

        if (entry.resources) {
            const res = entry.resources
            if (res.rages !== undefined) {
                it(`Rages = ${res.rages === null ? 'illimitées' : res.rages}`, () => {
                    const count = getBarbarianRageCount(entry.level)
                    res.rages === null ? expect(count).toBeGreaterThanOrEqual(99) : expect(count).toBe(res.rages)
                })
            }
            if (res.rageDamage !== undefined) {
                it(`Dégâts rage = +${res.rageDamage}`, () => expect(getBarbarianRageDamageBonus(entry.level)).toBe(res.rageDamage))
            }
        }
    })
})

// ============================================================================
// SECTION 3 — Tables de ressources
// ============================================================================

describe('Section 3 — Tables de ressources', () => {
    it('barbarianRages : 20 éléments, valeurs exactes', () => {
        expect(barbarianRages).toHaveLength(20)
        expect(barbarianRages).toEqual(barbareRef.resourceTables.barbarianRages)
    })
    it('barbarianRageDamage : 20 éléments, valeurs exactes', () => {
        expect(barbarianRageDamage).toHaveLength(20)
        expect(barbarianRageDamage).toEqual(barbareRef.resourceTables.barbarianRageDamage)
    })
    it('barbarianFastMovement : 20 éléments, valeurs exactes', () => {
        expect(barbarianFastMovement).toHaveLength(20)
        expect(barbarianFastMovement).toEqual(barbareRef.resourceTables.barbarianFastMovement)
    })
    it('barbarianBrutalCriticalDice : 20 éléments, valeurs exactes', () => {
        expect(barbarianBrutalCriticalDice).toHaveLength(20)
        expect(barbarianBrutalCriticalDice).toEqual(barbareRef.resourceTables.barbarianBrutalCriticalDice)
    })
    it('Types valides dans toutes les tables', () => {
        for (const arr of [barbarianRages, barbarianRageDamage, barbarianFastMovement, barbarianBrutalCriticalDice]) {
            for (const val of arr) {
                expect(typeof val).toBe('number')
                expect(Number.isFinite(val) || val >= 999).toBe(true)
            }
        }
    })
})

// ============================================================================
// SECTION 4 — Fonctions utilitaires
// ============================================================================

describe('Section 4 — Fonctions utilitaires', () => {
    describe('getBarbarianRageCount', () => {
        it('N0=0, N1=2, N3=3, N6=4, N12=5, N17=6, N20=∞', () => {
            expect(getBarbarianRageCount(0)).toBe(0)
            expect(getBarbarianRageCount(1)).toBe(2)
            expect(getBarbarianRageCount(3)).toBe(3)
            expect(getBarbarianRageCount(6)).toBe(4)
            expect(getBarbarianRageCount(12)).toBe(5)
            expect(getBarbarianRageCount(17)).toBe(6)
            expect(getBarbarianRageCount(20)).toBeGreaterThanOrEqual(99)
        })
    })
    describe('getBarbarianRageDamageBonus', () => {
        it('N1-8:+2, N9-15:+3, N16-20:+4', () => {
            for (let l = 1; l <= 8; l++) expect(getBarbarianRageDamageBonus(l)).toBe(2)
            for (let l = 9; l <= 15; l++) expect(getBarbarianRageDamageBonus(l)).toBe(3)
            for (let l = 16; l <= 20; l++) expect(getBarbarianRageDamageBonus(l)).toBe(4)
        })
    })
    describe('getBarbarianFastMovement', () => {
        it('N1-4:0m, N5-20:+3m', () => {
            for (let l = 1; l <= 4; l++) expect(getBarbarianFastMovement(l)).toBe(0)
            for (let l = 5; l <= 20; l++) expect(getBarbarianFastMovement(l)).toBe(3)
        })
    })
    describe('getBarbarianBrutalCriticalDice', () => {
        it('N1-8:0, N9-12:1, N13-16:2, N17-20:3', () => {
            for (let l = 1; l <= 8; l++) expect(getBarbarianBrutalCriticalDice(l)).toBe(0)
            for (let l = 9; l <= 12; l++) expect(getBarbarianBrutalCriticalDice(l)).toBe(1)
            for (let l = 13; l <= 16; l++) expect(getBarbarianBrutalCriticalDice(l)).toBe(2)
            for (let l = 17; l <= 20; l++) expect(getBarbarianBrutalCriticalDice(l)).toBe(3)
        })
    })
    it('formatResourceMax(999)=∞, (6)="6"', () => {
        expect(formatResourceMax(999)).toBe('∞')
        expect(formatResourceMax(6)).toBe('6')
    })
    it('normalizeClassId', () => {
        expect(normalizeClassId('ID_PHB_CLASS_BARBARIAN')).toBe('barbarian')
        expect(normalizeClassId('barbarian')).toBe('barbarian')
        expect(normalizeClassId(undefined)).toBeUndefined()
    })
})

// ============================================================================
// SECTION 5 — Capacités actionnables
// ============================================================================

describe('Section 5 — Capacités actionnables', () => {
    for (const [actionKey, ref] of Object.entries(barbareRef.classActions)) {
        const actions = getActionsAboveLevel('barbarian', ref.availableFrom)
        const found = actions.find(a => a.key === actionKey)

        it(`"${actionKey}" dispo niv ${ref.availableFrom}`, () => expect(found).toBeDefined())
        if (found) {
            it(`"${actionKey}" restoreOn=${ref.restoreOn}`, () => expect(found.restoreOn).toBe(ref.restoreOn))
            it(`"${actionKey}" nom + icône`, () => {
                expect(found.name).toBeTruthy()
                expect(found.icon).toBeTruthy()
            })
            it(`"${actionKey}" description > 10 chars`, () => expect(found.description.length).toBeGreaterThan(10))
        }
    }

    it('getClassActions niv 1 contient rages', () => {
        expect(getClassActions('barbarian', 1).some(a => a.key === 'rages')).toBe(true)
    })
    it('getClassActions niv 5 contient extraAttack', () => {
        expect(getClassActions('barbarian', 5).some(a => a.key === 'extraAttack')).toBe(true)
    })
    it('ASI levels = [4,8,12,16,19]', () => {
        expect(getClassASILevels('barbarian')).toEqual([4, 8, 12, 16, 19])
    })
})

// ============================================================================
// SECTION 6 — SOUS-CLASSES (vérification exhaustive mots-clés)
// ============================================================================

describe('Section 6 — Sous-classes', () => {
    const barbSubclasses = subclasses.filter(s => s.classId === 'barbarian')

    it('Au moins 7 sous-classes barbares dans la DB', () => {
        expect(barbSubclasses.length).toBeGreaterThanOrEqual(7)
    })

    for (const [refId, refSub] of Object.entries(barbareRef.subclasses)) {
        describe(`${refSub.name} (${refSub.source})`, () => {
            const dbSub = barbSubclasses.find(s => s.id === refId)

            if (!dbSub) {
                it(`⚠️ Sous-classe "${refSub.name}" (${refId}) ABSENTE de la DB`, () => {
                    expect(dbSub).toBeDefined()
                })
                return
            }

            it(`ID=${refId}`, () => expect(dbSub.id).toBe(refId))
            it(`Nom="${refSub.name}"`, () => expect(dbSub.name).toBe(refSub.name))
            it(`Source=${refSub.source}`, () => expect(dbSub.source).toBe(refSub.source))
            it(`subclassLevel=3`, () => expect(dbSub.subclassLevel).toBe(3))
            it(`Description > 20 chars`, () => expect(dbSub.description.length).toBeGreaterThan(20))

            // Vérifie chaque feature avec les mots-clés AideDD
            const levelFeatureIndex: Record<number, number> = {}
            for (const [levelKey, featRef] of Object.entries(refSub.features)) {
                const level = Math.floor(parseFloat(levelKey))
                // Index local : à chaque niveau entier, on incrémente pour
                // matcher plusieurs features au même niveau (ex: N3 feature 0, N3 feature 1)
                if (levelFeatureIndex[level] === undefined) levelFeatureIndex[level] = 0
                const idx = levelFeatureIndex[level]++

                const dbFeaturesAtLevel = dbSub.features.filter(f => f.level === level)
                const dbFeature = dbFeaturesAtLevel[idx]
                const suffix = dbFeaturesAtLevel.length > 1 ? ` [${idx + 1}/${dbFeaturesAtLevel.length}]` : ''

                it(`Niv ${level}${suffix} : "${featRef.name}" existe`, () => {
                    expect(dbFeature, `Feature #${idx + 1} manquante au niveau ${level} (DB: ${dbFeaturesAtLevel.map(f => f.name).join(', ') || 'aucune'})`).toBeDefined()
                    expect(dbFeature?.name.length).toBeGreaterThan(0)
                })

                // Vérification mots-clés mécaniques
                if (dbFeature && featRef.keywords && featRef.keywords.length > 0) {
                    const fullText = getFullText(dbFeature)
                    const kws = featRef.keywords!
                    it(`Niv ${level}${suffix} : mots-clés ${featRef.keywords.join(', ')}`, () => {
                        assertKeywordsSoft(fullText, kws, featRef.name)
                    })
                    if (featRef.forbidden && featRef.forbidden.length > 0) {
                        it(`Niv ${level}${suffix} : PAS de ${featRef.forbidden.join(', ')}`, () => {
                            assertKeywordsSoft(fullText, featRef.forbidden!.map((k: string) => `!${k}`), featRef.name)
                        })
                    }
                }

                // Vérifie que la description est substantielle
                if (dbFeature) {
                    it(`Niv ${level} : description > 15 chars`, () => {
                        expect(dbFeature.description.length).toBeGreaterThan(15)
                    })
                }
            }

            // Vérifie qu'il n'y a pas de features en trop dans la DB
            it('Toutes les features DB correspondent à un niveau de référence', () => {
                const refLevels = Object.keys(refSub.features).map(k => parseFloat(k))
                const expectedLevels = [...new Set(refLevels)].sort()
                const dbLevels = dbSub.features.map(f => f.level).sort()
                // Les niveaux DB doivent être un sous-ensemble des niveaux de référence
                for (const dbLvl of dbLevels) {
                    // Accepter les niveaux multiples au même palier (ex: 3 et 3)
                    const hasMatch = expectedLevels.some(rl => Math.floor(rl) === dbLvl)
                    expect(hasMatch, `Niveau ${dbLvl} dans la DB non trouvé dans la référence`).toBe(true)
                }
            })
        })
    }
})

// ============================================================================
// SECTION 7 — Cohérence globale
// ============================================================================

describe('Section 7 — Cohérence cross-fichiers', () => {
    it('ID barbarian présent partout', () => {
        const cls = findBarbarianClass()
        expect(cls?.id).toBe('barbarian')
        expect(classFeaturesByLevel['barbarian']).toBeDefined()
        expect(classActionsByLevel['barbarian']).toBeDefined()
    })
    it('Pas de sorts de classe de base', () => expect(findBarbarianClass()?.spellcasting).toBeUndefined())
    it('Toutes les features 1-20 ont nom+description', () => {
        for (let l = 1; l <= 20; l++) {
            for (const f of findFeatureAtLevel('barbarian', l)) {
                expect(f.name).toBeTruthy()
                expect(f.description).toBeTruthy()
            }
        }
    })
    it('Rages : progression strictement non-décroissante', () => {
        let prev = 0
        for (let l = 1; l <= 20; l++) {
            const cur = getBarbarianRageCount(l)
            expect(cur >= prev || cur >= 99).toBe(true)
            prev = cur
        }
    })
    it('Dégâts rage : progression non-décroissante', () => {
        let prev = 0
        for (let l = 1; l <= 20; l++) {
            const cur = getBarbarianRageDamageBonus(l)
            expect(cur).toBeGreaterThanOrEqual(prev)
            prev = cur
        }
    })
    it('Déplacement rapide : 0 avant N5, +3m après', () => {
        for (let l = 1; l <= 4; l++) expect(getBarbarianFastMovement(l)).toBe(0)
        for (let l = 5; l <= 20; l++) expect(getBarbarianFastMovement(l)).toBe(3)
    })
})
