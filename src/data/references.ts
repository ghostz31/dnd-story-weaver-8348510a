/**
 * Références standardisées - Système d'IDs Aurora
 * 
 * Ce fichier centralise toutes les références pour permettre
 * les liens croisés et la validation
 */

// ============================================================================
// COMPÉTENCES
// ============================================================================

export const SKILLS = {
  ACROBATICS: {
    id: 'ID_SKILL_ACROBATICS',
    name: 'Acrobaties',
    nameEn: 'Acrobatics',
    ability: 'dex',
  },
  ANIMAL_HANDLING: {
    id: 'ID_SKILL_ANIMAL_HANDLING',
    name: 'Dressage',
    nameEn: 'Animal Handling',
    ability: 'wis',
  },
  ARCANA: {
    id: 'ID_SKILL_ARCANA',
    name: 'Arcanes',
    nameEn: 'Arcana',
    ability: 'int',
  },
  ATHLETICS: {
    id: 'ID_SKILL_ATHLETICS',
    name: 'Athlétisme',
    nameEn: 'Athletics',
    ability: 'str',
  },
  DECEPTION: {
    id: 'ID_SKILL_DECEPTION',
    name: 'Tromperie',
    nameEn: 'Deception',
    ability: 'cha',
  },
  HISTORY: {
    id: 'ID_SKILL_HISTORY',
    name: 'Histoire',
    nameEn: 'History',
    ability: 'int',
  },
  INSIGHT: {
    id: 'ID_SKILL_INSIGHT',
    name: 'Perspicacité',
    nameEn: 'Insight',
    ability: 'wis',
  },
  INTIMIDATION: {
    id: 'ID_SKILL_INTIMIDATION',
    name: 'Intimidation',
    nameEn: 'Intimidation',
    ability: 'cha',
  },
  INVESTIGATION: {
    id: 'ID_SKILL_INVESTIGATION',
    name: 'Investigation',
    nameEn: 'Investigation',
    ability: 'int',
  },
  MEDICINE: {
    id: 'ID_SKILL_MEDICINE',
    name: 'Médecine',
    nameEn: 'Medicine',
    ability: 'wis',
  },
  NATURE: {
    id: 'ID_SKILL_NATURE',
    name: 'Nature',
    nameEn: 'Nature',
    ability: 'int',
  },
  PERCEPTION: {
    id: 'ID_SKILL_PERCEPTION',
    name: 'Perception',
    nameEn: 'Perception',
    ability: 'wis',
  },
  PERFORMANCE: {
    id: 'ID_SKILL_PERFORMANCE',
    name: 'Représentation',
    nameEn: 'Performance',
    ability: 'cha',
  },
  PERSUASION: {
    id: 'ID_SKILL_PERSUASION',
    name: 'Persuasion',
    nameEn: 'Persuasion',
    ability: 'cha',
  },
  RELIGION: {
    id: 'ID_SKILL_RELIGION',
    name: 'Religion',
    nameEn: 'Religion',
    ability: 'int',
  },
  SLEIGHT_OF_HAND: {
    id: 'ID_SKILL_SLEIGHT_OF_HAND',
    name: 'Escamotage',
    nameEn: 'Sleight of Hand',
    ability: 'dex',
  },
  STEALTH: {
    id: 'ID_SKILL_STEALTH',
    name: 'Discrétion',
    nameEn: 'Stealth',
    ability: 'dex',
  },
  SURVIVAL: {
    id: 'ID_SKILL_SURVIVAL',
    name: 'Survie',
    nameEn: 'Survival',
    ability: 'wis',
  },
} as const

// ============================================================================
// JETS DE SAUVEGARDE
// ============================================================================

