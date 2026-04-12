import type { Race } from '../types/character'

// Descriptions détaillées des traits raciaux
export interface RacialTrait {
    name: string
    nameEn: string
    description: string
}

export const racialTraitDetails: Record<string, RacialTrait> = {
    // ─── Traits communs ───
    'Vision dans le noir': {
        name: 'Vision dans le noir',
        nameEn: 'Darkvision',
        description: 'Vous pouvez voir à 18 mètres dans une lumière faible comme si c\'était une lumière vive, et dans le noir comme si c\'était une lumière faible. Vous ne discernez pas les couleurs dans le noir, seulement des nuances de gris.',
    },
    'Vision dans le noir supérieure': {
        name: 'Vision dans le noir supérieure',
        nameEn: 'Superior Darkvision',
        description: 'Votre vision dans le noir a un rayon de 36 mètres.',
    },

    // ─── Elfe ───
    'Sens aiguisés': {
        name: 'Sens aiguisés',
        nameEn: 'Keen Senses',
        description: 'Vous maîtrisez la compétence Perception.',
    },
    'Ascendance féerique': {
        name: 'Ascendance féerique',
        nameEn: 'Fey Ancestry',
        description: 'Vous avez l\'avantage aux jets de sauvegarde pour ne pas être charmé, et la magie ne peut pas vous endormir.',
    },
    'Transe': {
        name: 'Transe',
        nameEn: 'Trance',
        description: 'Les elfes n\'ont pas besoin de dormir. Au lieu de cela, ils méditent profondément pendant 4 heures par jour. Après un tel repos, vous obtenez les mêmes bénéfices qu\'un humain après 8 heures de sommeil.',
    },
    'Entraînement aux armes elfiques': {
        name: 'Entraînement aux armes elfiques',
        nameEn: 'Elf Weapon Training',
        description: 'Vous maîtrisez l\'épée longue, l\'épée courte, l\'arc court et l\'arc long.',
    },
    'Sort mineur': {
        name: 'Sort mineur',
        nameEn: 'Cantrip',
        description: 'Vous connaissez un sort mineur de votre choix dans la liste de sorts du magicien. L\'Intelligence est votre caractéristique d\'incantation pour ce sort.',
    },
    'Pied léger': {
        name: 'Pied léger',
        nameEn: 'Fleet of Foot',
        description: 'Votre vitesse de base passe à 10,5 mètres (35 ft).',
    },
    'Camouflage naturel': {
        name: 'Camouflage naturel',
        nameEn: 'Mask of the Wild',
        description: 'Vous pouvez tenter de vous cacher même lorsque vous n\'êtes que légèrement dissimulé par le feuillage, une pluie battante, la neige, la brume ou d\'autres phénomènes naturels.',
    },
    'Sensibilité au soleil': {
        name: 'Sensibilité au soleil',
        nameEn: 'Sunlight Sensitivity',
        description: 'Vous avez un désavantage aux jets d\'attaque et aux tests de Sagesse (Perception) liés à la vue lorsque vous, la cible ou ce que vous essayez de percevoir est en plein soleil.',
    },
    'Magie drow': {
        name: 'Magie drow',
        nameEn: 'Drow Magic',
        description: 'Vous connaissez le sort mineur Lumières dansantes. Au niveau 3, vous pouvez lancer Lueurs féeriques (1/jour). Au niveau 5, vous pouvez lancer Ténèbres (1/jour). Le Charisme est votre caractéristique d\'incantation.',
    },

    // ─── Nain ───
    'Résistance naine': {
        name: 'Résistance naine',
        nameEn: 'Dwarven Resilience',
        description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.',
    },
    'Entraînement aux armes naines': {
        name: 'Entraînement aux armes naines',
        nameEn: 'Dwarven Combat Training',
        description: 'Vous maîtrisez la hache d\'armes, la hachette, le marteau léger et le marteau de guerre.',
    },
    'Maîtrise des outils': {
        name: 'Maîtrise des outils',
        nameEn: 'Tool Proficiency',
        description: 'Vous maîtrisez un type d\'outils d\'artisan de votre choix parmi : outils de forgeron, matériel de brasseur ou outils de maçon.',
    },
    'Connaissance de la pierre': {
        name: 'Connaissance de la pierre',
        nameEn: 'Stonecunning',
        description: 'Chaque fois que vous faites un test d\'Intelligence (Histoire) lié à l\'origine d\'un travail dans la pierre, vous êtes considéré comme maîtrisant la compétence Histoire et ajoutez le double de votre bonus de maîtrise.',
    },
    'Ténacité naine': {
        name: 'Ténacité naine',
        nameEn: 'Dwarven Toughness',
        description: 'Vos points de vie maximum augmentent de 1, et ils augmentent encore de 1 à chaque fois que vous gagnez un niveau.',
    },
    'Entraînement aux armures naines': {
        name: 'Entraînement aux armures naines',
        nameEn: 'Dwarven Armor Training',
        description: 'Vous maîtrisez les armures légères et les armures intermédiaires.',
    },

    // ─── Halfelin ───
    'Chanceux': {
        name: 'Chanceux',
        nameEn: 'Lucky',
        description: 'Lorsque vous obtenez un 1 naturel sur un jet d\'attaque, un test de caractéristique ou un jet de sauvegarde, vous pouvez relancer le dé et devez utiliser le nouveau résultat.',
    },
    'Brave': {
        name: 'Brave',
        nameEn: 'Brave',
        description: 'Vous avez l\'avantage aux jets de sauvegarde pour ne pas être effrayé.',
    },
    'Agilité halfeline': {
        name: 'Agilité halfeline',
        nameEn: 'Halfling Nimbleness',
        description: 'Vous pouvez vous déplacer à travers l\'espace de toute créature dont la taille est supérieure à la vôtre.',
    },
    'Discrétion naturelle': {
        name: 'Discrétion naturelle',
        nameEn: 'Naturally Stealthy',
        description: 'Vous pouvez tenter de vous cacher même lorsque vous n\'êtes dissimulé que par une créature d\'une taille supérieure à la vôtre.',
    },
    'Résistance des robustes': {
        name: 'Résistance des robustes',
        nameEn: 'Stout Resilience',
        description: 'Vous avez l\'avantage aux jets de sauvegarde contre le poison, et vous avez la résistance aux dégâts de poison.',
    },

    // ─── Drakeïde ───
    'Ascendance draconique': {
        name: 'Ascendance draconique',
        nameEn: 'Draconic Ancestry',
        description: 'Choisissez un type de dragon. Votre souffle et votre résistance aux dégâts sont déterminés par ce type : Noir (Acide, ligne 1,5×9m), Bleu (Foudre, ligne 1,5×9m), Laiton (Feu, ligne 1,5×9m), Bronze (Foudre, ligne 1,5×9m), Cuivre (Acide, ligne 1,5×9m), Or (Feu, cône 4,5m), Vert (Poison, cône 4,5m), Rouge (Feu, cône 4,5m), Argent (Froid, cône 4,5m), Blanc (Froid, cône 4,5m).',
    },
    'Souffle': {
        name: 'Souffle',
        nameEn: 'Breath Weapon',
        description: 'Vous pouvez utiliser votre action pour exhaler une énergie destructrice. Votre ascendance draconique détermine la taille, la forme et le type de dégâts. Les dégâts sont de 2d6 au niveau 1, 3d6 au niveau 6, 4d6 au niveau 11 et 5d6 au niveau 16. JS DD = 8 + mod CON + bonus de maîtrise. Utilisable 1 fois par repos court ou long.',
    },
    'Résistance aux dégâts': {
        name: 'Résistance aux dégâts',
        nameEn: 'Damage Resistance',
        description: 'Vous avez la résistance au type de dégâts associé à votre ascendance draconique.',
    },

    // ─── Gnome ───
    'Ruse gnome': {
        name: 'Ruse gnome',
        nameEn: 'Gnome Cunning',
        description: 'Vous avez l\'avantage à tous les jets de sauvegarde d\'Intelligence, de Sagesse et de Charisme contre la magie.',
    },
    'Illusionniste-né': {
        name: 'Illusionniste-né',
        nameEn: 'Natural Illusionist',
        description: 'Vous connaissez le sort mineur Illusion mineure. L\'Intelligence est votre caractéristique d\'incantation pour ce sort.',
    },
    'Communication avec les petits animaux': {
        name: 'Communication avec les petits animaux',
        nameEn: 'Speak with Small Beasts',
        description: 'Par le biais de sons et de gestes, vous pouvez communiquer des idées simples aux bêtes de taille Petite ou inférieure.',
    },
    'Connaissance en ingénierie': {
        name: 'Connaissance en ingénierie',
        nameEn: 'Artificer\'s Lore',
        description: 'Chaque fois que vous faites un test d\'Intelligence (Histoire) lié à un objet magique, alchimique ou technologique, vous ajoutez le double de votre bonus de maîtrise.',
    },
    'Bricoleur': {
        name: 'Bricoleur',
        nameEn: 'Tinker',
        description: 'Vous maîtrisez les outils de bricoleur. En utilisant ces outils, vous pouvez passer 1 heure et 10 po de matériel pour construire un appareil mécanique (CA 5, 1 PV) de taille Très Petite. Parmi les options : briquet, boîte à musique ou jouet mécanique.',
    },

    // ─── Demi-elfe ───
    'Polyvalence': {
        name: 'Polyvalence',
        nameEn: 'Skill Versatility',
        description: 'Vous gagnez la maîtrise de deux compétences de votre choix.',
    },

    // ─── Demi-orque ───
    'Menaçant': {
        name: 'Menaçant',
        nameEn: 'Menacing',
        description: 'Vous maîtrisez la compétence Intimidation.',
    },
    'Endurance implacable': {
        name: 'Endurance implacable',
        nameEn: 'Relentless Endurance',
        description: 'Lorsque vous êtes réduit à 0 point de vie mais pas tué sur le coup, vous pouvez passer à 1 point de vie à la place. Vous ne pouvez pas réutiliser cette capacité avant d\'avoir terminé un repos long.',
    },
    'Attaques sauvages': {
        name: 'Attaques sauvages',
        nameEn: 'Savage Attacks',
        description: 'Lorsque vous obtenez un coup critique avec une attaque au corps à corps, vous pouvez lancer un des dés de dégâts de l\'arme une fois de plus et l\'ajouter aux dégâts supplémentaires du coup critique.',
    },

    // ─── Tieffelin ───
    'Résistance infernale': {
        name: 'Résistance infernale',
        nameEn: 'Hellish Resistance',
        description: 'Vous avez la résistance aux dégâts de feu.',
    },
    'Héritage infernal': {
        name: 'Héritage infernal',
        nameEn: 'Infernal Legacy',
        description: 'Vous connaissez le sort mineur Thaumaturgie. Au niveau 3, vous pouvez lancer Représailles infernales en tant que sort de niveau 2 (1/jour). Au niveau 5, vous pouvez lancer Ténèbres (1/jour). Le Charisme est votre caractéristique d\'incantation.',
    },

    // ─── Humain ───
    'Polyvalent': {
        name: 'Polyvalent',
        nameEn: 'Versatile',
        description: 'Les humains gagnent +1 à toutes les caractéristiques et parlent une langue supplémentaire au choix. Ils sont les plus adaptables et ambitieux de toutes les races.',
    },
}

