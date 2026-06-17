import type { FullClassRef } from '../reference-types'

export const moineRef: FullClassRef = {
    name: 'Moine',
    nameEn: 'Monk',
    hitDie: 8,
    primaryAbility: 'dex',
    savingThrows: ['str', 'dex'],
    armorProficiencies: ['aucune'],
    weaponProficiencies: ['armes courantes', 'épée courte'],
    skillChoices: ['Acrobaties', 'Athlétisme', 'Discrétion', 'Histoire', 'Intuition', 'Religion'],
    numSkillChoices: 2,
    tools: ['un outil d\'artisan ou un instrument de musique'],
    startingEquipment: ['épée courte ou arme courante', 'sac d\'exploration', '10 fléchettes'],

    progression: [
        { level: 1,  proficiencyBonus: 2, features: ['Défense sans armure', 'Arts martiaux'], resources: { martialArts: 'd4', ki: 0, unarmoredMove: 0 } },
        { level: 2,  proficiencyBonus: 2, features: ['Ki', 'Déplacement sans armure'], resources: { martialArts: 'd4', ki: 2, unarmoredMove: 3 } },
        { level: 3,  proficiencyBonus: 2, features: ['Tradition monastique', 'Parade de projectiles'], resources: { ki: 3, unarmoredMove: 3 } },
        { level: 4,  proficiencyBonus: 2, features: ['Amélioration de caractéristiques', 'Chute ralentie'], resources: { ki: 4 } },
        { level: 5,  proficiencyBonus: 3, features: ['Attaque supplémentaire', 'Frappe étourdissante'], resources: { martialArts: 'd6', ki: 5 } },
        { level: 6,  proficiencyBonus: 3, features: ['Frappes de ki', 'Capacité de la tradition'], resources: { ki: 6, unarmoredMove: 4.5 } },
        { level: 7,  proficiencyBonus: 3, features: ['Esquive totale', 'Plénitude intérieure'], resources: { ki: 7 } },
        { level: 8,  proficiencyBonus: 3, features: ['Amélioration de caractéristiques'], resources: { ki: 8 } },
        { level: 9,  proficiencyBonus: 4, features: ['Déplacement sans armure amélioré'], resources: { ki: 9 } },
        { level: 10, proficiencyBonus: 4, features: ['Pureté du corps'], resources: { ki: 10, unarmoredMove: 6 } },
        { level: 11, proficiencyBonus: 4, features: [] },
        { level: 12, proficiencyBonus: 4, features: ['Amélioration de caractéristiques'], resources: { ki: 12 } },
        { level: 13, proficiencyBonus: 5, features: ['Langue du soleil et de la lune'], resources: { ki: 13 } },
        { level: 14, proficiencyBonus: 5, features: ['Âme de diamant'], resources: { ki: 14, unarmoredMove: 7.5 } },
        { level: 15, proficiencyBonus: 5, features: ['Jeunesse éternelle'], resources: { ki: 15 } },
        { level: 16, proficiencyBonus: 5, features: ['Amélioration de caractéristiques'], resources: { ki: 16 } },
        { level: 17, proficiencyBonus: 6, features: [] },
        { level: 18, proficiencyBonus: 6, features: ['Désertion de l\'âme'], resources: { ki: 18, unarmoredMove: 9 } },
        { level: 19, proficiencyBonus: 6, features: ['Amélioration de caractéristiques'], resources: { ki: 19 } },
        { level: 20, proficiencyBonus: 6, features: ['Perfection de l\'être'], resources: { martialArts: 'd10', ki: 20, unarmoredMove: 9 } },
    ],

    resourceTables: {
        monkKiPoints: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
        monkMartialArtsDie: ['d4', 'd4', 'd4', 'd4', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10'],
        monkUnarmoredMovement: [0, 3, 3, 3, 3, 4.5, 4.5, 4.5, 4.5, 6, 6, 6, 6, 7.5, 7.5, 7.5, 7.5, 9, 9, 9],
    },

    classActions: {
        ki: { restoreOn: 'short', availableFrom: 2 },
        unarmoredMovement: { restoreOn: 'never', availableFrom: 2 },
        deflectMissiles: { restoreOn: 'never', availableFrom: 3 },
        extraAttack: { restoreOn: 'never', availableFrom: 5 },
        stunningStrike: { restoreOn: 'never', availableFrom: 5 },
        evasion: { restoreOn: 'never', availableFrom: 7 },
        stillnessOfMind: { restoreOn: 'never', availableFrom: 7 },
        purityOfBody: { restoreOn: 'never', availableFrom: 10 },
        diamondSoul: { restoreOn: 'never', availableFrom: 14 },
        emptyBody: { restoreOn: 'never', availableFrom: 18 },
        perfectSelf: { restoreOn: 'never', availableFrom: 20 },
    },

    subclasses: {
        open_hand: {
            id: 'open_hand', name: 'Voie de la Paume', source: 'PHB',
            features: {
                3:  { name: 'Technique de la paume', keywords: ['déluge de coups', 'poussez', 'réaction'] },
                6:  { name: 'Plénitude physique', keywords: ['3', 'niveau', 'repos long'] },
                11: { name: 'Tranquillité', keywords: ['sanctuaire', 'repos long'] },
                17: { name: 'Paume vibratoire', keywords: ['vibration', '0 pv'] },
            },
        },
        shadow: {
            id: 'shadow', name: 'Voie de l\'Ombre', source: 'PHB',
            features: {
                3:  { name: 'Sorts de l\'ombre', keywords: ['ténèbres', 'vision dans le noir', 'passage sans trace', 'silence'] },
                6:  { name: 'Téléportation d\'ombre', keywords: ['téléport', 'lumière faible', 'ténèbres'] },
                11: { name: 'Manteau d\'ombre', keywords: ['invisible', 'lumière faible'] },
                17: { name: 'Frappe d\'ombre', keywords: ['réaction', 'attaque', 'touche'] },
            },
        },
    },
}