export const SAVES = {
  STRENGTH: {
    id: 'ID_SAVE_STRENGTH',
    name: 'Force',
    nameEn: 'Strength',
    ability: 'str',
    abbreviation: 'FOR',
  },
  DEXTERITY: {
    id: 'ID_SAVE_DEXTERITY',
    name: 'Dextérité',
    nameEn: 'Dexterity',
    ability: 'dex',
    abbreviation: 'DEX',
  },
  CONSTITUTION: {
    id: 'ID_SAVE_CONSTITUTION',
    name: 'Constitution',
    nameEn: 'Constitution',
    ability: 'con',
    abbreviation: 'CON',
  },
  INTELLIGENCE: {
    id: 'ID_SAVE_INTELLIGENCE',
    name: 'Intelligence',
    nameEn: 'Intelligence',
    ability: 'int',
    abbreviation: 'INT',
  },
  WISDOM: {
    id: 'ID_SAVE_WISDOM',
    name: 'Sagesse',
    nameEn: 'Wisdom',
    ability: 'wis',
    abbreviation: 'SAG',
  },
  CHARISMA: {
    id: 'ID_SAVE_CHARISMA',
    name: 'Charisme',
    nameEn: 'Charisma',
    ability: 'cha',
    abbreviation: 'CHA',
  },
} as const

// ============================================================================
// CARACTÉRISTIQUES
// ============================================================================

export const ABILITIES = {
  STRENGTH: {
    id: 'ID_ABILITY_STRENGTH',
    name: 'Force',
    nameEn: 'Strength',
    abbreviation: 'FOR',
  },
  DEXTERITY: {
    id: 'ID_ABILITY_DEXTERITY',
    name: 'Dextérité',
    nameEn: 'Dexterity',
    abbreviation: 'DEX',
  },
  CONSTITUTION: {
    id: 'ID_ABILITY_CONSTITUTION',
    name: 'Constitution',
    nameEn: 'Constitution',
    abbreviation: 'CON',
  },
  INTELLIGENCE: {
    id: 'ID_ABILITY_INTELLIGENCE',
    name: 'Intelligence',
    nameEn: 'Intelligence',
    abbreviation: 'INT',
  },
  WISDOM: {
    id: 'ID_ABILITY_WISDOM',
    name: 'Sagesse',
    nameEn: 'Wisdom',
    abbreviation: 'SAG',
  },
  CHARISMA: {
    id: 'ID_ABILITY_CHARISMA',
    name: 'Charisme',
    nameEn: 'Charisma',
    abbreviation: 'CHA',
  },
} as const

// ============================================================================
// TRAITS RACIAUX COMMUNS
// ============================================================================

