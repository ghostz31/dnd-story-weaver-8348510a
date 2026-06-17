/**
 * Convertit les données existantes vers le format Aurora V2
 * Usage: npx tsx scripts/convert-to-aurora.mjs
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = join(__dirname, '..')

// ============================================================================
// DONNÉES RACES (extraites de src/data/races.ts)
// ============================================================================

const racesData = [
  {
    id: 'ID_PHB_RACE_DWARF',
    name: 'Nain',
    nameEn: 'Dwarf',
    source: 'PHB',
    size: 'medium',
    speed: 7.5, // 25 ft en mètres
    abilityBonuses: { constitution: 2 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_DWARVEN_RESILIENCE',
      'ID_RACIAL_DWARVEN_COMBAT_TRAINING',
      'ID_RACIAL_STONECUNNING'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_DWARVISH'],
    subraces: [
      {
        id: 'ID_PHB_SUBRACE_HILL_DWARF',
        name: 'Nain des collines',
        nameEn: 'Hill Dwarf',
        abilityBonuses: { wisdom: 1 },
        traits: ['ID_RACIAL_DWARVEN_TOUGHNESS'],
        rules: []
      },
      {
        id: 'ID_PHB_SUBRACE_MOUNTAIN_DWARF',
        name: 'Nain des montagnes',
        nameEn: 'Mountain Dwarf',
        abilityBonuses: { strength: 2 },
        traits: ['ID_RACIAL_DWARVEN_ARMOR_TRAINING'],
        rules: []
      }
    ],
    rules: [
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_BATTLEAXE' },
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_HANDAXE' },
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_LIGHT_HAMMER' },
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_WARHAMMER' }
    ]
  },
  {
    id: 'ID_PHB_RACE_ELF',
    name: 'Elfe',
    nameEn: 'Elf',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { dexterity: 2 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_KEEN_SENSES',
      'ID_RACIAL_FEY_ANCESTRY',
      'ID_RACIAL_TRANCE'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_ELVISH'],
    skillProficiencies: ['ID_SKILL_PERCEPTION'],
    subraces: [
      {
        id: 'ID_PHB_SUBRACE_HIGH_ELF',
        name: 'Elfe des hautes-terres',
        nameEn: 'High Elf',
        abilityBonuses: { intelligence: 1 },
        traits: ['ID_RACIAL_ELF_WEAPON_TRAINING', 'ID_RACIAL_CANTRIP', 'ID_RACIAL_EXTRA_LANGUAGE'],
        rules: [
          { type: 'select', targetType: 'spell', count: 1, options: 'any', supports: ['wizard', 'cantrip'] }
        ]
      },
      {
        id: 'ID_PHB_SUBRACE_WOOD_ELF',
        name: 'Elfe des bois',
        nameEn: 'Wood Elf',
        abilityBonuses: { wisdom: 1 },
        traits: ['ID_RACIAL_ELF_WEAPON_TRAINING', 'ID_RACIAL_FLEET_OF_FOOT', 'ID_RACIAL_MASK_OF_THE_WILD'],
        rules: []
      },
      {
        id: 'ID_PHB_SUBRACE_DROW',
        name: 'Drow',
        nameEn: 'Dark Elf',
        abilityBonuses: { charisma: 1 },
        traits: [
          'ID_RACIAL_SUPERIOR_DARKVISION',
          'ID_RACIAL_SUNLIGHT_SENSITIVITY',
          'ID_RACIAL_DROW_MAGIC'
        ],
        rules: []
      }
    ],
    rules: [
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_PERCEPTION' }
    ]
  },
  {
    id: 'ID_PHB_RACE_HALFLING',
    name: 'Halfelin',
    nameEn: 'Halfling',
    source: 'PHB',
    size: 'small',
    speed: 7.5, // 25 ft
    abilityBonuses: { dexterity: 2 },
    traits: [
      'ID_RACIAL_LUCKY',
      'ID_RACIAL_BRAVE',
      'ID_RACIAL_HALFLING_NIMBLENESS'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_HALFLING'],
    subraces: [
      {
        id: 'ID_PHB_SUBRACE_LIGHTFOOT_HALFLING',
        name: 'Halfelin pied-léger',
        nameEn: 'Lightfoot Halfling',
        abilityBonuses: { charisma: 1 },
        traits: ['ID_RACIAL_NATURALLY_STEALTHY'],
        rules: []
      },
      {
        id: 'ID_PHB_SUBRACE_STOUT_HALFLING',
        name: 'Halfelin robuste',
        nameEn: 'Stout Halfling',
        abilityBonuses: { constitution: 1 },
        traits: ['ID_RACIAL_STOUT_RESILIENCE'],
        rules: []
      }
    ],
    rules: []
  },
  {
    id: 'ID_PHB_RACE_HUMAN',
    name: 'Humain',
    nameEn: 'Human',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { 
      strength: 1, 
      dexterity: 1, 
      constitution: 1, 
      intelligence: 1, 
      wisdom: 1, 
      charisma: 1 
    },
    traits: [],
    languages: ['ID_LANGUAGE_COMMON'],
    rules: [
      { 
        type: 'select', 
        targetType: 'language', 
        count: 1, 
        options: 'any'
      }
    ],
    subraces: [
      {
        id: 'ID_PHB_SUBRACE_VARIANT_HUMAN',
        name: 'Humain (variante)',
        nameEn: 'Variant Human',
        abilityBonuses: {}, // +1 à deux caractéristiques au choix
        traits: [],
        rules: [
          { type: 'select', targetType: 'skill', count: 1, options: 'any' },
          { type: 'select', targetType: 'feat', count: 1, options: 'any' }
        ]
      }
    ]
  },
  {
    id: 'ID_PHB_RACE_DRAGONBORN',
    name: 'Drakéide',
    nameEn: 'Dragonborn',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { strength: 2, charisma: 1 },
    traits: [
      'ID_RACIAL_DRACONIC_ANCESTRY',
      'ID_RACIAL_BREATH_WEAPON',
      'ID_RACIAL_DAMAGE_RESISTANCE'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_DRACONIC'],
    rules: [
      {
        type: 'select',
        targetType: 'trait',
        count: 1,
        options: [
          'ID_RACIAL_DRACONIC_BLACK',
          'ID_RACIAL_DRACONIC_BLUE',
          'ID_RACIAL_DRACONIC_BRASS',
          'ID_RACIAL_DRACONIC_BRONZE',
          'ID_RACIAL_DRACONIC_COPPER',
          'ID_RACIAL_DRACONIC_GOLD',
          'ID_RACIAL_DRACONIC_GREEN',
          'ID_RACIAL_DRACONIC_RED',
          'ID_RACIAL_DRACONIC_SILVER',
          'ID_RACIAL_DRACONIC_WHITE'
        ]
      }
    ],
    subraces: []
  },
  {
    id: 'ID_PHB_RACE_GNOME',
    name: 'Gnome',
    nameEn: 'Gnome',
    source: 'PHB',
    size: 'small',
    speed: 7.5, // 25 ft
    abilityBonuses: { intelligence: 2 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_GNOME_CUNNING'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_GNOMISH'],
    subraces: [
      {
        id: 'ID_PHB_SUBRACE_FOREST_GNOME',
        name: 'Gnome des forêts',
        nameEn: 'Forest Gnome',
        abilityBonuses: { dexterity: 1 },
        traits: ['ID_RACIAL_NATURAL_ILLUSIONIST', 'ID_RACIAL_SPEAK_WITH_SMALL_BEASTS'],
        rules: []
      },
      {
        id: 'ID_PHB_SUBRACE_ROCK_GNOME',
        name: 'Gnome des roches',
        nameEn: 'Rock Gnome',
        abilityBonuses: { constitution: 1 },
        traits: ['ID_RACIAL_ARTIFICERS_LORE', 'ID_RACIAL_TINKER'],
        rules: []
      }
    ],
    rules: []
  },
  {
    id: 'ID_PHB_RACE_HALF_ELF',
    name: 'Demi-elfe',
    nameEn: 'Half-Elf',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { charisma: 2 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_FEY_ANCESTRY',
      'ID_RACIAL_SKILL_VERSATILITY'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_ELVISH'],
    rules: [
      {
        type: 'select',
        targetType: 'ability',
        count: 2,
        options: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom'],
        supports: ['+1']
      },
      {
        type: 'select',
        targetType: 'skill',
        count: 2,
        options: 'any'
      }
    ],
    subraces: []
  },
  {
    id: 'ID_PHB_RACE_HALF_ORC',
    name: 'Demi-orque',
    nameEn: 'Half-Orc',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { strength: 2, constitution: 1 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_MENACING',
      'ID_RACIAL_RELENTLESS_ENDURANCE',
      'ID_RACIAL_SAVAGE_ATTACKS'
    ],
    skillProficiencies: ['ID_SKILL_INTIMIDATION'],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_ORC'],
    rules: [
      { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_INTIMIDATION' }
    ],
    subraces: []
  },
  {
    id: 'ID_PHB_RACE_TIEFLING',
    name: 'Tiefelin',
    nameEn: 'Tiefling',
    source: 'PHB',
    size: 'medium',
    speed: 9, // 30 ft
    abilityBonuses: { intelligence: 1, charisma: 2 },
    traits: [
      'ID_RACIAL_DARKVISION',
      'ID_RACIAL_HELLISH_RESISTANCE',
      'ID_RACIAL_INFERNAL_LEGACY'
    ],
    languages: ['ID_LANGUAGE_COMMON', 'ID_LANGUAGE_INFERNAL'],
    rules: [],
    subraces: []
  }
]

// ============================================================================
// TRAITS RACIAUX DÉTAILLÉS
// ============================================================================

const racialTraitsV2 = {
  'ID_RACIAL_DARKVISION': {
    id: 'ID_RACIAL_DARKVISION',
    name: 'Vision dans le noir',
    nameEn: 'Darkvision',
    source: 'PHB',
    description: 'Vous pouvez voir à 18 mètres dans une lumière faible comme si c\'était une lumière vive, et dans le noir comme si c\'était une lumière faible. Vous ne discernez pas les couleurs dans le noir, seulement des nuances de gris.'
  },
  'ID_RACIAL_DWARVEN_RESILIENCE': {
    id: 'ID_RACIAL_DWARVEN_RESILIENCE',
    name: 'Résistance naine',
    nameEn: 'Dwarven Resilience',
    source: 'PHB',
    description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.'
  },
  'ID_RACIAL_DWARVEN_COMBAT_TRAINING': {
    id: 'ID_RACIAL_DWARVEN_COMBAT_TRAINING',
    name: 'Entraînement aux armes naines',
    nameEn: 'Dwarven Combat Training',
    source: 'PHB',
    description: 'Vous maîtrisez la hache d\'armes, la hachette, le marteau léger et le marteau de guerre.'
  },
  'ID_RACIAL_STONECUNNING': {
    id: 'ID_RACIAL_STONECUNNING',
    name: 'Connaissance de la pierre',
    nameEn: 'Stonecunning',
    source: 'PHB',
    description: 'Chaque fois que vous faites un test d\'Intelligence (Histoire) lié à l\'origine d\'un travail dans la pierre, vous êtes considéré comme maîtrisant la compétence Histoire et ajoutez le double de votre bonus de maîtrise.'
  },
  'ID_RACIAL_DWARVEN_TOUGHNESS': {
    id: 'ID_RACIAL_DWARVEN_TOUGHNESS',
    name: 'Ténacité naine',
    nameEn: 'Dwarven Toughness',
    source: 'PHB',
    description: 'Vos points de vie maximum augmentent de 1, et ils augmentent encore de 1 à chaque fois que vous gagnez un niveau.'
  },
  'ID_RACIAL_DWARVEN_ARMOR_TRAINING': {
    id: 'ID_RACIAL_DWARVEN_ARMOR_TRAINING',
    name: 'Entraînement aux armures naines',
    nameEn: 'Dwarven Armor Training',
    source: 'PHB',
    description: 'Vous maîtrisez les armures légères et les armures intermédiaires.'
  },
  'ID_RACIAL_KEEN_SENSES': {
    id: 'ID_RACIAL_KEEN_SENSES',
    name: 'Sens aiguisés',
    nameEn: 'Keen Senses',
    source: 'PHB',
    description: 'Vous maîtrisez la compétence Perception.'
  },
  'ID_RACIAL_FEY_ANCESTRY': {
    id: 'ID_RACIAL_FEY_ANCESTRY',
    name: 'Ascendance féerique',
    nameEn: 'Fey Ancestry',
    source: 'PHB',
    description: 'Vous avez l\'avantage aux jets de sauvegarde pour ne pas être charmé, et la magie ne peut pas vous endormir.'
  },
  'ID_RACIAL_TRANCE': {
    id: 'ID_RACIAL_TRANCE',
    name: 'Transe',
    nameEn: 'Trance',
    source: 'PHB',
    description: 'Les elfes n\'ont pas besoin de dormir. Au lieu de cela, ils méditent profondément pendant 4 heures par jour. Après un tel repos, vous obtenez les mêmes bénéfices qu\'un humain après 8 heures de sommeil.'
  },
  'ID_RACIAL_ELF_WEAPON_TRAINING': {
    id: 'ID_RACIAL_ELF_WEAPON_TRAINING',
    name: 'Entraînement aux armes elfiques',
    nameEn: 'Elf Weapon Training',
    source: 'PHB',
    description: 'Vous maîtrisez l\'épée longue, l\'épée courte, l\'arc court et l\'arc long.'
  },
  'ID_RACIAL_CANTRIP': {
    id: 'ID_RACIAL_CANTRIP',
    name: 'Sort mineur',
    nameEn: 'Cantrip',
    source: 'PHB',
    description: 'Vous connaissez un sort mineur de votre choix dans la liste de sorts du magicien. L\'Intelligence est votre caractéristique d\'incantation pour ce sort.'
  },
  'ID_RACIAL_EXTRA_LANGUAGE': {
    id: 'ID_RACIAL_EXTRA_LANGUAGE',
    name: 'Langue supplémentaire',
    nameEn: 'Extra Language',
    source: 'PHB',
    description: 'Vous parlez, lisez et écrivez une langue supplémentaire de votre choix.'
  },
  'ID_RACIAL_FLEET_OF_FOOT': {
    id: 'ID_RACIAL_FLEET_OF_FOOT',
    name: 'Pied léger',
    nameEn: 'Fleet of Foot',
    source: 'PHB',
    description: 'Votre vitesse de base passe à 10,5 mètres (35 ft).'
  },
  'ID_RACIAL_MASK_OF_THE_WILD': {
    id: 'ID_RACIAL_MASK_OF_THE_WILD',
    name: 'Camouflage naturel',
    nameEn: 'Mask of the Wild',
    source: 'PHB',
    description: 'Vous pouvez tenter de vous cacher même lorsque vous n\'êtes que légèrement dissimulé par le feuillage, une pluie battante, la neige, la brume ou d\'autres phénomènes naturels.'
  },
  'ID_RACIAL_SUPERIOR_DARKVISION': {
    id: 'ID_RACIAL_SUPERIOR_DARKVISION',
    name: 'Vision dans le noir supérieure',
    nameEn: 'Superior Darkvision',
    source: 'PHB',
    description: 'Votre vision dans le noir a un rayon de 36 mètres.'
  },
  'ID_RACIAL_SUNLIGHT_SENSITIVITY': {
    id: 'ID_RACIAL_SUNLIGHT_SENSITIVITY',
    name: 'Sensibilité au soleil',
    nameEn: 'Sunlight Sensitivity',
    source: 'PHB',
    description: 'Vous avez un désavantage aux jets d\'attaque et aux tests de Sagesse (Perception) liés à la vue lorsque vous, la cible ou ce que vous essayez de percevoir est en plein soleil.'
  },
  'ID_RACIAL_DROW_MAGIC': {
    id: 'ID_RACIAL_DROW_MAGIC',
    name: 'Magie drow',
    nameEn: 'Drow Magic',
    source: 'PHB',
    description: 'Vous connaissez le sort mineur Lumières dansantes. Au niveau 3, vous pouvez lancer Lueurs féeriques (1/jour). Au niveau 5, vous pouvez lancer Ténèbres (1/jour). Le Charisme est votre caractéristique d\'incantation.'
  },
  'ID_RACIAL_LUCKY': {
    id: 'ID_RACIAL_LUCKY',
    name: 'Chanceux',
    nameEn: 'Lucky',
    source: 'PHB',
    description: 'Lorsque vous obtenez un 1 sur le d20 pour un jet d\'attaque, de capacité ou de sauvegarde, vous pouvez relancer le dé et utiliser le nouveau résultat.'
  },
  'ID_RACIAL_BRAVE': {
    id: 'ID_RACIAL_BRAVE',
    name: 'Brave',
    nameEn: 'Brave',
    source: 'PHB',
    description: 'Vous avez l\'avantage aux jets de sauvegarde contre l\'état effrayé.'
  },
  'ID_RACIAL_HALFLING_NIMBLENESS': {
    id: 'ID_RACIAL_HALFLING_NIMBLENESS',
    name: 'Agilité halfeline',
    nameEn: 'Halfling Nimbleness',
    source: 'PHB',
    description: 'Vous pouvez traverser l\'espace occupé par une créature de toute taille supérieure à la vôtre.'
  },
  'ID_RACIAL_NATURALLY_STEALTHY': {
    id: 'ID_RACIAL_NATURALLY_STEALTHY',
    name: 'Naturellement furtif',
    nameEn: 'Naturally Stealthy',
    source: 'PHB',
    description: 'Vous pouvez tenter de vous cacher même lorsque vous êtes masqué seulement par une créature d\'une taille supérieure à la vôtre.'
  },
  'ID_RACIAL_STOUT_RESILIENCE': {
    id: 'ID_RACIAL_STOUT_RESILIENCE',
    name: 'Résistance robuste',
    nameEn: 'Stout Resilience',
    source: 'PHB',
    description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.'
  },
  'ID_RACIAL_DRACONIC_ANCESTRY': {
    id: 'ID_RACIAL_DRACONIC_ANCESTRY',
    name: 'Ancêtre draconique',
    nameEn: 'Draconic Ancestry',
    source: 'PHB',
    description: 'Vous avez un ancêtre dragon. Choisissez un type de dragon qui détermine votre arme de souffle et votre résistance aux dégâts.'
  },
  'ID_RACIAL_BREATH_WEAPON': {
    id: 'ID_RACIAL_BREATH_WEAPON',
    name: 'Arme de souffle',
    nameEn: 'Breath Weapon',
    source: 'PHB',
    description: 'Vous pouvez utiliser votre action pour exhaler une arme de souffle destructrice. La taille, la forme et le type de dégâts dépendent de votre ancêtre draconique.'
  },
  'ID_RACIAL_DAMAGE_RESISTANCE': {
    id: 'ID_RACIAL_DAMAGE_RESISTANCE',
    name: 'Résistance aux dégâts',
    nameEn: 'Damage Resistance',
    source: 'PHB',
    description: 'Vous avez la résistance au type de dégâts associé à votre ancêtre draconique.'
  },
  'ID_RACIAL_GNOME_CUNNING': {
    id: 'ID_RACIAL_GNOME_CUNNING',
    name: 'Ruse gnome',
    nameEn: 'Gnome Cunning',
    source: 'PHB',
    description: 'Vous avez l\'avantage à tous les jets de sauvegarde d\'Intelligence, de Sagesse et de Charisme contre la magie.'
  },
  'ID_RACIAL_NATURAL_ILLUSIONIST': {
    id: 'ID_RACIAL_NATURAL_ILLUSIONIST',
    name: 'Illusionniste naturel',
    nameEn: 'Natural Illusionist',
    source: 'PHB',
    description: 'Vous connaissez le sort mineur Illusion mineure. L\'Intelligence est votre caractéristique d\'incantation.'
  },
  'ID_RACIAL_SPEAK_WITH_SMALL_BEASTS': {
    id: 'ID_RACIAL_SPEAK_WITH_SMALL_BEASTS',
    name: 'Parler avec les petites bêtes',
    nameEn: 'Speak with Small Beasts',
    source: 'PHB',
    description: 'Grâce à des sons et des gestes, vous pouvez communiquer des idées simples aux petites bêtes (bestioles).'
  },
  'ID_RACIAL_ARTIFICERS_LORE': {
    id: 'ID_RACIAL_ARTIFICERS_LORE',
    name: 'Connaissance de l\'artificier',
    nameEn: 'Artificer\'s Lore',
    source: 'PHB',
    description: 'Lorsque vous faites un test d\'Intelligence (Histoire) lié aux objets magiques, aux objets alchimiques ou aux mécanismes techniques, ajoutez deux fois votre bonus de maîtrise.'
  },
  'ID_RACIAL_TINKER': {
    id: 'ID_RACIAL_TINKER',
    name: 'Bricolage',
    nameEn: 'Tinker',
    source: 'PHB',
    description: 'Vous maîtrisez les outils d\'artisan (outils de bricoleur). En utilisant ces outils, vous pouvez passer 1 heure et 10 po de matériaux pour construire un jouet mécanique minuscule.'
  },
  'ID_RACIAL_SKILL_VERSATILITY': {
    id: 'ID_RACIAL_SKILL_VERSATILITY',
    name: 'Polyvalence',
    nameEn: 'Skill Versatility',
    source: 'PHB',
    description: 'Vous gagnez la maîtrise de deux compétences de votre choix.'
  },
  'ID_RACIAL_MENACING': {
    id: 'ID_RACIAL_MENACING',
    name: 'Menaçant',
    nameEn: 'Menacing',
    source: 'PHB',
    description: 'Vous maîtrisez la compétence Intimidation.'
  },
  'ID_RACIAL_RELENTLESS_ENDURANCE': {
    id: 'ID_RACIAL_RELENTLESS_ENDURANCE',
    name: 'Endurance implacable',
    nameEn: 'Relentless Endurance',
    source: 'PHB',
    description: 'Lorsque vous êtes réduit à 0 point de vie mais pas tué, vous pouvez choisir d\'être réduit à 1 point de vie à la place. Vous ne pouvez pas utiliser cette capacité à nouveau avant d\'avoir terminé un repos long.'
  },
  'ID_RACIAL_SAVAGE_ATTACKS': {
    id: 'ID_RACIAL_SAVAGE_ATTACKS',
    name: 'Attaques sauvages',
    nameEn: 'Savage Attacks',
    source: 'PHB',
    description: 'Lorsque vous obtenez un coup critique avec une arme de corps-à-corps, vous pouvez lancer un des dés de dégâts de l\'arme une fois de plus et ajouter le résultat aux dégâts supplémentaires.'
  },
  'ID_RACIAL_HELLISH_RESISTANCE': {
    id: 'ID_RACIAL_HELLISH_RESISTANCE',
    name: 'Résistance infernale',
    nameEn: 'Hellish Resistance',
    source: 'PHB',
    description: 'Vous avez la résistance aux dégâts de feu.'
  },
  'ID_RACIAL_INFERNAL_LEGACY': {
    id: 'ID_RACIAL_INFERNAL_LEGACY',
    name: 'Héritage infernal',
    nameEn: 'Infernal Legacy',
    source: 'PHB',
    description: 'Vous connaissez le sort mineur Thaumaturgie. Au niveau 3, vous pouvez lancer Représailles infernales (2/jour). Au niveau 5, vous pouvez lancer Ténèbres (1/jour). Le Charisme est votre caractéristique d\'incantation.'
  }
}

// ============================================================================
// DONNÉES CLASSES
// ============================================================================

const classesData = [
  {
    id: 'ID_PHB_CLASS_BARBARIAN',
    name: 'Barbare',
    nameEn: 'Barbarian',
    source: 'PHB',
    hitDice: 12,
    primaryAbility: ['strength'],
    savingThrows: ['strength', 'constitution'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_BARBARIAN_1A', name: 'Hache d\'armes', items: ['ID_WEAPON_GLAIVE'], quantity: 1 },
          { id: 'ID_STARTOPT_BARBARIAN_1B', name: 'Arme de guerre', items: ['ID_WEAPON_ANY_MARTIAL'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_BARBARIAN_2A', name: 'Deux hachettes', items: ['ID_WEAPON_HANDAXE'], quantity: 2 },
          { id: 'ID_STARTOPT_BARBARIAN_2B', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ]
      ],
      fixed: ['ID_EQUIPMENT_EXPLORER_PACK', 'ID_WEAPON_JAVELIN']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_RAGE', 
          name: 'Rage', 
          level: 1,
          description: 'Combattez avec une férocité primale. Gagnez des dégâts bonus, résistance aux dégâts contondants/perforants/tranchants, avantage aux jets de Force.'
        },
        { 
          id: 'ID_PHB_FEATURE_UNARMORED_DEFENSE_BARBARIAN', 
          name: 'Défense sans armure', 
          level: 1,
          description: 'CA = 10 + modificateur de DEX + modificateur de CON lorsque vous ne portez pas d\'armure ni de bouclier.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_RECKLESS_ATTACK', 
          name: 'Attaque téméraire', 
          level: 2,
          description: 'Avantage sur vos jets d\'attaque au corps-à-corps avec Force pendant le tour, mais les attaques contre vous ont l\'avantage jusqu\'à votre prochain tour.'
        },
        { 
          id: 'ID_PHB_FEATURE_DANGER_SENSE', 
          name: 'Sens du danger', 
          level: 2,
          description: 'Avantage sur les jets de sauvegarde de Dextérité contre les effets visibles (pièges, sorts) si vous n\'êtes pas aveuglé/assourdi/paralysé.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_PRIMAL_PATH', 
          name: 'Voie primitive', 
          level: 3,
          description: 'Choisissez une voie primitive qui façonne la nature de votre rage.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_BARBARIAN', 
          name: 'Attaque supplémentaire', 
          level: 5,
          description: 'Vous pouvez attaquer deux fois au lieu d\'une lorsque vous utilisez l\'action Attaquer.'
        },
        { 
          id: 'ID_PHB_FEATURE_FAST_MOVEMENT', 
          name: 'Déplacement rapide', 
          level: 5,
          description: 'Votre vitesse augmente de 3 mètres (10 ft) tant que vous ne portez pas d\'armure lourde.'
        }
      ],
      7: [
        { 
          id: 'ID_PHB_FEATURE_FERAL_INSTINCT', 
          name: 'Instinct feral', 
          level: 7,
          description: 'Avantage aux jets d\'initiative. Vous ne pouvez pas être surpris tant que vous n\'êtes pas inconscient.'
        }
      ],
      9: [
        { 
          id: 'ID_PHB_FEATURE_BRUTAL_CRITICAL', 
          name: 'Critique brutal', 
          level: 9,
          description: 'Vous lancez un dé de dégâts supplémentaire lors d\'un coup critique (1 dé au niveau 9, 2 au niveau 13, 3 au niveau 17).'
        }
      ],
      11: [
        { 
          id: 'ID_PHB_FEATURE_RELENTLESS_RAGE', 
          name: 'Rage implacable', 
          level: 11,
          description: 'Si vous tombez à 0 PV alors que vous êtes enragé, faites un jet de sauvegarde de CON DD 10 pour rester à 1 PV.'
        }
      ],
      15: [
        { 
          id: 'ID_PHB_FEATURE_PERSISTENT_RAGE', 
          name: 'Rage persistante', 
          level: 15,
          description: 'Votre rage ne s\'arrête que si vous êtes inconscient ou si vous choisissez de l\'arrêter.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_INDOMITABLE_MIGHT', 
          name: 'Puissance indomptable', 
          level: 18,
          description: 'Si votre total pour un test de Force est inférieur à votre score de Force, utilisez votre score de Force à la place.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_PRIMAL_CHAMPION', 
          name: 'Champion primitif', 
          level: 20,
          description: 'Force et Constitution augmentent de 4 (max 24).'
        }
      ]
    },
    subclasses: [
      {
        id: 'ID_PHB_SUBCLASS_BERSERKER',
        name: 'Chemin du berserker',
        nameEn: 'Path of the Berserker',
        source: 'PHB',
        description: 'La voie du berserker est celle de la rage incontrôlée.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_FRENZY', 
              name: 'Frénésie', 
              level: 3,
              description: 'Lorsque vous ragez, vous pouvez devenir frénétique pour faire une attaque bonus supplémentaire.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_MINDLESS_RAGE', 
              name: 'Rage inconsciente', 
              level: 6,
              description: 'Vous ne pouvez pas être charmé ou effrayé pendant que vous ragez.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_INTIMIDATING_PRESENCE', 
              name: 'Présence intimidante', 
              level: 10,
              description: 'Action pour effrayer une créature à 9 mètres. Jet de sauvegarde de Sagesse.'
            }
          ],
          14: [
            { 
              id: 'ID_PHB_FEATURE_RETALIATION', 
              name: 'Représailles', 
              level: 14,
              description: 'Réaction pour attaquer une créature qui vous blesse (si à 1,5 mètre).'
            }
          ]
        }
      },
      {
        id: 'ID_PHB_SUBCLASS_TOTEM_WARRIOR',
        name: 'Chemin du guerrier totémique',
        nameEn: 'Path of the Totem Warrior',
        source: 'PHB',
        description: 'Un guerrier qui canalise l\'esprit des bêtes.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_SPIRIT_SEEKER', 
              name: 'Chercheur d\'esprits', 
              level: 3,
              description: 'Lancer détection des pièges et détection de la magie comme rituels.'
            },
            { 
              id: 'ID_PHB_FEATURE_TOTEM_SPIRIT', 
              name: 'Esprit totémique', 
              level: 3,
              description: 'Choisissez un totem animal (ours, aigle, loup, etc.) qui vous confère des bénéfices.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_ASPECT_OF_THE_BEAST', 
              name: 'Aspect de la bête', 
              level: 6,
              description: 'Gagnez un trait basé sur votre totem.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_SPIRIT_WALKER', 
              name: 'Marcheur d\'esprits', 
              level: 10,
              description: 'Lancer communion avec la nature comme un rituel.'
            }
          ],
          14: [
            { 
              id: 'ID_PHB_FEATURE_TOTEMIC_ATTUNEMENT', 
              name: 'Harmonie totémique', 
              level: 14,
              description: 'Gagnez un pouvoir puissant basé sur votre totem.'
            }
          ]
        }
      }
    ],
    resources: [
      {
        id: 'ID_RESOURCE_RAGES',
        name: 'Rages',
        progression: {
          1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4, 9: 4, 
          10: 4, 11: 4, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 
          17: 6, 18: 6, 19: 6, 20: 999
        },
        recovery: 'long'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_BARD',
    name: 'Barde',
    nameEn: 'Bard',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['dexterity', 'charisma'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_BARD_1A', name: 'Rapière', items: ['ID_WEAPON_RAPIER'], quantity: 1 },
          { id: 'ID_STARTOPT_BARD_1B', name: 'Épée longue', items: ['ID_WEAPON_LONGSWORD'], quantity: 1 },
          { id: 'ID_STARTOPT_BARD_1C', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_BARD_2A', name: 'Sac d\'diplomate', items: ['ID_EQUIPMENT_DIPLOMAT_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_BARD_2B', name: 'Sac d\'artiste', items: ['ID_EQUIPMENT_ENTERTAINER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_WEAPON_DAGGER', 'ID_EQUIPMENT_LUTE', 'ID_ARMOR_LEATHER']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_BARD', 
          name: 'Incantation', 
          level: 1,
          description: 'Vous pouvez lancer des sorts de barde utilisant le Charisme comme caractéristique d\'incantation.'
        },
        { 
          id: 'ID_PHB_FEATURE_BARDIC_INSPIRATION', 
          name: 'Inspiration bardique', 
          level: 1,
          description: 'Action bonus pour donner un d6 à une créature à 18 mètres qui peut l\'ajouter à un jet d\'attaque, de capacité ou de sauvegarde.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_JACK_OF_ALL_TRADES', 
          name: 'Touche-à-tout', 
          level: 2,
          description: 'Ajoutez la moitié de votre bonus de maîtrise (arrondi au nombre inférieur) à tout test de capacité qui n\'inclut pas déjà votre bonus de maîtrise.'
        },
        { 
          id: 'ID_PHB_FEATURE_SONG_OF_REST', 
          name: 'Chant de repos', 
          level: 2,
          description: 'Lors d\'un repos court, ceux qui regagnent des PV grâce à vos soins regagnent 1d6 PV supplémentaires.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_BARD_COLLEGE', 
          name: 'Collège de barde', 
          level: 3,
          description: 'Choisissez un collège de barde qui représente votre style de performance.'
        },
        { 
          id: 'ID_PHB_FEATURE_EXPERTISE_BARD', 
          name: 'Expertise', 
          level: 3,
          description: 'Choisissez deux compétences que vous maîtrisez. Votre bonus de maîtrise est doublé pour ces compétences.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_FONT_OF_INSPIRATION', 
          name: 'Source d\'inspiration', 
          level: 5,
          description: 'Récupérez toutes vos utilisations d\'inspiration bardique après un repos court ou long.'
        }
      ],
      6: [
        { 
          id: 'ID_PHB_FEATURE_COUNTERCHARM', 
          name: 'Contre-charme', 
          level: 6,
          description: 'Action pour offrir l\'avantage aux jets de sauvegarde contre charmé/effrayé aux créatures à 9 mètres.'
        }
      ],
      10: [
        { 
          id: 'ID_PHB_FEATURE_MAGICAL_SECRETS_10', 
          name: 'Secrets magiques', 
          level: 10,
          description: 'Choisissez deux sorts de n\'importe quelle classe. Ils comptent comme des sorts de barde.'
        },
        { 
          id: 'ID_PHB_FEATURE_EXPERTISE_BARD_10', 
          name: 'Expertise (2)', 
          level: 10,
          description: 'Choisissez deux compétences supplémentaires pour l\'expertise.'
        }
      ],
      14: [
        { 
          id: 'ID_PHB_FEATURE_MAGICAL_SECRETS_14', 
          name: 'Secrets magiques', 
          level: 14,
          description: 'Choisissez deux sorts supplémentaires de n\'importe quelle classe.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_MAGICAL_SECRETS_18', 
          name: 'Secrets magiques', 
          level: 18,
          description: 'Choisissez deux sorts supplémentaires de n\'importe quelle classe.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_SUPERIOR_INSPIRATION', 
          name: 'Inspiration supérieure', 
          level: 20,
          description: 'Lorsque vous lancez votre initiative sans plus d\'inspiration bardique, regagnez-en une utilisation.'
        }
      ]
    },
    subclasses: [
      {
        id: 'ID_PHB_SUBCLASS_LORE',
        name: 'Collège du savoir',
        nameEn: 'College of Lore',
        source: 'PHB',
        description: 'Les bardes du savoir collectionnent les secrets magiques.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_BONUS_PROFICIENCIES_LORE', 
              name: 'Maîtrises bonus', 
              level: 3,
              description: 'Maîtrisez trois compétences de votre choix.'
            },
            { 
              id: 'ID_PHB_FEATURE_CUTTING_WORDS', 
              name: 'Mots cinglants', 
              level: 3,
              description: 'Utilisez votre inspiration bardique pour réduire un jet d\'attaque, de dégâts ou de capacité d\'une créature.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_ADDITIONAL_MAGICAL_SECRETS', 
              name: 'Secrets magiques additionnels', 
              level: 6,
              description: 'Apprenez deux sorts supplémentaires de n\'importe quelle classe.'
            }
          ],
          14: [
            { 
              id: 'ID_PHB_FEATURE_PEERLESS_SKILL', 
              name: 'Compétence sans pareille', 
              level: 14,
              description: 'Ajoutez un dé d\'inspiration bardique à un test de capacité.'
            }
          ]
        }
      },
      {
        id: 'ID_PHB_SUBCLASS_VALOR',
        name: 'Collège de la vaillance',
        nameEn: 'College of Valor',
        source: 'PHB',
        description: 'Les bardes de la vaillance sont des guerriers poètes.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_BONUS_PROFICIENCIES_VALOR', 
              name: 'Maîtrises bonus', 
              level: 3,
              description: 'Maîtrisez les armures moyennes, les boucliers et les armes de guerre.'
            },
            { 
              id: 'ID_PHB_FEATURE_COMBAT_INSPIRATION', 
              name: 'Inspiration au combat', 
              level: 3,
              description: 'Une créature avec inspiration bardique peut l\'ajouter aux dégâts ou à sa CA.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_EXTRA_ATTACK_BARD', 
              name: 'Attaque supplémentaire', 
              level: 6,
              description: 'Vous pouvez attaquer deux fois au lieu d\'une lorsque vous utilisez l\'action Attaquer.'
            }
          ],
          14: [
            { 
              id: 'ID_PHB_FEATURE_BATTLE_MAGIC', 
              name: 'Magie de bataille', 
              level: 14,
              description: 'Après une attaque au corps-à-corps, vous pouvez lancer un sort à action bonus.'
            }
          ]
        }
      }
    ],
    spellcasting: {
      ability: 'charisma',
      type: 'full',
      slots: {},
      spellsKnown: {},
      ritualCasting: true,
      focus: 'component-pouch'
    },
    resources: [
      {
        id: 'ID_RESOURCE_BARDIC_INSPIRATION',
        name: 'Inspiration bardique',
        progression: {
          1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 3, 8: 3, 9: 3, 
          10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 5, 16: 5, 
          17: 5, 18: 5, 19: 5, 20: 5
        },
        recovery: 'short'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_CLERIC',
    name: 'Clerc',
    nameEn: 'Cleric',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['wisdom', 'charisma'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_CLERIC_1A', name: 'Masse d\'armes', items: ['ID_WEAPON_MACE'], quantity: 1 },
          { id: 'ID_STARTOPT_CLERIC_1B', name: 'Marteau de guerre', items: ['ID_WEAPON_WARHAMMER'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_CLERIC_2A', name: 'Armure de cuir', items: ['ID_ARMOR_LEATHER'], quantity: 1 },
          { id: 'ID_STARTOPT_CLERIC_2B', name: 'Armure de cuir clouté', items: ['ID_ARMOR_STUDDED_LEATHER'], quantity: 1 },
          { id: 'ID_STARTOPT_CLERIC_2C', name: 'Armure d\'écailles', items: ['ID_ARMOR_SCALE_MAIL'], quantity: 1 }
        ]
      ],
      fixed: ['ID_WEAPON_DAGGER', 'ID_EQUIPMENT_EXPLORER_PACK']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_CLERIC', 
          name: 'Incantation', 
          level: 1,
          description: 'Vous pouvez lancer des sorts de clerc utilisant la Sagesse comme caractéristique d\'incantation.'
        },
        { 
          id: 'ID_PHB_FEATURE_DIVINE_DOMAIN', 
          name: 'Domaine divin', 
          level: 1,
          description: 'Choisissez un domaine divin lié à votre divinité.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_CHANNEL_DIVINITY', 
          name: 'Canalisation divine', 
          level: 2,
          description: 'Action pour canaliser l\'énergie divine et créer divers effets magiques.'
        },
        { 
          id: 'ID_PHB_FEATURE_CHANNEL_DIVINITY_1_REST', 
          name: 'Canalisation divine (1/repos)', 
          level: 2,
          description: '1 utilisation entre les repos courts ou longs.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_DESTROY_UNDEAD', 
          name: 'Destruction des morts-vivants', 
          level: 5,
          description: 'Les morts-vivants de FP 1/2 ou moins sont détruits instantanément si ils échouent leur jet de sauvegarde contre votre renvoi.'
        }
      ],
      8: [
        { 
          id: 'ID_PHB_FEATURE_DIVINE_STRIKE', 
          name: 'Frappe divine', 
          level: 8,
          description: 'Une fois par tour, ajoutez 1d8 dégâts radiants à une attaque au corps-à-corps.'
        }
      ],
      10: [
        { 
          id: 'ID_PHB_FEATURE_DIVINE_INTERVENTION', 
          name: 'Intervention divine', 
          level: 10,
          description: 'Action pour demander à votre divinité d\'intervenir. Jet de réussite en pourcentage = niveau de clerc.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_IMPROVED_DIVINE_INTERVENTION', 
          name: 'Intervention divine améliorée', 
          level: 20,
          description: 'L\'intervention divine réussit automatiquement.'
        }
      ]
    },
    subclasses: [
      {
        id: 'ID_PHB_SUBCLASS_KNOWLEDGE',
        name: 'Domaine du savoir',
        nameEn: 'Knowledge Domain',
        source: 'PHB',
        description: 'Les clercs du savoir sont les gardiens de la vérité.',
        features: {
          1: [
            { 
              id: 'ID_PHB_FEATURE_BLESSINGS_OF_KNOWLEDGE', 
              name: 'Bénédictions du savoir', 
              level: 1,
              description: 'Maîtrisez deux compétences de la liste. Doublez votre bonus de maîtrise pour ces compétences.'
            }
          ],
          2: [
            { 
              id: 'ID_PHB_FEATURE_CHANNEL_DIVINITY_KNOWLEDGE_OF_THE_AGES', 
              name: 'Canalisation : Savoir des âges', 
              level: 2,
              description: 'Action pour gagner la maîtrise d\'une compétence ou d\'un outil pendant 10 minutes.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_CHANNEL_DIVINITY_READ_THOUGHTS', 
              name: 'Canalisation : Lecture des pensées', 
              level: 6,
              description: 'Lisez les pensées d\'une créature à 18 mètres pendant 1 minute.'
            }
          ],
          8: [
            { 
              id: 'ID_PHB_FEATURE_POTENT_SPELLCASTING', 
              name: 'Incantation puissante', 
              level: 8,
              description: 'Ajoutez votre modificateur de Sagesse aux dégâts des sorts de clerc de niveau 0.'
            }
          ],
          17: [
            { 
              id: 'ID_PHB_FEATURE_VISIONS_OF_THE_PAST', 
              name: 'Visions du passé', 
              level: 17,
              description: 'Méditez 1 minute pour voir les événements passés d\'un objet ou d\'un lieu.'
            }
          ]
        }
      },
      {
        id: 'ID_PHB_SUBCLASS_LIFE',
        name: 'Domaine de la vie',
        nameEn: 'Life Domain',
        source: 'PHB',
        description: 'Les clercs de la vie sont les guérisseurs par excellence.',
        features: {
          1: [
            { 
              id: 'ID_PHB_FEATURE_DISCIPLE_OF_LIFE', 
              name: 'Disciple de la vie', 
              level: 1,
              description: 'Les sorts de soins rendent 2 + niveau du sort PV supplémentaires.'
            },
            { 
              id: 'ID_PHB_FEATURE_BONUS_PROFICIENCY_LIFE', 
              name: 'Maîtrise bonus', 
              level: 1,
              description: 'Maîtrisez les armures lourdes.'
            }
          ],
          2: [
            { 
              id: 'ID_PHB_FEATURE_CHANNEL_DIVINITY_PRESERVE_LIFE', 
              name: 'Canalisation : Préservation de la vie', 
              level: 2,
              description: 'Action pour répartir 5 × niveau de clerc PV entre les créatures blessées à 9 mètres.'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_BLESSED_HEALER', 
              name: 'Guérisseur béni', 
              level: 6,
              description: 'Lorsque vous lancez un sort de soins sur une autre créature, vous regagnez 3 + niveau du sort PV.'
            }
          ],
          8: [
            { 
              id: 'ID_PHB_FEATURE_DIVINE_STRIKE_LIFE', 
              name: 'Frappe divine', 
              level: 8,
              description: 'Ajoutez 1d8 dégâts radiants à une attaque au corps-à-corps une fois par tour.'
            }
          ],
          17: [
            { 
              id: 'ID_PHB_FEATURE_SUPREME_HEALING', 
              name: 'Soin suprême', 
              level: 17,
              description: 'Lorsque vous lancez un sort de soins, utilisez le maximum possible pour chaque dé.'
            }
          ]
        }
      }
    ],
    spellcasting: {
      ability: 'wisdom',
      type: 'full',
      slots: {},
      spellsPrepared: {
        formula: '$(level) + $(wisdom:modifier)',
        from: 'domain'
      },
      ritualCasting: true,
      focus: 'holy-symbol'
    },
    resources: [
      {
        id: 'ID_RESOURCE_CHANNEL_DIVINITY',
        name: 'Canalisation divine',
        progression: {
          2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
          11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 3,
          19: 3, 20: 3
        },
        recovery: 'short'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_FIGHTER',
    name: 'Guerrier',
    nameEn: 'Fighter',
    source: 'PHB',
    hitDice: 10,
    primaryAbility: ['strength', 'dexterity'],
    savingThrows: ['strength', 'constitution'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_FIGHTER_1A', name: 'Cotte de mailles', items: ['ID_ARMOR_CHAIN_MAIL'], quantity: 1 },
          { id: 'ID_STARTOPT_FIGHTER_1B', name: 'Armures de cuir', items: ['ID_ARMOR_LEATHER'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_FIGHTER_2A', name: 'Arme de guerre et bouclier', items: ['ID_WEAPON_ANY_MARTIAL', 'ID_ARMOR_SHIELD'], quantity: 1 },
          { id: 'ID_STARTOPT_FIGHTER_2B', name: 'Deux armes de guerre', items: ['ID_WEAPON_ANY_MARTIAL'], quantity: 2 }
        ]
      ],
      fixed: ['ID_WEAPON_LIGHT_CROSSBOW', 'ID_WEAPON_HANDAXE', 'ID_EQUIPMENT_DUNGEONEER_PACK']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_FIGHTING_STYLE', 
          name: 'Style de combat', 
          level: 1,
          description: 'Choisissez un style de combat qui vous confère des bénéfices.'
        },
        { 
          id: 'ID_PHB_FEATURE_SECOND_WIND', 
          name: 'Second souffle', 
          level: 1,
          description: 'Bonus action pour regagner 1d10 + niveau de guerrier PV. Une fois par repos court ou long.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_ACTION_SURGE', 
          name: 'Déferlement d\'action', 
          level: 2,
          description: 'Action pour faire une action supplémentaire ce tour. Une fois par repos court ou long.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_MARTIAL_ARCHETYPE', 
          name: 'Archétype martial', 
          level: 3,
          description: 'Choisissez un archétype martial qui représente votre approche du combat.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_FIGHTER', 
          name: 'Attaque supplémentaire', 
          level: 5,
          description: 'Vous pouvez attaquer deux fois au lieu d\'une lorsque vous utilisez l\'action Attaquer.'
        }
      ],
      9: [
        { 
          id: 'ID_PHB_FEATURE_INDOMITABLE', 
          name: 'Indomptable', 
          level: 9,
          description: 'Relancez un jet de sauvegarde raté. Une fois par repos long.'
        }
      ],
      11: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_FIGHTER_2', 
          name: 'Attaque supplémentaire (2)', 
          level: 11,
          description: 'Vous pouvez attaquer trois fois lorsque vous utilisez l\'action Attaquer.'
        }
      ],
      13: [
        { 
          id: 'ID_PHB_FEATURE_INDOMITABLE_2', 
          name: 'Indomptable (2)', 
          level: 13,
          description: 'Deux utilisations par repos long.'
        }
      ],
      17: [
        { 
          id: 'ID_PHB_FEATURE_ACTION_SURGE_2', 
          name: 'Déferlement d\'action (2)', 
          level: 17,
          description: 'Deux utilisations par repos court ou long.'
        },
        { 
          id: 'ID_PHB_FEATURE_INDOMITABLE_3', 
          name: 'Indomptable (3)', 
          level: 17,
          description: 'Trois utilisations par repos long.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_FIGHTER_3', 
          name: 'Attaque supplémentaire (3)', 
          level: 20,
          description: 'Vous pouvez attaquer quatre fois lorsque vous utilisez l\'action Attaquer.'
        }
      ]
    },
    subclasses: [
      {
        id: 'ID_PHB_SUBCLASS_CHAMPION',
        name: 'Champion',
        nameEn: 'Champion',
        source: 'PHB',
        description: 'Un maître du combat physique.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_IMPROVED_CRITICAL', 
              name: 'Critique amélioré', 
              level: 3,
              description: 'Vos attaques infligent un coup critique sur un 19 ou 20.'
            }
          ],
          7: [
            { 
              id: 'ID_PHB_FEATURE_REMARKABLE_ATHLETE', 
              name: 'Athlète remarquable', 
              level: 7,
              description: 'Ajoutez la moitié de votre bonus de maîtrise aux tests de Force, Dextérité ou Constitution sans bonus.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_ADDITIONAL_FIGHTING_STYLE', 
              name: 'Style de combat additionnel', 
              level: 10,
              description: 'Choisissez un deuxième style de combat.'
            }
          ],
          15: [
            { 
              id: 'ID_PHB_FEATURE_SUPERIOR_CRITICAL', 
              name: 'Critique supérieur', 
              level: 15,
              description: 'Vos attaques infligent un coup critique sur un 18, 19 ou 20.'
            }
          ],
          18: [
            { 
              id: 'ID_PHB_FEATURE_SURVIVOR', 
              name: 'Survivant', 
              level: 18,
              description: 'Au début de chaque tour, regagnez 5 + modificateur de Constitution PV si vous avez moins de la moitié de vos PV.'
            }
          ]
        }
      },
      {
        id: 'ID_PHB_SUBCLASS_BATTLE_MASTER',
        name: 'Maître de bataille',
        nameEn: 'Battle Master',
        source: 'PHB',
        description: 'Un maître des manœuvres de combat.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_COMBAT_SUPERIORITY', 
              name: 'Supériorité martiale', 
              level: 3,
              description: 'Apprenez trois manœuvres. Vous avez 4 dés de supériorité (d8).'
            },
            { 
              id: 'ID_PHB_FEATURE_STUDENT_OF_WAR', 
              name: 'Étudiant de la guerre', 
              level: 3,
              description: 'Maîtrisez un type d\'outils d\'artisan.'
            }
          ],
          7: [
            { 
              id: 'ID_PHB_FEATURE_KNOW_YOUR_ENEMY', 
              name: 'Connais ton ennemi', 
              level: 7,
              description: 'Pendant 1 minute d\'observation, apprenez les capacités offensives/défensives d\'une créature.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_IMPROVED_COMBAT_SUPERIORITY', 
              name: 'Supériorité améliorée', 
              level: 10,
              description: 'Dés de supériorité d10.'
            }
          ],
          15: [
            { 
              id: 'ID_PHB_FEATURE_RELENTLESS', 
              name: 'Implacable', 
              level: 15,
              description: 'Récupérez un dé de supériorité au début du tour si vous n\'en avez plus.'
            }
          ],
          18: [
            { 
              id: 'ID_PHB_FEATURE_IMPROVED_COMBAT_SUPERIORITY_2', 
              name: 'Supériorité suprême', 
              level: 18,
              description: 'Dés de supériorité d12.'
            }
          ]
        }
      },
      {
        id: 'ID_PHB_SUBCLASS_ELDRITCH_KNIGHT',
        name: 'Chevalier occulte',
        nameEn: 'Eldritch Knight',
        source: 'PHB',
        description: 'Un guerrier qui pratique la magie arcanique.',
        features: {
          3: [
            { 
              id: 'ID_PHB_FEATURE_SPELLCASTING_FIGHTER', 
              name: 'Incantation', 
              level: 3,
              description: 'Vous connaissez deux tours de magie et trois sorts de niveau 1.'
            },
            { 
              id: 'ID_PHB_FEATURE_WEAPON_BOND', 
              name: 'Lien d\'arme', 
              level: 3,
              description: 'Rituel pour lier une arme. Vous ne pouvez pas être désarmé et pouvez invoquer l\'arme.'
            }
          ],
          7: [
            { 
              id: 'ID_PHB_FEATURE_WAR_MAGIC', 
              name: 'Magie de guerre', 
              level: 7,
              description: 'Action pour attaquer + sort bonus, ou sort + attaque bonus.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_ELDRTICH_STRIKE', 
              name: 'Frappe occulte', 
              level: 10,
              description: 'Lorsque vous touchez avec une arme, désavantage au prochain jet de sauvegarde de la cible contre votre sort.'
            }
          ],
          15: [
            { 
              id: 'ID_PHB_FEATURE_WAR_MAGIC_IMPROVED', 
              name: 'Magie de guerre améliorée', 
              level: 15,
              description: 'Action pour attaquer + sort bonus + attaque bonus.'
            }
          ],
          18: [
            { 
              id: 'ID_PHB_FEATURE_IMPROVED_WEAPON_BOND', 
              name: 'Lien d\'arme amélioré', 
              level: 18,
              description: 'Vous ne pouvez pas être désarmé. Résistance aux dégâts de la cible liée.'
            }
          ]
        }
      }
    ],
    resources: [
      {
        id: 'ID_RESOURCE_SECOND_WIND',
        name: 'Second souffle',
        progression: {
          1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
          11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 1, 18: 1, 19: 1, 20: 1
        },
        recovery: 'short'
      },
      {
        id: 'ID_RESOURCE_ACTION_SURGE',
        name: 'Déferlement d\'action',
        progression: {
          2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 1, 10: 1,
          11: 1, 12: 1, 13: 1, 14: 1, 15: 1, 16: 1, 17: 2, 18: 2, 19: 2, 20: 2
        },
        recovery: 'short'
      },
      {
        id: 'ID_RESOURCE_INDOMITABLE',
        name: 'Indomptable',
        progression: {
          9: 1, 10: 1, 11: 1, 12: 1, 13: 2, 14: 2, 15: 2, 16: 2, 17: 3, 18: 3, 19: 3, 20: 3
        },
        recovery: 'long'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_DRUID',
    name: 'Druide',
    nameEn: 'Druid',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['wisdom'],
    savingThrows: ['intelligence', 'wisdom'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_DRUID_1A', name: 'Bouclier', items: ['ID_ARMOR_SHIELD'], quantity: 1 },
          { id: 'ID_STARTOPT_DRUID_1B', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_DRUID_2A', name: 'Cimeterre', items: ['ID_WEAPON_SCIMITAR'], quantity: 1 },
          { id: 'ID_STARTOPT_DRUID_2B', name: 'Arme de corps-à-corps simple', items: ['ID_WEAPON_ANY_MELEE_SIMPLE'], quantity: 1 }
        ]
      ],
      fixed: ['ID_EQUIPMENT_EXPLORER_PACK', 'ID_EQUIPMENT_DRUIDIC_FOCUS']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_DRUIDIC', 
          name: 'Druidique', 
          level: 1,
          description: 'Vous connaissez le druidique, le langage secret des druides. Vous pouvez utiliser le druidique pour laisser des messages cachés.'
        },
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_DRUID', 
          name: 'Incantation', 
          level: 1,
          description: 'Vous pouvez lancer des sorts de druide utilisant la Sagesse comme caractéristique d\'incantation.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_WILD_SHAPE', 
          name: 'Forme sauvage', 
          level: 2,
          description: 'Action pour vous transformer en une bête que vous avez vue. FP max 1/4 (niv.2), 1/2 (niv.4), 1 (niv.8). 2 utilisations/repos court ou long.'
        },
        { 
          id: 'ID_PHB_FEATURE_DRUID_CIRCLE', 
          name: 'Cercle druidique', 
          level: 2,
          description: 'Choisissez un cercle druidique qui représente votre lien avec la nature.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_TIMELESS_BODY', 
          name: 'Corps intemporel', 
          level: 18,
          description: 'Le vieillissement magique ne vous affecte plus et vous ne pouvez pas être vieilli par magie.'
        },
        { 
          id: 'ID_PHB_FEATURE_BEAST_SPELLS', 
          name: 'Sorts de bête', 
          level: 18,
          description: 'Vous pouvez lancer la plupart de vos sorts de druide sous forme sauvage.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_ARCHDRUID', 
          name: 'Archidruide', 
          level: 20,
          description: 'Vous utilisez Forme sauvage un nombre illimité de fois. Ignorez les composantes verbales et somatiques des sorts de druide.'
        }
      ]
    },
    subclasses: [
      {
        id: 'ID_PHB_SUBCLASS_LAND',
        name: 'Cercle de la terre',
        nameEn: 'Circle of the Land',
        source: 'PHB',
        description: 'Un druide lié aux terres sauvages.',
        features: {
          2: [
            { 
              id: 'ID_PHB_FEATURE_BONUS_CANTIP', 
              name: 'Sort mineur bonus', 
              level: 2,
              description: 'Apprenez un sort mineur de druide supplémentaire.'
            },
            { 
              id: 'ID_PHB_FEATURE_NATURAL_RECOVERY', 
              name: 'Récupération naturelle', 
              level: 2,
              description: 'Au repos court, récupérez des emplacements de sort jusqu\'à la moitié de votre niveau de druide (arrondi supérieur).'
            }
          ],
          3: [
            { 
              id: 'ID_PHB_FEATURE_CIRCLE_SPELLS_LAND', 
              name: 'Sorts de cercle', 
              level: 3,
              description: 'Gagnez des sorts toujours préparés selon le terrain choisi (Arctique, Côtes, Désert, Forêt, Prairies, Montagne, Marais, Profondeurs, Outreterre).'
            }
          ],
          6: [
            { 
              id: 'ID_PHB_FEATURE_LANDS_STRIDE', 
              name: 'Démarche des terres', 
              level: 6,
              description: 'Déplacement non entravé à travers les terrains difficiles non magiques. Avantage aux jets de sauvegarde contre les terrains difficiles magiques.'
            }
          ],
          10: [
            { 
              id: 'ID_PHB_FEATURE_NATURES_WARD', 
              name: 'Protection de la nature', 
              level: 10,
              description: 'Immunité aux charmes et à la peur des élémentaires et des fées.'
            }
          ],
          14: [
            { 
              id: 'ID_PHB_FEATURE_NATURES_SANCTUARY', 
              name: 'Sanctuaire de la nature', 
              level: 14,
              description: 'Lorsqu\'une créature vous touche en combat, elle doit réussir un jet de sauvegarde de Sagesse ou choisir une autre cible.'
            }
          ]
        }
      }
    ],
    spellcasting: {
      ability: 'wisdom',
      type: 'full',
      slots: {},
      spellsPrepared: {
        formula: '$(level) + $(wisdom:modifier)',
        from: 'class-list'
      },
      ritualCasting: true,
      focus: 'druidic'
    },
    resources: [
      {
        id: 'ID_RESOURCE_WILD_SHAPE',
        name: 'Forme sauvage',
        progression: {
          2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2, 9: 2, 10: 2,
          11: 2, 12: 2, 13: 2, 14: 2, 15: 2, 16: 2, 17: 2, 18: 2, 19: 2, 20: 999
        },
        recovery: 'short'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_MONK',
    name: 'Moine',
    nameEn: 'Monk',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_MONK_1A', name: 'Épée courte', items: ['ID_WEAPON_SHORTSWORD'], quantity: 1 },
          { id: 'ID_STARTOPT_MONK_1B', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_MONK_2A', name: 'Sac d\'explorateur', items: ['ID_EQUIPMENT_EXPLORER_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_MONK_2B', name: 'Sac d\'explorateur (2)', items: ['ID_EQUIPMENT_EXPLORER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART', 'ID_WEAPON_DART']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_UNARMORED_DEFENSE_MONK', 
          name: 'Défense sans armure', 
          level: 1,
          description: 'CA = 10 + mod DEX + mod SAG sans armure ni bouclier.'
        },
        { 
          id: 'ID_PHB_FEATURE_MARTIAL_ARTS', 
          name: 'Arts martiaux', 
          level: 1,
          description: 'Attaque à mains nues comme arme (d4 dégâts), bonus action pour une attaque à mains nues supplémentaire.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_KI', 
          name: 'Ki', 
          level: 2,
          description: 'Points de Ki pour utiliser des techniques spéciales. Nombre égal à votre niveau de moine.'
        },
        { 
          id: 'ID_PHB_FEATURE_UNARMORED_MOVEMENT', 
          name: 'Déplacement sans armure', 
          level: 2,
          description: 'Vitesse +3m (10ft) sans armure ni bouclier. +3m aux niveaux 6, 10, 14, 18.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_MONASTIC_TRADITION', 
          name: 'Tradition monacale', 
          level: 3,
          description: 'Choisissez une tradition monacale (Voie de la paume ouverte, Voie de l\'ombre, Voie des quatre éléments).'
        },
        { 
          id: 'ID_PHB_FEATURE_DEFLECT_MISSILES', 
          name: 'Déviation de projectiles', 
          level: 3,
          description: 'Réaction pour réduire les dégâts d\'une arme à distance de 1d10 + mod DEX + niveau de moine. Si dégâts réduits à 0, attrapez le projectile.'
        }
      ],
      4: [
        { 
          id: 'ID_PHB_FEATURE_SLOW_FALL', 
          name: 'Chute lente', 
          level: 4,
          description: 'Réaction pour réduire les dégâts de chute de 5 × niveau de moine.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_MONK', 
          name: 'Attaque supplémentaire', 
          level: 5,
          description: 'Attaque deux fois avec l\'action Attaquer.'
        },
        { 
          id: 'ID_PHB_FEATURE_STUNNING_STRIKE', 
          name: 'Frappe étourdissante', 
          level: 5,
          description: 'Dépensez 1 point de Ki après avoir touché pour étourdir la cible jusqu\'à la fin de votre prochain tour.'
        }
      ],
      6: [
        { 
          id: 'ID_PHB_FEATURE_KI_EMPOWERED_STRIKES', 
          name: 'Frappes imprégnées de ki', 
          level: 6,
          description: 'Vos attaques à mains nues comptent comme magiques pour résister aux résistances aux dégâts non magiques.'
        },
        { 
          id: 'ID_PHB_FEATURE_UNARMORED_MOVEMENT_6', 
          name: 'Déplacement sans armure +3m', 
          level: 6,
          description: 'Bonus de vitesse passe à +6m (20ft).'
        }
      ],
      7: [
        { 
          id: 'ID_PHB_FEATURE_EVASION', 
          name: 'Évasion', 
          level: 7,
          description: 'Avantages aux jets de sauvegarde de Dextérité contre les effets de zone. Pas de dégâts si réussi, demi-dégâts si échoué.'
        },
        { 
          id: 'ID_PHB_FEATURE_STILLNESS_OF_MIND', 
          name: 'Calme intérieur', 
          level: 7,
          description: 'Action pour mettre fin à un effet vous charmant ou vous effrayant.'
        }
      ],
      10: [
        { 
          id: 'ID_PHB_FEATURE_PURITY_OF_BODY', 
          name: 'Pureté du corps', 
          level: 10,
          description: 'Immunité aux maladies et aux poisons.'
        }
      ],
      13: [
        { 
          id: 'ID_PHB_FEATURE_TONGUE_OF_THE_SUN_AND_MOON', 
          name: 'Langue du soleil et de la lune', 
          level: 13,
          description: 'Vous comprenez toutes les langues parlées et les créatures qui comprennent une langue peuvent comprendre vos paroles.'
        }
      ],
      14: [
        { 
          id: 'ID_PHB_FEATURE_DIAMOND_SOUL', 
          name: 'Âme de diamant', 
          level: 14,
          description: 'Maîtrise de tous les jets de sauvegarde. Dépensez 1 point de Ki pour relancer un jet de sauvegarde raté.'
        }
      ],
      15: [
        { 
          id: 'ID_PHB_FEATURE_TIMELESS_BODY_MONK', 
          name: 'Corps intemporel', 
          level: 15,
          description: 'Le vieillissement magique ne vous affecte plus et vous ne pouvez pas être vieilli par magie.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_EMPTY_BODY', 
          name: 'Corps vide', 
          level: 18,
          description: 'Action pour devenir invisible pendant 1 minute + résistance à tous les dégâts sauf force. Coûte 4 points de Ki.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_PERFECT_SELF', 
          name: 'Perfection absolue', 
          level: 20,
          description: 'Lorsque vous lancez votre initiative sans point de Ki, vous regagnez 4 points de Ki.'
        }
      ]
    },
    subclasses: [],
    resources: [
      {
        id: 'ID_RESOURCE_KI',
        name: 'Points de Ki',
        progression: {
          2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
          11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20
        },
        recovery: 'short'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_PALADIN',
    name: 'Paladin',
    nameEn: 'Paladin',
    source: 'PHB',
    hitDice: 10,
    primaryAbility: ['strength', 'charisma'],
    savingThrows: ['wisdom', 'charisma'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_PALADIN_1A', name: 'Arme de guerre et bouclier', items: ['ID_WEAPON_ANY_MARTIAL', 'ID_ARMOR_SHIELD'], quantity: 1 },
          { id: 'ID_STARTOPT_PALADIN_1B', name: 'Deux armes de guerre', items: ['ID_WEAPON_ANY_MARTIAL'], quantity: 2 }
        ],
        [
          { id: 'ID_STARTOPT_PALADIN_2A', name: 'Cinq javelines', items: ['ID_WEAPON_JAVELIN'], quantity: 5 },
          { id: 'ID_STARTOPT_PALADIN_2B', name: 'Arme simple de corps-à-corps', items: ['ID_WEAPON_ANY_MELEE_SIMPLE'], quantity: 1 },
          { id: 'ID_STARTOPT_PALADIN_2C', name: 'Arme simple à distance', items: ['ID_WEAPON_ANY_RANGED_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_PALADIN_3A', name: 'Sac d\'aventurier', items: ['ID_EQUIPMENT_DUNGEONEER_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_PALADIN_3B', name: 'Sac d\'explorateur', items: ['ID_EQUIPMENT_EXPLORER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_ARMOR_CHAIN_MAIL', 'ID_WEAPON_LONGSWORD', 'ID_WEAPON_SHORTSWORD']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_DIVINE_SENSE', 
          name: 'Perception divine', 
          level: 1,
          description: 'Action pour détecter les fiélons, les morts-vivants et les lieux consacrés ou profanés à 18 mètres.'
        },
        { 
          id: 'ID_PHB_FEATURE_LAY_ON_HANDS', 
          name: 'Imposition des mains', 
          level: 1,
          description: 'Pool de PV = 5 × niveau de paladin. Action pour soigner ou dépenser 5 PV pour guérir maladie/poison.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_PALADIN', 
          name: 'Incantation', 
          level: 2,
          description: 'Lanceur de sorts mi-portée (half-caster). N\'apprenez pas de sorts de niveau 1 et 2 avant le niveau 2 et 5.'
        },
        { 
          id: 'ID_PHB_FEATURE_DIVINE_SMITE', 
          name: 'Châtiment divin', 
          level: 2,
          description: 'Après avoir touché avec une arme de corps-à-corps, dépensez un emplacement de sort pour ajouter 2d8 dégâts radiants (+1d8 vs morts-vivants/fiélons).'
        },
        { 
          id: 'ID_PHB_FEATURE_DIVINE_HEALTH', 
          name: 'Santé divine', 
          level: 3,
          description: 'Immunité aux maladies.'
        },
        { 
          id: 'ID_PHB_FEATURE_SACRED_OATH', 
          name: 'Serment sacré', 
          level: 3,
          description: 'Choisissez un serment sacré (Dévotion, Anciens, Vengeance).'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_PALADIN', 
          name: 'Attaque supplémentaire', 
          level: 5,
          description: 'Attaque deux fois avec l\'action Attaquer.'
        }
      ],
      6: [
        { 
          id: 'ID_PHB_FEATURE_AURA_OF_PROTECTION', 
          name: 'Aura de protection', 
          level: 6,
          description: 'Vous et les créatures alliées à 3m gagnez un bonus aux jets de sauvegarde égal à votre modificateur de Charisme (min +1).'
        }
      ],
      10: [
        { 
          id: 'ID_PHB_FEATURE_AURA_OF_COURAGE', 
          name: 'Aura de courage', 
          level: 10,
          description: 'Vous et les créatures alliées à 3m ne pouvez pas être effrayées.'
        }
      ],
      11: [
        { 
          id: 'ID_PHB_FEATURE_IMPROVED_DIVINE_SMITE', 
          name: 'Châtiment divin amélioré', 
          level: 11,
          description: 'Attaques de corps-à-corps infligent 1d8 dégâts radiants supplémentaires.'
        }
      ],
      14: [
        { 
          id: 'ID_PHB_FEATURE_CLEANSING_TOUCH', 
          name: 'Toucher purificateur', 
          level: 14,
          description: 'Action pour mettre fin à un sort sur vous ou une créature que vous touchez. Utilisations = mod CHA (min 1) par repos long.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_AURA_IMPROVEMENTS', 
          name: 'Aura améliorée', 
          level: 18,
          description: 'Rayon de vos auras passe à 9m.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_SACRED_OATH_FEATURE', 
          name: 'Capacité de serment niveau 20', 
          level: 20,
          description: 'Capacité ultime de votre serment sacré pendant 1 minute.'
        }
      ]
    },
    subclasses: [],
    spellcasting: {
      ability: 'charisma',
      type: 'half',
      slots: {},
      spellsPrepared: {
        formula: '$(charisma:modifier) + floor($(level)/2)',
        from: 'class-list'
      }
    },
    resources: [
      {
        id: 'ID_RESOURCE_LAY_ON_HANDS',
        name: 'Imposition des mains',
        progression: {
          1: 5, 2: 10, 3: 15, 4: 20, 5: 25, 6: 30, 7: 35, 8: 40, 9: 45, 10: 50,
          11: 55, 12: 60, 13: 65, 14: 70, 15: 75, 16: 80, 17: 85, 18: 90, 19: 95, 20: 100
        },
        recovery: 'long'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_RANGER',
    name: 'Rôdeur',
    nameEn: 'Ranger',
    source: 'PHB',
    hitDice: 10,
    primaryAbility: ['dexterity', 'wisdom'],
    savingThrows: ['strength', 'dexterity'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_RANGER_1A', name: 'Cotte de mailles', items: ['ID_ARMOR_SCALE_MAIL'], quantity: 1 },
          { id: 'ID_STARTOPT_RANGER_1B', name: 'Armures de cuir', items: ['ID_ARMOR_LEATHER'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_RANGER_2A', name: 'Deux épées courtes', items: ['ID_WEAPON_SHORTSWORD'], quantity: 2 },
          { id: 'ID_STARTOPT_RANGER_2B', name: 'Deux armes de corps-à-corps simples', items: ['ID_WEAPON_ANY_MELEE_SIMPLE'], quantity: 2 }
        ]
      ],
      fixed: ['ID_EQUIPMENT_DUNGEONEER_PACK']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_FAVORED_ENEMY', 
          name: 'Ennemi juré', 
          level: 1,
          description: 'Avantage aux tests pour pister votre ennemi juré et aux tests de Sagesse (Survie) pour traquer.'
        },
        { 
          id: 'ID_PHB_FEATURE_NATURAL_EXPLORER', 
          name: 'Explorateur né', 
          level: 1,
          description: 'Avantage aux tests d\'Intelligence ou de Sagesse liés à un type de terrain favori. Terrain difficile ne vous ralentit pas.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_RANGER', 
          name: 'Incantation', 
          level: 2,
          description: 'Lanceur de sorts tiers (third-caster) utilisant la Sagesse.'
        },
        { 
          id: 'ID_PHB_FEATURE_FIGHTING_STYLE_RANGER', 
          name: 'Style de combat', 
          level: 2,
          description: 'Choisissez un style de combat (Archerie, Combat à deux armes, Défense, etc.)'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_RANGER_ARCHETYPE', 
          name: 'Archétype de rôdeur', 
          level: 3,
          description: 'Choisissez un archétype (Chasseur ou Maître des bêtes).'
        },
        { 
          id: 'ID_PHB_FEATURE_PRIMEVAL_AWARENESS', 
          name: 'Conscience primitive', 
          level: 3,
          description: 'Action pour sentir la présence de certains types de créatures à 8km.'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_EXTRA_ATTACK_RANGER', 
          name: 'Attaque supplémentaire', 
          level: 5,
          description: 'Attaque deux fois avec l\'action Attaquer.'
        }
      ],
      8: [
        { 
          id: 'ID_PHB_FEATURE_LANDS_STRIDE_RANGER', 
          name: 'Démarche des terres', 
          level: 8,
          description: 'Déplacement non entravé à travers les terrains difficiles non magiques.'
        }
      ],
      10: [
        { 
          id: 'ID_PHB_FEATURE_HIDE_IN_PLAIN_SIGHT', 
          name: 'Se cacher en plein jour', 
          level: 10,
          description: 'Dépensez 1 minute pour vous camoufler dans les environnements naturels.'
        }
      ],
      14: [
        { 
          id: 'ID_PHB_FEATURE_VANISH', 
          name: 'Disparition', 
          level: 14,
          description: 'Action bonus pour vous cacher. Ne pouvez pas être tracés par des moyens magiques.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_FERAL_SENSES', 
          name: 'Sens félins', 
          level: 18,
          description: 'Avantage aux tests de Perception basés sur l\'ouïe ou l\'odorat.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_FOE_SLAYER', 
          name: 'Pourfendeur d\'ennemis', 
          level: 20,
          description: 'Ajoutez votre modificateur de Sagesse (min +1) aux jets d\'attaque ou de dégâts contre votre ennemi juré.'
        }
      ]
    },
    subclasses: [],
    spellcasting: {
      ability: 'wisdom',
      type: 'third',
      slots: {}
    }
  },
  {
    id: 'ID_PHB_CLASS_ROGUE',
    name: 'Roublard',
    nameEn: 'Rogue',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['dexterity'],
    savingThrows: ['dexterity', 'intelligence'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_ROGUE_1A', name: 'Rapière', items: ['ID_WEAPON_RAPIER'], quantity: 1 },
          { id: 'ID_STARTOPT_ROGUE_1B', name: 'Arme de guerre', items: ['ID_WEAPON_SHORTSWORD'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_ROGUE_2A', name: 'Arc court et carquois', items: ['ID_WEAPON_SHORTBOW', 'ID_EQUIPMENT_ARROWS'], quantity: 1 },
          { id: 'ID_STARTOPT_ROGUE_2B', name: 'Arme simple à distance', items: ['ID_WEAPON_ANY_RANGED_SIMPLE'], quantity: 1 }
        ]
      ],
      fixed: ['ID_ARMOR_LEATHER', 'ID_WEAPON_DAGGER', 'ID_WEAPON_DAGGER', 'ID_EQUIPMENT_THIEVES_TOOLS', 'ID_EQUIPMENT_DUNGEONEER_PACK']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_EXPERTISE_ROGUE', 
          name: 'Expertise', 
          level: 1,
          description: 'Bonus de maîtrise doublé pour deux compétences ou outils de votre choix.'
        },
        { 
          id: 'ID_PHB_FEATURE_SNEAK_ATTACK', 
          name: 'Attaque sournoise', 
          level: 1,
          description: 'Ajoutez 1d6 dégâts (+1d6 tous les 2 niveaux) si vous avez l\'avantage à l\'attaque ou si une créature alliée est à 1,5m de la cible.'
        },
        { 
          id: 'ID_PHB_FEATURE_THIEVES_CANT', 
          name: 'Argot des voleurs', 
          level: 1,
          description: 'Langage secret pour communiquer avec d\'autres roublards.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_CUNNING_ACTION', 
          name: 'Action rusée', 
          level: 2,
          description: 'Action bonus pour Se désengager, Se cacher ou Foncer.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_ROGUISH_ARCHETYPE', 
          name: 'Archétype de roublard', 
          level: 3,
          description: 'Choisissez un archétype (Assassin, Voleur, Arnaqueur).'
        }
      ],
      5: [
        { 
          id: 'ID_PHB_FEATURE_UNCANNY_DODGE', 
          name: 'Esquive instinctive', 
          level: 5,
          description: 'Réaction pour réduire les dégâts d\'une attaque à vue de moitié.'
        }
      ],
      7: [
        { 
          id: 'ID_PHB_FEATURE_EVASION_ROGUE', 
          name: 'Évasion', 
          level: 7,
          description: 'Avantages aux jets de sauvegarde de Dextérité contre les effets de zone.'
        }
      ],
      11: [
        { 
          id: 'ID_PHB_FEATURE_RELIABLE_TALENT', 
          name: 'Talent fiable', 
          level: 11,
          description: 'Résultats de 9 ou moins sur les tests de compétences maîtrisées comptent comme 10.'
        }
      ],
      14: [
        { 
          id: 'ID_PHB_FEATURE_BLINDSENSE', 
          name: 'Perception aveugle', 
          level: 14,
          description: 'Perception de la présence de créatures invisibles à 3m.'
        }
      ],
      15: [
        { 
          id: 'ID_PHB_FEATURE_SLIPPERY_MIND', 
          name: 'Esprit insaisissable', 
          level: 15,
          description: 'Maîtrise des jets de sauvegarde de Sagesse.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_ELUSIVE', 
          name: 'Insaisissable', 
          level: 18,
          description: 'Aucune attaque contre vous n\'a l\'avantage tant que vous n\'êtes pas immobilisé.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_STROKE_OF_LUCK', 
          name: 'Coup de chance', 
          level: 20,
          description: 'Transformez un échec en réussite sur un jet d\'attaque ou de test de compétence une fois par repos court ou long.'
        }
      ]
    },
    subclasses: []
  },
  {
    id: 'ID_PHB_CLASS_SORCERER',
    name: 'Ensorceleur',
    nameEn: 'Sorcerer',
    source: 'PHB',
    hitDice: 6,
    primaryAbility: ['charisma'],
    savingThrows: ['constitution', 'charisma'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_SORCERER_1A', name: 'Arbalète légère', items: ['ID_WEAPON_LIGHT_CROSSBOW'], quantity: 1 },
          { id: 'ID_STARTOPT_SORCERER_1B', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_SORCERER_2A', name: 'Sac d\'explorateur', items: ['ID_EQUIPMENT_EXPLORER_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_SORCERER_2B', name: 'Sac d\'aventurier', items: ['ID_EQUIPMENT_DUNGEONEER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_WEAPON_DAGGER', 'ID_WEAPON_DAGGER']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_SORCERER', 
          name: 'Incantation', 
          level: 1,
          description: 'Lanceur de sorts complet utilisant le Charisme.'
        },
        { 
          id: 'ID_PHB_FEATURE_SORCEROUS_ORIGIN', 
          name: 'Origine sorceline', 
          level: 1,
          description: 'Choisissez une origine (Lignée draconique ou Magie divine).'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_FONT_OF_MAGIC', 
          name: 'Source de magie', 
          level: 2,
          description: 'Points de sorcellerie pour créer des emplacements de sort ou utiliser la Métamagie.'
        },
        { 
          id: 'ID_PHB_FEATURE_METAMAGIC', 
          name: 'Métamagie', 
          level: 3,
          description: 'Modifiez vos sorts avec des options comme Sort accru, Sort rapide, etc.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_SORCEROUS_RESTORATION', 
          name: 'Restoration sorceline', 
          level: 20,
          description: 'Récupérez 4 points de sorcellerie à chaque repos court.'
        }
      ]
    },
    subclasses: [],
    spellcasting: {
      ability: 'charisma',
      type: 'full',
      slots: {},
      spellsKnown: {}
    },
    resources: [
      {
        id: 'ID_RESOURCE_SORCERY_POINTS',
        name: 'Points de sorcellerie',
        progression: {
          2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10,
          11: 11, 12: 12, 13: 13, 14: 14, 15: 15, 16: 16, 17: 17, 18: 18, 19: 19, 20: 20
        },
        recovery: 'long'
      }
    ]
  },
  {
    id: 'ID_PHB_CLASS_WARLOCK',
    name: 'Occultiste',
    nameEn: 'Warlock',
    source: 'PHB',
    hitDice: 8,
    primaryAbility: ['charisma'],
    savingThrows: ['wisdom', 'charisma'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_WARLOCK_1A', name: 'Arbalète légère', items: ['ID_WEAPON_LIGHT_CROSSBOW'], quantity: 1 },
          { id: 'ID_STARTOPT_WARLOCK_1B', name: 'Arme simple', items: ['ID_WEAPON_ANY_SIMPLE'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_WARLOCK_2A', name: 'Sac de diplomate', items: ['ID_EQUIPMENT_DIPLOMAT_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_WARLOCK_2B', name: 'Sac d\'aventurier', items: ['ID_EQUIPMENT_DUNGEONEER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_ARMOR_LEATHER', 'ID_WEAPON_DAGGER', 'ID_WEAPON_DAGGER']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_OTHERWORLDLY_PATRON', 
          name: 'Patron occulte', 
          level: 1,
          description: 'Choisissez un patron (Archifée, Diable, Grand Ancien).'
        },
        { 
          id: 'ID_PHB_FEATURE_PACT_MAGIC', 
          name: 'Magie du pacte', 
          level: 1,
          description: 'Récupérez tous vos emplacements de pacte lors d\'un repos court ou long.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_ELDRITCH_INVOCATIONS', 
          name: 'Invocations occultes', 
          level: 2,
          description: 'Gagnez des pouvoirs magiques permanents. 2 au niveau 2, puis +1 aux niveaux 5, 7, 9, 12, 15, 18.'
        }
      ],
      3: [
        { 
          id: 'ID_PHB_FEATURE_PACT_BOON', 
          name: 'Avantage du pacte', 
          level: 3,
          description: 'Choisissez une bénédiction (Chaîne, Lame ou Tome).'
        }
      ],
      11: [
        { 
          id: 'ID_PHB_FEATURE_MYSTIC_ARCANUM', 
          name: 'Arcane mystique', 
          level: 11,
          description: 'Choisissez un sort de niveau 6, 7, 8 ou 9 utilisable une fois par repos long.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_ELDRITCH_MASTER', 
          name: 'Maître occulte', 
          level: 20,
          description: 'Récupérez tous vos emplacements de pacte avec une action bonus une fois par repos long.'
        }
      ]
    },
    subclasses: [],
    spellcasting: {
      ability: 'charisma',
      type: 'pact',
      slots: {}
    }
  },
  {
    id: 'ID_PHB_CLASS_WIZARD',
    name: 'Magicien',
    nameEn: 'Wizard',
    source: 'PHB',
    hitDice: 6,
    primaryAbility: ['intelligence'],
    savingThrows: ['intelligence', 'wisdom'],
    startingEquipment: {
      options: [
        [
          { id: 'ID_STARTOPT_WIZARD_1A', name: 'Bâton', items: ['ID_WEAPON_QUARTERSTAFF'], quantity: 1 },
          { id: 'ID_STARTOPT_WIZARD_1B', name: 'Dague', items: ['ID_WEAPON_DAGGER'], quantity: 1 }
        ],
        [
          { id: 'ID_STARTOPT_WIZARD_2A', name: 'Sac d\'explorateur', items: ['ID_EQUIPMENT_EXPLORER_PACK'], quantity: 1 },
          { id: 'ID_STARTOPT_WIZARD_2B', name: 'Sac d\'aventurier', items: ['ID_EQUIPMENT_DUNGEONEER_PACK'], quantity: 1 }
        ]
      ],
      fixed: ['ID_SPELLBOOK', 'ID_EQUIPMENT_COMPONENT_POUCH']
    },
    features: {
      1: [
        { 
          id: 'ID_PHB_FEATURE_SPELLCASTING_WIZARD', 
          name: 'Incantation', 
          level: 1,
          description: 'Lanceur de sorts complet utilisant l\'Intelligence. Les sorts sont enregistrés dans un grimoire.'
        },
        { 
          id: 'ID_PHB_FEATURE_ARCANE_RECOVERY', 
          name: 'Récupération arcanique', 
          level: 1,
          description: 'Au repos court, récupérez des emplacements de sort dont le total ≤ la moitié de votre niveau de magicien.'
        }
      ],
      2: [
        { 
          id: 'ID_PHB_FEATURE_ARCANE_TRADITION', 
          name: 'Tradition arcanique', 
          level: 2,
          description: 'Choisissez une école de magie (Abjuration, Évocation, etc.) ou la Nécromancie.'
        }
      ],
      18: [
        { 
          id: 'ID_PHB_FEATURE_SPELL_MASTERY', 
          name: 'Maîtrise des sorts', 
          level: 18,
          description: 'Lancez certains sorts de niveau 1 et 2 à volonté au niveau minimum.'
        }
      ],
      20: [
        { 
          id: 'ID_PHB_FEATURE_SIGNATURE_SPELLS', 
          name: 'Sorts emblématiques', 
          level: 20,
          description: 'Deux sorts de niveau 3 sont toujours préparés et peuvent être lancés au niveau 3 sans emplacement.'
        }
      ]
    },
    subclasses: [],
    spellcasting: {
      ability: 'intelligence',
      type: 'full',
      slots: {},
      spellsPrepared: {
        formula: '$(level) + $(intelligence:modifier)',
        from: 'spellbook'
      },
      ritualCasting: true
    }
  }
]

// ============================================================================
// DONNÉES D'ÉQUIPEMENT
// ============================================================================

const equipmentData = {
  weapons: [
    { id: 'ID_WEAPON_DAGGER', name: 'Dague', nameEn: 'Dagger', cost: 200, weight: 1, type: 'simple-melee', damage: '1d4', damageType: 'piercing', properties: ['finesse', 'light', 'thrown'], range: { normal: 20, long: 60 } },
    { id: 'ID_WEAPON_HANDAXE', name: 'Hachette', nameEn: 'Handaxe', cost: 500, weight: 2, type: 'simple-melee', damage: '1d6', damageType: 'slashing', properties: ['light', 'thrown'], range: { normal: 20, long: 60 } },
    { id: 'ID_WEAPON_JAVELIN', name: 'Javeline', nameEn: 'Javelin', cost: 500, weight: 2, type: 'simple-melee', damage: '1d6', damageType: 'piercing', properties: ['thrown'], range: { normal: 30, long: 120 } },
    { id: 'ID_WEAPON_LIGHT_HAMMER', name: 'Marteau léger', nameEn: 'Light Hammer', cost: 200, weight: 2, type: 'simple-melee', damage: '1d4', damageType: 'bludgeoning', properties: ['light', 'thrown'], range: { normal: 20, long: 60 } },
    { id: 'ID_WEAPON_MACE', name: 'Masse', nameEn: 'Mace', cost: 500, weight: 4, type: 'simple-melee', damage: '1d6', damageType: 'bludgeoning', properties: [] },
    { id: 'ID_WEAPON_QUARTERSTAFF', name: 'Bâton', nameEn: 'Quarterstaff', cost: 200, weight: 4, type: 'simple-melee', damage: '1d6', damageType: 'bludgeoning', properties: ['versatile'], versatileDamage: '1d8' },
    { id: 'ID_WEAPON_SPEAR', name: 'Lance', nameEn: 'Spear', cost: 100, weight: 3, type: 'simple-melee', damage: '1d6', damageType: 'piercing', properties: ['thrown', 'versatile'], range: { normal: 20, long: 60 }, versatileDamage: '1d8' },
    { id: 'ID_WEAPON_GREATCLUB', name: 'Gourdin', nameEn: 'Greatclub', cost: 200, weight: 10, type: 'simple-melee', damage: '1d8', damageType: 'bludgeoning', properties: ['two-handed'] },
    { id: 'ID_WEAPON_CLUB', name: 'Massue', nameEn: 'Club', cost: 10, weight: 2, type: 'simple-melee', damage: '1d4', damageType: 'bludgeoning', properties: ['light'] },
    { id: 'ID_WEAPON_SICKLE', name: 'Serpe', nameEn: 'Sickle', cost: 100, weight: 2, type: 'simple-melee', damage: '1d4', damageType: 'slashing', properties: ['light'] },
    { id: 'ID_WEAPON_SHORTSWORD', name: 'Épée courte', nameEn: 'Shortsword', cost: 1000, weight: 2, type: 'simple-melee', damage: '1d6', damageType: 'piercing', properties: ['finesse', 'light'] },
    { id: 'ID_WEAPON_LONGSWORD', name: 'Épée longue', nameEn: 'Longsword', cost: 1500, weight: 3, type: 'martial-melee', damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10' },
    { id: 'ID_WEAPON_BATTLEAXE', name: 'Hache d\'armes', nameEn: 'Battleaxe', cost: 1000, weight: 4, type: 'martial-melee', damage: '1d8', damageType: 'slashing', properties: ['versatile'], versatileDamage: '1d10' },
    { id: 'ID_WEAPON_WARHAMMER', name: 'Marteau de guerre', nameEn: 'Warhammer', cost: 1500, weight: 2, type: 'martial-melee', damage: '1d8', damageType: 'bludgeoning', properties: ['versatile'], versatileDamage: '1d10' },
    { id: 'ID_WEAPON_RAPIER', name: 'Rapière', nameEn: 'Rapier', cost: 2500, weight: 2, type: 'martial-melee', damage: '1d8', damageType: 'piercing', properties: ['finesse'] },
    { id: 'ID_WEAPON_SCIMITAR', name: 'Cimeterre', nameEn: 'Scimitar', cost: 2500, weight: 3, type: 'martial-melee', damage: '1d6', damageType: 'slashing', properties: ['finesse', 'light'] },
    { id: 'ID_WEAPON_GLAIVE', name: 'Coutille', nameEn: 'Glaive', cost: 2000, weight: 6, type: 'martial-melee', damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'] },
    { id: 'ID_WEAPON_GREATSWORD', name: 'Espadon', nameEn: 'Greatsword', cost: 5000, weight: 6, type: 'martial-melee', damage: '2d6', damageType: 'slashing', properties: ['heavy', 'two-handed'] },
    { id: 'ID_WEAPON_GREATAXE', name: 'Hache à deux mains', nameEn: 'Greataxe', cost: 3000, weight: 7, type: 'martial-melee', damage: '1d12', damageType: 'slashing', properties: ['heavy', 'two-handed'] },
    { id: 'ID_WEAPON_HALBERD', name: 'Hallebarde', nameEn: 'Halberd', cost: 2000, weight: 6, type: 'martial-melee', damage: '1d10', damageType: 'slashing', properties: ['heavy', 'reach', 'two-handed'] },
    { id: 'ID_WEAPON_LANCE', name: 'Lance de cavalerie', nameEn: 'Lance', cost: 1000, weight: 6, type: 'martial-melee', damage: '1d12', damageType: 'piercing', properties: ['reach', 'special'] },
    { id: 'ID_WEAPON_MAUL', name: 'Masse d\'armes', nameEn: 'Maul', cost: 1000, weight: 10, type: 'martial-melee', damage: '2d6', damageType: 'bludgeoning', properties: ['heavy', 'two-handed'] },
    { id: 'ID_WEAPON_PIKE', name: 'Pique', nameEn: 'Pike', cost: 500, weight: 18, type: 'martial-melee', damage: '1d10', damageType: 'piercing', properties: ['heavy', 'reach', 'two-handed'] },
    { id: 'ID_WEAPON_SHORTBOW', name: 'Arc court', nameEn: 'Shortbow', cost: 2500, weight: 2, type: 'simple-ranged', damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'two-handed'], range: { normal: 80, long: 320 } },
    { id: 'ID_WEAPON_LONGBOW', name: 'Arc long', nameEn: 'Longbow', cost: 5000, weight: 2, type: 'martial-ranged', damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'heavy', 'two-handed'], range: { normal: 150, long: 600 } },
    { id: 'ID_WEAPON_LIGHT_CROSSBOW', name: 'Arbalète légère', nameEn: 'Light Crossbow', cost: 2500, weight: 5, type: 'simple-ranged', damage: '1d8', damageType: 'piercing', properties: ['ammunition', 'loading', 'two-handed'], range: { normal: 80, long: 320 } },
    { id: 'ID_WEAPON_HEAVY_CROSSBOW', name: 'Arbalète lourde', nameEn: 'Heavy Crossbow', cost: 5000, weight: 18, type: 'martial-ranged', damage: '1d10', damageType: 'piercing', properties: ['ammunition', 'heavy', 'loading', 'two-handed'], range: { normal: 100, long: 400 } },
    { id: 'ID_WEAPON_HAND_CROSSBOW', name: 'Arbalète de poing', nameEn: 'Hand Crossbow', cost: 7500, weight: 3, type: 'martial-ranged', damage: '1d6', damageType: 'piercing', properties: ['ammunition', 'light', 'loading'], range: { normal: 30, long: 120 } },
    { id: 'ID_WEAPON_BLOWGUN', name: 'Sarbacane', nameEn: 'Blowgun', cost: 1000, weight: 1, type: 'martial-ranged', damage: '1', damageType: 'piercing', properties: ['ammunition', 'loading'], range: { normal: 25, long: 100 } },
    { id: 'ID_WEAPON_NET', name: 'Filet', nameEn: 'Net', cost: 100, weight: 3, type: 'martial-ranged', damage: '0', damageType: 'bludgeoning', properties: ['special', 'thrown'], range: { normal: 5, long: 15 } }
  ],
  armor: [
    { id: 'ID_ARMOR_PADDED', name: 'Gambison', nameEn: 'Padded Armor', type: 'light', cost: 500, weight: 8, ac: 11, maxDex: null, stealthDisadvantage: true },
    { id: 'ID_ARMOR_LEATHER', name: 'Armure de cuir', nameEn: 'Leather Armor', type: 'light', cost: 1000, weight: 10, ac: 11, maxDex: null, stealthDisadvantage: false },
    { id: 'ID_ARMOR_STUDDED_LEATHER', name: 'Armure de cuir clouté', nameEn: 'Studded Leather Armor', type: 'light', cost: 4500, weight: 13, ac: 12, maxDex: null, stealthDisadvantage: false },
    { id: 'ID_ARMOR_HIDE', name: 'Armure de peaux', nameEn: 'Hide Armor', type: 'medium', cost: 1000, weight: 12, ac: 12, maxDex: 2, stealthDisadvantage: false },
    { id: 'ID_ARMOR_CHAIN_SHIRT', name: 'Chemise de mailles', nameEn: 'Chain Shirt', type: 'medium', cost: 5000, weight: 20, ac: 13, maxDex: 2, stealthDisadvantage: false },
    { id: 'ID_ARMOR_SCALE_MAIL', name: 'Armure d\'écailles', nameEn: 'Scale Mail', type: 'medium', cost: 5000, weight: 45, ac: 14, maxDex: 2, stealthDisadvantage: true },
    { id: 'ID_ARMOR_BREASTPLATE', name: 'Cuirasse', nameEn: 'Breastplate', type: 'medium', cost: 40000, weight: 20, ac: 14, maxDex: 2, stealthDisadvantage: false },
    { id: 'ID_ARMOR_HALF_PLATE', name: 'Demi-armure', nameEn: 'Half Plate Armor', type: 'medium', cost: 75000, weight: 40, ac: 15, maxDex: 2, stealthDisadvantage: true },
    { id: 'ID_ARMOR_RING_MAIL', name: 'Armure d\'anneaux', nameEn: 'Ring Mail', type: 'heavy', cost: 3000, weight: 40, ac: 14, maxDex: 0, stealthDisadvantage: true },
    { id: 'ID_ARMOR_CHAIN_MAIL', name: 'Cotte de mailles', nameEn: 'Chain Mail', type: 'heavy', cost: 7500, weight: 55, ac: 16, maxDex: 0, stealthDisadvantage: true, strengthReq: 13 },
    { id: 'ID_ARMOR_SPLINT', name: 'Armure de clibanion', nameEn: 'Splint Armor', type: 'heavy', cost: 20000, weight: 60, ac: 17, maxDex: 0, stealthDisadvantage: true, strengthReq: 15 },
    { id: 'ID_ARMOR_PLATE', name: 'Armure de plates', nameEn: 'Plate Armor', type: 'heavy', cost: 150000, weight: 65, ac: 18, maxDex: 0, stealthDisadvantage: true, strengthReq: 15 },
    { id: 'ID_ARMOR_SHIELD', name: 'Bouclier', nameEn: 'Shield', type: 'shield', cost: 1000, weight: 6, ac: 2, maxDex: null, stealthDisadvantage: false }
  ],
  adventuringGear: [
    { id: 'ID_EQUIPMENT_BACKPACK', name: 'Sac à dos', nameEn: 'Backpack', cost: 200, weight: 5, description: '1m³ de capacité, 15kg max' },
    { id: 'ID_EQUIPMENT_BEDROLL', name: 'Sac de couchage', nameEn: 'Bedroll', cost: 100, weight: 7 },
    { id: 'ID_EQUIPMENT_ROPE_HEMP', name: 'Corde en chanvre (15m)', nameEn: 'Hempen Rope', cost: 100, weight: 10 },
    { id: 'ID_EQUIPMENT_ROPE_SILK', name: 'Corde de soie (15m)', nameEn: 'Silk Rope', cost: 1000, weight: 5 },
    { id: 'ID_EQUIPMENT_TORCH', name: 'Torche', nameEn: 'Torch', cost: 1, weight: 1, description: 'Lumière vive dans un rayon de 6m, faible dans 12m supplémentaires. Brûle 1 heure.' },
    { id: 'ID_EQUIPMENT_LANTERN_HOODED', name: 'Lanterne à capote', nameEn: 'Hooded Lantern', cost: 500, weight: 2, description: 'Lumière vive 9m, faible 18m. 6 heures avec 0.5L d\'huile.' },
    { id: 'ID_EQUIPMENT_OIL', name: 'Flasque d\'huile (0.5L)', nameEn: 'Oil Flask', cost: 10, weight: 1 },
    { id: 'ID_EQUIPMENT_TENT', name: 'Tente pour deux personnes', nameEn: 'Tent', cost: 200, weight: 20 },
    { id: 'ID_EQUIPMENT_RATIONS', name: 'Rations (1 jour)', nameEn: 'Rations', cost: 50, weight: 2 },
    { id: 'ID_EQUIPMENT_WATERSKIN', name: 'Outre', nameEn: 'Waterskin', cost: 20, weight: 5 },
    { id: 'ID_EQUIPMENT_TINDERBOX', name: 'Boîte à amadou', nameEn: 'Tinderbox', cost: 50, weight: 1 },
    { id: 'ID_EQUIPMENT_HEALERS_KIT', name: 'Trousse de soins', nameEn: 'Healer\'s Kit', cost: 500, weight: 3, description: '10 utilisations. Action pour stabiliser une créature à 0 PV.' },
    { id: 'ID_EQUIPMENT_THIEVES_TOOLS', name: 'Outils de cambrioleur', nameEn: 'Thieves\' Tools', cost: 2500, weight: 1, description: 'Nécessaires pour crocheter les serrures.' },
    { id: 'ID_EQUIPMENT_SPELLBOOK', name: 'Grimoire', nameEn: 'Spellbook', cost: 5000, weight: 3, description: 'Contient les sorts du magicien. 100 pages.' },
    { id: 'ID_EQUIPMENT_COMPONENT_POUCH', name: 'Bourse de composantes', nameEn: 'Component Pouch', cost: 2500, weight: 2, description: 'Contient les composantes matérielles de sorts.' },
    { id: 'ID_EQUIPMENT_DRUIDIC_FOCUS', name: 'Focus druidique', nameEn: 'Druidic Focus', cost: 500, weight: 2, description: 'Bâton en bois d\'if, baguette en bois d\'yeuse, bâton creux.' },
    { id: 'ID_EQUIPMENT_HOLY_SYMBOL', name: 'Symbole sacré', nameEn: 'Holy Symbol', cost: 500, weight: 1, description: 'Emblème, reliquaire ou amulette.' }
  ],
  equipmentPacks: [
    { 
      id: 'ID_EQUIPMENT_DUNGEONEER_PACK', 
      name: 'Sac d\'aventurier', 
      nameEn: 'Dungeoneer\'s Pack', 
      cost: 1200, 
      weight: 54,
      contents: ['ID_EQUIPMENT_BACKPACK', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TINDERBOX', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_WATERSKIN', 'ID_EQUIPMENT_HEALERS_KIT', 'ID_EQUIPMENT_ROPE_HEMP']
    },
    { 
      id: 'ID_EQUIPMENT_EXPLORER_PACK', 
      name: 'Sac d\'explorateur', 
      nameEn: 'Explorer\'s Pack', 
      cost: 1000, 
      weight: 49,
      contents: ['ID_EQUIPMENT_BACKPACK', 'ID_EQUIPMENT_BEDROLL', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TORCH', 'ID_EQUIPMENT_TINDERBOX', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_WATERSKIN']
    },
    { 
      id: 'ID_EQUIPMENT_DIPLOMAT_PACK', 
      name: 'Sac de diplomate', 
      nameEn: 'Diplomat\'s Pack', 
      cost: 3900, 
      weight: 16,
      contents: ['ID_EQUIPMENT_BACKPACK', 'ID_EQUIPMENT_OIL', 'ID_EQUIPMENT_OIL', 'ID_EQUIPMENT_LANTERN_HOODED', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_WATERSKIN']
    },
    { 
      id: 'ID_EQUIPMENT_ENTERTAINER_PACK', 
      name: 'Sac d\'artiste', 
      nameEn: 'Entertainer\'s Pack', 
      cost: 4000, 
      weight: 22,
      contents: ['ID_EQUIPMENT_BACKPACK', 'ID_EQUIPMENT_BEDROLL', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_WATERSKIN']
    },
    { 
      id: 'ID_EQUIPMENT_PRIEST_PACK', 
      name: 'Sac de prêtre', 
      nameEn: 'Priest\'s Pack', 
      cost: 1900, 
      weight: 15,
      contents: ['ID_EQUIPMENT_BACKPACK', 'ID_EQUIPMENT_HOLY_SYMBOL', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_RATIONS', 'ID_EQUIPMENT_WATERSKIN']
    }
  ]
}

// ============================================================================
// DONNÉES DES DONS
// ============================================================================

const featsData = [
  { id: 'ID_FEAT_ALERT', name: 'Alerte', nameEn: 'Alert', description: '+5 à l\'initiative, pas de surprise si conscient, pas d\'avantage pour les attaquants cachés.', prerequisites: [] },
  { id: 'ID_FEAT_ATHLETE', name: 'Athlète', nameEn: 'Athlete', description: 'Redressez-vous avec 1.5m de déplacement, escalade sans coût de mouvement supplémentaire, saut en distance et hauteur avec +1.5m.', prerequisites: [] },
  { id: 'ID_FEAT_ACTOR', name: 'Comédien', nameEn: 'Actor', description: '+1 CHA, avantage aux tests pour imiter quelqu\'un, imiter la voix d\'une créature entendue pendant 1 minute.', prerequisites: [] },
  { id: 'ID_FEAT_CHARGER', name: 'Chargeur', nameEn: 'Charger', description: 'Après un Foncer de 3m, attaque bonus ou pousser avec +5 dégâts.', prerequisites: [] },
  { id: 'ID_FEAT_CROSSBOW_EXPERT', name: 'Expert arbalète', nameEn: 'Crossbow Expert', description: 'Pas de désavantage à portée courte, action bonus pour attaquer avec une arbalète de poing, attaque de mêlée ne vous gène pas pour les attaques à distance.', prerequisites: [] },
  { id: 'ID_FEAT_DEFENSIVE_DUELIST', name: 'Duelliste défensif', nameEn: 'Defensive Duelist', description: 'Réaction pour ajouter votre bonus de maîtrise à la CA avec une arme de finesse.', prerequisites: [{ type: 'ability', dex: 13 }] },
  { id: 'ID_FEAT_DUAL_WIELDER', name: 'Combat à deux armes', nameEn: 'Dual Wielder', description: '+1 CA si deux armes en main, utiliser deux armes non légères.', prerequisites: [] },
  { id: 'ID_FEAT_DUNGEON_DELVER', name: 'Explorateur de donjons', nameEn: 'Dungeon Delver', description: 'Avantage pour repérer portes et passages secrets, résistance aux pièges, pas de désavantage aux jets de Perception dans une lumière faible.', prerequisites: [] },
  { id: 'ID_FEAT_DURABLE', name: 'Endurant', nameEn: 'Durable', description: 'Récupérez le minimum de 2× votre bonus de maîtrise aux dé de PV lors des repos courts.', prerequisites: [{ type: 'ability', con: 13 }] },
  { id: 'ID_FEAT_ELEMENTAL_ADEPT', name: 'Adepte élémentaire', nameEn: 'Elemental Adept', description: 'Sorts d\'un type de dégâts élémentaire ignore la résistance, 1 devient 2 sur les dé de dégâts.', prerequisites: [{ type: 'feature', feature: 'spellcasting' }] },
  { id: 'ID_FEAT_GREAT_WEAPON_MASTER', name: 'Maître d\'armes lourdes', nameEn: 'Great Weapon Master', description: '-5 pour +10 dégâts avec une arme lourde ou de corps-à-corps à deux mains. Action bonus si critique ou tué à 0 PV.', prerequisites: [] },
  { id: 'ID_FEAT_HEALER', name: 'Guérisseur', nameEn: 'Healer', description: 'Action pour stabiliser à 1 PV avec la trousse de soins. Action bonus pour soigner 1d6+4+PV max avec la trousse.', prerequisites: [] },
  { id: 'ID_FEAT_HEAVILY_ARMORED', name: 'Armure lourde', nameEn: 'Heavily Armored', description: '+1 FOR, maîtrise des armures lourdes.', prerequisites: [{ type: 'proficiency', armor: 'medium' }] },
  { id: 'ID_FEAT_HEAVY_ARMOR_MASTER', name: 'Maître des armures lourdes', nameEn: 'Heavy Armor Master', description: '+1 FOR, -3 dégâts contondants/perforants/tranchants avec une armure lourde.', prerequisites: [{ type: 'proficiency', armor: 'heavy' }] },
  { id: 'ID_FEAT_INSPIRING_LEADER', name: 'Chef inspirant', nameEn: 'Inspiring Leader', description: '10 minutes de discours pour donner PV temporaires = niveau + mod CHA à jusqu\'à 6 créatures.', prerequisites: [{ type: 'ability', cha: 13 }] },
  { id: 'ID_FEAT_KEEN_MIND', name: 'Esprit vif', nameEn: 'Keen Mind', description: '+1 INT, souvenez-vous de tout ce que vous avez vu/entendu depuis 1 mois, toujours savez où nord est, heure exacte.', prerequisites: [] },
  { id: 'ID_FEAT_LIGHTLY_ARMORED', name: 'Armure légère', nameEn: 'Lightly Armored', description: '+1 FOR ou DEX, maîtrise des armures légères.', prerequisites: [] },
  { id: 'ID_FEAT_LINGUIST', name: 'Linguiste', nameEn: 'Linguist', description: '+1 INT, +3 langues, créer des codes.', prerequisites: [] },
  { id: 'ID_FEAT_LUCKY', name: 'Chanceux', nameEn: 'Lucky', description: 'Relancez un jet d\'attaque, de test de capacité ou de sauvegarde. 3/utilisation/repos long.', prerequisites: [] },
  { id: 'ID_FEAT_MAGE_SLAYER', name: 'Pourfendeur de mages', nameEn: 'Mage Slayer', description: 'Réaction d\'attaque contre un lanceur de sorts à 1,5m. Avantage aux jets de sauvegarde contre les sorts à 1,5m.', prerequisites: [] },
  { id: 'ID_FEAT_MAGIC_INITIATE', name: 'Initié à la magie', nameEn: 'Magic Initiate', description: '2 sorts mineurs et 1 sort niveau 1 d\'une classe (1/jour) d\'une classe de lanceur de sorts.', prerequisites: [] },
  { id: 'ID_FEAT_MARTIAL_ADEPT', name: 'Adepte martial', nameEn: 'Martial Adept', description: '2 manœuvres du Maître de bataille, 1 dé de supériorité d4.', prerequisites: [] },
  { id: 'ID_FEAT_MEDIUM_ARMOR_MASTER', name: 'Maître des armures intermédiaires', nameEn: 'Medium Armor Master', description: 'Pas de désavantage de Discrétion avec armure intermédiaire, +3 au lieu de +2 de mod DEX max.', prerequisites: [{ type: 'proficiency', armor: 'medium' }] },
  { id: 'ID_FEAT_MOBILE', name: 'Mobile', nameEn: 'Mobile', description: 'Vitesse +3m, pas d\'attaque d\'opportunité contre cible attaquée, terrain difficile ne vous ralentit pas en Dash.', prerequisites: [] },
  { id: 'ID_FEAT_MODERATELY_ARMORED', name: 'Armure intermédiaire', nameEn: 'Moderately Armored', description: '+1 FOR ou DEX, maîtrise des armures intermédiaires et des boucliers.', prerequisites: [{ type: 'proficiency', armor: 'light' }] },
  { id: 'ID_FEAT_MOUNTED_COMBATANT', name: 'Cavalier', nameEn: 'Mounted Combatant', description: 'Avantage aux jets d\'attaque contre créatures plus petites que votre monture, attaque cible monture à la place, monture résiste aux jets de sauvegarde de DEX.', prerequisites: [] },
  { id: 'ID_FEAT_OBSERVANT', name: 'Observateur', nameEn: 'Observant', description: '+1 INT ou SAG, +5 à la Perception passive et Investigation passive, lire sur les lèvres.', prerequisites: [] },
  { id: 'ID_FEAT_POLEARM_MASTER', name: 'Maître des armes d\'hast', nameEn: 'Polearm Master', description: 'Attaque bonus avec le dos de l\'arme d\'hast, attaque d\'opportunité quand une créature entre à votre portée.', prerequisites: [] },
  { id: 'ID_FEAT_RESILIENT', name: 'Résistant', nameEn: 'Resilient', description: '+1 à une caractéristique (max 20), maîtrise des jets de sauvegarde de cette caractéristique.', prerequisites: [] },
  { id: 'ID_FEAT_RITUAL_CASTER', name: 'Lanceur de rituels', nameEn: 'Ritual Caster', description: 'Livre des rituels avec 2 sorts de ritual de niveau 1 d\'une classe de lanceur de sorts.', prerequisites: [{ type: 'ability', int: 13, wis: 13 }] },
  { id: 'ID_FEAT_SAVAGE_ATTACKER', name: 'Attaquant sauvage', nameEn: 'Savage Attacker', description: 'Relancez les dégâts d\'arme d\'une attaque une fois par tour.', prerequisites: [] },
  { id: 'ID_FEAT_SENTINEL', name: 'Sentinelle', nameEn: 'Sentinel', description: 'Attaque d\'opportunité arrête la cible, attaque d\'opportunité même si cible Se désengage, attaque si cible attaque un allié à 1,5m.', prerequisites: [] },
  { id: 'ID_FEAT_SHARPSHOOTER', name: 'Tireur d\'élite', nameEn: 'Sharpshooter', description: 'Pas de désavantage à longue portée, -5 pour +10 dégâts, ignorer les couverts à moitié et trois quarts.', prerequisites: [] },
  { id: 'ID_FEAT_SHIELD_MASTER', name: 'Maître des boucliers', nameEn: 'Shield Master', description: 'Bonus action pour pousser avec le bouclier, bonus de bouclier aux jets de sauvegarde de DEX, pas de dégâts si réussi le jet de sauvegarde.', prerequisites: [] },
  { id: 'ID_FEAT_SKILLED', name: 'Compétent', nameEn: 'Skilled', description: '+3 compétences ou outils.', prerequisites: [] },
  { id: 'ID_FEAT_SKULKER', name: 'Rôdeur', nameEn: 'Skulker', description: 'Vous pouvez vous cacher quand légèrement dissimulé, raté une attaque à distance ne révèle pas votre position, lumière faible ne donne pas de désavantage à la Perception.', prerequisites: [{ type: 'ability', dex: 13 }] },
  { id: 'ID_FEAT_SPELL_SNIPER', name: 'Tireur de sorts', nameEn: 'Spell Sniper', description: 'Doublage de portée des sorts d\'attaque, ignorez les couverts, sorts d\'attaque sans jet d\'attaque peuvent faire des critiques, sort mineur.', prerequisites: [{ type: 'feature', feature: 'spellcasting' }] },
  { id: 'ID_FEAT_TOUGH', name: 'Robuste', nameEn: 'Tough', description: 'PV max +2 par niveau.', prerequisites: [] },
  { id: 'ID_FEAT_WAR_CASTER', name: 'Lanceur de guerre', nameEn: 'War Caster', description: 'Avantage aux jets de CON pour maintenir la concentration, gestes somatiques même avec armes/bouclier, attaque d\'opportunité avec un sort à 1 action.', prerequisites: [{ type: 'feature', feature: 'spellcasting' }] },
  { id: 'ID_FEAT_WEAPON_MASTER', name: 'Maître d\'armes', nameEn: 'Weapon Master', description: '+1 FOR ou DEX, maîtrise de 4 armes simples ou de guerre.', prerequisites: [] }
]

// ============================================================================
// DONNÉES DES BACKGROUNDS (HISTORIQUES)
// ============================================================================

const backgroundsData = [
  {
    id: 'ID_PHB_BACKGROUND_ACOLYTE',
    name: 'Acolyte',
    nameEn: 'Acolyte',
    description: 'Vous avez passé votre vie au service d\'un temple, apprenti d\'un prêtre ou d\'un oracle.',
    skillProficiencies: ['ID_SKILL_INSIGHT', 'ID_SKILL_RELIGION'],
    languageCount: 2,
    equipment: ['ID_EQUIPMENT_HOLY_SYMBOL', 'ID_EQUIPMENT_PRAYER_BOOK', 'ID_EQUIPMENT_INCENSE', 'ID_EQUIPMENT_VESTMENTS', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Sanctuaire',
      description: 'Les temples et sanctuaires de votre foi vous offrent nourriture et abri, et vos confrères vous aident (pas au péril de leur vie).'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_CHARLATAN',
    name: 'Charlatan',
    nameEn: 'Charlatan',
    description: 'Vous avez toujours un don pour découvrir les faiblesses des gens et les exploiter.',
    skillProficiencies: ['ID_SKILL_DECEPTION', 'ID_SKILL_SLEIGHT_OF_HAND'],
    toolProficiencies: ['ID_TOOL_DISGUISE_KIT', 'ID_TOOL_FORGERY_KIT'],
    equipment: ['ID_EQUIPMENT_FINE_CLOTHES', 'ID_EQUIPMENT_DISGUISE_KIT', 'ID_EQUIPMENT_WEIGHTED_DICE', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Fausse identité',
      description: 'Vous avez créé une fausse identité complète avec documents, relations et vêtements.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_CRIMINAL',
    name: 'Criminel',
    nameEn: 'Criminal',
    description: 'Vous avez vécu des années en marge de la société, membre d\'une guilde de voleurs ou agissant seul.',
    skillProficiencies: ['ID_SKILL_DECEPTION', 'ID_SKILL_STEALTH'],
    toolProficiencies: ['ID_TOOL_THIEVES_TOOLS', 'ID_TOOL_GAMING_SET'],
    equipment: ['ID_EQUIPMENT_CROWBAR', 'ID_EQUIPMENT_DARK_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH', 'ID_EQUIPMENT_THIEVES_TOOLS'],
    feature: {
      name: 'Contact criminel',
      description: 'Vous avez un contact fiable qui connaît les réseaux criminels locaux.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_ENTERTAINER',
    name: 'Artiste',
    nameEn: 'Entertainer',
    description: 'Vous avez charmé, diverti et inspiré des auditoires avec vos talents artistiques.',
    skillProficiencies: ['ID_SKILL_ACROBATICS', 'ID_SKILL_PERFORMANCE'],
    toolProficiencies: ['ID_TOOL_DISGUISE_KIT', 'ID_TOOL_MUSICAL_INSTRUMENT'],
    equipment: ['ID_EQUIPMENT_MUSICAL_INSTRUMENT', 'ID_EQUIPMENT_FAN_LETTER', 'ID_EQUIPMENT_COSTUME', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Popularité',
      description: 'Vous pouvez trouver un endroit où performer, recevant nourriture et logement modestes.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_FOLK_HERO',
    name: 'Héros du peuple',
    nameEn: 'Folk Hero',
    description: 'Vous venez d\'un humble milieu, mais le destin vous a fait vivre quelque chose d\'extraordinaire.',
    skillProficiencies: ['ID_SKILL_ANIMAL_HANDLING', 'ID_SKILL_SURVIVAL'],
    toolProficiencies: ['ID_TOOL_ARTISAN_TOOLS', 'ID_TOOL_VEHICLES_LAND'],
    equipment: ['ID_EQUIPMENT_ARTISAN_TOOLS', 'ID_EQUIPMENT_SHOVEL', 'ID_EQUIPMENT_IRON_POT', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Hospitalité rustique',
      description: 'Les paysans vous cachent et vous aident, ne trahissant jamais (sauf au péril de leur vie).'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_GUILD_ARTISAN',
    name: 'Artisan de guilde',
    nameEn: 'Guild Artisan',
    description: 'Vous étiez membre d\'une guilde d\'artisans, ayant appris un métier spécifique.',
    skillProficiencies: ['ID_SKILL_INSIGHT', 'ID_SKILL_PERSUASION'],
    toolProficiencies: ['ID_TOOL_ARTISAN_TOOLS'],
    languageCount: 1,
    equipment: ['ID_EQUIPMENT_ARTISAN_TOOLS', 'ID_EQUIPMENT_GUILD_LETTER', 'ID_EQUIPMENT_TRAVELERS_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Membre de guilde',
      description: 'Votre guilde vous offre logement et nourriture, et vous aide avec des personnages influents.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_HERMIT',
    name: 'Ermite',
    nameEn: 'Hermit',
    description: 'Vous avez vécu isolé du monde, en méditation dans une communauté monastique ou dans une hutte.',
    skillProficiencies: ['ID_SKILL_MEDICINE', 'ID_SKILL_RELIGION'],
    toolProficiencies: ['ID_TOOL_HERBALISM_KIT'],
    languageCount: 1,
    equipment: ['ID_EQUIPMENT_SCROLL_CASE', 'ID_EQUIPMENT_WINTER_BLANKET', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_HERBALISM_KIT', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Découverte',
      description: 'Vous avez fait une découverte unique lors de votre isolement (nature de la divinité, réalité cosmique, etc.)'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_NOBLE',
    name: 'Noble',
    nameEn: 'Noble',
    description: 'Vous appartenez à une famille noble, élevé dans le luxe et l\'éducation, habitué au pouvoir et au privilège.',
    skillProficiencies: ['ID_SKILL_HISTORY', 'ID_SKILL_PERSUASION'],
    toolProficiencies: ['ID_TOOL_GAMING_SET'],
    languageCount: 1,
    equipment: ['ID_EQUIPMENT_FINE_CLOTHES', 'ID_EQUIPMENT_SIGNET_RING', 'ID_EQUIPMENT_SCROLL_BIRTH', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Position de privilège',
      description: 'Vous êtes accueilli dans la haute société, et les gens supposent que vous avez le droit d\'être là.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_OUTLANDER',
    name: 'Étranger',
    nameEn: 'Outlander',
    description: 'Vous avez grandi dans les terres sauvages, loin de la civilisation et de ses conforts.',
    skillProficiencies: ['ID_SKILL_ATHLETICS', 'ID_SKILL_SURVIVAL'],
    toolProficiencies: ['ID_TOOL_MUSICAL_INSTRUMENT'],
    languageCount: 1,
    equipment: ['ID_EQUIPMENT_STAFF', 'ID_EQUIPMENT_TRAP', 'ID_EQUIPMENT_HUNTING_TROPHY', 'ID_EQUIPMENT_TRAVELERS_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Vagabond',
      description: 'Vous pouvez trouver nourriture et eau fraîche pour vous et jusqu\'à 5 autres personnes par jour.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_SAGE',
    name: 'Sage',
    nameEn: 'Sage',
    description: 'Vous avez passé des années à apprendre les connaissances du multivers, étudiant dans des bibliothèques et des écoles.',
    skillProficiencies: ['ID_SKILL_ARCANA', 'ID_SKILL_HISTORY'],
    languageCount: 2,
    equipment: ['ID_EQUIPMENT_INK', 'ID_EQUIPMENT_QUILL', 'ID_EQUIPMENT_SMALL_KNIFE', 'ID_EQUIPMENT_LETTER_FRIEND', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Chercheur',
      description: 'Vous savez où trouver des informations (connaissances locales, bibliothèques, savants, etc.)'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_SAILOR',
    name: 'Marin',
    nameEn: 'Sailor',
    description: 'Vous avez navigué pendant des années, combattu des monstres marins et affronté tempêtes.',
    skillProficiencies: ['ID_SKILL_ATHLETICS', 'ID_SKILL_PERCEPTION'],
    toolProficiencies: ['ID_TOOL_NAVIGATOR_TOOLS', 'ID_TOOL_VEHICLES_WATER'],
    equipment: ['ID_EQUIPMENT_CLUB', 'ID_EQUIPMENT_SILK_ROPE', 'ID_EQUIPMENT_LUCKY_CHARM', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Aller dans le vent',
      description: 'Vous pouvez obtenir passage gratuit sur un navire pour vous et vos compagnons.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_SOLDIER',
    name: 'Soldat',
    nameEn: 'Soldier',
    description: 'Vous avez servi dans une armée, appris les bases du combat et la vie militaire.',
    skillProficiencies: ['ID_SKILL_ATHLETICS', 'ID_SKILL_INTIMIDATION'],
    toolProficiencies: ['ID_TOOL_GAMING_SET', 'ID_TOOL_VEHICLES_LAND'],
    equipment: ['ID_EQUIPMENT_INSIGNIA_RANK', 'ID_EQUIPMENT_TROPHY', 'ID_EQUIPMENT_BONE_DICE', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Grade militaire',
      description: 'Les soldats respectent votre rang, vous permettant d\'accéder à des installations militaires.'
    }
  },
  {
    id: 'ID_PHB_BACKGROUND_URCHIN',
    name: 'Gueux',
    nameEn: 'Urchin',
    description: 'Vous avez grandi dans les rues, seul, devant voler et survivre par vos propres moyens.',
    skillProficiencies: ['ID_SKILL_SLEIGHT_OF_HAND', 'ID_SKILL_STEALTH'],
    toolProficiencies: ['ID_TOOL_DISGUISE_KIT', 'ID_TOOL_THIEVES_TOOLS'],
    equipment: ['ID_EQUIPMENT_SMALL_KNIFE', 'ID_EQUIPMENT_MAP_HOME', 'ID_EQUIPMENT_PET_MOUSE', 'ID_EQUIPMENT_PARENT_TOKEN', 'ID_EQUIPMENT_COMMON_CLOTHES', 'ID_EQUIPMENT_BELT_POUCH'],
    feature: {
      name: 'Connaissance des rues',
      description: 'Vous connaissez les messages secrets et passages de la ville, pouvez voyager deux fois plus vite dans les ruelles.'
    }
  }
]

// ============================================================================
// FONCTIONS D'EXPORT
// ============================================================================

function ensureDir(dir) {
  try {
    mkdirSync(dir, { recursive: true })
  } catch (e) {
    // Directory already exists
  }
}

function convertRaces() {
  console.log('🔄 Conversion des races au format Aurora V2...')
  
  const outputDir = join(rootDir, 'public', 'data', 'aurora')
  ensureDir(outputDir)
  
  // Créer le fichier races.json
  const racesOutput = {
    version: '2.0.0',
    source: 'PHB',
    count: racesData.length,
    races: racesData,
    traits: racialTraitsV2
  }
  
  const racesPath = join(outputDir, 'races.json')
  writeFileSync(racesPath, JSON.stringify(racesOutput, null, 2))
  console.log(`✅ ${racesData.length} races exportées vers ${racesPath}`)
  
  // Créer le fichier racial-traits.json séparé aussi
  const traitsPath = join(outputDir, 'racial-traits.json')
  writeFileSync(traitsPath, JSON.stringify(racialTraitsV2, null, 2))
  console.log(`✅ ${Object.keys(racialTraitsV2).length} traits raciaux exportés vers ${traitsPath}`)
}

function convertClasses() {
  console.log('🔄 Conversion des classes au format Aurora V2...')
  
  const outputDir = join(rootDir, 'public', 'data', 'aurora')
  ensureDir(outputDir)
  
  const classesOutput = {
    version: '2.0.0',
    source: 'PHB',
    count: classesData.length,
    classes: classesData
  }
  
  const classesPath = join(outputDir, 'classes.json')
  writeFileSync(classesPath, JSON.stringify(classesOutput, null, 2))
  console.log(`✅ ${classesData.length} classes exportées vers ${classesPath}`)
}

function convertEquipment() {
  console.log('🔄 Conversion de l\'équipement au format Aurora V2...')
  
  const outputDir = join(rootDir, 'public', 'data', 'aurora')
  ensureDir(outputDir)
  
  const equipmentOutput = {
    version: '2.0.0',
    source: 'PHB',
    count: equipmentData.weapons.length + equipmentData.armor.length + equipmentData.adventuringGear.length,
    weapons: equipmentData.weapons,
    armor: equipmentData.armor,
    adventuringGear: equipmentData.adventuringGear,
    equipmentPacks: equipmentData.equipmentPacks
  }
  
  const equipmentPath = join(outputDir, 'equipment.json')
  writeFileSync(equipmentPath, JSON.stringify(equipmentOutput, null, 2))
  console.log(`✅ ${equipmentData.weapons.length} armes, ${equipmentData.armor.length} armures, ${equipmentData.adventuringGear.length} équipements exportés vers ${equipmentPath}`)
}

function convertFeats() {
  console.log('🔄 Conversion des dons au format Aurora V2...')
  
  const outputDir = join(rootDir, 'public', 'data', 'aurora')
  ensureDir(outputDir)
  
  const featsOutput = {
    version: '2.0.0',
    source: 'PHB',
    count: featsData.length,
    feats: featsData
  }
  
  const featsPath = join(outputDir, 'feats.json')
  writeFileSync(featsPath, JSON.stringify(featsOutput, null, 2))
  console.log(`✅ ${featsData.length} dons exportés vers ${featsPath}`)
}

function convertBackgrounds() {
  console.log('🔄 Conversion des backgrounds au format Aurora V2...')
  
  const outputDir = join(rootDir, 'public', 'data', 'aurora')
  ensureDir(outputDir)
  
  const backgroundsOutput = {
    version: '2.0.0',
    source: 'PHB',
    count: backgroundsData.length,
    backgrounds: backgroundsData
  }
  
  const backgroundsPath = join(outputDir, 'backgrounds.json')
  writeFileSync(backgroundsPath, JSON.stringify(backgroundsOutput, null, 2))
  console.log(`✅ ${backgroundsData.length} backgrounds exportés vers ${backgroundsPath}`)
}

// ============================================================================
// EXÉCUTION
// ============================================================================

console.log('🚀 Conversion des données vers Aurora V2\n')

convertRaces()
convertClasses()
convertEquipment()
convertFeats()
convertBackgrounds()

console.log('\n✨ Conversion terminée !')
console.log('\nFichiers générés:')
console.log('  - public/data/aurora/races.json')
console.log('  - public/data/aurora/racial-traits.json')
console.log('  - public/data/aurora/classes.json')
console.log('  - public/data/aurora/equipment.json')
console.log('  - public/data/aurora/feats.json')
console.log('  - public/data/aurora/backgrounds.json')