// Données enrichies des ascendances draconiques
export interface DraconicAncestry {
    dragon: string
    damageType: string
    breathWeapon: string
    color: string
}

export const draconicAncestries: DraconicAncestry[] = [
    { dragon: 'Noir', damageType: 'Acide', breathWeapon: 'Ligne 1,5 × 9 m (JS DEX)', color: '#1a1a2e' },
    { dragon: 'Bleu', damageType: 'Foudre', breathWeapon: 'Ligne 1,5 × 9 m (JS DEX)', color: '#3B82F6' },
    { dragon: 'Laiton', damageType: 'Feu', breathWeapon: 'Ligne 1,5 × 9 m (JS DEX)', color: '#D97706' },
    { dragon: 'Bronze', damageType: 'Foudre', breathWeapon: 'Ligne 1,5 × 9 m (JS DEX)', color: '#92400E' },
    { dragon: 'Cuivre', damageType: 'Acide', breathWeapon: 'Ligne 1,5 × 9 m (JS DEX)', color: '#B45309' },
    { dragon: 'Or', damageType: 'Feu', breathWeapon: 'Cône 4,5 m (JS DEX)', color: '#F59E0B' },
    { dragon: 'Vert', damageType: 'Poison', breathWeapon: 'Cône 4,5 m (JS CON)', color: '#059669' },
    { dragon: 'Rouge', damageType: 'Feu', breathWeapon: 'Cône 4,5 m (JS DEX)', color: '#DC2626' },
    { dragon: 'Argent', damageType: 'Froid', breathWeapon: 'Cône 4,5 m (JS CON)', color: '#9CA3AF' },
    { dragon: 'Blanc', damageType: 'Froid', breathWeapon: 'Cône 4,5 m (JS CON)', color: '#E5E7EB' },
]

