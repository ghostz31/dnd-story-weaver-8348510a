// ─────────────────────────────────────────────
// src/data/feats.ts  —  Dons (Feats) D&D 5e
// Sources : PHB, XGtE, TCoE
// ─────────────────────────────────────────────

export type { Feat, FeatSource } from './feats/types'
import { phbFeats } from './feats/phb'
import { xgteFeats } from './feats/xgte'
import { tcoeFeats } from './feats/tcoe'
import type { Feat, FeatSource } from './feats/types'

export const feats: Feat[] = [...phbFeats, ...xgteFeats, ...tcoeFeats]

// ─── Helpers ───
export function getFeatById(id: string): Feat | undefined {
    return feats.find(f => f.id === id)
}

export function getFeatsBySource(source: FeatSource): Feat[] {
    return feats.filter(f => f.source === source)
}

export function getAllFeats(): Feat[] {
    return feats
}

export function getFeatHpBonusPerLevel(featIds: string[]): number {
    return featIds
        .map(id => getFeatById(id))
        .filter((f): f is Feat => !!f)
        .reduce((sum, f) => sum + (f.hpBonusPerLevel || f.effects?.passive?.hpBonusPerLevel || 0), 0)
}

export function getFeatSpeedBonus(featIds: string[]): number {
    return featIds
        .map(id => getFeatById(id))
        .filter((f): f is Feat => !!f)
        .reduce((sum, f) => sum + (f.speedBonus || f.effects?.passive?.speedBonus || 0), 0)
}

export function getFeatSavingThrowProficiencies(
    featIds: string[],
    _asiChoices?: Record<number, import('../types/character').AsiChoice>
): string[] {
    const result: string[] = []
    for (const featId of featIds) {
        const feat = getFeatById(featId)
        if (feat?.savingThrowProficiency) {
            result.push(feat.savingThrowProficiency)
        }
    }
    return result
}

export function getFeatSpells(featIds: string[]): string[] {
    const result: string[] = []
    for (const featId of featIds) {
        const feat = getFeatById(featId)
        if (feat?.spells) {
            result.push(...feat.spells)
        }
    }
    return result
}

export function isFeatSpell(spellName: string, featIds: string[]): boolean {
    return getFeatSpells(featIds).some(s =>
        s.toLowerCase() === spellName.toLowerCase()
    )
}
