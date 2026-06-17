// Données de progression par classe et niveau

// Progression des Rages du Barbarian
export const barbarianRages: number[] = [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 999]

// Bonus de dégâts de Rage
export const barbarianRageDamage: number[] = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]

// ============================================================================
// RANGER-SPECIFIC TABLES
// ============================================================================

// Nombre d'ennemis jurés choisis (niv 1 = 1, niv 6 = 2, niv 14 = 3)
export const rangerFavoredEnemyCount: number[] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3]

// Nombre de terrains favoris choisis (niv 1 = 1, niv 6 = 2, niv 10 = 3)
export const rangerNaturalExplorerCount: number[] = [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

// Nombre de sorts connus du Rôdeur (niv 1 = 0 car demi-incantateur, niv 2 = 2, etc.)
export const rangerKnownSpells: number[] = [0, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11]

// ============================================================================
// DRUID-SPECIFIC TABLES
// ============================================================================

// FP maximum de Forme sauvage (0 avant niv 2)
export const druidWildShapeMaxCR: number[] = [0, 0, 0.25, 0.25, 0.5, 0.5, 0.5, 0.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// Nombre d'utilisations de Forme sauvage (2 à partir du niv 2, illimité au niv 20)
export const druidWildShapeUses: number[] = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 999]

// Restriction de vol pour Forme sauvage (débloqué au niv 8)
export const druidWildShapeCanFly: boolean[] = [
    false, false, false, false, false, false, false, false,
    true, true, true, true, true, true, true, true, true, true, true, true
]

// Restriction de forme aquatique (débloquée au niv 4)
export const druidWildShapeCanSwim: boolean[] = [
    false, false, false, false,
    true, true, true, true, true, true, true, true, true, true, true, true, true, true, true, true
]

// Sneak Attack du Roublard (en nombre de d6)
export const rogueSneakAttackDice: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]

// Points de Ki du Moine (= niveau, mais commence à 2)
export const monkKiPoints: number[] = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// Dé d'arts martiaux du Moine
export const monkMartialArtsDie: string[] = [
    'd4', 'd4', 'd4', 'd4', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6',
    'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10'
]

// Bonus de déplacement sans armure du Moine (en mètres)
export const monkUnarmoredMovement: number[] = [
    0, 3, 3, 3, 3, 4.5, 4.5, 4.5, 4.5, 6,
    6, 6, 6, 7.5, 7.5, 7.5, 7.5, 9, 9, 9
]

// Points de Sorcellerie (= niveau pour Ensorceleur)
export const sorcererSorceryPoints: number[] = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// Dé d'Inspiration Bardique
export const bardInspirationDie: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10',
    'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12', 'd12', 'd12'
]

// Utilisations d'Inspiration Bardique par repos long
export const bardInspirationUses: number[] = [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 5]

// Imposition des mains du Paladin (pool de PV = niveau × 5)
export const paladinLayOnHandsPool: number[] = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95]

// Second souffle du Guerrier (utilisations par repos court)
export const fighterSecondWindUses: number[] = [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]

// Niveau maximum de slot Warlock
export const warlockSlotLevel: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

// Nombre de slots Warlock
export const warlockSlotCount: number[] = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]

// Aptitudes de classe par niveau (descriptions courtes FR)
export interface ClassFeature {
    name: string
    description: string
}

// Capacités de classe actionnables (trackées avec des ressources)
export interface ClassAction {
    key: string
    name: string
    description: string
    icon: string
    restoreOn: 'short' | 'long' | 'never'
}

// ============================================================================
// BARBARIAN-SPECIFIC TABLES
// ============================================================================

// Bonus de vitesse du Barbare (Déplacement rapide, niveau 5+)
export const barbarianFastMovement: number[] = [0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

// Dés de Critique Brutal du Barbare (0 avant niveau 9)
export const barbarianBrutalCriticalDice: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3]

// ============================================================================
// FIGHTER-SPECIFIC TABLES
// ============================================================================

// Nombre de dés de supériorité du Maître de bataille (4 au niv 3, 5 au niv 10, 6 au niv 18)
export const battleMasterDiceCount: number[] = [0, 0, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 6, 6, 6]

// Type de dé de supériorité du Maître de bataille (d6 → d10 au niv 10 → d12 au niv 18)
export const battleMasterDieSize: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd10', 'd10',
    'd10', 'd10', 'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12'
]

// Nombre de manœuvres connues du Maître de bataille (3 au niv 3, +2 au niv 7/10/15/18)
export const battleMasterManeuversKnown: number[] = [0, 0, 3, 3, 3, 3, 5, 5, 5, 7, 7, 7, 7, 7, 9, 9, 9, 11, 11, 11]

// Tirs arcaniques de l'Archer arcanique (2 par repos court ou long)
export const arcaneArcherShots: number[] = [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]

// Esprit combatif du Samouraï (3 par repos long)
export const samuraiFightingSpirit: number[] = [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]

// Dés d'énergie psionique du Guerrier psionique (2 × bonus maîtrise)
export const psiWarriorDiceCount: number[] = [0, 0, 4, 4, 4, 4, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8]

// Type de dé d'énergie psionique (d6 → d8 au niv 11 → d10 au niv 17)
export const psiWarriorDieSize: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6', 'd8',
    'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10'
]

