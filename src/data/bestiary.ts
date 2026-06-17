import type { WildShapeBeast } from '../types/wild-shape'

export const bestiary: WildShapeBeast[] = [
    // ========== CR 0 ==========
    {
        id: 'wolf',
        name: 'Loup',
        nameEn: 'Wolf',
        cr: 0.25,
        size: 'M',
        hp: 11,
        ac: 13,
        speed: { walk: 40 },
        abilityScores: { str: 12, dex: 15, con: 12, int: 3, wis: 12, cha: 6 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 4, damage: '2d4+2', damageType: 'perforant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Perception passive 13'],
    },
    {
        id: 'panther',
        name: 'Panthère',
        nameEn: 'Panther',
        cr: 0.25,
        size: 'M',
        hp: 13,
        ac: 12,
        speed: { walk: 50, climb: 40 },
        abilityScores: { str: 14, dex: 15, con: 10, int: 3, wis: 14, cha: 7 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 4, damage: '1d6+2', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 4, damage: '1d6+2', damageType: 'perforant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Perception passive 14'],
    },
    {
        id: 'giant-owl',
        name: 'Hibou géant',
        nameEn: 'Giant Owl',
        cr: 0.25,
        size: 'M',
        hp: 19,
        ac: 12,
        speed: { walk: 5, fly: 60 },
        abilityScores: { str: 13, dex: 15, con: 12, int: 8, wis: 13, cha: 10 },
        attacks: [
            { name: 'Serres', nameEn: 'Talons', bonus: 3, damage: '2d6+1', damageType: 'tranchant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Vision dans le noir 36m', 'Perception passive 15'],
    },
    {
        id: 'giant-badger',
        name: 'Blaireau géant',
        nameEn: 'Giant Badger',
        cr: 0.25,
        size: 'M',
        hp: 13,
        ac: 10,
        speed: { walk: 30, burrow: 10 },
        abilityScores: { str: 13, dex: 10, con: 15, int: 2, wis: 12, cha: 5 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 3, damage: '2d4+1', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 3, damage: '1d6+1', damageType: 'perforant' },
        ],
        senses: ['Vision dans le noir 9m', 'Odorat'],
    },
    {
        id: 'boar',
        name: 'Sanglier',
        nameEn: 'Boar',
        cr: 0.25,
        size: 'M',
        hp: 11,
        ac: 11,
        speed: { walk: 40 },
        abilityScores: { str: 13, dex: 11, con: 12, int: 2, wis: 9, cha: 5 },
        attacks: [
            { name: 'Défenses', nameEn: 'Tusks', bonus: 3, damage: '1d6+1', damageType: 'tranchant' },
        ],
        traits: [
            { name: 'Charge', description: 'Si la bête se déplace d\'au moins 6 m vers une cible puis la touche avec ses Défenses, la cible subit 1d6 dégâts tranchants supplémentaires.' },
        ],
    },
    {
        id: 'elk',
        name: 'Élan',
        nameEn: 'Elk',
        cr: 0.25,
        size: 'G',
        hp: 13,
        ac: 10,
        speed: { walk: 50 },
        abilityScores: { str: 16, dex: 10, con: 12, int: 2, wis: 10, cha: 6 },
        attacks: [
            { name: 'Corne', nameEn: 'Ram', bonus: 5, damage: '1d6+3', damageType: 'contondant' },
        ],
    },
    {
        id: 'constrictor-snake',
        name: 'Constricteur',
        nameEn: 'Constrictor Snake',
        cr: 0.25,
        size: 'G',
        hp: 13,
        ac: 12,
        speed: { walk: 30, swim: 30 },
        abilityScores: { str: 15, dex: 14, con: 12, int: 1, wis: 10, cha: 3 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 4, damage: '1d6+2', damageType: 'perforant' },
            { name: 'Étreinte', nameEn: 'Constrict', bonus: 4, damage: '1d8+2', damageType: 'contondant', properties: ['empoigne'] },
        ],
    },
    // ========== CR 1/2 ==========
    {
        id: 'ape',
        name: 'Singe',
        nameEn: 'Ape',
        cr: 0.5,
        size: 'M',
        hp: 19,
        ac: 12,
        speed: { walk: 30, climb: 30 },
        abilityScores: { str: 16, dex: 14, con: 14, int: 6, wis: 12, cha: 7 },
        attacks: [
            { name: 'Poing', nameEn: 'Fist', bonus: 5, damage: '1d6+3', damageType: 'contondant' },
            { name: 'Rocher', nameEn: 'Rock', bonus: 5, damage: '1d6+3', damageType: 'contondant', range: { normal: 7, long: 21 } },
        ],
    },
    {
        id: 'black-bear',
        name: 'Ours noir',
        nameEn: 'Black Bear',
        cr: 0.5,
        size: 'M',
        hp: 19,
        ac: 11,
        speed: { walk: 40, climb: 30 },
        abilityScores: { str: 15, dex: 10, con: 14, int: 2, wis: 12, cha: 7 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 3, damage: '2d4+2', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 3, damage: '1d6+2', damageType: 'perforant' },
        ],
        senses: ['Odorat'],
    },
    {
        id: 'crocodile',
        name: 'Crocodile',
        nameEn: 'Crocodile',
        cr: 0.5,
        size: 'G',
        hp: 19,
        ac: 12,
        speed: { walk: 20, swim: 30 },
        abilityScores: { str: 15, dex: 10, con: 13, int: 2, wis: 10, cha: 5 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 4, damage: '1d10+2', damageType: 'perforant' },
        ],
        traits: [
            { name: 'Retenir le souffle', description: 'Le crocodile peut retenir son souffle pendant 15 minutes.' },
        ],
    },
    {
        id: 'reef-shark',
        name: 'Requin de récif',
        nameEn: 'Reef Shark',
        cr: 0.5,
        size: 'M',
        hp: 22,
        ac: 12,
        speed: { walk: 0, swim: 40 },
        abilityScores: { str: 14, dex: 13, con: 13, int: 1, wis: 10, cha: 4 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 4, damage: '1d8+2', damageType: 'perforant' },
        ],
        senses: ['Vision dans le noir 9m'],
        traits: [
            { name: 'Frénésie sanglante', description: 'Avantage aux attaques de morsure contre une créature sans tous ses PV.' },
        ],
    },
    // ========== CR 1 ==========
    {
        id: 'brown-bear',
        name: 'Ours brun',
        nameEn: 'Brown Bear',
        cr: 1,
        size: 'G',
        hp: 34,
        ac: 11,
        speed: { walk: 40, climb: 30 },
        abilityScores: { str: 19, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 5, damage: '2d6+4', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 5, damage: '1d8+4', damageType: 'perforant' },
        ],
        senses: ['Odorat'],
    },
    {
        id: 'dire-wolf',
        name: 'Loup sinistre',
        nameEn: 'Dire Wolf',
        cr: 1,
        size: 'G',
        hp: 37,
        ac: 14,
        speed: { walk: 50 },
        abilityScores: { str: 17, dex: 15, con: 15, int: 3, wis: 12, cha: 7 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 5, damage: '2d6+3', damageType: 'perforant' },
        ],
        skills: ['Perception'],
        senses: ['Perception passive 13'],
        traits: [
            { name: 'Tactique de meute', description: 'Avantage aux jets d\'attaque si un allié est à 1,5 m de la cible.' },
        ],
    },
    {
        id: 'giant-eagle',
        name: 'Aigle géant',
        nameEn: 'Giant Eagle',
        cr: 1,
        size: 'G',
        hp: 26,
        ac: 13,
        speed: { walk: 10, fly: 80 },
        abilityScores: { str: 16, dex: 17, con: 13, int: 8, wis: 14, cha: 10 },
        attacks: [
            { name: 'Bec', nameEn: 'Beak', bonus: 5, damage: '1d6+3', damageType: 'perforant' },
            { name: 'Serres', nameEn: 'Talons', bonus: 5, damage: '2d6+3', damageType: 'tranchant' },
        ],
        skills: ['Perception'],
        senses: ['Perception passive 14'],
    },
    {
        id: 'giant-spider',
        name: 'Araignée géante',
        nameEn: 'Giant Spider',
        cr: 1,
        size: 'G',
        hp: 26,
        ac: 14,
        speed: { walk: 30, climb: 30 },
        abilityScores: { str: 14, dex: 16, con: 12, int: 2, wis: 11, cha: 4 },
        attacks: [
            { name: 'Morsure', nameEn: 'Bite', bonus: 5, damage: '1d8+2', damageType: 'perforant' },
        ],
        skills: ['Discrétion'],
        senses: ['Vision dans le noir 18m', 'Perception passive 10'],
        traits: [
            { name: 'Toile', description: 'Attaque à distance (9m/18m) : empoigne la cible.' },
        ],
    },
    {
        id: 'lion',
        name: 'Lion',
        nameEn: 'Lion',
        cr: 1,
        size: 'G',
        hp: 26,
        ac: 12,
        speed: { walk: 50 },
        abilityScores: { str: 17, dex: 15, con: 13, int: 3, wis: 12, cha: 8 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 5, damage: '1d8+3', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 5, damage: '1d8+3', damageType: 'perforant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Perception passive 13'],
        traits: [
            { name: 'Bond', description: 'Si le lion se déplace d\'au moins 6 m puis attaque, la cible doit réussir un JS de FOR DD 13 ou être renversée.' },
        ],
    },
    {
        id: 'tiger',
        name: 'Tigre',
        nameEn: 'Tiger',
        cr: 1,
        size: 'G',
        hp: 37,
        ac: 12,
        speed: { walk: 40 },
        abilityScores: { str: 17, dex: 15, con: 14, int: 3, wis: 12, cha: 8 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 5, damage: '1d8+3', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 5, damage: '1d10+3', damageType: 'perforant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Vision dans le noir 18m', 'Perception passive 13'],
        traits: [
            { name: 'Bond', description: 'Si le tigre se déplace d\'au moins 6 m puis attaque, la cible doit réussir un JS de FOR DD 13 ou être renversée.' },
        ],
    },
    // ========== CR 2 (Moon Druid) ==========
    {
        id: 'polar-bear',
        name: 'Ours polaire',
        nameEn: 'Polar Bear',
        cr: 2,
        size: 'G',
        hp: 42,
        ac: 12,
        speed: { walk: 40, swim: 30 },
        abilityScores: { str: 20, dex: 10, con: 16, int: 2, wis: 13, cha: 7 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 7, damage: '2d8+5', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 7, damage: '1d8+5', damageType: 'perforant' },
        ],
        senses: ['Odorat'],
    },
    {
        id: 'giant-elk',
        name: 'Élan géant',
        nameEn: 'Giant Elk',
        cr: 2,
        size: 'G',
        hp: 42,
        ac: 14,
        speed: { walk: 60 },
        abilityScores: { str: 19, dex: 16, con: 14, int: 7, wis: 14, cha: 10 },
        attacks: [
            { name: 'Corne', nameEn: 'Ram', bonus: 6, damage: '2d6+4', damageType: 'contondant' },
        ],
        skills: ['Perception'],
        senses: ['Perception passive 14'],
    },
    {
        id: 'rhinoceros',
        name: 'Rhinocéros',
        nameEn: 'Rhinoceros',
        cr: 2,
        size: 'G',
        hp: 45,
        ac: 11,
        speed: { walk: 40 },
        abilityScores: { str: 21, dex: 8, con: 15, int: 2, wis: 12, cha: 6 },
        attacks: [
            { name: 'Corne', nameEn: 'Gore', bonus: 7, damage: '2d8+5', damageType: 'perforant' },
        ],
        traits: [
            { name: 'Charge', description: 'Si le rhinocéros se déplace d\'au moins 6 m vers une cible puis la touche avec sa Corne, la cible subit 2d8 dégâts perforants supplémentaires et est repoussée de 1,5 m.' },
        ],
    },
    {
        id: 'saber-toothed-tiger',
        name: 'Tigre à dents de sabre',
        nameEn: 'Saber-Toothed Tiger',
        cr: 2,
        size: 'G',
        hp: 52,
        ac: 12,
        speed: { walk: 40 },
        abilityScores: { str: 18, dex: 14, con: 15, int: 3, wis: 12, cha: 8 },
        attacks: [
            { name: 'Griffe', nameEn: 'Claw', bonus: 6, damage: '2d6+4', damageType: 'tranchant' },
            { name: 'Morsure', nameEn: 'Bite', bonus: 6, damage: '1d10+4', damageType: 'perforant' },
        ],
        skills: ['Perception', 'Discrétion'],
        senses: ['Perception passive 13'],
        traits: [
            { name: 'Bond', description: 'Si le tigre se déplace d\'au moins 6 m puis attaque, la cible doit réussir un JS de FOR DD 14 ou être renversée.' },
        ],
    },
    // ========== CR 3+ (Moon Druid haut niveau) ==========
    {
        id: 'giant-scorpion',
        name: 'Scorpion géant',
        nameEn: 'Giant Scorpion',
        cr: 3,
        size: 'G',
        hp: 52,
        ac: 15,
        speed: { walk: 40 },
        abilityScores: { str: 15, dex: 13, con: 15, int: 1, wis: 9, cha: 3 },
        attacks: [
            { name: 'Pince', nameEn: 'Claw', bonus: 4, damage: '1d8+2', damageType: 'tranchant' },
            { name: 'Dard', nameEn: 'Sting', bonus: 4, damage: '1d10+2', damageType: 'perforant' },
        ],
        senses: ['Vision dans le noir 18m'],
    },
    {
        id: 'elephant',
        name: 'Éléphant',
        nameEn: 'Elephant',
        cr: 4,
        size: 'TG',
        hp: 76,
        ac: 12,
        speed: { walk: 40 },
        abilityScores: { str: 22, dex: 9, con: 17, int: 3, wis: 11, cha: 6 },
        attacks: [
            { name: 'Trompe', nameEn: 'Trunk', bonus: 8, damage: '2d6+6', damageType: 'contondant' },
            { name: 'Pied', nameEn: 'Foot', bonus: 8, damage: '2d10+6', damageType: 'contondant' },
        ],
    },
    {
        id: 'mammoth',
        name: 'Mammouth',
        nameEn: 'Mammoth',
        cr: 6,
        size: 'TG',
        hp: 126,
        ac: 13,
        speed: { walk: 40 },
        abilityScores: { str: 24, dex: 9, con: 21, int: 3, wis: 11, cha: 6 },
        attacks: [
            { name: 'Défenses', nameEn: 'Gore', bonus: 10, damage: '4d8+7', damageType: 'perforant' },
            { name: 'Pied', nameEn: 'Foot', bonus: 10, damage: '4d10+7', damageType: 'contondant' },
        ],
        traits: [
            { name: 'Charge', description: 'Si le mammouth se déplace d\'au moins 6 m vers une cible puis la touche avec ses Défenses, la cible subit 4d8 dégâts perforants supplémentaires et est repoussée de 1,5 m.' },
        ],
    },
]

export function getBeastById(id: string): WildShapeBeast | undefined {
    return bestiary.find(b => b.id === id)
}

export function getBeastsByCR(maxCR: number): WildShapeBeast[] {
    return bestiary.filter(b => b.cr <= maxCR).sort((a, b) => a.cr - b.cr || a.name.localeCompare(b.name))
}

export function getAvailableBeasts(
    level: number,
    subclass?: string,
    canFly = false,
    canSwim = false
): WildShapeBeast[] {
    let maxCR: number

    if (subclass === 'moon') {
        maxCR = level >= 6 ? Math.floor(level / 3) : 1
    } else {
        if (level < 2) return []
        if (level < 4) maxCR = 0.25
        else if (level < 8) maxCR = 0.5
        else maxCR = 1
    }

    let beasts = getBeastsByCR(maxCR)

    if (!canFly) {
        beasts = beasts.filter(b => !b.speed.fly)
    }
    if (!canSwim) {
        beasts = beasts.filter(b => !b.speed.swim)
    }

    return beasts
}