// Données enrichies des races
export const races: Race[] = [
    {
        id: 'human',
        name: 'Humain',
        nameEn: 'Human',
        abilityBonuses: { str: 1, dex: 1, con: 1, int: 1, wis: 1, cha: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Polyvalent'],
        languages: ['Commun', 'Une langue au choix'],
    },
    {
        id: 'elf',
        name: 'Elfe',
        nameEn: 'Elf',
        abilityBonuses: { dex: 2 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Sens aiguisés', 'Ascendance féerique', 'Transe'],
        languages: ['Commun', 'Elfique'],
        subraces: [
            {
                id: 'high-elf',
                name: 'Haut-elfe',
                abilityBonuses: { int: 1 },
                traits: ['Entraînement aux armes elfiques', 'Sort mineur'],
            },
            {
                id: 'wood-elf',
                name: 'Elfe des bois',
                abilityBonuses: { wis: 1 },
                traits: ['Entraînement aux armes elfiques', 'Pied léger', 'Camouflage naturel'],
            },
            {
                id: 'dark-elf',
                name: 'Elfe noir (Drow)',
                abilityBonuses: { cha: 1 },
                traits: ['Vision dans le noir supérieure', 'Sensibilité au soleil', 'Magie drow'],
            },
        ],
    },
    {
        id: 'dwarf',
        name: 'Nain',
        nameEn: 'Dwarf',
        abilityBonuses: { con: 2 },
        speed: 25,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Résistance naine', 'Entraînement aux armes naines', 'Maîtrise des outils', 'Connaissance de la pierre'],
        languages: ['Commun', 'Nain'],
        subraces: [
            {
                id: 'hill-dwarf',
                name: 'Nain des collines',
                abilityBonuses: { wis: 1 },
                traits: ['Ténacité naine'],
            },
            {
                id: 'mountain-dwarf',
                name: 'Nain des montagnes',
                abilityBonuses: { str: 2 },
                traits: ['Entraînement aux armures naines'],
            },
        ],
    },
    {
        id: 'halfling',
        name: 'Halfelin',
        nameEn: 'Halfling',
        abilityBonuses: { dex: 2 },
        speed: 25,
        size: 'Petit',
        traits: ['Chanceux', 'Brave', 'Agilité halfeline'],
        languages: ['Commun', 'Halfelin'],
        subraces: [
            {
                id: 'lightfoot',
                name: 'Pied-léger',
                abilityBonuses: { cha: 1 },
                traits: ['Discrétion naturelle'],
            },
            {
                id: 'stout',
                name: 'Robuste',
                abilityBonuses: { con: 1 },
                traits: ['Résistance des robustes'],
            },
        ],
    },
    {
        id: 'dragonborn',
        name: 'Drakeïde',
        nameEn: 'Dragonborn',
        abilityBonuses: { str: 2, cha: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Ascendance draconique', 'Souffle', 'Résistance aux dégâts'],
        languages: ['Commun', 'Draconique'],
    },
    {
        id: 'gnome',
        name: 'Gnome',
        nameEn: 'Gnome',
        abilityBonuses: { int: 2 },
        speed: 25,
        size: 'Petit',
        traits: ['Vision dans le noir', 'Ruse gnome'],
        languages: ['Commun', 'Gnome'],
        subraces: [
            {
                id: 'forest-gnome',
                name: 'Gnome des forêts',
                abilityBonuses: { dex: 1 },
                traits: ['Illusionniste-né', 'Communication avec les petits animaux'],
            },
            {
                id: 'rock-gnome',
                name: 'Gnome des roches',
                abilityBonuses: { con: 1 },
                traits: ['Connaissance en ingénierie', 'Bricoleur'],
            },
        ],
    },
    {
        id: 'half-elf',
        name: 'Demi-elfe',
        nameEn: 'Half-Elf',
        abilityBonuses: { cha: 2 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Ascendance féerique', 'Polyvalence'],
        languages: ['Commun', 'Elfique', 'Une langue au choix'],
    },
    {
        id: 'half-orc',
        name: 'Demi-orque',
        nameEn: 'Half-Orc',
        abilityBonuses: { str: 2, con: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Menaçant', 'Endurance implacable', 'Attaques sauvages'],
        languages: ['Commun', 'Orque'],
    },
    {
        id: 'tiefling',
        name: 'Tieffelin',
        nameEn: 'Tiefling',
        abilityBonuses: { cha: 2, int: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Résistance infernale', 'Héritage infernal'],
        languages: ['Commun', 'Infernal'],
    },
    // ─── XGtE ──────────────────────────────────────────────────
    {
        id: 'firbolg',
        name: 'Firbolg',
        nameEn: 'Firbolg',
        source: 'XGtE',
        abilityBonuses: { wis: 2, str: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Magie firbolg', 'Camouflage firbolg', 'Parler à la bête et à la feuille', 'Pieds de la forêt'],
        languages: ['Commun', 'Elfe', 'Géant'],
        traitDetails: {
            'Magie firbolg': 'Détecter la magie (1/repos court) et déguisement (1/repos court), comme le sort mais pouvez paraître jusqu\'à 30 cm plus petit.',
            'Camouflage firbolg': 'Action bonus : invisible jusqu\'à la fin de votre prochain tour ou jusqu\'à attaque/sort. 1/repos court.',
            'Parler à la bête et à la feuille': 'Communiquer simplement avec bêtes et plantes (pas d\'intelligence conférée).',
            'Pieds de la forêt': 'Vous vous déplacez dans les terrains difficiles naturels sans dépenser de déplacement supplémentaire.',
        },
    },
    {
        id: 'goliath',
        name: 'Goliath',
        nameEn: 'Goliath',
        source: 'XGtE',
        abilityBonuses: { str: 2, con: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Constitution de la montagne', 'Endurance de la pierre', 'Adapté à l\'altitude', 'Puissant'],
        languages: ['Commun', 'Géant'],
        traitDetails: {
            'Constitution de la montagne': 'Avantage aux JS contre le froid et les effets de température extrême.',
            'Endurance de la pierre': 'Réaction : réduire les dégâts d\'une attaque de 1d12 + mod CON. 1 fois/repos court.',
            'Adapté à l\'altitude': 'S\'acclimate à toute altitude jusqu\'à 4 000 m. Adapté naturellement aux hautes altitudes.',
            'Puissant': 'Comptez comme grande taille pour déterminer la charge maximale et le poids qu\'on peut pousser/tirer/porter.',
        },
    },
    {
        id: 'kenku',
        name: 'Kenku',
        nameEn: 'Kenku',
        source: 'XGtE',
        abilityBonuses: { dex: 2, wis: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Don des langues kenku', 'Imitation', 'Formation kenku'],
        languages: ['Commun', 'Auran'],
        traitDetails: {
            'Don des langues kenku': 'Vous ne pouvez parler qu\'en répétant des sons, des phrases et des voix que vous avez entendus.',
            'Imitation': 'Vous pouvez imiter les sons que vous avez entendus (voix, animaux, sons ambiants). Perspicacité (DD18) pour reconnaître l\'imitation.',
            'Formation kenku': 'Vous maîtrisez deux des compétences suivantes : Acrobaties, Escamotage, Tromperie, Discrétion.',
        },
    },
    {
        id: 'lizardfolk',
        name: 'Homme-lézard',
        nameEn: 'Lizardfolk',
        source: 'XGtE',
        abilityBonuses: { con: 2, wis: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision naturelle', 'Contrôle primal', 'Résistance à la faim', 'Nage', 'Morsure', 'Armure naturelle'],
        languages: ['Commun', 'Draconique'],
        traitDetails: {
            'Contrôle primal': 'Vous pouvez maîtriser 2 compétences supplémentaires parmi : Athlétisme, Nature, Perception, Discrétion, Survie.',
            'Résistance à la faim': 'Vous pouvez survivre sans nourriture pendant 3 + mod CON jours (min 1).',
            'Nage': 'Vitesse de nage égale à votre vitesse normale.',
            'Morsure': 'Attaque naturelle (morsure) : 1d6 + mod FOR dégâts perforants. Peut être utilisée comme arme.',
            'Armure naturelle': 'CA naturelle = 13 + mod DEX (sans armure ni bouclier).',
        },
    },
    {
        id: 'tabaxi',
        name: 'Tabaxi',
        nameEn: 'Tabaxi',
        source: 'XGtE',
        abilityBonuses: { dex: 2, cha: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Vision dans le noir', 'Griffes de félin', 'Double mouvement', 'Curiosité de félin'],
        languages: ['Commun', 'Une langue au choix'],
        traitDetails: {
            'Vision dans le noir': 'Voir dans la pénombre sur 18 m comme si c\'était la lumière du jour, et dans l\'obscurité comme s\'il faisait sombre.',
            'Griffes de félin': 'Attaque de griffes: 1d4 + mod DEX. Vous grimpez à votre vitesse normale.',
            'Double mouvement': 'Bonus action: doublez votre vitesse jusqu\'à la fin du tour. 1 fois/repos court.',
            'Curiosité de félin': 'Maîtrise de Discrétion et Perception.',
        },
    },
    {
        id: 'triton',
        name: 'Triton',
        nameEn: 'Triton',
        source: 'XGtE',
        abilityBonuses: { str: 1, con: 1, cha: 1 },
        speed: 30,
        size: 'Moyen',
        traits: ['Emprise des profondeurs', 'Maîtrise de l\'eau et du vent', 'Résistance du fond', 'Amphibie', 'Nage des grands fonds'],
        languages: ['Commun', 'Primordial'],
        traitDetails: {
            'Emprise des profondeurs': 'Apprenez 1 sort au choix par palier: 1er Héroïsme, 2e Communication avec les animaux (créatures aquatiques), 3e Mur d\'eau. CHA pour lancer.',
            'Maîtrise de l\'eau et du vent': 'Immunité aux effets d\'une profondeur extrême. Vous vous adaptez à toute pression.',
            'Résistance du fond': 'Résistance aux dégâts de froid.',
            'Amphibie': 'Vous pouvez respirer l\'air et l\'eau.',
            'Nage des grands fonds': 'Vitesse de nage de 9 m.',
        },
    },
    // ─── TCoE ──────────────────────────────────────────────────
    {
        id: 'fairy',
        name: 'Fée',
        nameEn: 'Fairy',
        source: 'TCoE',
        abilityBonuses: {},
        customAbilityBonuses: 2,
        speed: 30,
        size: 'Petit',
        traits: ['Vol', 'Magie féerique', 'Réduction'],
        languages: ['Commun', 'Sylvestre'],
        traitDetails: {
            'Vol': 'Vitesse de vol de 9 m. Vous ne pouvez pas voler si vous portez une armure lourde.',
            'Magie féerique': 'Apprenez lumières dansantes. À partir du niveau 3 : lancer faerie fire 1/repos long. Au niveau 5 : confused 1/repos long (les deux avec INT, SAG ou CHA).',
            'Réduction': 'Vous pouvez passer par un espace pour une créature de Très Petite taille.',
        },
    },
    {
        id: 'harengon',
        name: 'Harengon',
        nameEn: 'Harengon',
        source: 'TCoE',
        abilityBonuses: {},
        customAbilityBonuses: 2,
        speed: 30,
        size: 'Moyen',
        traits: ['Saut agile', 'Chance du lapin', 'Perception intuitive'],
        languages: ['Commun', 'Une langue au choix'],
        traitDetails: {
            'Saut agile': 'Action bonus : saut en longueur ou en hauteur jusqu\'à votre mod DEX (min 1 m).',
            'Chance du lapin': 'Réaction quand une créature que vous voyez vous attaque : ajouter votre bonus de maîtrise à votre CA contre cette attaque. 1/repos court.',
            'Perception intuitive': 'Bonus de maîtrise à l\'initiative.',
        },
    },
    {
        id: 'satyr',
        name: 'Satyre',
        nameEn: 'Satyr',
        source: 'TCoE',
        abilityBonuses: { cha: 2, dex: 1 },
        speed: 35,
        size: 'Moyen',
        traits: ['Magie occulte', 'Résistance à la magie', 'Ruée'],
        languages: ['Commun', 'Sylvestre'],
        traitDetails: {
            'Magie occulte': 'Apprenez un tour de magie de Barde. Au niveau 3 : charme-personne 1/repos long. Au niveau 5 : enchevêtrement 1/repos long. CHA pour tout.',
            'Résistance à la magie': 'Avantage sur les JS contre les sorts et les effets magiques.',
            'Ruée': 'Course sans terrain difficile (cornes) : poussée de bélier, cible doit réussir un JS de FOR ou être repoussée de 1,5 m et tomber à terre.',
        },
    },
    {
        id: 'owlin',
        name: 'Chouhette',
        nameEn: 'Owlin',
        source: 'TCoE',
        abilityBonuses: {},
        customAbilityBonuses: 2,
        speed: 30,
        size: 'Moyen',
        traits: ['Vol silencieux', 'Vision dans le noir étendue', 'Maîtrise perception'],
        languages: ['Commun', 'Une langue au choix'],
        traitDetails: {
            'Vol silencieux': 'Vitesse de vol de 9 m. Vous ne pouvez pas voler en armure lourde. Vol discret (pas de désavantage Discrétion en vol).',
            'Vision dans le noir étendue': 'Voir dans la pénombre et l\'obscurité sur 36 m.',
            'Maîtrise perception': 'Maîtrise de Perception.',
        },
    },
]

// Helper : récupérer la description d'un trait
export function getTraitDescription(traitName: string): string {
    return racialTraitDetails[traitName]?.description ?? ''
}
