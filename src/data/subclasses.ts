import type { Subclass, SubclassFeature } from './subclasses/types'

export * from './subclasses/types'
export * from './subclasses/barbarian'
export * from './subclasses/bard'
export * from './subclasses/cleric'
export * from './subclasses/druid'
export * from './subclasses/sorcerer'
export * from './subclasses/fighter'
export * from './subclasses/wizard'
export * from './subclasses/monk'
export * from './subclasses/warlock'
export * from './subclasses/paladin'
export * from './subclasses/ranger'
export * from './subclasses/rogue'

import { barbarianSubclasses } from './subclasses/barbarian'
import { bardSubclasses } from './subclasses/bard'
import { clericSubclasses } from './subclasses/cleric'
import { druidSubclasses } from './subclasses/druid'
import { fighterSubclasses } from './subclasses/fighter'
import { monkSubclasses } from './subclasses/monk'
import { paladinSubclasses } from './subclasses/paladin'
import { rangerSubclasses } from './subclasses/ranger'
import { rogueSubclasses } from './subclasses/rogue'
import { sorcererSubclasses } from './subclasses/sorcerer'
import { warlockSubclasses } from './subclasses/warlock'
import { wizardSubclasses } from './subclasses/wizard'

export const subclasses: Subclass[] = [
    ...barbarianSubclasses,
    ...bardSubclasses,
    ...clericSubclasses,
    ...druidSubclasses,
    ...fighterSubclasses,
    ...monkSubclasses,
    ...paladinSubclasses,
    ...rangerSubclasses,
    ...rogueSubclasses,
    ...sorcererSubclasses,
    ...warlockSubclasses,
    ...wizardSubclasses,
]

// Helper : récupérer les sous-classes d'une classe
export function getSubclassesForClass(classId: string): Subclass[] {
    return subclasses.filter(sc => sc.classId === classId)
}

// Helper : récupérer une sous-classe par son ID
export function getSubclassById(subclassId: string): Subclass | undefined {
    return subclasses.find(s => s.id === subclassId)
}

// Helper : récupérer les features d'une sous-classe à un niveau donné
export function getSubclassFeaturesAtLevel(subclassId: string, level: number): SubclassFeature[] {
    const sc = subclasses.find(s => s.id === subclassId)
    return sc ? sc.features.filter(f => f.level <= level) : []
}

// Helper : récupérer le niveau de choix de sous-classe pour une classe
export function getSubclassSelectionLevel(classId: string): number {
    const first = subclasses.find(sc => sc.classId === classId)
    return first?.subclassLevel ?? 3
}
