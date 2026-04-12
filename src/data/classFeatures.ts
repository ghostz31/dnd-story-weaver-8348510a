// Données de progression par classe et niveau

// Progression des Rages du Barbarian
export const barbarianRages: number[] = [2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 6, 6, 6, 999]

// Bonus de dégâts de Rage
export const barbarianRageDamage: number[] = [2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4]

// Sneak Attack du Roublard (en nombre de d6)
export const rogueSneakAttackDice: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10]

// Points de Ki du Moine (= niveau, mais commence à 2)
export const monkKiPoints: number[] = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// Dé d'arts martiaux du Moine
export const monkMartialArtsDie: string[] = [
    'd4', 'd4', 'd4', 'd4', 'd6', 'd6', 'd6', 'd6', 'd6', 'd6',
    'd8', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10', 'd10', 'd10', 'd10'
]

// Points de Sorcellerie (= niveau pour Ensorceleur)
export const sorcererSorceryPoints: number[] = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]

// Dé d'Inspiration Bardique
export const bardInspirationDie: string[] = [
    'd6', 'd6', 'd6', 'd6', 'd8', 'd8', 'd8', 'd8', 'd8', 'd10',
    'd10', 'd10', 'd10', 'd10', 'd12', 'd12', 'd12', 'd12', 'd12', 'd12'
]

// Niveau maximum de slot Warlock
export const warlockSlotLevel: number[] = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5]

// Nombre de slots Warlock
export const warlockSlotCount: number[] = [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4]

// Aptitudes de classe par niveau (descriptions courtes FR)
export interface ClassFeature {
    name: string
    description: string
}