export const RACIAL_TRAITS = {
  DARKVISION: {
    id: 'ID_TRAIT_DARKVISION',
    name: 'Vision dans le noir',
    nameEn: 'Darkvision',
    description: 'Vous pouvez voir à 18 mètres (60 ft) dans une lumière faible comme si c\'était une lumière vive, et dans le noir comme si c\'était une lumière faible. Vous ne discernez pas les couleurs dans le noir, seulement des nuances de gris.',
  },
  DARKVISION_SUPERIOR: {
    id: 'ID_TRAIT_DARKVISION_SUPERIOR',
    name: 'Vision dans le noir supérieure',
    nameEn: 'Superior Darkvision',
    description: 'Votre vision dans le noir a un rayon de 36 mètres (120 ft).',
  },
  KEEN_SENSES: {
    id: 'ID_TRAIT_KEEN_SENSES',
    name: 'Sens aiguisés',
    nameEn: 'Keen Senses',
    description: 'Vous maîtrisez la compétence Perception.',
    grants: ['ID_SKILL_PERCEPTION'],
  },
  FEY_ANCESTRY: {
    id: 'ID_TRAIT_FEY_ANCESTRY',
    name: 'Ascendance féerique',
    nameEn: 'Fey Ancestry',
    description: 'Vous avez l\'avantage aux jets de sauvegarde pour ne pas être charmé, et la magie ne peut pas vous endormir.',
  },
  TRANCE: {
    id: 'ID_TRAIT_TRANCE',
    name: 'Transe',
    nameEn: 'Trance',
    description: 'Les elfes n\'ont pas besoin de dormir. Au lieu de cela, ils méditent profondément pendant 4 heures par jour. Après un tel repos, vous obtenez les mêmes bénéfices qu\'un humain après 8 heures de sommeil.',
  },
  DWARVEN_RESILIENCE: {
    id: 'ID_TRAIT_DWARVEN_RESILIENCE',
    name: 'Résistance naine',
    nameEn: 'Dwarven Resilience',
    description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez une résistance contre les dégâts de poison.',
  },
  STONECUNNING: {
    id: 'ID_TRAIT_STONECUNNING',
    name: 'Connaissance de la pierre',
    nameEn: 'Stonecunning',
    description: 'Chaque fois que vous faites un test d\'Intelligence (Histoire) concernant l\'origine d\'un élément de maçonnerie, vous est considéré comme maîtrisant la compétence Histoire et vous ajoutez le double de votre bonus de maîtrise au test.',
  },
  LUCKY: {
    id: 'ID_TRAIT_LUCKY',
    name: 'Chanceux',
    nameEn: 'Lucky',
    description: 'Quand vous obtenez un 1 sur un d20 pour un jet d\'attaque, de test de caractéristique ou de sauvegarde, vous pouvez relancer le dé et devez utiliser le nouveau résultat.',
  },
  BRAVE: {
    id: 'ID_TRAIT_BRAVE',
    name: 'Brave',
    nameEn: 'Brave',
    description: 'Vous avez l\'avantage aux jets de sauvegarde contre être terrorisé.',
  },
  HALFLING_NIMBLENESS: {
    id: 'ID_TRAIT_HALFLING_NIMBLENESS',
    name: 'Agilité halfeline',
    nameEn: 'Halfling Nimbleness',
    description: 'Vous pouvez vous déplacer à travers l\'espace de n\'importe quelle créature de taille supérieure à la vôtre.',
  },
  BREATH_WEAPON: {
    id: 'ID_TRAIT_BREATH_WEAPON',
    name: 'Souffle',
    nameEn: 'Breath Weapon',
    description: 'Vous pouvez utiliser votre action pour libérer un souffle d\'énergie destructrice. La forme et le type de dégâts dépendent de votre ancêtre draconique.',
  },
  DRACONIC_RESISTANCE: {
    id: 'ID_TRAIT_DRACONIC_RESISTANCE',
    name: 'Résistance draconique',
    nameEn: 'Damage Resistance',
    description: 'Vous avez une résistance contre le type de dégâts associé à votre ancêtre draconique.',
  },
  GNOME_CUNNING: {
    id: 'ID_TRAIT_GNOME_CUNNING',
    name: 'Ruse gnome',
    nameEn: 'Gnome Cunning',
    description: 'Vous avez l\'avantage à tous les jets de sauvegarde d\'Intelligence, de Sagesse et de Charisme contre la magie.',
  },
  MENACING: {
    id: 'ID_TRAIT_MENACING',
    name: 'Menaçant',
    nameEn: 'Menacing',
    description: 'Vous maîtrisez la compétence Intimidation.',
    grants: ['ID_SKILL_INTIMIDATION'],
  },
  RELENTLESS_ENDURANCE: {
    id: 'ID_TRAIT_RELENTLESS_ENDURANCE',
    name: 'Endurance implacable',
    nameEn: 'Relentless Endurance',
    description: 'Quand vous êtes réduit à 0 point de vie mais non tué, vous pouvez choisir d\'être réduit à 1 point de vie à la place. Vous ne pouvez pas utiliser cette capacité à nouveau avant d\'avoir terminé un repos long.',
  },
  SAVAGE_ATTACKS: {
    id: 'ID_TRAIT_SAVAGE_ATTACKS',
    name: 'Attaques sauvages',
    nameEn: 'Savage Attacks',
    description: 'Quand vous réussissez un coup critique avec une attaque au corps à corps, vous pouvez lancer un dé de dégâts de l\'arme une fois de plus et l\'ajouter aux dégâts supplémentaires du coup critique.',
  },
  HELLISH_RESISTANCE: {
    id: 'ID_TRAIT_HELLISH_RESISTANCE',
    name: 'Résistance infernale',
    nameEn: 'Hellish Resistance',
    description: 'Vous avez une résistance contre les dégâts de feu.',
  },
  INFERNAL_LEGACY: {
    id: 'ID_TRAIT_INFERNAL_LEGACY',
    name: 'Héritage infernal',
    nameEn: 'Infernal Legacy',
    description: 'Vous connaissez le sort mineur Thaumaturgie. Une fois que vous atteignez le niveau 3, vous pouvez lancer le sort Représentation infernale une fois par jour. Le Charisme est votre caractéristique d\'incantation pour ces sorts.',
  },
} as const

