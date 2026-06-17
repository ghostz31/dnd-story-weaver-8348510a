export interface RacialSpellEntry {
    characterLevel: number
    spells: string[]
    /** Type de sort : cantrip = tour de magie, spell = sort avec utilisation limitée */
    type: 'cantrip' | 'innate'
}

export interface RacialSpellList {
    raceId: string
    /** Label affiché (ex: "Héritage infernal", "Sort mineur elfique") */
    label: string
    /** Caractéristique d'incantation pour ces sorts */
    spellcastingAbility: 'cha' | 'int' | 'wis' | 'con'
    entries: RacialSpellEntry[]
}

const tieflingSpells: RacialSpellList = {
    raceId: 'tiefling',
    label: 'Héritage infernal',
    spellcastingAbility: 'cha',
    entries: [
        { characterLevel: 1, spells: ['Thaumaturgie'], type: 'cantrip' },
        { characterLevel: 3, spells: ['Représailles infernales'], type: 'innate' },
        { characterLevel: 5, spells: ['Ténèbres'], type: 'innate' },
    ],
}

const highElfSpells: RacialSpellList = {
    raceId: 'high_elf',
    label: 'Sort mineur elfique',
    spellcastingAbility: 'int',
    entries: [
        { characterLevel: 1, spells: [], type: 'cantrip' },
    ],
}

const drowSpells: RacialSpellList = {
    raceId: 'drow',
    label: 'Magie drow',
    spellcastingAbility: 'cha',
    entries: [
        { characterLevel: 1, spells: ['Lueurs féeriques'], type: 'cantrip' },
        { characterLevel: 3, spells: ['Nappe de brouillard'], type: 'innate' },
        { characterLevel: 5, spells: ['Ténèbres'], type: 'innate' },
    ],
}

const forestGnomeSpells: RacialSpellList = {
    raceId: 'forest_gnome',
    label: 'Illusionniste-né',
    spellcastingAbility: 'int',
    entries: [
        { characterLevel: 1, spells: ['Illusion mineure'], type: 'cantrip' },
    ],
}

const firbolgSpells: RacialSpellList = {
    raceId: 'firbolg',
    label: 'Magie firbolg',
    spellcastingAbility: 'wis',
    entries: [
        { characterLevel: 1, spells: ['Détection de la magie', 'Déguisement'], type: 'innate' },
    ],
}

const tritonSpells: RacialSpellList = {
    raceId: 'triton',
    label: 'Emprise des profondeurs',
    spellcastingAbility: 'cha',
    entries: [
        { characterLevel: 1, spells: ['Nappe de brouillard'], type: 'innate' },
        { characterLevel: 3, spells: ['Assistance'], type: 'innate' },
        { characterLevel: 5, spells: ["Mur d'eau"], type: 'innate' },
    ],
}

const satyrSpells: RacialSpellList = {
    raceId: 'satyr',
    label: 'Magie occulte',
    spellcastingAbility: 'cha',
    entries: [
        { characterLevel: 1, spells: ['Prestidigitation'], type: 'cantrip' },
        { characterLevel: 3, spells: ['Charme-personne'], type: 'innate' },
        { characterLevel: 5, spells: ['Enchevêtrement'], type: 'innate' },
    ],
}

const aasimarSpells: RacialSpellList = {
    raceId: 'aasimar',
    label: 'Héritage céleste',
    spellcastingAbility: 'cha',
    entries: [
        { characterLevel: 1, spells: ['Lumière'], type: 'cantrip' },
        { characterLevel: 3, spells: ['Assistance'], type: 'innate' },
        { characterLevel: 5, spells: ['Flamme éternelle'], type: 'innate' },
    ],
}

const genasiAirSpells: RacialSpellList = {
    raceId: 'air_genasi',
    label: 'Héritage élémentaire',
    spellcastingAbility: 'con',
    entries: [
        { characterLevel: 1, spells: ['Lévitation'], type: 'innate' },
    ],
}

const genasiFireSpells: RacialSpellList = {
    raceId: 'fire_genasi',
    label: 'Héritage élémentaire',
    spellcastingAbility: 'con',
    entries: [
        { characterLevel: 1, spells: ['Prestidigitation'], type: 'cantrip' },
        { characterLevel: 3, spells: ['Flammes'], type: 'innate' },
    ],
}

const genasiEarthSpells: RacialSpellList = {
    raceId: 'earth_genasi',
    label: 'Héritage élémentaire',
    spellcastingAbility: 'con',
    entries: [
        { characterLevel: 1, spells: ['Façonnage de la pierre'], type: 'innate' },
    ],
}

export const allRacialSpells: RacialSpellList[] = [
    tieflingSpells,
    highElfSpells,
    drowSpells,
    forestGnomeSpells,
    firbolgSpells,
    tritonSpells,
    satyrSpells,
    aasimarSpells,
    genasiAirSpells,
    genasiFireSpells,
    genasiEarthSpells,
]

export function getRacialSpells(raceId: string | null | undefined, subraceId: string | null | undefined, characterLevel: number): string[] {
    if (!raceId) return []
    const spells: string[] = []
    const racialList = allRacialSpells.find(s => s.raceId === raceId || s.raceId === subraceId)
    if (!racialList) return []
    for (const entry of racialList.entries) {
        if (characterLevel >= entry.characterLevel) {
            spells.push(...entry.spells)
        }
    }
    return [...new Set(spells)]
}

export function getRacialSpellList(raceId: string | null | undefined, subraceId: string | null | undefined): RacialSpellList | null {
    if (!raceId) return null
    return allRacialSpells.find(s => s.raceId === raceId || s.raceId === subraceId) ?? null
}

export function getRacialSpellLabel(raceId: string | null | undefined, subraceId: string | null | undefined): string {
    const list = getRacialSpellList(raceId, subraceId)
    return list?.label ?? ''
}

export function isRacialSpell(spellName: string, raceId: string | null | undefined, subraceId: string | null | undefined, characterLevel: number): boolean {
    const spells = getRacialSpells(raceId, subraceId, characterLevel)
    return spells.includes(spellName)
}