// ============================================================================
export const classActionsByLevel: Record<string, Record<number, ClassAction[]>> = {
    barbarian: {
        1: [
            { key: 'rages', name: 'Rage', description: 'Avantage aux jets de Force et JS Force. +2 dégâts CàC (Force). Résistance B/P/S. Pas de sorts/concentration. Dure 1 min.', icon: '😤', restoreOn: 'long' },
            { key: 'unarmoredDefense', name: 'Défense sans armure', description: 'CA = 10 + DEX + CON si pas d\'armure (bouclier autorisé).', icon: '🛡️', restoreOn: 'never' },
        ],
        2: [
            { key: 'rages', name: 'Rage', description: 'Avantage aux jets de Force et JS Force. +2 dégâts CàC (Force). Résistance B/P/S. Pas de sorts/concentration. Dure 1 min.', icon: '😤', restoreOn: 'long' },
            { key: 'recklessAttack', name: 'Attaque téméraire', description: 'Lors de la première attaque de votre tour, décidez d\'effectuer une Attaque téméraire. Avantage à tous les jets d\'attaque CàC (Force) ce tour, mais les attaques contre vous ont aussi l\'avantage jusqu\'à votre prochain tour.', icon: '⚔️', restoreOn: 'never' },
            { key: 'dangerSense', name: 'Sens du danger', description: 'Avantage aux JS de Dextérité contre les effets visibles (pièges, sorts). Ne fonctionne pas si aveuglé, assourdi ou incapable d\'agir.', icon: '👁️', restoreOn: 'never' },
        ],
        3: [
            { key: 'rages', name: 'Rage', description: 'Avantage aux jets de Force et JS Force. +2 dégâts CàC (Force). Résistance B/P/S. Pas de sorts/concentration. Dure 1 min.', icon: '😤', restoreOn: 'long' },
            { key: 'recklessAttack', name: 'Attaque téméraire', description: 'Lors de la première attaque de votre tour, décidez d\'effectuer une Attaque téméraire. Avantage à tous les jets d\'attaque CàC (Force) ce tour, mais les attaques contre vous ont aussi l\'avantage jusqu\'à votre prochain tour.', icon: '⚔️', restoreOn: 'never' },
            { key: 'dangerSense', name: 'Sens du danger', description: 'Avantage aux JS de Dextérité contre les effets visibles (pièges, sorts). Ne fonctionne pas si aveuglé, assourdi ou incapable d\'agir.', icon: '👁️', restoreOn: 'never' },
            { key: 'primalPath', name: 'Voie primitive', description: 'Choisissez votre voie primitive de barbare.', icon: '🐾', restoreOn: 'never' },
        ],
        5: [
            { key: 'rages', name: 'Rage', description: 'Avantage aux jets de Force et JS Force. +2 dégâts CàC (Force). Résistance B/P/S. Pas de sorts/concentration. Dure 1 min.', icon: '😤', restoreOn: 'long' },
            { key: 'extraAttack', name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', icon: '⚔️', restoreOn: 'never' },
            { key: 'fastMovement', name: 'Déplacement rapide', description: '+3m de vitesse tant que vous ne portez pas d\'armure lourde.', icon: '💨', restoreOn: 'never' },
        ],
        7: [
            { key: 'rages', name: 'Rage', description: 'Avantage aux jets de Force et JS Force. +2 dégâts CàC (Force). Résistance B/P/S. Pas de sorts/concentration. Dure 1 min.', icon: '😤', restoreOn: 'long' },
            { key: 'feralInstinct', name: 'Instinct sauvage', description: 'Avantage aux jets d\'initiative. Si surpris au début du combat, vous pouvez agir normalement au premier tour si vous entrez en rage.', icon: '🐺', restoreOn: 'never' },
        ],
        9: [
            { key: 'rages', name: 'Rage', description: '+3 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'brutalCritical', name: 'Critique brutal', description: 'Sur un coup critique en CàC, lancez 1 dé de dégâts de l\'arme en plus. (2 dés au niv 13, 3 dés au niv 17).', icon: '💀', restoreOn: 'never' },
        ],
        11: [
            { key: 'rages', name: 'Rage', description: '+3 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'relentlessRage', name: 'Rage implacable', description: 'Si vous tombez à 0 PV en rage : JS CON DD 10. Réussite = 1 PV. DD augmente de 5 à chaque utilisation. Reset au repos court/long.', icon: '🔥', restoreOn: 'never' },
        ],
        12: [
            { key: 'rages', name: 'Rage', description: '+3 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
        ],
        13: [
            { key: 'rages', name: 'Rage', description: '+3 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'brutalCritical', name: 'Critique brutal (2)', description: 'Sur un coup critique en CàC, lancez 2 dés de dégâts de l\'arme en plus.', icon: '💀', restoreOn: 'never' },
        ],
        15: [
            { key: 'rages', name: 'Rage', description: '+3 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'persistentRage', name: 'Rage persistante', description: 'Votre rage ne s\'arrête prématurément que si vous tombez inconscient ou choisissez de l\'arrêter.', icon: '♾️', restoreOn: 'never' },
        ],
        16: [
            { key: 'rages', name: 'Rage', description: '+4 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
        ],
        17: [
            { key: 'rages', name: 'Rage', description: '+4 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'brutalCritical', name: 'Critique brutal (3)', description: 'Sur un coup critique en CàC, lancez 3 dés de dégâts de l\'arme en plus.', icon: '💀', restoreOn: 'never' },
        ],
        18: [
            { key: 'rages', name: 'Rage', description: '+4 dégâts CàC (Force). Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'indomitableMight', name: 'Puissance indomptable', description: 'Si le résultat d\'un jet de Force est inférieur à votre score de Force, utilisez votre score de Force à la place.', icon: '💪', restoreOn: 'never' },
        ],
        20: [
            { key: 'rages', name: 'Rage', description: '+4 dégâts CàC (Force). Illimité. Avantage aux jets de Force et JS Force. Résistance B/P/S.', icon: '😤', restoreOn: 'long' },
            { key: 'primalChampion', name: 'Champion primitif', description: 'FOR et CON augmentent de 4 (max 24).', icon: '👑', restoreOn: 'never' },
        ],
    },
    bard: {
        1: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Action bonus : donnez un dé d6 (d8 niv 5, d10 niv 10, d12 niv 15) à une créature à 18m. Elle peut l\'ajouter à un jet d\'attaque, test de caractéristique ou JS dans les 10 minutes. Utilisations = mod CHA (min 1).', icon: '🎵', restoreOn: 'short' },
        ],
        2: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Action bonus : donnez un dé d6 à un allié à 18m.', icon: '🎵', restoreOn: 'short' },
            { key: 'jackOfAllTrades', name: 'Touche-à-tout', description: 'Ajoutez la moitié de votre bonus de maîtrise (arrondi à l\'inférieur) aux tests de caractéristique où vous n\'avez pas déjà de bonus de maîtrise.', icon: '🎲', restoreOn: 'never' },
            { key: 'songOfRest', name: 'Chant reposant', description: 'Au repos court, si vous utilisez Chant reposant, les alliés qui récupèrent des PV regagnent +1d6 PV supplémentaires (d8 niv 9, d10 niv 13, d12 niv 17).', icon: '🎶', restoreOn: 'short' },
        ],
        3: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Action bonus : donnez un dé d6 à un allié à 18m.', icon: '🎵', restoreOn: 'short' },
            { key: 'jackOfAllTrades', name: 'Touche-à-tout', description: '+demi maîtrise aux tests de caractéristique non maîtrisés.', icon: '🎲', restoreOn: 'never' },
            { key: 'songOfRest', name: 'Chant reposant', description: 'Alliés récupèrent +1d6 PV au repos court.', icon: '🎶', restoreOn: 'short' },
            { key: 'bardCollege', name: 'Collège bardique', description: 'Choisissez votre collège : Savoir, Vaillance (PHB) ; Glamour, Épées, Murmures (XGtE) ; Création, Éloquence (TCoE).', icon: '🎭', restoreOn: 'never' },
            { key: 'expertise', name: 'Expertise', description: 'Doublez le bonus de maîtrise pour 2 compétences de votre choix (4 au niveau 10).', icon: '⭐', restoreOn: 'never' },
        ],
        5: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d8.', icon: '🎵', restoreOn: 'short' },
        ],
        6: [
            { key: 'countercharm', name: 'Contre-charme', description: 'Action : jusqu\'à la fin de votre prochain tour, les créatures de votre choix à 9m ont l\'avantage aux JS contre le charme et la peur. Nécessite une représentation.', icon: '🛡️', restoreOn: 'never' },
        ],
        9: [
            { key: 'songOfRest', name: 'Chant reposant', description: 'Alliés récupèrent +1d8 PV au repos court.', icon: '🎶', restoreOn: 'short' },
        ],
        10: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d10.', icon: '🎵', restoreOn: 'short' },
            { key: 'expertise', name: 'Expertise (2)', description: 'Doublez le bonus de maîtrise pour 2 compétences supplémentaires.', icon: '⭐', restoreOn: 'never' },
            { key: 'magicalSecrets', name: 'Secrets magiques', description: 'Apprenez 2 sorts de n\'importe quelle classe. Ils comptent comme des sorts de barde.', icon: '🔮', restoreOn: 'never' },
        ],
        13: [
            { key: 'songOfRest', name: 'Chant reposant', description: 'Alliés récupèrent +1d10 PV au repos court.', icon: '🎶', restoreOn: 'short' },
        ],
        14: [
            { key: 'magicalSecrets', name: 'Secrets magiques (2)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe.', icon: '🔮', restoreOn: 'never' },
        ],
        15: [
            { key: 'bardicInspiration', name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d12.', icon: '🎵', restoreOn: 'short' },
        ],
        17: [
            { key: 'songOfRest', name: 'Chant reposant', description: 'Alliés récupèrent +1d12 PV au repos court.', icon: '🎶', restoreOn: 'short' },
        ],
        18: [
            { key: 'magicalSecrets', name: 'Secrets magiques (3)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe.', icon: '🔮', restoreOn: 'never' },
        ],
        20: [
            { key: 'superiorInspiration', name: 'Inspiration supérieure', description: 'Quand vous faites un jet d\'initiative et qu\'il ne vous reste aucune Inspiration bardique, vous en regagnez une.', icon: '✨', restoreOn: 'never' },
        ],
    },
    cleric: {
        2: [{ key: 'channelDivinity', name: 'Canal divin', description: 'Canalisez l\'énergie divine pour utiliser une aptitude de Canal divin de votre domaine. 1/utilisation/repos court au niv. 2, 2 au niv. 6, 3 au niv. 18.', icon: '✨', restoreOn: 'short' }],
    },
    fighter: {
        1: [{ key: 'secondWind', name: 'Second souffle', description: 'Action bonus : regagnez 1d10 + niveau de guerrier PV. 1/utilisation/repos court.', icon: '💨', restoreOn: 'short' }],
        2: [{ key: 'actionSurge', name: 'Fougue', description: 'Sur votre tour, entreprenez une action supplémentaire. 1/repos court (2 au niv. 17).', icon: '⚔️', restoreOn: 'short' }],
        9: [
            { key: 'indomitable', name: 'Indomptable', description: 'Relancez un jet de sauvegarde raté. Vous devez utiliser le nouveau résultat. 1/repos long (2 au niv. 13, 3 au niv. 17).', icon: '🛡️', restoreOn: 'long' },
        ],
    },
    rogue: {
        1: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: 'Une fois par tour : +1d6 dégâts si avantage (arme finesse/distance) OU cible à 1,5m d\'un allié sans désavantage. Monte à 2d6 au niv. 3, 10d6 au niv. 20.', icon: '🗡️', restoreOn: 'never' },
            { key: 'cunningAction', name: 'Ruse', description: 'Action bonus : Foncer, Se désengager, ou Se cacher.', icon: '👤', restoreOn: 'never' },
        ],
        5: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+3d6 dégâts une fois par tour (condition : avantage avec finesse/distance, ou allié adjacent sans désavantage).', icon: '🗡️', restoreOn: 'never' },
            { key: 'cunningAction', name: 'Ruse', description: 'Action bonus : Foncer, Se désengager, ou Se cacher.', icon: '👤', restoreOn: 'never' },
            { key: 'uncannyDodge', name: 'Esquive instinctive', description: 'Réaction : réduisez de moitié les dégâts d\'une attaque qui vous touche.', icon: '🛡️', restoreOn: 'never' },
        ],
        7: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+4d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'cunningAction', name: 'Ruse', description: 'Action bonus : Foncer, Se désengager, ou Se cacher.', icon: '👤', restoreOn: 'never' },
            { key: 'uncannyDodge', name: 'Esquive instinctive', description: 'Réaction : réduisez de moitié les dégâts d\'une attaque qui vous touche.', icon: '🛡️', restoreOn: 'never' },
            { key: 'evasion', name: 'Dérobade', description: 'JS DEX : réussi = 0 dégât, raté = demi-dégâts contre les effets de zone.', icon: '💨', restoreOn: 'never' },
        ],
        11: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+6d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'reliableTalent', name: 'Talent fiable', description: 'Tests de compétences maîtrisées : minimum 10 sur le d20.', icon: '✨', restoreOn: 'never' },
        ],
        14: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+7d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'blindSense', name: 'Perception aveugle', description: 'Détectez les créatures invisibles à 3m (si pas cachées derrière abri total).', icon: '👁️', restoreOn: 'never' },
        ],
        15: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+8d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'slipperyMind', name: 'Esprit fuyant', description: 'Maîtrise des jets de sauvegarde de Sagesse.', icon: '🧠', restoreOn: 'never' },
        ],
        18: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+9d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'elusive', name: 'Insaisissable', description: 'Aucune attaque contre vous n\'a l\'avantage (sauf incapable d\'agir).', icon: '👻', restoreOn: 'never' },
        ],
        20: [
            { key: 'sneakAttack', name: 'Attaque sournoise', description: '+10d6 dégâts une fois par tour.', icon: '🗡️', restoreOn: 'never' },
            { key: 'strokeOfLuck', name: 'Coup de chance', description: 'Transformez un échec en succès (1/repos court ou long).', icon: '🍀', restoreOn: 'short' },
        ],
    },
    monk: {
        2: [
            { key: 'ki', name: 'Points de Ki', description: 'Points de Ki = niveau de moine. Action bonus : Frappe étourdissante (1 Ki, JS CON ou étourdi), Déplacement patient (1 Ki, Foncer/Se désengager/Se cacher + x2 vitesse), Pas des ombres (2 Ki, Ténèbres, Silence, Pas brumeux, etc.). Réaction : Déviation de projectiles (1 Ki).', icon: '☯️', restoreOn: 'short' },
            { key: 'unarmoredMovement', name: 'Déplacement sans armure', description: 'Tant que vous ne portez ni armure ni bouclier, votre vitesse augmente. +3m au niv 2, +4.5m au niv 6, +6m au niv 10, +7.5m au niv 14, +9m au niv 18. Vous pouvez aussi traverser les surfaces verticales et liquides au niv 9+ sans tomber.', icon: '💨', restoreOn: 'never' },
        ],
        3: [
            { key: 'ki', name: 'Points de Ki', description: 'Points de Ki = niveau de moine.', icon: '☯️', restoreOn: 'short' },
            { key: 'deflectMissiles', name: 'Déviation de projectiles', description: 'Réaction : quand vous êtes touché par une attaque à distance avec une arme ou un projectile, réduisez les dégâts de 1d10 + mod DEX + niveau de moine. Si les dégâts tombent à 0, vous attrapez le projectile et pouvez le renvoyer (dépensez 1 Ki, attaque à distance, 6m/18m).', icon: '🛡️', restoreOn: 'never' },
        ],
        5: [
            { key: 'ki', name: 'Points de Ki', description: 'Points de Ki = niveau de moine.', icon: '☯️', restoreOn: 'short' },
            { key: 'extraAttack', name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', icon: '⚔️', restoreOn: 'never' },
            { key: 'stunningStrike', name: 'Frappe étourdissante', description: 'Quand vous touchez avec une attaque au corps à corps, dépensez 1 Ki pour forcer un JS CON (DD 8 + mod SAG + bonus maîtrise). Échec = étourdi jusqu\'à la fin de votre prochain tour.', icon: '💥', restoreOn: 'never' },
        ],
        7: [
            { key: 'evasion', name: 'Dérobade', description: 'JS DEX réussi contre un effet de zone = 0 dégât. Raté = demi-dégâts.', icon: '💨', restoreOn: 'never' },
            { key: 'stillnessOfMind', name: 'Tranquillité de l\'esprit', description: 'Action : mettez fin à un effet qui vous charmé ou effrayé.', icon: '🧘', restoreOn: 'never' },
        ],
        10: [
            { key: 'purityOfBody', name: 'Pureté du corps', description: 'Immunité aux maladies et au poison.', icon: '🛡️', restoreOn: 'never' },
        ],
        14: [
            { key: 'diamondSoul', name: 'Âme de diamant', description: 'Maîtrise de tous les jets de sauvegarde. Vous pouvez dépenser 1 Ki pour relancer un JS raté.', icon: '💎', restoreOn: 'never' },
        ],
        18: [
            { key: 'emptyBody', name: 'Corps vide', description: 'Action : dépensez 4 Ki pour devenir invisible pendant 1 minute. De plus, vous avez résistance à tous les dégâts sauf force. Vous pouvez aussi dépenser 8 Ki pour lancer Astral (sans composantes).', icon: '👻', restoreOn: 'never' },
        ],
        20: [
            { key: 'perfectSelf', name: 'Perfection de l\'être', description: 'Quand vous faites un jet d\'initiative et qu\'il ne vous reste aucun point de Ki, vous regagnez 4 points de Ki.', icon: '✨', restoreOn: 'never' },
        ],
    },
    paladin: {
        1: [
            { key: 'layOnHands', name: 'Imposition des mains', description: 'Pool de PV = 5 × niveau. Action : touchez pour soigner ou dépensez 5 PV pour guérir maladie/poison. Repos long.', icon: '🤲', restoreOn: 'long' },
            { key: 'divineSmite', name: 'Châtiment divin', description: 'Quand vous touchez en CàC : dépensez un emplacement pour +2d8 radiants (+1d8 vs morts-vivants/fiélons, +1d8 si déclaré avant).', icon: '⚡', restoreOn: 'long' },
            { key: 'divineSense', name: 'Sens divin', description: 'Action : détectez aberrations, célestes, fiélons, élémentaires, fées et morts-vivants à 18m. Localisez lieux consacrés/profanes.', icon: '👁️', restoreOn: 'never' },
        ],
        2: [
            { key: 'divineSmite', name: 'Châtiment divin', description: 'Quand vous touchez en CàC : dépensez un emplacement pour +2d8 radiants (+1d8 vs morts-vivants/fiélons, +1d8 si déclaré avant). Niv 3 = 3d8, niv 4 = 4d8, etc.', icon: '⚡', restoreOn: 'long' },
            { key: 'layOnHands', name: 'Imposition des mains', description: 'Pool de PV = 5 × niveau. Action : touchez pour soigner ou dépensez 5 PV pour guérir maladie/poison. Repos long.', icon: '🤲', restoreOn: 'long' },
            { key: 'divineSense', name: 'Sens divin', description: 'Action : détectez aberrations, célestes, fiélons, élémentaires, fées et morts-vivants à 18m. Localisez lieux consacrés/profanes.', icon: '👁️', restoreOn: 'never' },
        ],
        3: [
            { key: 'channelDivinity', name: 'Canal divin', description: 'Canalisez l\'énergie divine pour utiliser une aptitude de Canal divin de votre serment. 1/repos court au niv. 3, 2 au niv. 6, 3 au niv. 18.', icon: '✨', restoreOn: 'short' },
            { key: 'divineHealth', name: 'Santé divine', description: 'Immunité aux maladies.', icon: '🛡️', restoreOn: 'never' },
        ],
        5: [
            { key: 'extraAttack', name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', icon: '⚔️', restoreOn: 'never' },
        ],
        6: [
            { key: 'auraOfProtection', name: 'Aura de protection', description: 'Vous et les alliés à 3m (9m au niv 18) gagnez +mod CHA aux JS. Nécessite être conscient.', icon: '🛡️', restoreOn: 'never' },
        ],
        10: [
            { key: 'auraOfCourage', name: 'Aura de courage', description: 'Vous et les alliés à 3m (9m au niv 18) êtes immunisés à la peur. Nécessite être conscient.', icon: '🦁', restoreOn: 'never' },
        ],
        11: [
            { key: 'improvedDivineSmite', name: 'Châtiment divin amélioré', description: '+1d8 dégâts radiants à chaque attaque au corps à corps (pas besoin d\'emplacement).', icon: '⚡', restoreOn: 'never' },
        ],
        14: [
            { key: 'cleansingTouch', name: 'Contact purificateur', description: 'Action : mettez fin à un sort vous ciblant ou ciblant une créature consentante à votre portée. 1 + mod CHA fois par repos long.', icon: '✨', restoreOn: 'long' },
        ],
    },
    sorcerer: {
        1: [
            { key: 'spellcasting', name: 'Incantation', description: 'Lancez des sorts d\'Ensorceleur avec le Charisme. Vous connaissez un nombre fixe de sorts (pas de préparation).', icon: '✨', restoreOn: 'long' },
        ],
        2: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: 'Dépensez des points de sorcellerie pour créer emplacements de sort (1 pt = niv 1, 2 pts = niv 2, etc.) ou pour activer la Métamagie. Maximum = niveau d\'ensorceleur.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies. Dépensez des points de sorcellerie pour les activer.', icon: '⚡', restoreOn: 'never' },
        ],
        3: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '3 points de sorcellerie. Dépensez-les pour créer des emplacements ou activer la Métamagie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        4: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '4 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        5: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '5 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        6: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '6 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        7: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '7 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        8: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '8 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        9: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '9 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie', description: '2 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        10: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '10 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        11: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '11 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        12: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '12 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        13: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '13 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        14: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '14 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        15: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '15 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        16: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '16 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (3)', description: '3 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        17: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '17 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (4)', description: '4 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        18: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '18 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (4)', description: '4 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        19: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '19 points de sorcellerie.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (4)', description: '4 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
        20: [
            { key: 'sorceryPoints', name: 'Points de sorcellerie', description: '20 points de sorcellerie. Restauration de sorcellerie : regagnez 4 pts au repos court.', icon: '🔮', restoreOn: 'long' },
            { key: 'metamagic', name: 'Métamagie (4)', description: '4 options de Métamagie choisies.', icon: '⚡', restoreOn: 'never' },
        ],
    },
    druid: {
        2: [
            { key: 'wildShape', name: 'Forme sauvage', description: 'Action : transformez-vous en bête vue (FP max 1/4 au niv 2, 1/2 au niv 4, 1 au niv 8). Vol au niv 8, nage au niv 4. Vous adoptez les PV, CA, FOR, DEX, CON de la bête. Vous conservez votre SAG, INT, CHA, JS, maîtrise, bonus de maîtrise. 2 utilisations/repos court.','icon': '🐺', restoreOn: 'short' },
        ],
        18: [
            { key: 'wildShape', name: 'Forme sauvage', description: 'Action : transformez-vous en bête. 2 utilisations/repos court.','icon': '🐺', restoreOn: 'short' },
        ],
        20: [
            { key: 'wildShape', name: 'Forme sauvage', description: 'Forme sauvage illimitée. Action : transformez-vous en bête sans limite d\'utilisation.','icon': '🐺', restoreOn: 'never' },
        ],
    },
    ranger: {
        1: [
            { key: 'favoredEnemy', name: 'Ennemi juré', description: 'Avantage aux tests de Sagesse (Survie) pour pister et Intelligence pour se souvenir des ennemis jurés. Vous apprenez une langue associée.', icon: '🎯', restoreOn: 'never' },
            { key: 'naturalExplorer', name: 'Explorateur-né', description: 'Avantage aux tests d\'Initiative et d\'Orientation sur votre terrain favori. Le terrain difficile ne vous ralentit pas. Seul : voyage furtif, fourrage, pistage. Maîtrise d\'une compétence de votre choix (Dressage, Nature ou Survie) si déjà maîtrisée, doublez le bonus.', icon: '🌲', restoreOn: 'never' },
        ],
        2: [
            { key: 'favoredEnemy', name: 'Ennemi juré', description: 'Avantage aux tests de Sagesse (Survie) pour pister et Intelligence pour se souvenir des ennemis jurés. Vous apprenez une langue associée.', icon: '🎯', restoreOn: 'never' },
            { key: 'naturalExplorer', name: 'Explorateur-né', description: 'Avantage aux tests d\'Initiative et d\'Orientation sur votre terrain favori. Le terrain difficile ne vous ralentit pas.', icon: '🌲', restoreOn: 'never' },
            { key: 'fightingStyle', name: 'Style de combat', description: 'Choisissez un style de combat : Archerie, Défense, Duel, Combat à grande arme, Protection, Combat à deux armes, etc.', icon: '⚔️', restoreOn: 'never' },
            { key: 'spellcasting', name: 'Incantation', description: 'Lancez des sorts de Rôdeur avec la Sagesse. Vous préparez vos sorts après un repos long. Niveau 2 : 2 emplacements niv 1.', icon: '✨', restoreOn: 'long' },
        ],
        3: [
            { key: 'favoredEnemy', name: 'Ennemi juré', description: 'Avantage aux tests de Sagesse (Survie) pour pister et Intelligence pour se souvenir des ennemis jurés.', icon: '🎯', restoreOn: 'never' },
            { key: 'naturalExplorer', name: 'Explorateur-né', description: 'Avantage aux tests d\'Initiative et d\'Orientation sur votre terrain favori.', icon: '🌲', restoreOn: 'never' },
            { key: 'fightingStyle', name: 'Style de combat', description: 'Style de combat choisi.', icon: '⚔️', restoreOn: 'never' },
            { key: 'spellcasting', name: 'Incantation', description: 'Lancez des sorts de Rôdeur avec la Sagesse.', icon: '✨', restoreOn: 'long' },
            { key: 'rangerArchetype', name: 'Archétype de rôdeur', description: 'Choisissez votre conclave : Chasseur, Maître des Bêtes (PHB) ; Traqueur des Ombres, Marcheur de l\'Horizon, Pourfendeur (XGtE) ; Vagabond Féerique, Gardien des Essaims (TCoE).', icon: '🐾', restoreOn: 'never' },
        ],
        5: [
            { key: 'favoredEnemy', name: 'Ennemi juré', description: 'Deux ennemis jurés choisis.', icon: '🎯', restoreOn: 'never' },
            { key: 'naturalExplorer', name: 'Explorateur-né', description: 'Deux terrains favoris choisis.', icon: '🌲', restoreOn: 'never' },
            { key: 'extraAttack', name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', icon: '⚔️', restoreOn: 'never' },
            { key: 'spellcasting', name: 'Incantation', description: 'Sorts de Rôdeur : 4 emplacements (2× niv 1, 2× niv 2).', icon: '✨', restoreOn: 'long' },
        ],
        6: [
            { key: 'favoredEnemy', name: 'Ennemi juré (2)', description: 'Choisissez un ennemi juré supplémentaire et une langue associée.', icon: '🎯', restoreOn: 'never' },
            { key: 'naturalExplorer', name: 'Explorateur-né (2)', description: 'Choisissez un terrain favori supplémentaire.', icon: '🌲', restoreOn: 'never' },
        ],
        8: [
            { key: 'landStride', name: 'Foulée tellurique', description: 'Le terrain difficile ne vous ralentit pas. Avantage aux JS contre les plantes magiques.', icon: '🌿', restoreOn: 'never' },
        ],
        10: [
            { key: 'naturalExplorer', name: 'Explorateur-né (3)', description: 'Trois terrains favoris choisis.', icon: '🌲', restoreOn: 'never' },
            { key: 'hideInPlainSight', name: 'Se fondre dans le décor', description: 'Action : camouflez-vous avec des matériaux naturels. Bonus de +10 à la Discrétion tant que vous restez immobile.', icon: '👤', restoreOn: 'never' },
        ],
        13: [
            { key: 'favoredEnemy', name: 'Ennemi juré (3)', description: 'Trois ennemis jurés choisis. Avantage aux JS contre les sorts de vos ennemis jurés.', icon: '🎯', restoreOn: 'never' },
        ],
        14: [
            { key: 'vanish', name: 'Disparition', description: 'Action bonus : utilisez l\'action Se cacher.', icon: '💨', restoreOn: 'never' },
        ],
        18: [
            { key: 'feralSenses', name: 'Sens sauvages', description: 'Détectez les créatures invisibles à 9m (pas derrière un abri total).', icon: '👁️', restoreOn: 'never' },
        ],
        20: [
            { key: 'foeSlayer', name: 'Tueur d\'ennemis', description: 'Une fois par tour, ajoutez mod SAG aux dégâts OU aux jets d\'attaque contre vos ennemis jurés.', icon: '💀', restoreOn: 'never' },
        ],
    },
    warlock: {
        1: [
            { key: 'spellcasting', name: 'Magie de pacte', description: 'Vos emplacements de sorts sont tous du même niveau et reviennent au repos court. Vous lancez avec le Charisme.', icon: '✨', restoreOn: 'short' },
        ],
        2: [
            { key: 'eldritchInvocations', name: 'Invocations occultes', description: 'Choisissez 2 aptitudes spéciales (3 au niv. 5, 4 au niv. 7, 5 au niv. 9, 6 au niv. 11, 7 au niv. 13, 8 au niv. 15, 9 au niv. 17). Certaines nécessitent un niveau ou un pacte minimum.', icon: '📖', restoreOn: 'long' },
        ],
        3: [
            { key: 'pactBoon', name: 'Pacte', description: 'Choisissez un Pacte : Chaîne, Lame, Grimoire ou Talisman (TCoE).', icon: '🔗', restoreOn: 'never' },
        ],
        5: [
            { key: 'eldritchInvocations', name: 'Invocations occultes (3)', description: '3 invocations occultes choisies. Invocations de niveau 5 disponibles.', icon: '📖', restoreOn: 'long' },
        ],
        7: [
            { key: 'eldritchInvocations', name: 'Invocations occultes (4)', description: '4 invocations occultes choisies.', icon: '📖', restoreOn: 'long' },
        ],
        9: [
            { key: 'eldritchInvocations', name: 'Invocations occultes (5)', description: '5 invocations occultes choisies. Invocations de niveau 9 disponibles.', icon: '📖', restoreOn: 'long' },
        ],
        11: [
            { key: 'mysticArcanum6', name: 'Arcanum mystique (6)', description: 'Lancez un sort de niveau 6 choisi 1/jour sans emplacement.', icon: '🔮', restoreOn: 'long' },
        ],
        12: [
            { key: 'eldritchInvocations', name: 'Invocations occultes (6)', description: '6 invocations occultes choisies.', icon: '📖', restoreOn: 'long' },
        ],
        13: [
            { key: 'mysticArcanum7', name: 'Arcanum mystique (7)', description: 'Lancez un sort de niveau 7 choisi 1/jour sans emplacement.', icon: '🔮', restoreOn: 'long' },
        ],
        15: [
            { key: 'mysticArcanum8', name: 'Arcanum mystique (8)', description: 'Lancez un sort de niveau 8 choisi 1/jour sans emplacement.', icon: '🔮', restoreOn: 'long' },
            { key: 'eldritchInvocations', name: 'Invocations occultes (7)', description: '7 invocations occultes choisies.', icon: '📖', restoreOn: 'long' },
        ],
        17: [
            { key: 'mysticArcanum9', name: 'Arcanum mystique (9)', description: 'Lancez un sort de niveau 9 choisi 1/jour sans emplacement.', icon: '🔮', restoreOn: 'long' },
            { key: 'eldritchInvocations', name: 'Invocations occultes (8)', description: '8 invocations occultes choisies.', icon: '📖', restoreOn: 'long' },
        ],
        20: [
            { key: 'eldritchMaster', name: 'Maître occulte', description: 'Regagnez tous vos emplacements en 1 minute (1/jour).', icon: '👑', restoreOn: 'long' },
        ],
    },
    wizard: {
        1: [
            { key: 'arcaneRecovery', name: 'Récupération arcanique', description: 'Au repos court, récupérez des emplacements de sort dont le total des niveaux ≤ la moitié de votre niveau de magicien (arrondi supérieur). Aucun emplacement de niveau 6+.', icon: '📘', restoreOn: 'long' },
            { key: 'spellbook', name: 'Grimoire', description: 'Vous disposez d\'un grimoire contenant 6 sorts de niveau 1. Vous copiez de nouveaux sorts en dépensant du temps et de l\'or (2h et 50po par niveau de sort).', icon: '📖', restoreOn: 'never' },
        ],
        2: [
            { key: 'arcaneRecovery', name: 'Récupération arcanique', description: 'Au repos court, récupérez des emplacements de sort dont le total ≤ niveau/2 (arrondi sup).', icon: '📘', restoreOn: 'long' },
            { key: 'arcaneTradition', name: 'Tradition arcanique', description: 'Choisissez votre tradition arcanique : Évocation, Abjuration, Conjuration, Divination, Enchantement, Illusion, Nécromancie, Transmutation (PHB) ; Magie de Guerre (XGtE) ; Chant de Lame, Ordre des Scribes (TCoE).', icon: '✨', restoreOn: 'never' },
        ],
        18: [
            { key: 'spellMastery', name: 'Maîtrise des sorts', description: 'Choisissez 2 sorts de niveau 1 et 2 sorts de niveau 2. Vous pouvez les lancer au niveau minimum sans emplacement.', icon: '🔮', restoreOn: 'never' },
        ],
        20: [
            { key: 'signatureSpells', name: 'Sorts de prédilection', description: 'Choisissez 2 sorts de niveau 3. Vous les avez toujours préparés et pouvez les lancer une fois chacun au niveau 3 sans emplacement (récupéré au repos court ou long).', icon: '⭐', restoreOn: 'short' },
        ],
    },
}

