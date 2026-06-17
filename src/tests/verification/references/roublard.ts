import type { FullClassRef } from '../reference-types'

export const roublardRef: FullClassRef = {
    name: 'Roublard',
    nameEn: 'Rogue',
    hitDie: 8,
    primaryAbility: 'dex',
    savingThrows: ['dex', 'int'],
    armorProficiencies: ['armures légères'],
    weaponProficiencies: ['armes courantes', 'arbalète de poing', 'épée courte', 'épée longue', 'rapière'],
    skillChoices: ['Acrobaties', 'Athlétisme', 'Discrétion', 'Escamotage', 'Intimidation', 'Intuition', 'Investigation', 'Perception', 'Persuasion', 'Représentation', 'Tromperie'],
    numSkillChoices: 4,
    tools: ['outils de voleur'],
    startingEquipment: ['rapière ou épée courte', 'arc court + flèches ou épée courte', 'sac cambrioleur/explo/exploration', 'armure cuir + 2 dagues + outils voleur'],

    progression: [
        { level: 1,  proficiencyBonus: 2, features: ['Expertise', 'Attaque sournoise', 'Jargon des voleurs'], resources: { sneakAttack: 1 } },
        { level: 2,  proficiencyBonus: 2, features: ['Ruse'], resources: { sneakAttack: 1 } },
        { level: 3,  proficiencyBonus: 2, features: ['Archétype de roublard'], resources: { sneakAttack: 2 } },
        { level: 4,  proficiencyBonus: 2, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 2 } },
        { level: 5,  proficiencyBonus: 3, features: ['Esquive instinctive'], resources: { sneakAttack: 3 } },
        { level: 6,  proficiencyBonus: 3, features: ['Expertise'], resources: { sneakAttack: 3 } },
        { level: 7,  proficiencyBonus: 3, features: ['Esquive totale'], resources: { sneakAttack: 4 } },
        { level: 8,  proficiencyBonus: 3, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 4 } },
        { level: 9,  proficiencyBonus: 4, features: ['Capacité de l\'archétype'], resources: { sneakAttack: 5 } },
        { level: 10, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 5 } },
        { level: 11, proficiencyBonus: 4, features: ['Savoir-faire'], resources: { sneakAttack: 6 } },
        { level: 12, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 6 } },
        { level: 13, proficiencyBonus: 5, features: ['Capacité de l\'archétype'], resources: { sneakAttack: 7 } },
        { level: 14, proficiencyBonus: 5, features: ['Perception aveugle'], resources: { sneakAttack: 7 } },
        { level: 15, proficiencyBonus: 5, features: ['Esprit fuyant'], resources: { sneakAttack: 8 } },
        { level: 16, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 8 } },
        { level: 17, proficiencyBonus: 6, features: ['Capacité de l\'archétype'], resources: { sneakAttack: 9 } },
        { level: 18, proficiencyBonus: 6, features: ['Insaisissable'], resources: { sneakAttack: 9 } },
        { level: 19, proficiencyBonus: 6, features: ['Amélioration de caractéristiques'], resources: { sneakAttack: 10 } },
        { level: 20, proficiencyBonus: 6, features: ['Coup de chance'], resources: { sneakAttack: 10 } },
    ],

    resourceTables: {
        rogueSneakAttackDice: [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10],
    },

    classActions: {
        sneakAttack: { restoreOn: 'never', availableFrom: 1 },
        cunningAction: { restoreOn: 'never', availableFrom: 2 },
        uncannyDodge: { restoreOn: 'never', availableFrom: 5 },
        evasion: { restoreOn: 'never', availableFrom: 7 },
        reliableTalent: { restoreOn: 'never', availableFrom: 11 },
        blindSense: { restoreOn: 'never', availableFrom: 14 },
        slipperyMind: { restoreOn: 'never', availableFrom: 15 },
        elusive: { restoreOn: 'never', availableFrom: 18 },
        strokeOfLuck: { restoreOn: 'short', availableFrom: 20 },
    },

    subclasses: {
        thief: {
            id: 'thief', name: 'Voleur', source: 'PHB',
            features: {
                3:  { name: 'Mains lestes', keywords: ['ruse', 'escamotage', 'outils de voleur'] },
                3.1: { name: 'Seconde histoire', keywords: ['escalade', 'saut'] },
                9:  { name: 'Discrétion suprême', keywords: ['avantage', 'discrétion', 'moitié', 'vitesse'] },
                13: { name: 'Utilisation d\'objets magiques', keywords: ['magique', 'classe', 'race', 'niveau'] },
                17: { name: 'Réflexes de voleur', keywords: ['deux tours', 'premier round'] },
            },
        },
        assassin: {
            id: 'assassin', name: 'Assassin', source: 'PHB',
            features: {
                3:  { name: 'Maîtrises supplémentaires', keywords: ['déguisement', 'empoisonneur'] },
                3.1: { name: 'Assassinat', keywords: ['avantage', 'surpris', 'critique'] },
                9:  { name: 'Expert en infiltration', keywords: ['identité', '7 jours', '25 po'] },
                13: { name: 'Imposteur', keywords: ['imitez', 'voix', 'écriture', 'comportement'] },
                17: { name: 'Coup de grâce', keywords: ['surprise', 'constitution', 'double'] },
            },
        },
        arcane_trickster: {
            id: 'arcane_trickster', name: 'Escroc Arcanique', source: 'PHB',
            features: {
                3:  { name: 'Incantation', keywords: ['main du mage', 'sort', 'magicien'] },
                3.1: { name: 'Main de mage améliorée', keywords: ['main', 'invisible', 'crocheter', 'piège'] },
                9:  { name: 'Embuscade magique', keywords: ['caché', 'désavantage', 'sauvegarde'] },
                13: { name: 'Polyvalence magique', keywords: ['main du mage', 'discrétion', 'escamotage'] },
                17: { name: 'Voleur de sorts', keywords: ['réaction', 'sort', 'vole'] },
            },
        },
    },
}