// ============================================================================
// DONS
// ============================================================================

export const FEATS = {
  ALERT: {
    id: 'ID_FEAT_ALERT',
    name: 'Vigilance',
    nameEn: 'Alert',
    description: '+5 à l\'initiative, impossible à surprendre quand conscient, les créatures cachées n\'ont pas l\'avantage contre vous.',
    prerequisites: null,
  },
  ATHLETE: {
    id: 'ID_FEAT_ATHLETE',
    name: 'Athlète',
    nameEn: 'Athlete',
    description: 'Vitesse d\'escalade et de nage = vitesse au sol, debout avec 1.5m de mouvement, Saut en longueur/hauteur +Force.',
    prerequisites: null,
  },
  ACTOR: {
    id: 'ID_FEAT_ACTOR',
    name: 'Acteur',
    nameEn: 'Actor',
    description: 'CHA +1, avantage aux tests de Cha (Tromperie/Performance) pour adopter une autre identité, imiter la voix/speech d\'autrui.',
    prerequisites: { ability: { cha: 13 } },
    bonus: { cha: 1 },
  },
  CHARGER: {
    id: 'ID_FEAT_CHARGER',
    name: 'Chargeur',
    nameEn: 'Charger',
    description: 'Après course de 3m en ligne droite : attaque bonus +5 dégâts OU pousser cible de 3m.',
    prerequisites: null,
  },
  CROSSBOW_EXPERT: {
    id: 'ID_FEAT_CROSSBOW_EXPERT',
    name: 'Expert en arbalète',
    nameEn: 'Crossbow Expert',
    description: 'Ignore pénalité attaque contact arbalète, arbalète légère attaque bonus, attaque de mêlée ne désavantage pas attaque à distance.',
    prerequisites: null,
  },
  DEFENSIVE_DUELIST: {
    id: 'ID_FEAT_DEFENSIVE_DUELIST',
    name: 'Duelliste défensif',
    nameEn: 'Defensive Duelist',
    description: 'Réaction : ajouter bonus maîtrise à CA quand attaqué au corps à corps avec arme finesse.',
    prerequisites: { ability: { dex: 13 } },
  },
  DUAL_WIELDER: {
    id: 'ID_FEAT_DUAL_WIELDER',
    name: 'Ambidextre',
    nameEn: 'Dual Wielder',
    description: '+1 CA quand deux armes, combat à deux armes avec armes non-légères, dégainer deux armes en une action.',
    prerequisites: null,
  },
  DUNGEON_DELVER: {
    id: 'ID_FEAT_DUNGEON_DELVER',
    name: 'Explorateur de donjons',
    nameEn: 'Dungeon Delver',
    description: 'Avantage pour détecter portes secrètes, dégâts de piège réduits de moitié, déplacement rapide à travers terrain difficile, détection pièges.',
    prerequisites: null,
  },
  DURABLE: {
    id: 'ID_FEAT_DURABLE',
    name: 'Endurant',
    nameEn: 'Durable',
    description: 'CON +1, régénération minimum 2×CON mod lors d\'un repos court (si utilisation Second souffle).',
    prerequisites: null,
    bonus: { con: 1 },
  },
  ELEMENTAL_ADEPT: {
    id: 'ID_FEAT_ELEMENTAL_ADEPT',
    name: 'Adepte élémentaire',
    nameEn: 'Elemental Adept',
    description: 'Choisir un type de dégâts (feu, froid, etc.). Ignore résistance à ce type, jets de dégâts 1 deviennent 2.',
    prerequisites: { feature: 'spellcasting' },
  },
  GRAPPLER: {
    id: 'ID_FEAT_GRAPPLER',
    name: 'Lutteur',
    nameEn: 'Grappler',
    description: 'Avantage aux tests de Force (Athlétisme) pour agripper, immobiliser créature agrippée.',
    prerequisites: { ability: { str: 13 } },
  },
  GREAT_WEAPON_MASTER: {
    id: 'ID_FEAT_GREAT_WEAPON_MASTER',
    name: 'Maître des armes lourdes',
    nameEn: 'Great Weapon Master',
    description: '-5 attaque / +10 dégâts avec arme lourde, attaque bonus après critique ou coup fatal.',
    prerequisites: null,
  },
  HEALER: {
    id: 'ID_FEAT_HEALER',
    name: 'Guérisseur',
    nameEn: 'Healer',
    description: 'Action : stabiliser créature à 0 PV et 1d6+4 PV, kit de soins : 1d6+4 PV supplémentaires.',
    prerequisites: null,
  },
  HEAVILY_ARMORED: {
    id: 'ID_FEAT_HEAVILY_ARMORED',
    name: 'Lourdement cuirassé',
    nameEn: 'Heavily Armored',
    description: 'Maîtrise des armures lourdes, FOR +1.',
    prerequisites: { proficiency: 'medium_armor' },
    bonus: { str: 1 },
  },
  HEAVY_ARMOR_MASTER: {
    id: 'ID_FEAT_HEAVY_ARMOR_MASTER',
    name: 'Maître des armures lourdes',
    nameEn: 'Heavy Armor Master',
    description: 'FOR +1, -3 dégâts contondants/perforants/tranchants non-magiques avec armure lourde.',
    prerequisites: { proficiency: 'heavy_armor' },
    bonus: { str: 1 },
  },
  INSPIRING_LEADER: {
    id: 'ID_FEAT_INSPIRING_LEADER',
    name: 'Chef inspirant',
    nameEn: 'Inspiring Leader',
    description: '10 minutes de discours : temp HP = niveau + CHA mod pour 6 créatures max.',
    prerequisites: { ability: { cha: 13 } },
  },
  KEEN_MIND: {
    id: 'ID_FEAT_KEEN_MIND',
    name: 'Esprit vif',
    nameEn: 'Keen Mind',
    description: 'INT +1, maîtrise : orientation, navigation, calcul temporel, souvenirs exacts 1 mois.',
    prerequisites: null,
    bonus: { int: 1 },
  },
  LIGHTLY_ARMORED: {
    id: 'ID_FEAT_LIGHTLY_ARMORED',
    name: 'Légèrement cuirassé',
    nameEn: 'Lightly Armored',
    description: 'Maîtrise armures légères, FOR ou DEX +1.',
    prerequisites: null,
  },
  LINGUIST: {
    id: 'ID_FEAT_LINGUIST',
    name: 'Linguiste',
    nameEn: 'Linguist',
    description: 'INT +1, maîtrise 3 langues, créer écritures codées.',
    prerequisites: null,
    bonus: { int: 1 },
  },
  LUCKY: {
    id: 'ID_FEAT_LUCKY',
    name: 'Chanceux',
    nameEn: 'Lucky',
    description: '3 points de chance par jour : relancer d20 (attaque, test, sauvegarde, ou attaque ennemie).',
    prerequisites: null,
  },
  MAGE_SLAYER: {
    id: 'ID_FEAT_MAGE_SLAYER',
    name: 'Tueur de mages',
    nameEn: 'Mage Slayer',
    description: 'Réaction contre lanceur de sorts à 1.5m, résistance aux dégâts de sorts de créature à 1.5m, avantage JS sorts de créature à 1.5m.',
    prerequisites: null,
  },
  MAGIC_INITIATE: {
    id: 'ID_FEAT_MAGIC_INITIATE',
    name: 'Initié à la magie',
    nameEn: 'Magic Initiate',
    description: 'Choisir une classe : 2 sorts mineurs + 1 sort niveau 1 (1/jour).',
    prerequisites: null,
  },
  MARTIAL_ADEPT: {
    id: 'ID_FEAT_MARTIAL_ADEPT',
    name: 'Adepte martial',
    nameEn: 'Martial Adept',
    description: 'Maîtrise 2 manœuvres de guerrier, 1d6 dé de supériorité.',
    prerequisites: null,
  },
  MEDIUM_ARMOR_MASTER: {
    id: 'ID_FEAT_MEDIUM_ARMOR_MASTER',
    name: 'Maître des armures intermédiaires',
    nameEn: 'Medium Armor Master',
    description: 'Pas de discrétion désavantagée avec armure intermédiaire, +3 max bonus DEX.',
    prerequisites: { proficiency: 'medium_armor' },
  },
  MOBILE: {
    id: 'ID_FEAT_MOBILE',
    name: 'Mobile',
    nameEn: 'Mobile',
    description: '+3m vitesse, terrain difficile annulé après attaque au corps à corps, attaque corps à corps ne provoque pas d\'AO.',
    prerequisites: null,
    bonus: { speed: 3 },
  },
  MODERATELY_ARMORED: {
    id: 'ID_FEAT_MODERATELY_ARMORED',
    name: 'Moyennement cuirassé',
    nameEn: 'Moderately Armored',
    description: 'Maîtrise armures intermédiaires et boucliers, FOR ou DEX +1.',
    prerequisites: { proficiency: 'light_armor' },
  },
  MOUNTED_COMBATANT: {
    id: 'ID_FEAT_MOUNTED_COMBATANT',
    name: 'Monture aguerrie',
    nameEn: 'Mounted Combatant',
    description: 'Avantage attaque créatures plus petites que monture, attaque contre monture cible vous à la place, sauvegarde de monture Evasion.',
    prerequisites: null,
  },
  OBSERVANT: {
    id: 'ID_FEAT_OBSERVANT',
    name: 'Observateur',
    nameEn: 'Observant',
    description: 'INT ou SAG +1, lecture sur les lèvres, +5 Perception passive, +5 Investigation passive.',
    prerequisites: null,
  },
  POLEARM_MASTER: {
    id: 'ID_FEAT_POLEARM_MASTER',
    name: 'Maître des armes d\'hast',
    nameEn: 'Polearm Master',
    description: 'Attaque bonus avec extrémité d\'arme d\'hast (1d4), AO quand ennemi entre à portée.',
    prerequisites: null,
  },
  RESILIENT: {
    id: 'ID_FEAT_RESILIENT',
    name: 'Résistant',
    nameEn: 'Resilient',
    description: 'Choix d\'une caractéristique : +1 et maîtrise des JS.',
    prerequisites: null,
  },
  RITUAL_CASTER: {
    id: 'ID_FEAT_RITUAL_CASTER',
    name: 'Lanceur de rituels',
    nameEn: 'Ritual Caster',
    description: 'Choisir une classe : livre de rituels, sorts mineurs + sorts niveau 1+ avec tag Rituel.',
    prerequisites: { ability: { int: 13 } },
  },
  SAVAGE_ATTACKER: {
    id: 'ID_FEAT_SAVAGE_ATTACKER',
    name: 'Attaquant sauvage',
    nameEn: 'Savage Attacker',
    description: 'Une fois par tour : relancer dégâts d\'une arme et choisir meilleur.',
    prerequisites: null,
  },
  SENTINEL: {
    id: 'ID_FEAT_SENTINEL',
    name: 'Sentinelle',
    nameEn: 'Sentinel',
    description: 'AO même si créature Désengager, créature attaquée par AO vitesse 0 ce tour, réaction attaque corps à corps contre attaque d\'allié à 1.5m.',
    prerequisites: null,
  },
  SHARPSHOOTER: {
    id: 'ID_FEAT_SHARPSHOOTER',
    name: 'Tireur d\'élite',
    nameEn: 'Sharpshooter',
    description: 'Pas de désavantage portée longue, ignore abri 1/2 et 3/4, -5 attaque / +10 dégâts.',
    prerequisites: null,
  },
  SHIELD_MASTER: {
    id: 'ID_FEAT_SHIELD_MASTER',
    name: 'Maître du bouclier',
    nameEn: 'Shield Master',
    description: 'Action bonus : pousser avec bouclier (AO), bonus CA contre effet de demi-sphère, pas de dégâts réduits JS DEX.',
    prerequisites: null,
  },
  SKILLED: {
    id: 'ID_FEAT_SKILLED',
    name: 'Compétent',
    nameEn: 'Skilled',
    description: 'Maîtrise 3 compétences ou outils.',
    prerequisites: null,
  },
  SPELL_SNIPER: {
    id: 'ID_FEAT_SPELL_SNIPER',
    name: 'Tireur de sorts',
    nameEn: 'Spell Sniper',
    description: 'Portée sorts doublée, sorts attaque ignore abris, sort mineur attaque critique sur 19-20.',
    prerequisites: { feature: 'spellcasting' },
  },
  TAVERN_BRAWLER: {
    id: 'ID_FEAT_TAVERN_BRAWLER',
    name: 'Bagarreur de taverne',
    nameEn: 'Tavern Brawler',
    description: 'FOR ou CON +1, maîtrise armes improvisées/dégainées/débattues, critique corps à corps pousser/tripper attaque bonus, dégainer/poing très rapide.',
    prerequisites: null,
  },
  TOUGH: {
    id: 'ID_FEAT_TOUGH',
    name: 'Robuste',
    nameEn: 'Tough',
    description: '+2 PV par niveau.',
    prerequisites: null,
    bonus: { hpPerLevel: 2 },
  },
  WAR_CASTER: {
    id: 'ID_FEAT_WAR_CASTER',
    name: 'Lanceur de guerre',
    nameEn: 'War Caster',
    description: 'Avantage JS concentration dégâts, somatique avec mains pleines, AO avec sort (pas de sort de temps > 1 action).',
    prerequisites: { feature: 'spellcasting' },
  },
  WEAPON_MASTER: {
    id: 'ID_FEAT_WEAPON_MASTER',
    name: 'Maître d\'armes',
    nameEn: 'Weapon Master',
    description: 'FOR ou DEX +1, maîtrise 4 armes au choix.',
    prerequisites: null,
  },
} as const

// ============================================================================
// UTILITAIRES
// ============================================================================

/**
 * Récupère une référence par son ID
 */
export function getReferenceById(id: string): any {
  // Chercher dans toutes les catégories
  const allReferences = {
    ...SKILLS,
    ...SAVES,
    ...ABILITIES,
    ...RACIAL_TRAITS,
    ...FEATS,
  }
  
  return Object.values(allReferences).find(ref => ref.id === id)
}

/**
 * Liste toutes les compétences
 */
export function getAllSkills() {
  return Object.values(SKILLS)
}

/**
 * Liste tous les traits raciaux
 */
export function getAllRacialTraits() {
  return Object.values(RACIAL_TRAITS)
}

/**
 * Liste tous les dons
 */
export function getAllFeats() {
  return Object.values(FEATS)
}