/**
 * Récupère les capacités actionnables pour une classe à un niveau donné
 */
export function getClassActions(classId: string, level: number): ClassAction[] {
    const actionsByLevel = classActionsByLevel[classId]
    if (!actionsByLevel) return []
    
    const actions: ClassAction[] = []
    const seen = new Set<string>()
    
    // Trouver l'entrée la plus récente <= level pour chaque key
    const availableLevels = Object.keys(actionsByLevel).map(Number).sort((a, b) => b - a)
    for (const lvl of availableLevels) {
        if (lvl > level) continue
        for (const action of actionsByLevel[lvl]) {
            if (!seen.has(action.key)) {
                seen.add(action.key)
                actions.push(action)
            }
        }
    }
    
    return actions
}

export const classFeaturesByLevel: Record<string, Record<number, ClassFeature[]>> = {
    barbarian: {
        1: [
            { name: 'Rage', description: 'Entrez en rage (action bonus) : avantage jets de Force et JS Force, +2 dégâts CàC (Force), résistance B/P/S. Pas de sorts/concentration. Dure 1 min. Se termine si inconscient ou si vous n\'attaquez/subissez pas de dégâts pendant 1 tour.' },
            { name: 'Défense sans armure', description: 'CA = 10 + mod DEX + mod CON si pas d\'armure. Bouclier autorisé.' },
        ],
        2: [
            { name: 'Attaque téméraire', description: 'Lors de la première attaque de votre tour, décidez d\'effectuer une Attaque téméraire. Vous obtenez l\'avantage à tous les jets d\'attaque au corps à corps avec une arme utilisant la Force durant ce tour, mais les attaques effectuées contre vous ont aussi l\'avantage jusqu\'à votre prochain tour.' },
            { name: 'Sens du danger', description: 'Avantage aux jets de sauvegarde de Dextérité contre les effets que vous pouvez voir (pièges, sorts). Ne fonctionne pas si vous êtes aveuglé, assourdi ou incapable d\'agir.' },
        ],
        3: [{ name: 'Voie primitive', description: 'Choisissez votre voie primitive de barbare : Voie du Berserker, Voie du Totem, Voie du Gardien ancestral, Voie du Héraut de la tempête, Voie du Zélote, Voie de la Bête, Voie de la Magie sauvage, Voie du Battlerager (nain uniquement), Voie du Géant.' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois, au lieu d\'une seule, chaque fois que vous réalisez l\'action Attaquer durant votre tour.' },
            { name: 'Déplacement rapide', description: 'Votre vitesse augmente de 3 mètres tant que vous ne portez pas d\'armure lourde.' },
        ],
        6: [{ name: 'Capacité de voie', description: 'Vous gagnez une capacité propre à votre voie primitive (voir sous-classe).' }],
        7: [{ name: 'Instinct sauvage', description: 'Avantage aux jets d\'initiative. Si vous êtes surpris au début du combat et que vous n\'êtes pas incapable d\'agir, vous pouvez jouer normalement durant votre premier tour si vous entrez en rage avant de faire quoique ce soit d\'autre à ce tour.' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        9: [{ name: 'Critique brutal', description: 'Sur un coup critique réussi avec une attaque au corps à corps, vous pouvez lancer un dé de dégâts de votre arme en plus lorsque vous déterminez les dégâts supplémentaires. Ce bonus passe à 2 dés au niveau 13 et à 3 dés au niveau 17.' }],
        10: [{ name: 'Capacité de voie', description: 'Vous gagnez une capacité propre à votre voie primitive (voir sous-classe).' }],
        11: [{ name: 'Rage implacable', description: 'Si vous tombez à 0 point de vie pendant votre rage et que vous ne mourez pas sur le coup, vous pouvez faire un jet de sauvegarde de Constitution DD 10. Si vous le réussissez, vous retournez immédiatement à 1 point de vie. Chaque fois que vous utilisez cette capacité après la première, le DD augmente de 5. Quand vous terminez un repos court ou long, le DD retombe à 10.' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Critique brutal (2)', description: 'Sur un coup critique réussi avec une attaque au corps à corps, vous pouvez lancer 2 dés de dégâts de votre arme en plus.' }],
        14: [{ name: 'Capacité de voie', description: 'Vous gagnez une capacité propre à votre voie primitive (voir sous-classe).' }],
        15: [{ name: 'Rage persistante', description: 'Votre rage est si intense qu\'elle ne s\'arrête prématurément que si vous tombez inconscient ou choisissez de l\'arrêter.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        17: [{ name: 'Critique brutal (3)', description: 'Sur un coup critique réussi avec une attaque au corps à corps, vous pouvez lancer 3 dés de dégâts de votre arme en plus.' }],
        18: [{ name: 'Puissance indomptable', description: 'Si le résultat d\'un de vos jets de Force est inférieur à votre valeur de Force, vous pouvez utiliser votre valeur de Force à la place de votre résultat.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Champion primitif', description: 'Vos valeurs de Force et de Constitution augmentent de 4. Votre maximum dans ces valeurs de caractéristique est maintenant de 24.' }],
    },
    fighter: {
        1: [
            { name: 'Style de combat', description: 'Choisissez un style de combat parmi : Archerie, Défense, Duel, Combat à grande arme, Protection, Combat à deux armes, et les options de XGtE/TCoE.' },
            { name: 'Second souffle', description: 'Action bonus : regagnez 1d10 + niveau de guerrier points de vie. Une fois utilisé, vous devez finir un repos court ou long avant de pouvoir l\'utiliser de nouveau.' },
        ],
        2: [{ name: 'Fougue', description: 'Sur votre tour, vous pouvez entreprendre une action supplémentaire en plus de votre action et de votre action bonus. Une fois que vous avez utilisé cette aptitude, vous devez finir un repos court ou long avant de pouvoir l\'utiliser de nouveau (2 utilisations au niveau 17).' }],
        3: [{ name: 'Archétype martial', description: 'Choisissez votre archétype martial : Champion, Maître de bataille, Chevalier occulte (PHB) ; Archer arcanique, Cavalier, Samouraï (XGtE) ; Guerrier psionique, Chevalier runique (TCoE).' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [{ name: 'Attaque supplémentaire', description: 'Attaquez deux fois, au lieu d\'une seule, chaque fois que vous réalisez l\'action Attaquer durant votre tour.' }],
        6: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        7: [{ name: 'Capacité d\'archétype martial', description: 'Vous gagnez une capacité propre à votre archétype martial (voir sous-classe).' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        9: [{ name: 'Indomptable', description: 'Si vous ratez un jet de sauvegarde, vous pouvez le relancer. Vous devez utiliser le nouveau résultat. Une fois que vous avez utilisé cette aptitude, vous devez finir un repos long avant de pouvoir l\'utiliser de nouveau.' }],
        10: [{ name: 'Capacité d\'archétype martial', description: 'Vous gagnez une capacité propre à votre archétype martial (voir sous-classe).' }],
        11: [{ name: 'Attaque supplémentaire (2)', description: 'Attaquez trois fois par action Attaquer.' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Indomptable (2)', description: 'Indomptable 2 fois par repos long.' }],
        14: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        15: [{ name: 'Capacité d\'archétype martial', description: 'Vous gagnez une capacité propre à votre archétype martial (voir sous-classe).' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        17: [
            { name: 'Fougue (2)', description: 'Fougue 2 fois par repos court ou long.' },
            { name: 'Indomptable (3)', description: 'Indomptable 3 fois par repos long.' },
        ],
        18: [{ name: 'Capacité d\'archétype martial', description: 'Vous gagnez une capacité propre à votre archétype martial (voir sous-classe).' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Attaque supplémentaire (3)', description: 'Attaquez quatre fois par action Attaquer.' }],
    },
    rogue: {
        1: [
            { name: 'Expertise', description: 'Doublez le bonus de maîtrise pour 2 compétences ou outils de votre choix (4 au niveau 6).' },
            { name: 'Attaque sournoise', description: 'Une fois par tour, infligez des dégâts supplémentaires (1d6 au niveau 1, jusqu\'à 10d6 au niveau 20) si vous avez l\'avantage à l\'attaque et utilisez une arme de finesse ou à distance, OU si la cible est à 1,5m d\'un allié et que vous n\'avez pas de désavantage.' },
            { name: 'Jargon des voleurs', description: 'Langage secret des voleurs. Vous savez lire, écrire et parler le Jargon des voleurs.' },
        ],
        2: [{ name: 'Ruse', description: 'Action bonus : Foncer, Se désengager, ou Se cacher. Vous pouvez aussi utiliser vos outils de voleur ou Escamotage (Voleur niv 3).' }],
        3: [{ name: 'Archétype de roublard', description: 'Choisissez votre archétype de roublard : Voleur, Assassin, Escroc arcanique (PHB) ; Inquisiteur, Cerveau, Éclaireur, Bretteur (XGtE) ; Fantôme, Âme-lame (TCoE).' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [{ name: 'Esquive instinctive', description: 'Réaction : quand une créature vous touche avec une attaque, réduisez les dégâts de moitié (arrondis à l\'inférieur).' }],
        6: [{ name: 'Expertise (2)', description: 'Doublez le bonus de maîtrise pour 2 compétences ou outils supplémentaires.' }],
        7: [{ name: 'Dérobade', description: 'Quand vous subissez des dégâts d\'un effet vous permettant un jet de sauvegarde de Dextérité, vous ne subissez aucun dégât si vous réussissez, et la moitié seulement si vous ratez.' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        9: [{ name: 'Capacité d\'archétype', description: 'Vous gagnez une capacité propre à votre archétype de roublard (voir sous-classe).' }],
        10: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        11: [{ name: 'Talent fiable', description: 'Si vous faites un test de caractéristique maîtrisé, le résultat minimum sur le d20 est 10.' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Capacité d\'archétype (2)', description: 'Vous gagnez une capacité propre à votre archétype de roublard (voir sous-classe).' }],
        14: [{ name: 'Perception aveugle', description: 'Détectez les créatures invisibles à 3m si elles ne sont pas cachées derrière un abri total.' }],
        15: [{ name: 'Esprit fuyant', description: 'Maîtrise des jets de sauvegarde de Sagesse.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        17: [{ name: 'Capacité d\'archétype (3)', description: 'Vous gagnez une capacité propre à votre archétype de roublard (voir sous-classe).' }],
        18: [{ name: 'Insaisissable', description: 'Aucune attaque contre vous n\'a l\'avantage, sauf si vous êtes incapable d\'agir.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Coup de chance', description: 'Transformez un échec en succès sur un jet d\'attaque, de caractéristique ou de sauvegarde. 1/repos court ou long.' }],
    },
    monk: {
        1: [
            { name: 'Défense sans armure', description: 'Tant que vous ne portez ni armure ni bouclier, votre CA = 10 + mod DEX + mod SAG.' },
            { name: 'Arts martiaux', description: 'Vous pouvez utiliser DEX au lieu de FOR pour les jets d\'attaque et de dégâts de vos attaques à mains nues et armes de moine. Vous pouvez lancer 1d4 (d6 niv 5, d8 niv 11, d10 niv 17) au lieu des dégâts normaux. Quand vous utilisez l\'action Attaquer, vous pouvez faire une attaque à mains nues en action bonus.' },
        ],
        2: [
            { name: 'Ki', description: 'Points de Ki = niveau de moine. Récupérés au repos court ou long. Action bonus : Frappe étourdissante (1 Ki), Déplacement patient (1 Ki, Foncer/Se désengager/Se cacher + x2 vitesse), Pas des ombres (2 Ki, Ténèbres, Silence, Pas brumeux...).' },
            { name: 'Déplacement sans armure', description: 'Tant que vous ne portez ni armure ni bouclier, votre vitesse augmente de +3m (niv 2), +4.5m (niv 6), +6m (niv 10), +7.5m (niv 14), +9m (niv 18). Au niveau 9, vous pouvez traverser les surfaces verticales et liquides sans tomber.' },
        ],
        3: [
            { name: 'Tradition monastique', description: 'Choisissez votre tradition monastique : Voie de la Paume, Voie de l\'Ombre (PHB) ; Voie de l\'Ivrogne, Voie du Kensei, Voie de l\'Âme Solaire (XGtE) ; Voie de la Miséricorde, Voie de l\'Être Astral (TCoE).' },
            { name: 'Déviation de projectiles', description: 'Réaction : quand vous êtes touché par une attaque à distance avec une arme ou un projectile, réduisez les dégâts de 1d10 + mod DEX + niveau de moine. Si les dégâts tombent à 0, vous attrapez le projectile et pouvez le renvoyer (dépensez 1 Ki, attaque à distance, 6m/18m).' },
        ],
        4: [
            { name: 'Chute ralentie', description: 'Réaction : quand vous tombez, réduisez les dégâts de chute de 5 × niveau de moine.' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois, au lieu d\'une seule, chaque fois que vous réalisez l\'action Attaquer durant votre tour.' },
            { name: 'Frappe étourdissante', description: 'Quand vous touchez une créature avec une attaque au corps à corps, dépensez 1 point de Ki pour tenter une Frappe étourdissante. La cible doit réussir un jet de sauvegarde de Constitution (DD 8 + mod SAG + bonus de maîtrise) ou être étourdie jusqu\'à la fin de votre prochain tour.' },
        ],
        6: [
            { name: 'Frappes de Ki', description: 'Vos attaques à mains nues comptent comme magiques pour passer les résistances et immunités aux attaques non magiques.' },
            { name: 'Capacité de tradition', description: 'Vous gagnez une capacité propre à votre tradition monastique (voir sous-classe).' },
        ],
        7: [
            { name: 'Dérobade', description: 'Quand vous subissez des dégâts d\'un effet vous permettant un jet de sauvegarde de Dextérité, vous ne subissez aucun dégât si vous réussissez, et la moitié seulement si vous ratez.' },
            { name: 'Tranquillité de l\'esprit', description: 'Action : mettez fin à un effet qui vous charmé ou effrayé.' },
        ],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        9: [
            { name: 'Déplacement amélioré', description: 'Vous pouvez traverser les surfaces verticales et les liquides sans tomber pendant votre tour.' },
            { name: 'Frappes de Ki supérieures', description: 'Vos attaques à mains nues comptent comme magiques.' },
        ],
        10: [
            { name: 'Pureté du corps', description: 'Vous êtes immunisé aux maladies et au poison.' },
            { name: 'Capacité de tradition (2)', description: 'Vous gagnez une capacité propre à votre tradition monastique (voir sous-classe).' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Langue du soleil et de la lune', description: 'Vous comprenez toutes les langues parlées. Toute créature qui comprend une langue peut comprendre ce que vous dites.' }],
        14: [
            { name: 'Âme de diamant', description: 'Vous maîtrisez tous les jets de sauvegarde. De plus, quand vous ratez un jet de sauvegarde, vous pouvez dépenser 1 point de Ki pour le relancer.' },
            { name: 'Capacité de tradition (3)', description: 'Vous gagnez une capacité propre à votre tradition monastique (voir sous-classe).' },
        ],
        15: [{ name: 'Jeunesse éternelle', description: 'Vous ne souffrez plus des effets du vieillissement et vous ne pouvez pas être vieilli magiquement.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        18: [
            { name: 'Corps vide', description: 'Action : dépensez 4 points de Ki pour devenir invisible pendant 1 minute. De plus, vous avez résistance à tous les dégâts sauf force. Vous pouvez aussi dépenser 8 points de Ki pour lancer Astral (sans composantes matérielles).' },
            { name: 'Capacité de tradition (4)', description: 'Vous gagnez une capacité propre à votre tradition monastique (voir sous-classe).' },
        ],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Perfection de l\'être', description: 'Quand vous faites un jet d\'initiative et qu\'il ne vous reste aucun point de Ki, vous regagnez 4 points de Ki.' }],
    },
    paladin: {
        1: [
            { name: 'Sens divin', description: 'Action : jusqu\'à la fin de votre prochain tour, vous savez si une aberration, céleste, fiélon, élémentaire, fée ou mort-vivant se trouve à 18m (pas derrière un abri total). Vous localisez aussi les lieux consacrés/profanes.' },
            { name: 'Imposition des mains', description: 'Pool de PV = 5 × niveau de paladin. Action : touchez une créature pour lui rendre autant de PV que vous dépensez du pool, ou dépensez 5 PV pour guérir une maladie ou neutraliser un poison. Tout le pool est récupéré au repos long.' },
        ],
        2: [
            { name: 'Style de combat', description: 'Choisissez un style de combat : Archerie (+2 attaque distance), Combat à deux armes (mod dégâts off), Combat aux armes de jet (+2), Combat à grande arme (relance 1-2), Défense (+1 CA en armure), Duel (+2 dégâts à une main), Protection (désavantage attaque contre allié à 1,5m), Interception (réduction 1d10 + bonus de maîtrise).' },
            { name: 'Incantation', description: 'Lancez des sorts de Paladin avec le Charisme. Vous préparez vos sorts après un repos long. Niveau 2 : 2 emplacements niv 1.' },
            { name: 'Châtiment divin', description: 'Quand vous touchez en CàC : dépensez un emplacement de sort pour +2d8 dégâts radiants (+1d8 si cible = mort-vivant ou fiélon, +1d8 si vous avez déclaré avant le jet). Niveau 3+ = 3d8, niv 4+ = 4d8, etc.' },
        ],
        3: [
            { name: 'Santé divine', description: 'Immunité aux maladies. Vous ne pouvez pas être affecté par une maladie.' },
            { name: 'Serment sacré', description: 'Choisissez votre serment : Dévotion, Anciens, Vengeance (PHB) ; Conquête, Rédemption (XGtE) ; Gloire, Sentinelles (TCoE).' },
            { name: 'Canal divin', description: 'Canalisez l\'énergie divine pour utiliser une aptitude de Canal divin de votre serment. 1/repos court au niv. 3, 2 au niv. 6, 3 au niv. 18.' },
        ],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer (au lieu d\'une).' },
        ],
        6: [{ name: 'Aura de protection', description: 'Vous et les alliés à 3m gagnez +mod CHA aux jets de sauvegarde (min +1). Portée 9m au niv 18. Nécessite être conscient.' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        10: [{ name: 'Aura de courage', description: 'Vous et les alliés à 3m ne pouvez pas être effrayés. Portée 9m au niv 18. Nécessite être conscient.' }],
        11: [{ name: 'Châtiment divin amélioré', description: '+1d8 dégâts radiants à chaque attaque au corps à corps (pas besoin d\'emplacement). S\'ajoute au Châtiment divin déclenché.' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        14: [{ name: 'Contact purificateur', description: 'Action : touchez-vous ou une créature consentante à votre portée pour mettre fin à un sort la ciblant. 1 + mod CHA fois par repos long.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        18: [{ name: 'Amélioration d\'aura', description: 'Vos auras (Protection et Courage) s\'étendent à 9m au lieu de 3m.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Aptitude de serment (niv 20)', description: 'Chaque serment confère une capacité puissante au niveau 20 (Nimbe sacré, Ange vengeur, Conquérant invincible, Émissaire de la rédemption, Légende vivante, Rempart mortel).' }],
    },
    ranger: {
        1: [
            { name: 'Ennemi juré', description: 'Choisissez un type d\'ennemi juré (aberrations, bêtes, célestes, constructeurs, dragons, élémentaires, fées, fiélons, géants, morts-vivants, oozes, plantes, ou humanoïdes : 2 races). Vous avez l\'avantage aux tests de Sagesse (Survie) pour pister et Intelligence pour vous souvenir d\'informations à leur sujet. Vous apprenez une langue associée à votre ennemi juré.' },
            { name: 'Explorateur-né', description: 'Choisissez un terrain favori (arctique, côtes, désert, forêt, prairie, montagne, marais, souterrain, urbain). Dans ce terrain : difficulté du terrain ne vous ralentit pas ; ignorez les plantes non magiques dangereuses ; seul : voyage furtif, fourrage, pistage sans ralentir. Maîtrise d\'une compétence parmi Dressage, Nature ou Survie (si déjà maîtrisée, bonus doublé).' },
        ],
        2: [
            { name: 'Style de combat', description: 'Choisissez un style de combat : Archerie (+2 attaque distance), Défense (+1 CA en armure), Duel (+2 dégâts à une main), Combat à grande arme (relance 1-2), Protection (désavantage attaque contre allié à 1,5m), Combat à deux armes (mod dégâts off), Combat aux armes de jet (+2 dégâts jet), Interception (réduction 1d10 + bonus maîtrise).' },
            { name: 'Incantation', description: 'Lancez des sorts de Rôdeur avec la Sagesse. Vous préparez vos sorts après un repos long. Niveau 2 : 2 emplacements de niveau 1. Progression demi-incantateur.' },
        ],
        3: [{ name: 'Archétype de rôdeur', description: 'Choisissez votre conclave de rôdeur : Chasseur, Maître des Bêtes (PHB) ; Traqueur des Ombres, Marcheur de l\'Horizon, Pourfendeur (XGtE) ; Vagabond Féerique, Gardien des Essaims (TCoE).' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois, au lieu d\'une seule, chaque fois que vous réalisez l\'action Attaquer durant votre tour.' },
            { name: 'Ennemi juré amélioré', description: 'Vous choisissez un deuxième ennemi juré et apprenez une langue associée.' },
        ],
        6: [
            { name: 'Ennemi juré amélioré', description: 'Vous choisissez un deuxième ennemi juré et apprenez une langue associée.' },
            { name: 'Explorateur-né amélioré', description: 'Vous choisissez un deuxième terrain favori.' },
        ],
        8: [
            { name: 'Foulée tellurique', description: 'Le terrain difficile ne vous ralentit plus, même s\'il est causé par un sort ou une créature magique. Avantage aux jets de sauvegarde contre les plantes non magiques dangereuses et les créatures de terrain difficile qui infligent des dégâts ou des états.' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        10: [
            { name: 'Se fondre dans le décor', description: 'Action : prenez 1 minute pour vous camoufler avec des matériaux naturels. Tant que vous restez immobile et dissimulé, les autres créatures subissent un malus de -10 à leurs tests de Sagesse (Perception) pour vous détecter.' },
            { name: 'Explorateur-né amélioré', description: 'Vous choisissez un troisième terrain favori.' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Ennemi juré supérieur', description: 'Vous choisissez un troisième ennemi juré. De plus, vous avez l\'avantage aux jets de sauvegarde contre les sorts et les capacités de vos ennemis jurés.' }],
        14: [{ name: 'Disparition', description: 'Action bonus : utilisez l\'action Se cacher. Vous ne pouvez pas être pisté par des moyens magiques, à moins que le lanceur ne réussisse un test d\'Arcanes contre un DD de 8 + bonus de maîtrise + mod SAG.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        18: [{ name: 'Sens sauvages', description: 'Vous détectez les créatures invisibles à 9m (à condition qu\'elles ne soient pas derrière un abri total). Vous n\'êtes pas aveuglé par les attaques qui nécessitent de voir la cible (ex : regard de méduse).' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Tueur d\'ennemis', description: 'Une fois par tour, ajoutez votre modificateur de Sagesse aux dégâts que vous infligez à un ennemi juré, OU ajoutez votre modificateur de Sagesse à un jet d\'attaque contre un ennemi juré.' }],
    },
    bard: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Barde avec le Charisme comme caractéristique d\'incantation. Vous préparez vos sorts après un repos long. Nombre de sorts préparés = niveau de barde + mod CHA (min 1). Vous connaissez 3 sorts mineurs au niveau 1, 4 au niveau 4, 5 au niveau 10.' },
            { name: 'Inspiration bardique', description: 'Action bonus : donnez un dé d6 à une créature autre que vous à 18m. Elle peut l\'ajouter à un jet d\'attaque, test de caractéristique ou jet de sauvegarde dans les 10 minutes. Utilisations = mod CHA (minimum 1). Récupéré au repos court ou long. Le dé passe à d8 au niveau 5, d10 au niveau 10, d12 au niveau 15.' },
        ],
        2: [
            { name: 'Touche-à-tout', description: 'Ajoutez la moitié de votre bonus de maîtrise (arrondi à l\'inférieur) aux tests de caractéristique où vous n\'avez pas déjà de bonus de maîtrise.' },
            { name: 'Chant reposant', description: 'Si vous utilisez Chant reposant au cours d\'un repos court, chaque créature de votre choix qui récupère des PV regagne +1d6 PV supplémentaires. Le dé passe à d8 au niveau 9, d10 au niveau 13, d12 au niveau 17.' },
        ],
        3: [
            { name: 'Collège bardique', description: 'Choisissez votre collège bardique : Savoir, Vaillance (PHB) ; Glamour, Épées, Murmures (XGtE) ; Création, Éloquence (TCoE).' },
            { name: 'Expertise', description: 'Choisissez 2 compétences maîtrisées. Votre bonus de maîtrise est doublé pour les tests de ces compétences. Vous en choisissez 2 de plus au niveau 10.' },
        ],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [{ name: 'Inspiration bardique', description: 'Le dé d\'inspiration passe à d8.' }],
        6: [
            { name: 'Contre-charme', description: 'Action : jusqu\'à la fin de votre prochain tour, les créatures de votre choix à 9m ont l\'avantage aux jets de sauvegarde contre le charme et la peur. Nécessite une représentation musicale.' },
            { name: 'Aptitude de collège', description: 'Vous gagnez une aptitude propre à votre collège bardique (voir sous-classe).' },
        ],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        9: [{ name: 'Chant reposant', description: 'Le dé de Chant reposant passe à d8.' }],
        10: [
            { name: 'Inspiration bardique', description: 'Le dé d\'inspiration passe à d10.' },
            { name: 'Expertise (2)', description: 'Choisissez 2 compétences maîtrisées supplémentaires. Leur bonus de maîtrise est doublé.' },
            { name: 'Secrets magiques', description: 'Apprenez 2 sorts de n\'importe quelle classe. Ils comptent comme des sorts de barde et n\'occupent pas d\'emplacement dans votre grimoire.' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        13: [{ name: 'Chant reposant', description: 'Le dé de Chant reposant passe à d10.' }],
        14: [
            { name: 'Secrets magiques (2)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe.' },
            { name: 'Aptitude de collège (2)', description: 'Vous gagnez une aptitude propre à votre collège bardique (voir sous-classe).' },
        ],
        15: [{ name: 'Inspiration bardique', description: 'Le dé d\'inspiration passe à d12.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        17: [{ name: 'Chant reposant', description: 'Le dé de Chant reposant passe à d12.' }],
        18: [{ name: 'Secrets magiques (3)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Inspiration supérieure', description: 'Quand vous faites un jet d\'initiative et qu\'il ne vous reste aucune Inspiration bardique, vous en regagnez une.' }],
    },
    cleric: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Clerc avec la Sagesse comme caractéristique d\'incantation. Vos sorts de Clerc utilisent la liste de sorts du Clerc.' },
            { name: 'Domaine divin', description: 'Choisissez votre domaine divin : Savoir, Vie, Lumière, Nature, Tempête, Tromperie, Guerre (PHB) ; Forge, Tombe (XGtE) ; Paix, Crépuscule (TCoE).' },
        ],
        2: [{ name: 'Canal divin', description: 'Canalisez l\'énergie divine pour utiliser une aptitude de Canal divin de votre domaine. 1/repos court au niv. 2, 2 au niv. 6, 3 au niv. 18.' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        5: [{ name: 'Destruction des morts-vivants', description: 'Action : présentez votre symbole sacré. Tous les morts-vivants à 9m d\'un FP ≤ 1/2 doivent réussir un JS Sagesse ou être détruits.' }],
        6: [{ name: 'Canal divin (2)', description: 'Canal divin 2 fois par repos court ou long.' }],
        8: [
            { name: 'Destruction des morts-vivants (2)', description: 'Affecte les morts-vivants jusqu\'à FP 1. Action : présentez votre symbole sacré.' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
            { name: 'Coups divins / Potentiellement sacré', description: 'Niveau 8 : ajoutez 1d8 dégâts radiants à une attaque avec une arme (niv. 14 = 2d8).' },
        ],
        10: [{ name: 'Intervention divine', description: 'Action : implorez votre divinité d\'intervenir. Lancez un d100 : si le résultat est ≤ votre niveau de Clerc, votre divinité intervient (au choix du MJ). Une fois réussie, ne peut être réutilisée pendant 7 jours.' }],
        11: [{ name: 'Destruction des morts-vivants (3)', description: 'Affecte les morts-vivants jusqu\'à FP 2.' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        14: [{ name: 'Destruction des morts-vivants (4)', description: 'Affecte les morts-vivants jusqu\'à FP 3.' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        17: [{ name: 'Destruction des morts-vivants (5)', description: 'Affecte les morts-vivants jusqu\'à FP 4.' }],
        18: [{ name: 'Canal divin (3)', description: 'Canal divin 3 fois par repos court ou long.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Intervention divine améliorée', description: 'Intervention divine réussit automatiquement (pas de jet de dé nécessaire). Une fois utilisée, ne peut être réutilisée pendant 7 jours.' }],
    },
    druid: {
        1: [
            { name: 'Druidique', description: 'Vous connaissez le Druidique, le langage secret des druides. Vous pouvez le parler et l\'utiliser pour laisser des messages cachés.' },
            { name: 'Incantation', description: 'Lancez des sorts de Druide avec la Sagesse. Vous préparez vos sorts après un repos long. Niveau 1 : 2 emplacements niv 1, 2 sorts préparés (+ mod SAG). Vous ne portez pas d\'armure métallique.' },
        ],
        2: [
            { name: 'Cercle druidique', description: 'Choisissez votre cercle druidique : Cercle de la Terre, Cercle de la Lune (PHB) ; Cercle des Rêves, Cercle du Berger (XGtE) ; Cercle des Spores, Cercle des Étoiles, Cercle des Flammes (TCoE).' },
            { name: 'Forme sauvage', description: 'Action : transformez-vous en bête que vous avez vue (FP max 1/4, pas de vol/nage). Vous adoptez ses PV, CA, FOR, DEX, CON. Vous conservez SAG, INT, CHA, JS, bonus de maîtrise. Vous ne pouvez pas lancer de sorts. 2 utilisations/repos court.' },
        ],
        3: [
            { name: 'Sorts de cercle', description: 'Votre cercle vous confère des sorts toujours préparés (voir sous-classe).' },
        ],
        4: [
            { name: 'Forme sauvage améliorée', description: 'Vous pouvez vous transformer en bête de FP 1/2 maximum. Vous pouvez prendre une forme avec vitesse de nage.' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        6: [
            { name: 'Capacité de cercle', description: 'Vous gagnez une capacité propre à votre cercle druidique (voir sous-classe).' },
        ],
        8: [
            { name: 'Forme sauvage améliorée (2)', description: 'Vous pouvez vous transformer en bête de FP 1 maximum. Vous pouvez prendre une forme avec vitesse de vol.' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        9: [
            { name: 'Immuabilité biologique', description: 'Vous gagnez l\'avantage aux jets de sauvegarde contre les maladies et le poison.' },
        ],
        10: [
            { name: 'Capacité de cercle (2)', description: 'Vous gagnez une capacité propre à votre cercle druidique (voir sous-classe).' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        14: [
            { name: 'Capacité de cercle (3)', description: 'Vous gagnez une capacité propre à votre cercle druidique (voir sous-classe).' },
        ],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        18: [{ name: 'Corps intemporel', description: 'Le temps ne laisse plus de traces sur votre corps. Vous ne vieillissez plus et ne pouvez pas être vieilli magiquement. Vous vieillissez 10 fois plus lentement.' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [{ name: 'Archidruide', description: 'Vous pouvez utiliser Forme sauvage un nombre illimité de fois. Vous ignorez les composantes verbales et somatiques de vos sorts de Druide, ainsi que les composantes matérielles qui n\'ont pas de coût et ne sont pas consommées par le sort.' }],
    },
    sorcerer: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts d\'Ensorceleur avec le Charisme comme caractéristique d\'incantation. Vous connaissez un nombre fixe de sorts (4 au niv 1) et ne pouvez pas les préparer. Vous regagnez tous vos emplacements au repos long. Vous connaissez 4 tours de magie au niv 1, 5 au niv 4, 6 au niv 10.' },
            { name: 'Origine magique', description: 'Choisissez votre origine magique : Lignée draconique, Magie sauvage (PHB) ; Âme divine, Magie de l\'Ombre, Sorcellerie de Tempête (XGtE) ; Esprit aberrant, Âme mécanique (TCoE).' },
        ],
        2: [
            { name: 'Source de magie', description: 'Vous gagnez 2 points de sorcellerie (max = niveau d\'Ensorceleur). Dépensez-les pour créer des emplacements de sort (1 pt = niv 1, 2 pts = niv 2, etc.) ou pour des capacités de Métamagie.' },
            { name: 'Métamagie', description: 'Choisissez 2 options de Métamagie : Sort accru, Sort ciblé, Sort distant, Sort prolongé, Sort jumeau, Sort subtil, Sort rapide, Sort soigné, etc. Dépensez des points de sorcellerie pour les activer.' },
        ],
        3: [
            { name: 'Métamagie', description: '2 options de Métamagie choisies.' },
        ],
        4: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        6: [
            { name: 'Aptitude d\'origine magique', description: 'Vous gagnez une capacité propre à votre origine magique (voir sous-classe).' },
        ],
        8: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        10: [
            { name: 'Métamagie (2)', description: 'Choisissez 1 option de Métamagie supplémentaire (total 3).' },
        ],
        12: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        14: [
            { name: 'Aptitude d\'origine magique (2)', description: 'Vous gagnez une capacité propre à votre origine magique (voir sous-classe).' },
        ],
        16: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        17: [
            { name: 'Métamagie (3)', description: 'Choisissez 1 option de Métamagie supplémentaire (total 4).' },
        ],
        18: [
            { name: 'Aptitude d\'origine magique (3)', description: 'Vous gagnez une capacité propre à votre origine magique (voir sous-classe).' },
        ],
        19: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        20: [
            { name: 'Restauration de sorcellerie', description: 'Regagnez 4 points de sorcellerie lorsque vous terminez un repos court.' },
        ],
    },
    warlock: {
        1: [
            { name: 'Protecteur d\'outre-monde', description: 'Choisissez votre protecteur d\'outre-monde : Le Fiélon, L\'Archifée, Le Grand Ancien (PHB) ; Le Céleste, Le Maître des Lames (XGtE) ; Le Fathomless, Le Génie (TCoE).' },
            { name: 'Magie de pacte', description: 'Vos emplacements de sorts sont tous du même niveau (niv 1-5 selon votre niveau d\'Occultiste) et reviennent au repos court. Vous connaissez 2 tours de magie et 2 sorts de niveau 1. Vous lancez avec le Charisme.' },
        ],
        2: [
            { name: 'Invocations occultes', description: 'Choisissez 2 invocations occultes parmi une liste spéciale. Certaines nécessitent un niveau ou un pacte minimum. Vous en gagnez une supplémentaire aux niveaux 5, 7, 9, 12, 15 et 18 (max 8 au niv 18).' },
        ],
        3: [
            { name: 'Pacte', description: 'Choisissez un Pacte : Pacte de la Chaîne (familiar amélioré), Pacte de la Lame (arme de pacte), Pacte du Grimoire (rituels), Pacte du Talisman (talisman magique, TCoE).' },
        ],
        4: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        5: [
            { name: 'Invocations occultes supplémentaires', description: 'Vous gagnez une 3e invocation occulte. Des invocations de niveau 5 sont maintenant disponibles.' },
        ],
        6: [
            { name: 'Aptitude de protecteur', description: 'Vous gagnez une capacité propre à votre protecteur d\'outre-monde (voir sous-classe).' },
        ],
        8: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        9: [
            { name: 'Invocations occultes supplémentaires (2)', description: 'Vous gagnez une 4e invocation occulte. Des invocations de niveau 9 sont maintenant disponibles.' },
        ],
        10: [
            { name: 'Aptitude de protecteur (2)', description: 'Vous gagnez une capacité propre à votre protecteur d\'outre-monde (voir sous-classe).' },
        ],
        11: [
            { name: 'Arcanum mystique (6)', description: 'Vous pouvez lancer un sort de niveau 6 choisi une fois par jour sans dépenser d\'emplacement.' },
        ],
        12: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        13: [
            { name: 'Arcanum mystique (7)', description: 'Vous pouvez lancer un sort de niveau 7 choisi une fois par jour sans dépenser d\'emplacement.' },
        ],
        14: [
            { name: 'Aptitude de protecteur (3)', description: 'Vous gagnez une capacité propre à votre protecteur d\'outre-monde (voir sous-classe).' },
        ],
        15: [
            { name: 'Arcanum mystique (8)', description: 'Vous pouvez lancer un sort de niveau 8 choisi une fois par jour sans dépenser d\'emplacement.' },
        ],
        16: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        17: [
            { name: 'Arcanum mystique (9)', description: 'Vous pouvez lancer un sort de niveau 9 choisi une fois par jour sans dépenser d\'emplacement.' },
        ],
        19: [
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' },
        ],
        20: [
            { name: 'Maître occulte', description: 'Une fois par jour, vous pouvez regagner tous vos emplacements de sort dépensés en 1 minute.' },
        ],
    },
    wizard: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Magicien avec l\'Intelligence comme caractéristique d\'incantation. Vous préparez vos sorts depuis votre grimoire après un repos long. Nombre de sorts préparés = niveau de magicien + mod INT (min 1).' },
            { name: 'Récupération arcanique', description: 'Une fois par jour, au repos court, récupérez des emplacements de sort dont le total des niveaux est ≤ la moitié de votre niveau de magicien (arrondi au supérieur). Aucun emplacement de niveau 6+.' },
            { name: 'Grimoire', description: 'Vous disposez d\'un grimoire contenant 6 sorts de niveau 1. Vous pouvez copier de nouveaux sorts en dépensant du temps et de l\'or (2 heures et 50 po par niveau de sort). Vous ajoutez automatiquement 2 sorts au grimoire à chaque gain de niveau.' },
        ],
        2: [
            { name: 'Tradition arcanique', description: 'Choisissez votre tradition arcanique : Évocation, Abjuration, Conjuration, Divination, Enchantement, Illusion, Nécromancie, Transmutation (PHB) ; Magie de Guerre (XGtE) ; Chant de Lame, Ordre des Scribes (TCoE).' },
            { name: 'Aptitude de tradition', description: 'Vous gagnez une aptitude propre à votre tradition arcanique (voir sous-classe).' },
        ],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        6: [{ name: 'Aptitude de tradition (2)', description: 'Vous gagnez une aptitude propre à votre tradition arcanique (voir sous-classe).' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        10: [{ name: 'Aptitude de tradition (3)', description: 'Vous gagnez une aptitude propre à votre tradition arcanique (voir sous-classe).' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        14: [{ name: 'Aptitude de tradition (4)', description: 'Vous gagnez une aptitude propre à votre tradition arcanique (voir sous-classe).' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        18: [
            { name: 'Maîtrise des sorts', description: 'Choisissez 2 sorts de niveau 1 et 2 sorts de niveau 2. Vous pouvez les lancer au niveau minimum sans dépenser d\'emplacement. Vous pouvez les lancer à des niveaux supérieurs en dépensant un emplacement.' },
        ],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique de votre choix, ou +1 à deux caractéristiques. Vous ne pouvez pas dépasser 20 par ce biais (sauf capacité spécifique).' }],
        20: [
            { name: 'Sorts de prédilection', description: 'Choisissez 2 sorts de niveau 3. Vous les avez toujours préparés et pouvez les lancer une fois chacun au niveau 3 sans dépenser d\'emplacement. Récupéré au repos court ou long.' },
        ],
    },
}

// Obtenir les aptitudes gagnées à un niveau donné
export function getClassFeaturesAtLevel(classId: string, level: number): ClassFeature[] {
    return classFeaturesByLevel[classId]?.[level] || []
}

// Obtenir les niveaux où la classe gagne un ASI (Amélioration de Caractéristique)
export function getClassASILevels(classId: string): number[] {
    const features = classFeaturesByLevel[classId]
    if (!features) return []

    return Object.entries(features)
        .filter(([, feats]) => feats.some(f => f.name === 'Amélioration de caractéristique'))
        .map(([level]) => parseInt(level))
        .sort((a, b) => a - b)
}