export const classFeaturesByLevel: Record<string, Record<number, ClassFeature[]>> = {
    barbarian: {
        1: [
            { name: 'Rage', description: 'Entrez en rage pour +2 dégâts, résistance aux dégâts physiques' },
            { name: 'Défense sans armure', description: 'CA = 10 + mod DEX + mod CON sans armure' },
        ],
        2: [
            { name: 'Attaque téméraire', description: 'Avantage aux attaques avec Force, mais les attaques contre vous ont aussi l\'avantage' },
            { name: 'Sens du danger', description: 'Avantage aux jets de sauvegarde de Dextérité' },
        ],
        3: [{ name: 'Voie primitive', description: 'Choisissez votre sous-classe de Barbare' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer' },
            { name: 'Déplacement rapide', description: '+10 ft de vitesse sans armure lourde' },
        ],
        7: [{ name: 'Instinct sauvage', description: 'Avantage à l\'initiative, agissez même si surpris' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        9: [{ name: 'Critique brutal', description: '+1 dé de dégâts sur les coups critiques' }],
        11: [{ name: 'Rage implacable', description: 'Si vous tombez à 0 PV en rage, faites un JS CON DD 10' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        13: [{ name: 'Critique brutal (2)', description: '+2 dés de dégâts sur les coups critiques' }],
        15: [{ name: 'Rage persistante', description: 'Votre rage ne s\'arrête que si vous le voulez' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        17: [{ name: 'Critique brutal (3)', description: '+3 dés de dégâts sur les coups critiques' }],
        18: [{ name: 'Puissance indomptable', description: 'Utilisez FOR à la place du résultat d\'un test de Force' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Champion primitif', description: '+4 FOR et CON (max 24)' }],
    },
    fighter: {
        1: [
            { name: 'Style de combat', description: 'Choisissez un style de combat' },
            { name: 'Second souffle', description: 'Récupérez 1d10 + niveau PV en action bonus' },
        ],
        2: [{ name: 'Fougue', description: 'Une action supplémentaire par tour (1/repos)' }],
        3: [{ name: 'Archétype martial', description: 'Choisissez votre sous-classe de Guerrier' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer' }],
        6: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        9: [{ name: 'Indomptable', description: 'Relancez un jet de sauvegarde raté (1/repos)' }],
        11: [{ name: 'Attaque supplémentaire (2)', description: 'Attaquez trois fois par action Attaquer' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        13: [{ name: 'Indomptable (2)', description: 'Indomptable 2 fois par repos' }],
        14: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        17: [
            { name: 'Fougue (2)', description: 'Fougue 2 fois par repos' },
            { name: 'Indomptable (3)', description: 'Indomptable 3 fois par repos' },
        ],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Attaque supplémentaire (3)', description: 'Attaquez quatre fois par action Attaquer' }],
    },
    rogue: {
        1: [
            { name: 'Expertise', description: 'Doublez le bonus de maîtrise pour 2 compétences' },
            { name: 'Attaque sournoise', description: 'Infligez des dégâts supplémentaires avec avantage' },
            { name: 'Jargon des voleurs', description: 'Langage secret des voleurs' },
        ],
        2: [{ name: 'Ruse', description: 'Action bonus : Se cacher, Se désengager, ou Foncer' }],
        3: [{ name: 'Archétype de roublard', description: 'Choisissez votre sous-classe de Roublard' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Esquive instinctive', description: 'Utilisez votre réaction pour réduire de moitié les dégâts d\'une attaque' }],
        6: [{ name: 'Expertise', description: 'Doublez le bonus de maîtrise pour 2 compétences supplémentaires' }],
        7: [{ name: 'Dérobade', description: 'JS DEX réussi = 0 dégât, raté = demi-dégâts' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        10: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        11: [{ name: 'Talent fiable', description: 'Minimum 10 aux jets de compétences maîtrisées' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        14: [{ name: 'Perception aveugle', description: 'Détectez les créatures invisibles à 3m' }],
        15: [{ name: 'Esprit fuyant', description: 'Maîtrise des jets de sauvegarde de Sagesse' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Insaisissable', description: 'Les attaques n\'ont jamais l\'avantage contre vous' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Coup de chance', description: 'Transformez un échec en succès (1/repos)' }],
    },
    monk: {
        1: [
            { name: 'Défense sans armure', description: 'CA = 10 + mod DEX + mod SAG sans armure' },
            { name: 'Arts martiaux', description: 'Utilisez DEX pour les attaques à mains nues, dé spécial' },
        ],
        2: [
            { name: 'Ki', description: 'Points de Ki égaux à votre niveau de Moine' },
            { name: 'Déplacement sans armure', description: '+10 ft de vitesse sans armure' },
        ],
        3: [
            { name: 'Tradition monastique', description: 'Choisissez votre sous-classe de Moine' },
            { name: 'Parade de projectiles', description: 'Réduisez les dégâts de projectiles' },
        ],
        4: [
            { name: 'Chute ralentie', description: 'Réduisez les dégâts de chute' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' },
        ],
        5: [
            { name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer' },
            { name: 'Frappe étourdissante', description: 'Étourdissez une cible avec du Ki' },
        ],
        6: [{ name: 'Frappes de Ki', description: 'Vos attaques à mains nues comptent comme magiques' }],
        7: [
            { name: 'Dérobade', description: 'JS DEX réussi = 0 dégât, raté = demi-dégâts' },
            { name: 'Tranquillité de l\'esprit', description: 'Action : mettez fin aux effets de charme/peur' },
        ],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        10: [{ name: 'Pureté du corps', description: 'Immunité aux maladies et poisons' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        13: [{ name: 'Langue du soleil et de la lune', description: 'Comprenez toutes les langues' }],
        14: [{ name: 'Âme de diamant', description: 'Maîtrise de tous les jets de sauvegarde' }],
        15: [{ name: 'Jeunesse éternelle', description: 'Vous ne souffrez plus de la vieillesse' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Corps vide', description: 'Devenez invisible (4 Ki)' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Perfection de l\'être', description: 'Regagnez 4 Ki si vous n\'en avez plus au jet d\'initiative' }],
    },
    paladin: {
        1: [
            { name: 'Sens divin', description: 'Détectez les célestes, fiélons et morts-vivants' },
            { name: 'Imposition des mains', description: 'Soignez niveau × 5 PV par jour' },
        ],
        2: [
            { name: 'Style de combat', description: 'Choisissez un style de combat' },
            { name: 'Incantation', description: 'Lancez des sorts de Paladin' },
            { name: 'Châtiment divin', description: 'Dépensez un emplacement pour +2d8 dégâts radiants' },
        ],
        3: [
            { name: 'Santé divine', description: 'Immunité aux maladies' },
            { name: 'Serment sacré', description: 'Choisissez votre sous-classe de Paladin' },
        ],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer' }],
        6: [{ name: 'Aura de protection', description: '+mod CHA aux JS pour vous et alliés proches' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        10: [{ name: 'Aura de courage', description: 'Immunité à la peur pour vous et alliés proches' }],
        11: [{ name: 'Châtiment divin amélioré', description: '+1d8 dégâts radiants à chaque attaque au corps à corps' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        14: [{ name: 'Contact purificateur', description: 'Mettez fin à un sort sur vous ou un allié' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Amélioration d\'aura', description: 'Auras étendues à 9 mètres' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
    },
    ranger: {
        1: [
            { name: 'Ennemi juré', description: 'Avantages contre un type de créatures' },
            { name: 'Explorateur-né', description: 'Avantages en terrain favori' },
        ],
        2: [
            { name: 'Style de combat', description: 'Choisissez un style de combat' },
            { name: 'Incantation', description: 'Lancez des sorts de Rôdeur' },
        ],
        3: [{ name: 'Archétype de rôdeur', description: 'Choisissez votre sous-classe de Rôdeur' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer' }],
        8: [
            { name: 'Foulée tellurique', description: 'Le terrain difficile ne vous ralentit plus' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' },
        ],
        10: [{ name: 'Se fondre dans le décor', description: 'Camouflage naturel pendant 1 minute' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        14: [{ name: 'Disparition', description: 'Utilisez Se cacher en action bonus' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Sens sauvages', description: 'Détectez les créatures invisibles à 9m' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Tueur d\'ennemis', description: '+mod SAG aux dégâts contre ennemis jurés' }],
    },
    bard: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Barde avec le Charisme' },
            { name: 'Inspiration bardique', description: 'Donnez un dé bonus à un allié (dé d6)' },
        ],
        2: [
            { name: 'Touche-à-tout', description: '+demi maîtrise aux compétences non maîtrisées' },
            { name: 'Chant reposant', description: 'Alliés récupèrent +1d6 PV au repos court' },
        ],
        3: [
            { name: 'Collège bardique', description: 'Choisissez votre sous-classe de Barde' },
            { name: 'Expertise', description: 'Doublez le bonus de maîtrise pour 2 compétences' },
        ],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d8' }],
        6: [{ name: 'Contre-charme', description: 'Alliés ont avantage contre charme et peur' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        10: [
            { name: 'Secrets magiques', description: 'Apprenez 2 sorts de n\'importe quelle classe' },
            { name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d10' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        14: [{ name: 'Secrets magiques (2)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe' }],
        15: [{ name: 'Inspiration bardique', description: 'Dé d\'inspiration passe à d12' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Secrets magiques (3)', description: 'Apprenez 2 sorts supplémentaires de n\'importe quelle classe' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Inspiration supérieure', description: 'Regagnez 1 Inspiration si vous n\'en avez plus' }],
    },
    cleric: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Clerc avec la Sagesse' },
            { name: 'Domaine divin', description: 'Choisissez votre sous-classe de Clerc' },
        ],
        2: [{ name: 'Conduit divin', description: 'Canalisez l\'énergie divine (1/repos)' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Destruction des morts-vivants', description: 'Détruisez les morts-vivants faibles' }],
        6: [{ name: 'Conduit divin (2)', description: 'Conduit divin 2 fois par repos' }],
        8: [
            { name: 'Destruction des morts-vivants (2)', description: 'Affecte les morts-vivants jusqu\'à FP 1' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' },
        ],
        10: [{ name: 'Intervention divine', description: 'Invoquez l\'aide de votre divinité (10%)' }],
        11: [{ name: 'Destruction des morts-vivants (3)', description: 'Affecte les morts-vivants jusqu\'à FP 2' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        14: [{ name: 'Destruction des morts-vivants (4)', description: 'Affecte les morts-vivants jusqu\'à FP 3' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        17: [{ name: 'Destruction des morts-vivants (5)', description: 'Affecte les morts-vivants jusqu\'à FP 4' }],
        18: [{ name: 'Conduit divin (3)', description: 'Conduit divin 3 fois par repos' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Intervention divine améliorée', description: 'Intervention divine réussit automatiquement' }],
    },
    druid: {
        1: [
            { name: 'Druidique', description: 'Langage secret des druides' },
            { name: 'Incantation', description: 'Lancez des sorts de Druide avec la Sagesse' },
        ],
        2: [
            { name: 'Cercle druidique', description: 'Choisissez votre sous-classe de Druide' },
            { name: 'Forme sauvage', description: 'Transformez-vous en animal (2/repos)' },
        ],
        4: [
            { name: 'Forme sauvage améliorée', description: 'Transformez-vous en animal FP 1/2' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' },
        ],
        8: [
            { name: 'Forme sauvage améliorée (2)', description: 'Transformez-vous en animal FP 1' },
            { name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' },
        ],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Corps intemporel', description: 'Vieillissez 10× plus lentement' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Archidruide', description: 'Forme sauvage illimitée' }],
    },
    sorcerer: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts d\'Ensorceleur avec le Charisme' },
            { name: 'Origine magique', description: 'Choisissez votre sous-classe d\'Ensorceleur' },
        ],
        2: [{ name: 'Source de magie', description: 'Points de Sorcellerie = niveau, Métamagie' }],
        3: [{ name: 'Métamagie', description: 'Choisissez 2 options de Métamagie' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        10: [{ name: 'Métamagie (2)', description: 'Choisissez 1 option de Métamagie supplémentaire' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        17: [{ name: 'Métamagie (3)', description: 'Choisissez 1 option de Métamagie supplémentaire' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Restauration de sorcellerie', description: 'Regagnez 4 points de sorcellerie au repos court' }],
    },
    warlock: {
        1: [
            { name: 'Protecteur d\'outre-monde', description: 'Choisissez votre sous-classe d\'Occultiste' },
            { name: 'Magie de pacte', description: 'Emplacements de sorts spéciaux qui reviennent au repos court' },
        ],
        2: [{ name: 'Invocations occultes', description: 'Choisissez 2 invocations occultes' }],
        3: [{ name: 'Pacte', description: 'Choisissez Pacte de la Chaîne, de la Lame, du Grimoire ou du Talisman' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        5: [{ name: 'Invocations occultes supplémentaires', description: 'Invocations de niveau 5 débloquées' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        11: [{ name: 'Arcanum mystique (6)', description: 'Lancez un sort de niveau 6 1/jour' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        13: [{ name: 'Arcanum mystique (7)', description: 'Lancez un sort de niveau 7 1/jour' }],
        15: [{ name: 'Arcanum mystique (8)', description: 'Lancez un sort de niveau 8 1/jour' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        17: [{ name: 'Arcanum mystique (9)', description: 'Lancez un sort de niveau 9 1/jour' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Maître occulte', description: 'Regagnez tous vos emplacements en 1 minute (1/jour)' }],
    },
    wizard: {
        1: [
            { name: 'Incantation', description: 'Lancez des sorts de Magicien avec l\'Intelligence' },
            { name: 'Récupération arcanique', description: 'Récupérez des emplacements au repos court' },
        ],
        2: [{ name: 'Tradition arcanique', description: 'Choisissez votre sous-classe de Magicien' }],
        4: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        8: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        12: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        16: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        18: [{ name: 'Maîtrise des sorts', description: '2 sorts de niveau 1 et 2 à volonté' }],
        19: [{ name: 'Amélioration de caractéristique', description: '+2 à une caractéristique, ou +1 à deux, ou choisissez un don' }],
        20: [{ name: 'Sorts de prédilection', description: '2 sorts de niveau 3 préparés gratuitement' }],
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
        .filter(([_, feats]) => feats.some(f => f.name === 'Amélioration de caractéristique'))
        .map(([level, _]) => parseInt(level))
        .sort((a, b) => a - b)
}
