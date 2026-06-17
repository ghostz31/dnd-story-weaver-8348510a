// Sous-classes de D&D 5e — données enrichies
// Sources : AideDD, 5e-drs, dnd5eapi.co (SRD 5.1)

import type { Rule } from '../types/aurora-v2'

export interface SubclassFeature {
    level: number
    name: string
    description: string
    rules?: Rule[]             // Rules mécaniques applicables (optionnel)
}

export interface Subclass {
    id: string
    classId: string
    name: string
    nameEn: string
    description: string
    source: string             // ex: 'PHB' = Player's Handbook
    subclassLevel: number      // Niveau auquel on choisit la sous-classe
    features: SubclassFeature[]
    rules?: Rule[]             // Rules globales de la sous-classe (optionnel)
}

export const subclasses: Subclass[] = [
    // ═══════════════════════════════════════════
    // BARBARE — Voie primitive (niveau 3)
    // ═══════════════════════════════════════════
    {
        id: 'berserker',
        classId: 'barbarian',
        name: 'Voie du Berserker',
        nameEn: 'Path of the Berserker',
        description: 'Une rage déchaînée qui vous consume entièrement, vous transformant en machine de destruction au prix de l\'épuisement.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Frénésie', description: 'En rage, vous pouvez effectuer une attaque au corps à corps supplémentaire en action bonus à chaque tour. À la fin de la rage, vous subissez un niveau d\'épuisement.',
                rules: [
                    { type: 'condition', condition: 'frenzy-extra-attack', description: 'Attaque supplémentaire en action bonus pendant la rage' }
                ]
            },
            {
                level: 6, name: 'Rage aveugle', description: 'Vous ne pouvez pas être charmé ou effrayé tant que vous êtes en rage. Si vous étiez charmé ou effrayé avant d\'entrer en rage, l\'effet est suspendu.',
                rules: [
                    { type: 'condition', condition: 'immunity-charmed-rage', description: 'Immunité au charme en rage' },
                    { type: 'condition', condition: 'immunity-frightened-rage', description: 'Immunité à la peur en rage' }
                ]
            },
            {
                level: 10, name: 'Présence intimidante', description: 'Utilisez votre action pour effrayer une créature. JS Sagesse DD = 8 + bonus de maîtrise + mod CHA. Effrayée jusqu\'à la fin de votre prochain tour.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'intimidating-presence' }
                ]
            },
            {
                level: 14, name: 'Représailles', description: 'Lorsqu\'une créature vous touche avec une attaque au corps à corps, vous pouvez utiliser votre réaction pour effectuer une attaque au corps à corps contre elle.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'retaliation' }
                ]
            },
        ],
    },
    {
        id: 'totem_warrior',
        classId: 'barbarian',
        name: 'Voie du Totem',
        nameEn: 'Path of the Totem Warrior',
        description: 'Un voyage spirituel où vous adoptez un animal totem comme guide, protecteur et source d\'inspiration.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Quêteur spirituel', description: 'Vous pouvez lancer Communication avec les animaux et Sens animal en tant que rituels.',
                rules: [
                    { type: 'spell', spellId: 'communication-avec-les-animaux', alwaysKnown: true },
                    { type: 'spell', spellId: 'sens-animal', alwaysKnown: true }
                ]
            },
            {
                level: 3, name: 'Esprit totem', description: 'Choisissez un animal totem : Ours (résistance à tous les dégâts sauf psychiques en rage), Aigle (les attaques d\'opportunité contre vous ont un désavantage + Foncer en action bonus en rage), ou Loup (vos alliés ont l\'avantage aux attaques au corps à corps contre les créatures à 1,5m de vous en rage).',
                rules: [
                    { type: 'select', name: 'Esprit totem', targetType: 'trait', count: 1, options: ['totem-bear', 'totem-eagle', 'totem-wolf'] }
                ]
            },
            {
                level: 6, name: 'Aspect de la bête', description: 'Choisissez : Ours (capacité de charge doublée, avantage Force pour pousser/tirer), Aigle (vision à 1,5 km, pas de désavantage Perception en lumière faible), ou Loup (pistage en rythme rapide, discrétion en rythme normal).',
                rules: [
                    { type: 'select', name: 'Aspect de la bête', targetType: 'trait', count: 1, options: ['aspect-bear', 'aspect-eagle', 'aspect-wolf'] }
                ]
            },
            {
                level: 10, name: 'Marcheur spirituel', description: 'Lancez Communion avec la nature comme rituel. Un esprit totem apparaît pour vous transmettre l\'information.',
                rules: [
                    { type: 'spell', spellId: 'communion-avec-la-nature', alwaysKnown: true }
                ]
            },
            {
                level: 14, name: 'Lien totémique', description: 'Choisissez : Ours (créatures hostiles à 1,5m ont désavantage aux attaques contre vos alliés), Aigle (vitesse de vol = vitesse au sol en rage, courts déplacements uniquement), ou Loup (action bonus pour renverser une créature de taille G ou inférieure touchée en CàC).',
                rules: [
                    { type: 'select', name: 'Lien totémique', targetType: 'trait', count: 1, options: ['totemic-bond-bear', 'totemic-bond-eagle', 'totemic-bond-wolf'] }
                ]
            },
        ],
    },
    {
        id: 'ancestral_guardian',
        classId: 'barbarian',
        name: 'Voie du Gardien Ancestral',
        nameEn: 'Path of the Ancestral Guardian',
        description: 'Vous invoquez les esprits de vos ancêtres guerriers pour protéger vos alliés et contrôler le champ de bataille.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Protecteurs ancestraux', description: 'En rage, la première créature que vous touchez à chaque tour est gênée par des esprits guerriers : désavantage aux attaques contre les autres, et ses cibles bénéficient de résistance aux dégâts.',
                rules: [
                    { type: 'condition', condition: 'ancestral-protectors', description: 'En rage, la première créature touchée a désavantage aux attaques contre les autres et ses cibles ont résistance aux dégâts' }
                ]
            },
            {
                level: 6, name: 'Bouclier spirituel', description: 'En rage, utilisez votre réaction pour réduire les dégâts subis par un allié visible à 9m de 2d6 (3d6 au niv 10, 4d6 au niv 14).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spirit-shield' }
                ]
            },
            {
                level: 10, name: 'Consulter les esprits', description: 'Lancez Augure ou Clairvoyance sans emplacement ni composantes matérielles. Sagesse est votre caractéristique d\'incantation. Utilisable bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'consult-spirits', name: 'Consulter les esprits', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Ancêtres vengeurs', description: 'Lorsque vous utilisez Bouclier spirituel, l\'attaquant subit des dégâts de force égaux aux dégâts réduits par le bouclier.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'spirit-shield-retaliation', damageType: 'force' }
                ]
            },
        ],
    },
    {
        id: 'storm_herald',
        classId: 'barbarian',
        name: 'Voie du Héraut de la Tempête',
        nameEn: 'Path of the Storm Herald',
        description: 'Vous canalisez votre rage en une aura de magie élémentaire primordiale — désert, mer ou toundra.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Aura de tempête', description: 'En rage, aura de 3m. Choisissez un environnement : Désert (2 dégâts feu aux créatures, scaling +1 niv 5/10/15/20), Mer (1d6 foudre JS DEX une cible, scaling 2d6/3d6/4d6), ou Toundra (2 PV temp aux alliés, scaling). Changez d\'environnement à chaque gain de niveau.',
                rules: [
                    { type: 'select', name: 'Environnement de tempête', targetType: 'trait', count: 1, options: ['storm-desert', 'storm-sea', 'storm-tundra'] }
                ]
            },
            {
                level: 6, name: 'Âme de tempête', description: 'Même hors rage : Désert (résistance feu), Mer (résistance foudre + respiration aquatique + nage 9m), ou Toundra (résistance froid).',
                rules: [
                    { type: 'condition', condition: 'storm-soul-resistance', description: 'Résistance selon l\'environnement choisi' }
                ]
            },
            {
                level: 10, name: 'Tempête protectrice', description: 'Les alliés dans votre aura bénéficient de résistance au type de dégâts de votre environnement choisi.',
                rules: [
                    { type: 'condition', condition: 'storm-shield-aura', description: 'Alliés dans l\'aura ont résistance au type de dégâts de l\'environnement' }
                ]
            },
            {
                level: 14, name: 'Tempête déchaînée', description: 'Désert (réaction : dégâts feu = niv barbare si touché par créature dans l\'aura), Mer (réaction : renverser une créature touchée dans l\'aura, JS Force), ou Toundra (vitesse réduite à 0 pour une créature dans l\'aura, JS Force).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'storm-rage-reaction' }
                ]
            },
        ],
    },
    {
        id: 'zealot',
        classId: 'barbarian',
        name: 'Voie du Zélote',
        nameEn: 'Path of the Zealot',
        description: 'Un guerrier qui canalise sa rage en démonstrations de pouvoir divin, transcendant même la mort au combat.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Fureur divine', description: 'En rage, la 1ère créature touchée par tour subit +1d6 + ½ niveau de barbare dégâts supplémentaires (radiant ou nécrotique, choisi à l\'obtention).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'divine-fury-first-hit', damageType: 'radiant' }
                ]
            },
            {
                level: 3, name: 'Guerrier des dieux', description: 'Les sorts qui vous ramènent à la vie (comme Rappel à la vie) n\'ont pas besoin de composantes matérielles.',
                rules: [
                    { type: 'condition', condition: 'warrior-of-the-gods', description: 'Pas de composantes matérielles pour les sorts de résurrection' }
                ]
            },
            {
                level: 6, name: 'Concentration fanatique', description: 'Si vous ratez un JS en rage, vous pouvez le relancer (1 fois par rage).',
                rules: [
                    { type: 'condition', condition: 'fanatical-focus', description: 'Relance d\'un JS raté en rage (1 fois par rage)' }
                ]
            },
            {
                level: 10, name: 'Présence zélée', description: 'Action bonus : jusqu\'à 10 créatures à 18m qui vous entendent gagnent avantage aux jets d\'attaque et de sauvegarde jusqu\'au début de votre prochain tour (1/repos long).',
                rules: [
                    { type: 'resource', id: 'zealous-presence', name: 'Présence zélée', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Rage au-delà de la mort', description: 'En rage, tomber à 0 PV ne vous rend pas inconscient. Vous faites toujours les JS contre la mort. Vous ne mourez que si la rage prend fin et que vous êtes toujours à 0 PV.',
                rules: [
                    { type: 'condition', condition: 'rage-beyond-death', description: 'Tomber à 0 PV en rage ne rend pas inconscient' }
                ]
            },
        ],
    },
    {
        id: 'beast',
        classId: 'barbarian',
        name: 'Voie de la Bête',
        nameEn: 'Path of the Beast',
        description: 'Une puissance bestiale dormante se manifeste lorsque vous entrez en rage, vous dotant d\'armes naturelles redoutables.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Forme de la bête', description: 'En rage, manifestez une arme naturelle au choix : Morsure (1d8 perf, soin = mod CON 1/tour si < 50% PV), Griffes (1d6 tranch, 1 attaque de griffe supplémentaire 1/tour), ou Queue (1d8 perf, allonge, réaction +1d8 CA).',
                rules: [
                    { type: 'select', name: 'Arme naturelle', targetType: 'trait', count: 1, options: ['beast-bite', 'beast-claws', 'beast-tail'] }
                ]
            },
            {
                level: 6, name: 'Âme de la bête', description: 'Vos armes naturelles comptent comme magiques. Après un repos, choisissez : nage + respiration aquatique, escalade (même plafonds sans test), ou sauts améliorés (jet Athlétisme ajouté).',
                rules: [
                    { type: 'condition', condition: 'magical-natural-weapons', description: 'Armes naturelles comptent comme magiques' },
                    { type: 'select', name: 'Bénéfice d\'Âme de la bête', targetType: 'trait', count: 1, options: ['beast-soul-swim', 'beast-soul-climb', 'beast-soul-jump'] }
                ]
            },
            {
                level: 10, name: 'Fureur infectieuse', description: 'Touchez avec arme naturelle en rage : la cible doit réussir un JS SAG (DD 8 + mod CON + maîtrise) ou subir un effet au choix : attaque un allié en réaction, ou 2d12 dégâts psychiques. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'infectious-fury', name: 'Fureur infectieuse', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Appel de la chasse', description: 'En rage, choisissez jusqu\'à mod CON créatures consentantes à 9m. Gagnez 5 PV temp par créature. Elles gagnent +1d6 dégâts 1/tour. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'call-the-hunt', name: 'Appel de la chasse', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'wild_magic_barbarian',
        classId: 'barbarian',
        name: 'Voie de la Magie Sauvage',
        nameEn: 'Path of Wild Magic',
        description: 'Imprégné de magie sauvage par la Féerie ou d\'autres forces surnaturelles, votre rage déclenche des effets magiques imprévisibles.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Sens de la magie', description: 'Action : détectez sorts et objets magiques dans un rayon de 18m (pas à travers abri total). Identifiez l\'école de magie. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'magic-awareness', name: 'Sens de la magie', progression: [0, 0, 0, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 3, name: 'Sursaut sauvage', description: 'En entrant en rage, lancez 1d8 sur la table de Magie sauvage pour un effet aléatoire. DD des effets = 8 + bonus de maîtrise + mod CON.',
                rules: [
                    { type: 'condition', condition: 'wild-magic-surge', description: 'Effet aléatoire en entrant en rage' }
                ]
            },
            {
                level: 6, name: 'Réserve de magie', description: 'Action : touchez une créature pour lui conférer +1d3 aux jets d\'attaque/caractéristique pendant 10 min, OU restaurez un emplacement de sort de niveau ≤ 1d3. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'bolstering-magic', name: 'Réserve de magie', progression: [0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 10, name: 'Réaction instable', description: 'Après avoir subi des dégâts ou raté un JS en rage, utilisez votre réaction pour relancer sur la table de Magie sauvage. Le nouvel effet remplace le précédent.',
                rules: [
                    { type: 'condition', condition: 'unstable-reaction', description: 'Réaction pour relancer la table de Magie sauvage après dégâts ou JS raté en rage' }
                ]
            },
            {
                level: 14, name: 'Sursaut contrôlé', description: 'Lancez 2d8 sur la table de Magie sauvage et choisissez le résultat. Si les deux dés sont identiques, choisissez librement n\'importe quel effet.',
                rules: [
                    { type: 'condition', condition: 'controlled-surge', description: 'Lancez 2d8 et choisissez le résultat sur la table de Magie sauvage' }
                ]
            },
        ],
    },
    {
        id: 'battlerager',
        classId: 'barbarian',
        name: 'Voie du Battlerager',
        nameEn: 'Path of the Battlerager',
        description: 'Réservé aux nains. Vous portez une armure d\'épines et vous jetez dans la mêlée avec une férocité dévastatrice.',
        source: 'SCAG',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Armure d\'épines', description: 'En rage et sans armure (hors bouclier), vous pouvez effectuer une attaque au corps à corps en action bonus avec votre armure d\'épines (1d4 perforants). Quand une créature vous touche avec une attaque au corps à corps en rage, elle subit 3 dégâts perforants.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spiked-armor-attack' },
                    { type: 'damage_bonus', value: 3, condition: 'spiked-armor-retaliation', damageType: 'piercing' }
                ]
            },
            {
                level: 6, name: 'Chargeur téméraire', description: 'Quand vous utilisez Attaque téméraire en rage, vous gagnez un nombre de points de vie temporaires égal à votre modificateur de Constitution.',
                rules: [
                    { type: 'condition', condition: 'reckless-abandon-temp-hp', description: 'PV temporaires = mod CON quand Attaque téméraire est utilisée en rage' }
                ]
            },
            {
                level: 10, name: 'Chargeur de bataille', description: 'En rage, vous pouvez utiliser votre action bonus pour Foncer. Si vous touchez une créature avec une attaque au corps à corps lors de cette action, elle doit réussir un jet de sauvegarde de Force ou être renversée.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'battlerager-charge' }
                ]
            },
            {
                level: 14, name: 'Épines de stockage', description: 'En rage, quand une créature à 1,5 mètre ou moins de vous vous touche avec une attaque au corps à corps, vous pouvez utiliser votre réaction pour lui infliger 1d10 + votre modificateur de Constitution dégâts perforants.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'spiked-retaliation' }
                ]
            },
        ],
    },
    {
        id: 'giant',
        classId: 'barbarian',
        name: 'Voie du Géant',
        nameEn: 'Path of the Giant',
        description: 'Vous tirez votre force des mêmes forces primordiales que les géants. En rage, vous êtes imprégné de puissance élémentaire et grandissez, prenant une forme qui évoque la gloire des géants — peut-être entouré d\'énergie de feu, de givre ou de foudre.',
        source: 'Bigby',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Puissance du géant', description: 'Vous apprenez à parler, lire et écrire le Géant (ou une autre langue si vous le connaissez déjà). De plus, vous apprenez un tour de magie au choix : druidisme ou thaumaturgie. La Sagesse est votre caractéristique d\'incantation pour ce sort.',
                rules: [
                    { type: 'grant', targetType: 'language', targetId: 'giant' },
                    { type: 'select', name: 'Tour de magie du Géant', targetType: 'spell', count: 1, options: ['druidcraft', 'thaumaturgy'] },
                ]
            },
            {
                level: 3, name: 'Dévastation géante', description: 'En rage : Jet écrasant — quand vous réussissez une attaque à distance avec une arme de lancer utilisant la Force, ajoutez votre bonus de dégâts de la Rage. Stature géante — votre allonge augmente de 1,50 m, et si vous êtes de taille Inférieure à Grande, vous devenez Grand (avec votre équipement). Si la place manque, votre taille ne change pas.',
                rules: [
                    { type: 'condition', condition: 'crushing-throw', description: '+Rage dégâts aux armes de lancer (Force) en rage' },
                    { type: 'condition', condition: 'giant-stature-reach', description: 'Allonge +1,5m en rage' },
                    { type: 'condition', condition: 'giant-stature-size', description: 'Taille Grande en rage' },
                ]
            },
            {
                level: 6, name: 'Fendoir élémentaire', description: 'Quand vous entrez en rage, choisissez une arme tenue et infusez-la avec un type de dégâts : acide, froid, feu, tonnerre ou foudre. Tant que vous maniez l\'arme infusée en rage : ses dégâts passent au type choisi, +1d6 dégâts du type choisi, elle gagne la propriété lancer (portée 6/18 m). Si lancée, elle réapparaît dans votre main après l\'attaque. Les bénéfices sont supprimés si une autre créature manie l\'arme. En action bonus en rage, changez le type de dégâts.',
                rules: [
                    { type: 'select', name: 'Type élémentaire', targetType: 'trait', count: 1, options: ['acid', 'cold', 'fire', 'thunder', 'lightning'] },
                    { type: 'damage_bonus', value: 0, condition: 'elemental-cleaver', damageType: 'fire' }
                ]
            },
            {
                level: 10, name: 'Projection puissante', description: 'En rage, action bonus : choisissez une créature de taille M ou inférieure à votre allonge et déplacez-la dans un espace inoccupé que vous voyez à 9 m. Une créature non consentante doit réussir un JS de Force (DD = 8 + bonus de maîtrise + mod FOR) pour éviter l\'effet. Si à la fin du mouvement la créature n\'est pas sur une surface qui la supporte, elle tombe (dégâts normaux + à terre).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'mighty-impel' }
                ]
            },
            {
                level: 14, name: 'Colosse démiurgique', description: 'En rage : votre allonge augmente de 3 m (au lieu de 1,5), votre taille peut devenir Grande ou Très Grande (votre choix), et votre Projection puissante peut déplacer des créatures de taille G ou inférieure. De plus, les dégâts supplémentaires de Fendoir élémentaire passent à 2d6.',
                rules: [
                    { type: 'condition', condition: 'demiurgic-colossus-reach', description: 'Allonge +3m en rage' },
                    { type: 'condition', condition: 'demiurgic-colossus-size', description: 'Taille Grande ou Très Grande au choix en rage' },
                    { type: 'condition', condition: 'demiurgic-colossus-impel', description: 'Projection puissante cible les créatures de taille G ou inférieure' },
                    { type: 'damage_bonus', value: 0, condition: 'elemental-cleaver-2d6', damageType: 'fire' }
                ]
            },
        ],
    },

    // ═══════════════════════════════════════════
    // BARDE — Collège bardique (niveau 3)
    // ═══════════════════════════════════════════
    {
        id: 'lore',
        classId: 'bard',
        name: 'Collège du Savoir',
        nameEn: 'College of Lore',
        description: 'Des bardes érudits qui collectent des connaissances de toutes les sources, qu\'elles soient livresques ou orales.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrises supplémentaires', description: 'Maîtrise de 3 compétences supplémentaires de votre choix.', rules: [{ type: 'select', name: 'Compétences du Savoir', targetType: 'skill', count: 3, options: ['ID_SKILL_ARCANA', 'ID_SKILL_HISTORY', 'ID_SKILL_NATURE', 'ID_SKILL_RELIGION', 'ID_SKILL_ANIMAL_HANDLING', 'ID_SKILL_INSIGHT', 'ID_SKILL_MEDICINE', 'ID_SKILL_PERCEPTION', 'ID_SKILL_SURVIVAL', 'ID_SKILL_ACROBATICS', 'ID_SKILL_ATHLETICS', 'ID_SKILL_DECEPTION', 'ID_SKILL_INTIMIDATION', 'ID_SKILL_PERFORMANCE', 'ID_SKILL_PERSUASION', 'ID_SKILL_SLEIGHT_OF_HAND', 'ID_SKILL_STEALTH'] }] },
            { level: 3, name: 'Mots cinglants', description: 'Utilisez votre réaction et une Inspiration Bardique pour soustraire le résultat du dé au jet d\'attaque, de caractéristique ou de dégâts d\'une créature.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'cutting-words' }] },
            { level: 6, name: 'Secrets magiques supplémentaires', description: 'Apprenez 2 sorts de n\'importe quelle classe (au lieu d\'attendre le niveau 10).', rules: [{ type: 'condition', condition: 'additional-magical-secrets', description: '2 sorts de n\'importe quelle classe au niveau 6' }] },
            { level: 14, name: 'Inspiration régénérée', description: 'Lorsque vous n\'avez plus d\'utilisations d\'Inspiration Bardique, vous en regagnez une lorsque vous faites un test de caractéristique, un jet d\'attaque ou un jet de sauvegarde.', rules: [{ type: 'condition', condition: 'peerless-skill', description: 'Regagne 1 Inspiration quand vous faites un jet' }] },
        ],
    },
    {
        id: 'valor',
        classId: 'bard',
        name: 'Collège de la Vaillance',
        nameEn: 'College of Valor',
        description: 'Des bardes guerriers qui inspirent les autres par des actes de bravoure et des récits épiques de batailles.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrises supplémentaires', description: 'Maîtrise des armures intermédiaires, des boucliers et des armes de guerre.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_MEDIUM' }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_SHIELD' }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_MARTIAL' }] },
            { level: 3, name: 'Inspiration de combat', description: 'Les créatures qui utilisent votre Inspiration Bardique peuvent ajouter le dé à un jet de dégâts ou à leur CA contre une attaque.', rules: [{ type: 'condition', condition: 'combat-inspiration', description: 'Inspiration peut ajouter aux dégâts ou à la CA' }] },
            { level: 6, name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', rules: [{ type: 'condition', condition: 'extra-attack-valor', description: '2 attaques par action Attaquer' }] },
            { level: 14, name: 'Magie de bataille', description: 'Lorsque vous lancez un sort de Barde en action, vous pouvez effectuer une attaque avec une arme en action bonus.', rules: [{ type: 'condition', condition: 'battle-magic', description: 'Attaque d\'arme en action bonus après un sort' }] },
        ],
    },
    {
        id: 'glamour',
        classId: 'bard',
        name: 'Collège du Glamour',
        nameEn: 'College of Glamour',
        description: 'Des bardes imprégnés de la magie de la Féerie, capables d\'enchanter et de captiver leur auditoire par des représentations surnaturelles.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Manteau d\'inspiration', description: 'Action bonus : dépensez une Inspiration bardique. Jusqu\'à mod CHA créatures à 18m gagnent 5 PV temp (8 niv 5, 11 niv 10, 14 niv 15) et peuvent utiliser leur réaction pour se déplacer sans provoquer d\'attaque d\'opportunité.', rules: [{ type: 'condition', condition: 'mantle-of-inspiration', description: 'Inspiration = PV temp + déplacement sans attaque d\'opportunité' }] },
            { level: 3, name: 'Représentation fascinante', description: 'Après 1 minute de représentation, jusqu\'à mod CHA humanoïdes à 18m doivent réussir un JS SAG ou être charmés pendant 1 heure (1/repos court ou long).', rules: [{ type: 'resource', id: 'enthralling-performance', name: 'Représentation fascinante', progression: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 6, name: 'Manteau de majesté', description: 'Action bonus : apparence surnaturelle pendant 1 minute (concentration). Lancez Injonction en action bonus chaque tour sans emplacement. Les créatures charmées par vous ratent automatiquement le JS (1/repos long).', rules: [{ type: 'resource', id: 'mantle-of-majesty', name: 'Manteau de majesté', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Majesté inaltérable', description: 'Action bonus : majesté féerique pendant 1 minute. La 1ère créature qui vous attaque à son tour doit réussir un JS CHA ou l\'attaque échoue. En cas de réussite, elle a un désavantage aux JS contre vos sorts (1/repos court ou long).', rules: [{ type: 'resource', id: 'unalterable-majesty', name: 'Majesté inaltérable', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
        ],
    },
    {
        id: 'swords',
        classId: 'bard',
        name: 'Collège des Épées',
        nameEn: 'College of Swords',
        description: 'Des bardes martial qui divertissent par des prouesses d\'épée audacieuses, mêlant combat et spectacle.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrises supplémentaires', description: 'Maîtrise des armures intermédiaires et des cimeterres. Une arme de mêlée peut servir de focaliseur d\'incantation.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_MEDIUM' }, { type: 'grant', targetType: 'proficiency', targetId: 'scimitar' }] },
            { level: 3, name: 'Style de combat', description: 'Choisissez : Combat à deux armes (ajoutez mod car aux dégâts de la 2nde attaque) ou Duel (+2 dégâts avec une arme à une main seule).', rules: [{ type: 'select', name: 'Style de combat', targetType: 'trait', count: 1, options: ['two-weapon-fighting', 'dueling'] }] },
            { level: 3, name: 'Épanouissement martial', description: 'Quand vous attaquez, +3m de vitesse. Dépensez une Inspiration bardique pour un effet : Défensif (dé ajouté à la CA + dégâts), Tranchant (dégâts à la cible + 1 créature à 1,5m), ou Mobile (dégâts + repousser 1,5m + réaction pour se déplacer).', rules: [{ type: 'condition', condition: 'blade-flourish', description: '+3m vitesse quand vous attaquez, effets avec Inspiration' }] },
            { level: 6, name: 'Attaque supplémentaire', description: 'Attaquez deux fois par action Attaquer.', rules: [{ type: 'condition', condition: 'extra-attack-swords', description: '2 attaques par action Attaquer' }] },
            { level: 14, name: 'Épanouissement de maître', description: 'Utiliser un Épanouissement martial ne coûte qu\'un d6 au lieu d\'un dé d\'Inspiration bardique.', rules: [{ type: 'condition', condition: 'masters-flourish', description: 'Épanouissement martial coûte d6' }] },
        ],
    },
    {
        id: 'whispers',
        classId: 'bard',
        name: 'Collège des Murmures',
        nameEn: 'College of Whispers',
        description: 'Des bardes qui utilisent la peur, la manipulation et le secret comme instruments de leur art.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Lames psychiques', description: 'Dépensez une Inspiration bardique quand vous touchez avec une arme : +2d6 dégâts psychiques (3d6 niv 5, 5d6 niv 10, 8d6 niv 15). 1/tour.', rules: [{ type: 'damage_bonus', value: 0, condition: 'psychic-blades', damageType: 'psychic' }] },
            { level: 3, name: 'Mots de terreur', description: 'Après 1 min de conversation, un humanoïde doit réussir un JS SAG ou être effrayé pendant 1 heure (1/repos court ou long).', rules: [{ type: 'resource', id: 'words-of-terror', name: 'Mots de terreur', progression: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 6, name: 'Manteau de murmures', description: 'Quand un humanoïde meurt à 9m, capturez son ombre en réaction. En action, prenez son apparence (avantage Tromperie). Mod CHA utilisations par repos long.', rules: [{ type: 'resource', id: 'mantle-of-whispers', name: 'Manteau de murmures', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Savoir des ombres', description: 'Action : une créature à 9m qui vous entend et partage un langage doit réussir un JS SAG ou être charmée pendant 1 heure, obéissant à vos demandes (1/repos long).', rules: [{ type: 'resource', id: 'shadow-lore', name: 'Savoir des ombres', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'creation',
        classId: 'bard',
        name: 'Collège de la Création',
        nameEn: 'College of Creation',
        description: 'Des bardes qui canalisent le Chant de la Création, donnant vie aux objets et matérialisant l\'impossible.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Atome de potentiel', description: 'Quand vous donnez une Inspiration bardique, un atome apparaît. Effet selon l\'utilisation : Test de caractéristique (relancer et choisir), Attaque (dégâts tonnerre = dé à la cible et créatures à 1,5m), JS (PV temp = dé + mod CHA).', rules: [{ type: 'condition', condition: 'mote-of-potential', description: 'Inspiration bardique a des effets supplémentaires' }] },
            { level: 3, name: 'Représentation créatrice', description: 'Action : créez un objet non magique (taille M max, valeur ≤ 20 × niv barde po). Dure bonus de maîtrise heures. Taille L au niv 6, TG au niv 14 (1/repos long ou emplacement niv 2+).', rules: [{ type: 'resource', id: 'performance-of-creation', name: 'Représentation créatrice', progression: [0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 6, name: 'Représentation animée', description: 'Action : animez un objet non magique taille G ou – à 9m pendant 1 heure. Utilisez le bloc d\'Objet dansant. Action bonus pour le commander (1/repos long ou emplacement niv 3+).', rules: [{ type: 'resource', id: 'animating-performance', name: 'Représentation animée', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Crescendo créatif', description: 'Représentation créatrice : créez jusqu\'à mod CHA objets simultanément (1 seul au max de taille). Plus de limite de valeur en po.', rules: [{ type: 'condition', condition: 'creative-crescendo', description: 'Jusqu\'à mod CHA objets simultanément' }] },
        ],
    },
    {
        id: 'eloquence',
        classId: 'bard',
        name: 'Collège de l\'Éloquence',
        nameEn: 'College of Eloquence',
        description: 'Des maîtres de l\'art oratoire qui utilisent la parole pour persuader, inspirer et manipuler avec une précision surnaturelle.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Langue d\'argent', description: 'Vos jets de Persuasion et Tromperie ne peuvent pas être inférieurs à 10 sur le d20.', rules: [{ type: 'condition', condition: 'silver-tongue', description: 'Min 10 au d20 pour Persuasion et Tromperie' }] },
            { level: 3, name: 'Mots déstabilisants', description: 'Action bonus : dépensez une Inspiration bardique. Une créature à 18m soustrait le résultat du dé de son prochain JS.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'unsettling-words' }] },
            { level: 6, name: 'Inspiration infaillible', description: 'Si une créature utilise votre Inspiration bardique et échoue quand même, elle conserve le dé.', rules: [{ type: 'condition', condition: 'unfailing-inspiration', description: 'L\'allié conserve le dé si le jet échoue quand même' }] },
            { level: 6, name: 'Discours universel', description: 'Action : jusqu\'à mod CHA créatures à 18m vous comprennent magiquement pendant 1 heure, quelle que soit la langue (1/repos long ou emplacement).', rules: [{ type: 'resource', id: 'universal-speech', name: 'Discours universel', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Inspiration contagieuse', description: 'Quand une créature réussit grâce à votre Inspiration bardique, utilisez votre réaction pour donner une Inspiration à une autre créature à 18m sans dépenser d\'utilisation.', rules: [{ type: 'condition', condition: 'infectious-inspiration', description: 'Réaction pour donner Inspiration à un autre allié' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'life',
        classId: 'cleric',
        name: 'Domaine de la Vie',
        nameEn: 'Life Domain',
        description: 'Les dieux de la Vie promeuvent la vitalité et la santé à travers la guérison des malades et des blessés.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armures lourdes.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }] },
            { level: 1, name: 'Disciple de la vie', description: 'Vos sorts de guérison soignent 2 + niveau du sort PV supplémentaires.', rules: [{ type: 'condition', condition: 'disciple-of-life', description: 'Sorts de guérison : +2 + niveau du sort PV' }] },
            { level: 2, name: 'Conduit divin : Préserver la vie', description: 'Soignez jusqu\'à 5 × niveau de Clerc PV répartis entre les créatures à 9m.' },
            { level: 6, name: 'Guérisseur béni', description: 'Vos sorts de guérison vous soignent également de 2 + niveau du sort PV.', rules: [{ type: 'condition', condition: 'blessed-healer', description: 'Sorts de guérison : vous soignez aussi 2 + niveau du sort PV' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts radiants sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-life', damageType: 'radiant' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts radiants sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-life-2d8', damageType: 'radiant' }] },
            { level: 17, name: 'Guérison suprême', description: 'Au lieu de lancer les dés de guérison, utilisez le maximum possible pour chaque dé.', rules: [{ type: 'condition', condition: 'supreme-healing', description: 'Dés de guérison = maximum' }] },
        ],
    },
    {
        id: 'war',
        classId: 'cleric',
        name: 'Domaine de la Guerre',
        nameEn: 'War Domain',
        description: 'Les dieux de la Guerre veillent sur les guerriers et récompensent les actes de bravoure au combat.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armures lourdes et des armes de guerre.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_MARTIAL' }] },
            { level: 1, name: 'Prêtre de guerre', description: 'Lorsque vous attaquez, effectuez une attaque supplémentaire en action bonus (utilisable mod SAG fois par repos long).', rules: [{ type: 'condition', condition: 'war-priest', description: 'Attaque supplémentaire en action bonus, mod SAG fois par repos long' }] },
            { level: 2, name: 'Conduit divin : Frappe guidée', description: '+10 à un jet d\'attaque (après le lancer, avant de savoir si ça touche).', rules: [{ type: 'condition', condition: 'guided-strike', description: '+10 à un jet d\'attaque après le lancer' }] },
            { level: 6, name: 'Conduit divin : Bénédiction du dieu de la guerre', description: 'Donnez +10 au jet d\'attaque d\'une créature à 9m.', rules: [{ type: 'condition', condition: 'war-gods-blessing', description: '+10 au jet d\'attaque d\'un allié à 9m' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts (du type de votre arme) sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-war', damageType: 'weapon' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts (du type de votre arme) sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-war-2d8', damageType: 'weapon' }] },
            { level: 17, name: 'Avatar de bataille', description: 'Résistance aux dégâts contondants, perforants et tranchants des attaques non-magiques.', rules: [{ type: 'condition', condition: 'resistance-nonmagical-bps', description: 'Résistance B/P/S non-magiques' }] },
        ],
    },
    {
        id: 'light',
        classId: 'cleric',
        name: 'Domaine de la Lumière',
        nameEn: 'Light Domain',
        description: 'Les dieux de la Lumière promeuvent la renaissance, la vérité, la vigilance et la beauté.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Sort mineur supplémentaire', description: 'Vous gagnez le sort mineur Lumière.', rules: [{ type: 'spell', spellId: 'light', alwaysKnown: true }] },
            { level: 1, name: 'Illumination protectrice', description: 'Imposez un désavantage à un jet d\'attaque contre vous en réaction (mod SAG fois par repos long).', rules: [{ type: 'condition', condition: 'warding-flare', description: 'Désavantage à une attaque contre vous en réaction, mod SAG fois par repos long' }] },
            { level: 2, name: 'Conduit divin : Radiance de l\'aube', description: 'Dissipez les ténèbres magiques et infligez 2d10 + niveau de Clerc dégâts radiants aux ennemis à 9m.' },
            { level: 6, name: 'Illumination améliorée', description: 'Illumination protectrice utilisable sur une créature à 9m.', rules: [{ type: 'condition', condition: 'improved-flare', description: 'Illumination protectrice utilisable sur allié à 9m' }] },
            { level: 8, name: 'Frappe puissante', description: '+mod SAG dégâts radiants avec un sort mineur.', rules: [{ type: 'condition', condition: 'potent-spellcasting-light', description: '+mod SAG dégâts avec les sorts mineurs' }] },
            { level: 17, name: 'Couronne de lumière', description: 'Aura de lumière vive à 18m. Les ennemis dans l\'aura subissent un désavantage à leurs jets d\'attaque.', rules: [{ type: 'condition', condition: 'corona-of-light', description: 'Aura 18m : ennemis désavantage aux jets d\'attaque' }] },
        ],
    },
    {
        id: 'knowledge',
        classId: 'cleric',
        name: 'Domaine du Savoir',
        nameEn: 'Knowledge Domain',
        description: 'Les dieux du Savoir valorisent l\'apprentissage et la compréhension, étudiant les mystères de l\'univers.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Bénédiction du savoir', description: 'Apprenez 2 langues. Maîtrise de 2 compétences parmi Arcanes, Histoire, Nature, Religion (bonus de maîtrise doublé pour ces compétences).', rules: [{ type: 'grant', targetType: 'language', targetId: 'any' }, { type: 'grant', targetType: 'language', targetId: 'any' }, { type: 'select', name: 'Compétences d\'expertise', targetType: 'skill', count: 2, options: ['ID_SKILL_ARCANA', 'ID_SKILL_HISTORY', 'ID_SKILL_NATURE', 'ID_SKILL_RELIGION'] }] },
            { level: 2, name: 'Conduit divin : Savoir ancestral', description: 'Action : gagnez la maîtrise d\'une compétence ou d\'un outil pendant 10 minutes.' },
            { level: 6, name: 'Conduit divin : Lecture des pensées', description: 'Action : lisez les pensées d\'une créature à 18m pendant 1 minute. Vous pouvez lancer Suggestion sur elle sans emplacement.' },
            { level: 8, name: 'Frappe puissante', description: '+mod SAG dégâts avec un sort mineur de Clerc.', rules: [{ type: 'condition', condition: 'potent-spellcasting-knowledge', description: '+mod SAG dégâts avec les sorts mineurs de Clerc' }] },
            { level: 17, name: 'Visions du passé', description: 'Méditez 1 minute pour obtenir des visions liées à un objet tenu ou à votre environnement immédiat.', rules: [{ type: 'condition', condition: 'visions-of-the-past', description: 'Méditation 1 min : visions d\'un objet ou de l\'environnement' }] },
        ],
    },
    {
        id: 'nature',
        classId: 'cleric',
        name: 'Domaine de la Nature',
        nameEn: 'Nature Domain',
        description: 'Les dieux de la Nature protègent le monde sauvage, mêlant magie divine et pouvoir druidique.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Acolyte de la nature', description: 'Apprenez 1 sort mineur de Druide. Maîtrise d\'une compétence (Dressage, Nature ou Survie).', rules: [{ type: 'select', name: 'Sort mineur de Druide', targetType: 'spell', count: 1, options: ['druidcraft', 'guidance', 'mending', 'poison-spray', 'produce-flame', 'resistance', 'shillelagh', 'thorn-whip'] }, { type: 'select', name: 'Compétence', targetType: 'skill', count: 1, options: ['ID_SKILL_ANIMAL_HANDLING', 'ID_SKILL_NATURE', 'ID_SKILL_SURVIVAL'] }] },
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armures lourdes.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }] },
            { level: 2, name: 'Conduit divin : Charme des animaux et plantes', description: 'Action : charmez les bêtes et créatures végétales à 9m (JS SAG).' },
            { level: 6, name: 'Amortir les éléments', description: 'Réaction : accordez la résistance à un type de dégâts élémentaires (acide, froid, feu, foudre, tonnerre) à une créature à 9m.', rules: [{ type: 'condition', condition: 'dampen-elements', description: 'Réaction : résistance élémentaire à un allié à 9m' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts de froid, feu ou foudre (au choix) sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-nature', damageType: 'elemental' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts de froid, feu ou foudre (au choix) sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-nature-2d8', damageType: 'elemental' }] },
            { level: 17, name: 'Maître de la nature', description: 'Action bonus : commandez les créatures charmées par Charme des animaux et plantes.', rules: [{ type: 'condition', condition: 'master-of-nature', description: 'Action bonus : commandez les créatures charmées' }] },
        ],
    },
    {
        id: 'tempest',
        classId: 'cleric',
        name: 'Domaine de la Tempête',
        nameEn: 'Tempest Domain',
        description: 'Les dieux de la Tempête commandent les orages, la mer et le ciel, déchaînant foudre et tonnerre.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armes de guerre et des armures lourdes.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_MARTIAL' }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }] },
            { level: 1, name: 'Colère de la tempête', description: 'Réaction : une créature à 1,5m qui vous touche subit 2d8 dégâts foudre ou tonnerre (JS DEX pour moitié). Mod SAG fois par repos long.', rules: [{ type: 'condition', condition: 'wrath-of-the-storm', description: 'Réaction : 2d8 foudre/tonnerre à une créature à 1,5m, mod SAG fois par repos long' }] },
            { level: 2, name: 'Conduit divin : Colère destructrice', description: 'Quand vous lancez des dégâts de foudre ou tonnerre, utilisez le maximum au lieu de lancer les dés.', rules: [{ type: 'condition', condition: 'destructive-wrath', description: 'Dégâts foudre/tonnerre = maximum des dés' }] },
            { level: 6, name: 'Frappe de tonnerre', description: 'Quand vous infligez des dégâts de foudre à une créature de taille G ou –, vous la repoussez de 3m.', rules: [{ type: 'condition', condition: 'thunderbolt-strike', description: 'Dégâts foudre repoussent créatures taille G ou moins de 3m' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts de tonnerre sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-tempest', damageType: 'thunder' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts de tonnerre sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-tempest-2d8', damageType: 'thunder' }] },
            { level: 17, name: 'Né de la tempête', description: 'Vous avez une vitesse de vol égale à votre vitesse de marche tant que vous êtes à l\'extérieur.', rules: [{ type: 'speed', value: '$(speed)', condition: 'outside' }] },
        ],
    },
    {
        id: 'trickery',
        classId: 'cleric',
        name: 'Domaine de la Duperie',
        nameEn: 'Trickery Domain',
        description: 'Les dieux de la Duperie sont des fauteurs de trouble et des provocateurs, préférant la ruse à la force brute.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Bénédiction du trompeur', description: 'Action : touchez une créature consentante pour lui donner avantage aux tests de Discrétion pendant 1 heure.', rules: [{ type: 'condition', condition: 'blessing-of-the-trickster', description: 'Action : avantage Discrétion à une créature consentante pendant 1h' }] },
            { level: 2, name: 'Conduit divin : Copie illusoire', description: 'Action : créez un double illusoire à 9m pendant 1 minute. Lancez des sorts depuis sa position. Avantage aux attaques si vous et le double êtes à 1,5m d\'une cible.' },
            { level: 6, name: 'Conduit divin : Manteau d\'ombres', description: 'Action : devenez invisible jusqu\'à la fin de votre prochain tour ou jusqu\'à ce que vous attaquiez/lanciez un sort.' },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts de poison sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-trickery', damageType: 'poison' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts de poison sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-trickery-2d8', damageType: 'poison' }] },
            { level: 17, name: 'Copie améliorée', description: 'Créez jusqu\'à 4 copies illusoires au lieu d\'une avec Copie illusoire.', rules: [{ type: 'condition', condition: 'improved-duplicity', description: 'Jusqu\'à 4 copies illusoires avec Copie illusoire' }] },
        ],
    },
    {
        id: 'forge',
        classId: 'cleric',
        name: 'Domaine de la Forge',
        nameEn: 'Forge Domain',
        description: 'Les dieux de la Forge sont les patrons des artisans qui travaillent le métal, créant armes et armures magiques.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armures lourdes et des outils de forgeron.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }, { type: 'grant', targetType: 'proficiency', targetId: 'smiths-tools' }] },
            { level: 1, name: 'Bénédiction de la forge', description: 'Après un repos long, touchez une armure ou arme non-magique : elle devient magique (+1 CA ou +1 attaque/dégâts) jusqu\'au prochain repos long.', rules: [{ type: 'condition', condition: 'blessing-of-the-forge', description: 'Repos long : +1 CA (armure) ou +1 attaque/dégâts (arme) sur un objet non-magique' }] },
            { level: 2, name: 'Conduit divin : Bénédiction de l\'artisan', description: 'Rituel d\'1 heure pour créer un objet métallique non-magique (≤ 100 po) à partir de métal de valeur équivalente.' },
            { level: 6, name: 'Âme de la forge', description: 'Résistance aux dégâts de feu. En armure lourde, +1 CA.', rules: [{ type: 'condition', condition: 'resistance-fire', description: 'Résistance aux dégâts de feu' }, { type: 'ac', formula: 'base + 1', condition: 'heavy-armor' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts de feu sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-forge', damageType: 'fire' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts de feu sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-forge-2d8', damageType: 'fire' }] },
            { level: 17, name: 'Saint du feu et de la forge', description: 'Immunité aux dégâts de feu. Résistance aux dégâts contondants, perforants et tranchants non-magiques en armure lourde.', rules: [{ type: 'condition', condition: 'immunity-fire', description: 'Immunité aux dégâts de feu' }, { type: 'condition', condition: 'resistance-nonmagical-bps-heavy', description: 'Résistance B/P/S non-magiques en armure lourde' }] },
        ],
    },
    {
        id: 'grave',
        classId: 'cleric',
        name: 'Domaine de la Tombe',
        nameEn: 'Grave Domain',
        description: 'Les dieux de la Tombe veillent à l\'équilibre entre la vie et la mort, s\'opposant aux morts-vivants.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Cercle de mortalité', description: 'Sorts de guérison sur créatures à 0 PV : utilisez le max de chaque dé. Apprenez Épargner les mourants (portée 9m, action bonus).', rules: [{ type: 'condition', condition: 'circle-of-mortality', description: 'Guérison sur créature à 0 PV : max de chaque dé' }, { type: 'spell', spellId: 'spare-the-dying', alwaysKnown: true }] },
            { level: 1, name: 'Yeux de la tombe', description: 'Action : détectez les morts-vivants à 18m (mod SAG fois par repos long).', rules: [{ type: 'condition', condition: 'eyes-of-the-grave', description: 'Action : détectez les morts-vivants à 18m, mod SAG fois par repos long' }] },
            { level: 2, name: 'Conduit divin : Sentier vers la tombe', description: 'Action : une créature à 9m devient vulnérable au prochain jet de dégâts qu\'elle subit avant la fin de votre prochain tour.', rules: [{ type: 'condition', condition: 'path-to-the-grave', description: 'Action : vulnérabilité au prochain dégât subi par une créature à 9m' }] },
            { level: 6, name: 'Sentinelle aux portes de la mort', description: 'Réaction : transformez un coup critique subi par vous ou un allié à 9m en coup normal (mod SAG fois par repos long).', rules: [{ type: 'condition', condition: 'sentinel-at-deaths-door', description: 'Réaction : annule un critique sur vous ou allié à 9m, mod SAG fois par repos long' }] },
            { level: 8, name: 'Frappe puissante', description: '+mod SAG dégâts avec un sort mineur de Clerc.', rules: [{ type: 'condition', condition: 'potent-spellcasting-grave', description: '+mod SAG dégâts avec les sorts mineurs de Clerc' }] },
            { level: 17, name: 'Gardien des âmes', description: 'Quand un ennemi meurt à 9m, vous ou un allié à 9m récupérez des PV = nombre de DV de l\'ennemi.', rules: [{ type: 'condition', condition: 'keeper-of-souls', description: 'Ennemi meurt à 9m : vous ou allié régénérez PV = DV de l\'ennemi' }] },
        ],
    },
    {
        id: 'order',
        classId: 'cleric',
        name: 'Domaine de l\'Ordre',
        nameEn: 'Order Domain',
        description: 'Les dieux de l\'Ordre représentent la discipline et le dévouement aux lois qui gouvernent la société.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armures lourdes. Maîtrise d\'Intimidation ou Persuasion (au choix).', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }, { type: 'select', name: 'Compétence', targetType: 'skill', count: 1, options: ['ID_SKILL_INTIMIDATION', 'ID_SKILL_PERSUASION'] }] },
            { level: 1, name: 'Voix de l\'autorité', description: 'Après avoir lancé un sort niv 1+ ciblant un allié, cet allié peut utiliser sa réaction pour effectuer une attaque d\'arme.', rules: [{ type: 'condition', condition: 'voice-of-authority', description: 'Sort niv 1+ sur allié : il peut attaquer en réaction' }] },
            { level: 2, name: 'Conduit divin : Injonction de l\'ordre', description: 'Action : les créatures au choix à 9m qui ratent un JS SAG sont charmées et peuvent être forcées à lâcher leurs objets.' },
            { level: 6, name: 'Domination de l\'ordre', description: 'Quand vous utilisez Conduit divin, vous pouvez lancer un sort de Clerc en action bonus.', rules: [{ type: 'condition', condition: 'embodiment-of-the-law', description: 'Canal divin : sort de Clerc en action bonus' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts psychiques sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-order', damageType: 'psychic' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts psychiques sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-order-2d8', damageType: 'psychic' }] },
            { level: 17, name: 'Colère de l\'ordre', description: 'Les créatures charmées par vous qui touchent une cible infligent +2d8 dégâts psychiques supplémentaires.', rules: [{ type: 'condition', condition: 'orders-wrath', description: 'Créatures charmées par vous : +2d8 psychiques sur attaque' }] },
        ],
    },
    {
        id: 'peace',
        classId: 'cleric',
        name: 'Domaine de la Paix',
        nameEn: 'Peace Domain',
        description: 'Les dieux de la Paix inspirent la résolution des conflits et le renforcement des liens entre alliés.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Instrument de paix', description: 'Maîtrise d\'une compétence au choix : Perspicacité, Représentation ou Persuasion.', rules: [{ type: 'select', name: 'Compétence', targetType: 'skill', count: 1, options: ['ID_SKILL_INSIGHT', 'ID_SKILL_PERFORMANCE', 'ID_SKILL_PERSUASION'] }] },
            { level: 1, name: 'Lien encourageant', description: 'Action : liez jusqu\'à bonus de maîtrise créatures à 9m pendant 10 min. 1/tour, un lié à 9m d\'un autre lié peut ajouter 1d4 à un jet d\'attaque, caractéristique ou sauvegarde.', rules: [{ type: 'condition', condition: 'emboldening-bond', description: 'Action : liez jusqu\'à bonus de maîtrise créatures à 9m, 1d4 aux jets' }] },
            { level: 2, name: 'Conduit divin : Baume de paix', description: 'Action : déplacez-vous jusqu\'à votre vitesse. Chaque créature dont vous passez à 9m récupère 1d6 + mod SAG PV.' },
            { level: 6, name: 'Lien protecteur', description: 'Un allié lié à 9m d\'un autre lié peut utiliser sa réaction pour se téléporter à 1,5m et absorber les dégâts à sa place.', rules: [{ type: 'condition', condition: 'protective-bond', description: 'Allié lié peut se téléporter et absorber les dégâts en réaction' }] },
            { level: 8, name: 'Frappe puissante', description: '+mod SAG dégâts avec un sort mineur de Clerc.', rules: [{ type: 'condition', condition: 'potent-spellcasting-peace', description: '+mod SAG dégâts avec les sorts mineurs de Clerc' }] },
            { level: 17, name: 'Lien étendu', description: 'Lien encourageant et Lien protecteur portent à 18m. Les créatures utilisant Lien protecteur gagnent résistance aux dégâts absorbés.', rules: [{ type: 'condition', condition: 'expansive-bond', description: 'Liens à 18m, résistance aux dégâts absorbés' }] },
        ],
    },
    {
        id: 'twilight',
        classId: 'cleric',
        name: 'Domaine du Crépuscule',
        nameEn: 'Twilight Domain',
        description: 'Les dieux du Crépuscule gardent contre les horreurs de la nuit, apportant réconfort et protection dans l\'obscurité.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Maîtrise supplémentaire', description: 'Maîtrise des armes de guerre et des armures lourdes.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_WEAPON_MARTIAL' }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_HEAVY' }] },
            { level: 1, name: 'Yeux de la nuit', description: 'Vision dans le noir à 90m. Action : partagez cette vision avec des créatures consentantes à 3m pendant 1 heure.', rules: [{ type: 'condition', condition: 'eyes-of-night', description: 'Vision dans le noir à 90m, partageable' }] },
            { level: 1, name: 'Bénédiction vigilante', description: 'Action : touchez une créature pour lui donner avantage à son prochain jet d\'initiative.', rules: [{ type: 'condition', condition: 'vigilant-blessing', description: 'Action : avantage à l\'initiative d\'une créature' }] },
            { level: 2, name: 'Conduit divin : Sanctuaire crépusculaire', description: 'Action : sphère de lumière tamisée 9m pendant 1 minute. Les créatures y terminant leur tour gagnent 1d6 + niv Clerc PV temp OU mettent fin à un effet de charme/peur.' },
            { level: 6, name: 'Pas de la nuit', description: 'Action bonus en lumière faible/ténèbres : vitesse de vol = vitesse de marche pendant 1 minute (bonus de maîtrise fois par repos long).', rules: [{ type: 'condition', condition: 'steps-of-night', description: 'Action bonus : vol en lumière faible/ténèbres, bonus de maîtrise fois par repos long' }] },
            { level: 8, name: 'Frappe divine', description: '+1d8 dégâts radiants sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-twilight', damageType: 'radiant' }] },
            { level: 14, name: 'Frappe divine (2d8)', description: '+2d8 dégâts radiants sur une attaque d\'arme (1/tour).', rules: [{ type: 'damage_bonus', value: 0, condition: 'divine-strike-twilight-2d8', damageType: 'radiant' }] },
            { level: 17, name: 'Voile crépusculaire', description: 'Créatures au choix dans votre Sanctuaire crépusculaire bénéficient d\'un abri partiel.', rules: [{ type: 'condition', condition: 'twilight-shroud', description: 'Sanctuaire crépusculaire : abri partiel pour alliés au choix' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'land',
        classId: 'druid',
        name: 'Cercle de la Terre',
        nameEn: 'Circle of the Land',
        description: 'Des druides gardiens des anciens savoirs, qui tirent leur magie de la terre elle-même.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Sort mineur supplémentaire', description: 'Apprenez un sort mineur de Druide supplémentaire.',
                rules: [{ type: 'spell', spellId: 'druid-cantrip', alwaysKnown: true }]
            },
            {
                level: 2, name: 'Récupération naturelle', description: 'Au repos court, récupérez des emplacements de sorts d\'un total égal à la moitié de votre niveau (arrondi au supérieur).',
                rules: [{ type: 'resource', id: 'natural-recovery', name: 'Récupération naturelle', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }]
            },
            {
                level: 3, name: 'Sorts de cercle', description: 'Sorts supplémentaires toujours préparés selon votre terrain (Arctique, Côte, Désert, Forêt, Plaine, Marais, Montagne, Outreterre).',
                rules: [{ type: 'select', name: 'Terrain du cercle', targetType: 'trait', count: 1, options: ['land-arctic', 'land-coast', 'land-desert', 'land-forest', 'land-grassland', 'land-mountain', 'land-swamp', 'land-underdark'] }]
            },
            {
                level: 6, name: 'Foulée tellurique', description: 'Se déplacer en terrain difficile non-magique ne coûte pas de mouvement supplémentaire. Vous pouvez traverser les plantes non-magiques sans être ralenti.',
                rules: [{ type: 'condition', condition: 'land-stride', description: 'Terrain difficile non-magique sans malus, traverse plantes sans ralentissement' }]
            },
            {
                level: 10, name: 'Protégé de la nature', description: 'Immunité au poison et aux maladies. Immunité aux effets de charme ou de peur des élémentaires et des fées.',
                rules: [
                    { type: 'condition', condition: 'immunity-poison', description: 'Immunité au poison' },
                    { type: 'condition', condition: 'immunity-disease', description: 'Immunité aux maladies' },
                    { type: 'condition', condition: 'immunity-charm-fey-elemental', description: 'Immunité charme/peur des élémentaires et fées' }
                ]
            },
            {
                level: 14, name: 'Sanctuaire de la nature', description: 'Les bêtes et plantes hésitent à vous attaquer. JS Sagesse DD = DD de sort de Druide.',
                rules: [{ type: 'condition', condition: 'nature-sanctuary', description: 'Bêtes et plantes hésitent à vous attaquer' }]
            },
        ],
    },
    {
        id: 'moon',
        classId: 'druid',
        name: 'Cercle de la Lune',
        nameEn: 'Circle of the Moon',
        description: 'Des druides changeurs de forme dont la magie se manifeste en transformations bestiales puissantes.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Forme sauvage de combat', description: 'Utilisez Forme sauvage en action bonus. Transformez-vous en bêtes de FP 1 (au lieu de FP 1/4).',
                rules: [
                    { type: 'condition', condition: 'combat-wild-shape', description: 'Forme sauvage en action bonus, FP max 1' },
                    { type: 'condition', condition: 'moon-wild-shape-hp', description: 'Regagnez PV en transformant-vous : 1d8 par niveau de druide' }
                ]
            },
            {
                level: 6, name: 'Forme primordiale', description: 'Vos attaques en Forme sauvage comptent comme magiques. Transformez-vous en bêtes de FP = niveau de Druide / 3.',
                rules: [
                    { type: 'condition', condition: 'primal-strike', description: 'Attaques en Forme sauvage magiques' },
                    { type: 'condition', condition: 'elemental-wild-shape', description: 'FP max = niveau / 3 en Forme sauvage' }
                ]
            },
            {
                level: 10, name: 'Frappe élémentaire', description: 'Dépensez 2 Formes sauvages pour vous transformer en élémentaire (Air, Eau, Feu ou Terre).',
                rules: [
                    { type: 'resource', id: 'elemental-wild-shape', name: 'Forme élémentaire', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], recovery: 'short' }
                ]
            },
            {
                level: 14, name: 'Mille et une formes', description: 'Lancez Modification d\'apparence à volonté.',
                rules: [{ type: 'spell', spellId: 'alter-self', alwaysKnown: true }]
            },
        ],
    },
    {
        id: 'dreams',
        classId: 'druid',
        name: 'Cercle des Rêves',
        nameEn: 'Circle of Dreams',
        description: 'Des druides liés à la Féerie, qui apportent guérison et émerveillement grâce à l\'énergie féerique.',
        source: 'XGtE',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Soin de la cour d\'été', description: 'Action bonus : dépensez des d6 (réserve = niv druide) pour soigner une créature à 36m. La cible gagne aussi 1 PV temp par dé dépensé. Réserve récupérée au repos long.',
                rules: [
                    { type: 'resource', id: 'summer-court-healing', name: 'Soin de la cour d\'été', progression: [0, 0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], recovery: 'long' }
                ]
            },
            {
                level: 6, name: 'Foyer de clair de lune et d\'ombres', description: 'Au repos, créez une sphère invisible de 9m : +5 Discrétion et Perception pour vos alliés. Les flammes à l\'intérieur sont invisibles de l\'extérieur.',
                rules: [{ type: 'condition', condition: 'hearth-of-moonlight', description: 'Sphère de 9m : +5 Discrétion et Perception aux alliés' }]
            },
            {
                level: 10, name: 'Sentiers cachés', description: 'Action bonus : téléportez-vous de 18m. Ou action : téléportez une créature consentante de 9m. Mod SAG utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'hidden-paths', name: 'Sentiers cachés', progression: [0, 0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4], recovery: 'long' }
                ]
            },
            {
                level: 14, name: 'Marcheur en rêves', description: 'Après un repos court, lancez Rêve, Scrutation ou Cercle de téléportation (vers le dernier lieu de repos long) sans emplacement ni composantes.',
                rules: [
                    { type: 'spell', spellId: 'dream', alwaysKnown: true },
                    { type: 'spell', spellId: 'scrying', alwaysKnown: true },
                    { type: 'spell', spellId: 'teleportation-circle', alwaysKnown: true }
                ]
            },
        ],
    },
    {
        id: 'shepherd',
        classId: 'druid',
        name: 'Cercle du Berger',
        nameEn: 'Circle of the Shepherd',
        description: 'Des druides qui communient avec les esprits de la nature pour protéger les vulnérables et invoquer des alliés.',
        source: 'XGtE',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Langage des bois', description: 'Parlez, lisez et écrivez le Sylvestre. Les bêtes comprennent votre parole et vous comprenez leurs sons.',
                rules: [
                    { type: 'grant', targetType: 'language', targetId: 'sylvan' },
                    { type: 'condition', condition: 'speak-with-beasts', description: 'Les bêtes comprennent votre parole' }
                ]
            },
            {
                level: 2, name: 'Totem spirituel', description: 'Action bonus : invoquez un esprit (aura 9m, 1 min). Ours (5 + niv PV temp + avantage Force), Faucon (avantage Perception + réaction : attaque pour un allié), ou Licorne (avantage détection + sorts de soin : +1 PV à tous dans l\'aura). 1/repos court ou long.',
                rules: [
                    { type: 'resource', id: 'spirit-totem', name: 'Totem spirituel', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' },
                    { type: 'select', name: 'Esprit du totem', targetType: 'trait', count: 1, options: ['totem-bear', 'totem-hawk', 'totem-unicorn'] }
                ]
            },
            {
                level: 6, name: 'Invocateur puissant', description: 'Les bêtes et fées invoquées gagnent +2 PV par DV et leurs armes naturelles comptent comme magiques.',
                rules: [{ type: 'condition', condition: 'mighty-summoner', description: 'Bêtes et fées invoquées : +2 PV/DV et armes magiques' }]
            },
            {
                level: 10, name: 'Esprit gardien', description: 'Les bêtes et fées invoquées gagnent +2 CA. Le totem Licorne soigne de 5 + mod SAG au lieu de 1.',
                rules: [{ type: 'condition', condition: 'guardian-spirit', description: 'Bêtes et fées invoquées : +2 CA' }]
            },
            {
                level: 14, name: 'Invocations fidèles', description: 'Si vous tombez à 0 PV ou êtes incapacité, lancez automatiquement Invoquer des animaux (niv 9) : 4 bêtes FP 2 ou moins, sans concentration, 1 heure. 1/repos long.',
                rules: [{ type: 'resource', id: 'faithful-summons', name: 'Invocations fidèles', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }]
            },
        ],
    },
    {
        id: 'spores',
        classId: 'druid',
        name: 'Cercle des Spores',
        nameEn: 'Circle of Spores',
        description: 'Des druides qui embrassent le cycle de la vie et de la mort, manipulant les spores et la décomposition.',
        source: 'TCoE',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Halo de spores', description: 'Réaction : une créature à 3m subit 1d4 nécrotique (JS CON). Passe à 1d6 niv 6, 1d8 niv 10, 1d10 niv 14.',
                rules: [{ type: 'damage_bonus', value: 0, condition: 'halo-of-spores', damageType: 'necrotic' }]
            },
            {
                level: 2, name: 'Entité symbiotique', description: 'Action : dépensez Forme sauvage. Gagnez 4 × niv druide PV temp. Tant qu\'actif : Halo de spores inflige double dés + armes CàC infligent +1d6 nécrotique.',
                rules: [
                    { type: 'condition', condition: 'symbiotic-entity', description: '4×niv PV temp, Halo double, CàC +1d6 nécrotique' },
                    { type: 'damage_bonus', value: 0, condition: 'symbiotic-melee', damageType: 'necrotic' }
                ]
            },
            {
                level: 6, name: 'Infestation fongique', description: 'Réaction : si une bête ou humanoïde P ou M meurt à 3m, animez-la en zombie pendant 1 heure (mod SAG utilisations par repos long).',
                rules: [
                    { type: 'resource', id: 'fungal-infestation', name: 'Infestation fongique', progression: [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 4], recovery: 'long' }
                ]
            },
            {
                level: 10, name: 'Spores envahissantes', description: 'Action bonus (Entité symbiotique active) : lancez des spores à 9m créant un cube de 3m pendant 1 minute. Créatures y entrant/débutant subissent le Halo de spores.',
                rules: [{ type: 'grant', targetType: 'feature', targetId: 'spreading-spores' }]
            },
            {
                level: 14, name: 'Corps fongique', description: 'Immunité aux états aveuglé, assourdi, effrayé et empoisonné. Les coups critiques contre vous deviennent des coups normaux.',
                rules: [
                    { type: 'condition', condition: 'immunity-blinded', description: 'Immunité aveuglé' },
                    { type: 'condition', condition: 'immunity-deafened', description: 'Immunité assourdi' },
                    { type: 'condition', condition: 'immunity-frightened', description: 'Immunité effrayé' },
                    { type: 'condition', condition: 'immunity-poisoned', description: 'Immunité empoisonné' },
                    { type: 'condition', condition: 'fungal-body-crit', description: 'Critiques deviennent normaux' }
                ]
            },
        ],
    },
    {
        id: 'stars',
        classId: 'druid',
        name: 'Cercle des Étoiles',
        nameEn: 'Circle of Stars',
        description: 'Des druides qui puisent leur pouvoir dans les constellations et le cosmos pour éclairer et protéger.',
        source: 'TCoE',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Carte stellaire', description: 'Focaliseur d\'incantation. Vous connaissez Assistance et avez Trait lumineux toujours préparé (lançable sans emplacement bonus de maîtrise fois).',
                rules: [
                    { type: 'spell', spellId: 'guidance', alwaysKnown: true },
                    { type: 'spell', spellId: 'guiding-bolt', alwaysKnown: true }
                ]
            },
            {
                level: 2, name: 'Forme stellaire', description: 'Action bonus : dépensez Forme sauvage pour une forme lumineuse 10 min. Archer (1d8 radiant action bonus), Calice (sort de soin +1d8 PV à vous ou allié à 9m), ou Dragon (avantage concentration + jet minimum 10).',
                rules: [
                    { type: 'select', name: 'Constellation stellaire', targetType: 'trait', count: 1, options: ['star-archer', 'star-chalice', 'star-dragon'] }
                ]
            },
            {
                level: 6, name: 'Présage cosmique', description: 'Au repos long, lancez 1 dé. Pair : réaction +1d6 au jet d\'une créature. Impair : réaction −1d6. Bonus de maîtrise utilisations par repos long.',
                rules: [
                    { type: 'resource', id: 'cosmic-omen', name: 'Présage cosmique', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 10, name: 'Constellations scintillantes', description: 'Archer et Calice passent à 2d8. Dragon : vol 6m + changement de constellation au début de chaque tour en Forme stellaire.',
                rules: [
                    { type: 'condition', condition: 'twinkling-constellations', description: 'Archer/Calice 2d8, Dragon vol 6m' }
                ]
            },
            {
                level: 14, name: 'Plein d\'étoiles', description: 'En Forme stellaire : résistance aux dégâts contondants, perforants et tranchants.',
                rules: [
                    { type: 'condition', condition: 'full-of-stars', description: 'Résistance B/P/S en Forme stellaire' }
                ]
            },
        ],
    },
    {
        id: 'wildfire',
        classId: 'druid',
        name: 'Cercle des Flammes',
        nameEn: 'Circle of Wildfire',
        description: 'Des druides qui comprennent que la destruction est le prélude à la création, liés à un esprit de feu et de renouveau.',
        source: 'TCoE',
        subclassLevel: 2,
        features: [
            {
                level: 2, name: 'Invocation de l\'esprit des flammes', description: 'Action : dépensez Forme sauvage pour invoquer un Esprit des flammes à 9m (dégâts feu aux créatures adjacentes à l\'apparition). Il obéit à vos commandes.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'summon-wildfire-spirit' }
                ]
            },
            {
                level: 6, name: 'Lien renforcé', description: 'Sorts de feu ou soin avec l\'esprit actif : +1d8 à un jet de dégâts ou soin. Sorts à portée non-personnelle : origine depuis vous ou l\'esprit.',
                rules: [
                    { type: 'condition', condition: 'enhanced-bond', description: '+1d8 sorts feu/soin avec l\'esprit, origine depuis vous ou l\'esprit' }
                ]
            },
            {
                level: 10, name: 'Flammes cautérisantes', description: 'Quand une créature meurt à 9m de vous/l\'esprit, une flamme spectrale apparaît. Réaction : soignez ou infligez 2d10 + mod SAG dégâts feu à une créature qui entre dans l\'espace.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'cauterizing-flames' }
                ]
            },
            {
                level: 14, name: 'Résurrection ardente', description: 'Si vous tombez à 0 PV et l\'esprit est à 36m, il tombe à 0 PV à votre place. Vous remontez à la moitié de vos PV max (1/repos long).',
                rules: [
                    { type: 'resource', id: 'blazing-resurrection', name: 'Résurrection ardente', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }
                ]
            },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'champion',
        classId: 'fighter',
        name: 'Champion',
        nameEn: 'Champion',
        description: 'L\'archétype du guerrier pur, focalisé sur la perfection physique et les coups dévastateurs.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Critique amélioré', description: 'Vos attaques sont des coups critiques sur un 19 ou un 20.', rules: [{ type: 'condition', condition: 'critical-range-19-20', description: 'Zone de critique 19-20' }] },
            { level: 7, name: 'Athlète remarquable', description: 'Ajoutez la moitié de votre bonus de maîtrise (arrondi au supérieur) à tout test de Force, Dextérité ou Constitution que vous ne maîtrisez pas déjà.', rules: [{ type: 'condition', condition: 'remarkable-athlete', description: '+½ maîtrise aux tests de FOR/DEX/CON non maîtrisés' }] },
            { level: 10, name: 'Style de combat supplémentaire', description: 'Choisissez un second style de combat.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'second-fighting-style' }] },
            { level: 15, name: 'Critique supérieur', description: 'Vos attaques sont des coups critiques sur un 18, 19 ou 20.', rules: [{ type: 'condition', condition: 'critical-range-18-20', description: 'Zone de critique 18-20' }] },
            { level: 18, name: 'Survivant', description: 'Au début de chacun de vos tours, regagnez 5 + mod CON PV si vous avez la moitié ou moins de vos PV max.', rules: [{ type: 'condition', condition: 'survivor-regen', description: 'Régénération 5 + mod CON au début du tour si ≤ 50% PV' }] },
        ],
    },
    {
        id: 'battle_master',
        classId: 'fighter',
        name: 'Maître de Bataille',
        nameEn: 'Battle Master',
        description: 'Un tacticien qui utilise des manœuvres de supériorité pour contrôler le champ de bataille.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Supériorité martiale', description: 'Apprenez 3 manœuvres et gagnez 4 dés de supériorité (d8). Manœuvres : Attaque menaçante, Balayage, Coup précis, Désarmement, Diversion, Feinte, Manœuvre tactique, Parade, Provocation, Renversement, Riposte, etc.',
                rules: [
                    { type: 'resource', id: 'superiority-dice', name: 'Dés de supériorité', progression: [0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 6], recovery: 'short' },
                    { type: 'select', name: 'Manœuvres', targetType: 'trait', count: 3, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }
                ]
            },
            { level: 7, name: 'Connais ton ennemi', description: 'Après 1 minute d\'observation, apprenez si la créature est supérieure, égale ou inférieure à vous dans 2 caractéristiques.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'know-your-enemy' }] },
            { level: 10, name: 'Supériorité martiale améliorée', description: '2 manœuvres supplémentaires, 5 dés de supériorité. Le dé passe à d10.', rules: [{ type: 'select', name: 'Manœuvre supplémentaire', targetType: 'trait', count: 2, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }] },
            { level: 15, name: 'Implacable', description: 'Regagnez 1 dé de supériorité si vous n\'en avez plus au jet d\'initiative.', rules: [{ type: 'condition', condition: 'relentless-superiority-dice', description: 'Regagne 1 dé de supériorité au jet d\'initiative si épuisé' }] },
            { level: 18, name: 'Supériorité martiale supérieure', description: '2 manœuvres supplémentaires, 6 dés de supériorité. Le dé passe à d12.', rules: [{ type: 'select', name: 'Manœuvre supplémentaire', targetType: 'trait', count: 2, options: ['maneuver-ambush', 'maneuver-bait-and-switch', 'maneuver-commanders-strike', 'maneuver-disarming-attack', 'maneuver-distracting-strike', 'maneuver-evasive-footwork', 'maneuver-feinting-attack', 'maneuver-goading-attack', 'maneuver-lunging-attack', 'maneuver-maneuvering-attack', 'maneuver-menacing-attack', 'maneuver-parry', 'maneuver-precision-attack', 'maneuver-pushing-attack', 'maneuver-rally', 'maneuver-riposte', 'maneuver-sweeping-attack', 'maneuver-trip-attack'] }] },
        ],
    },
    {
        id: 'eldritch_knight',
        classId: 'fighter',
        name: 'Chevalier Occulte',
        nameEn: 'Eldritch Knight',
        description: 'Un guerrier qui combine la maîtrise des armes avec l\'étude de l\'Abjuration et de l\'Évocation.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Incantation', description: 'Lancez des sorts de Magicien (INT). 2 sorts mineurs + 3 sorts de niveau 1 (principalement Abjuration et Évocation).',
                rules: [
                    { type: 'spell', spellId: 'eldritch-knight-cantrips', alwaysKnown: true },
                    { type: 'spell', spellId: 'eldritch-knight-spells', alwaysKnown: true }
                ]
            },
            { level: 3, name: 'Lien d\'arme', description: 'Liez-vous à une arme. Vous ne pouvez pas être désarmé et pouvez invoquer l\'arme en action bonus.', rules: [{ type: 'condition', condition: 'weapon-bond', description: 'Arme liée : invocable en action bonus, impossible à désarmer' }] },
            { level: 7, name: 'Magie de guerre', description: 'Lorsque vous lancez un sort mineur en action, effectuez une attaque en action bonus.', rules: [{ type: 'condition', condition: 'war-magic-bonus-action', description: 'Attaque en action bonus après un sort mineur' }] },
            { level: 10, name: 'Coup arcanique', description: 'Lorsque vous touchez avec une attaque, le prochain sort que vous lancez contre la même cible a un avantage au jet d\'attaque avant la fin de votre prochain tour.', rules: [{ type: 'condition', condition: 'eldritch-strike', description: 'Avantage au prochain sort contre la cible touchée' }] },
            { level: 15, name: 'Charge arcanique', description: 'Vous pouvez vous téléporter de 9m avant ou après votre Fougue.', rules: [{ type: 'condition', condition: 'arcane-charge-teleport', description: 'Téléportation 9m avant/après Fougue' }] },
            { level: 18, name: 'Magie de guerre améliorée', description: 'Lorsque vous lancez un sort en action, effectuez une attaque en action bonus.', rules: [{ type: 'condition', condition: 'improved-war-magic', description: 'Attaque en action bonus après n\'importe quel sort' }] },
        ],
    },
    {
        id: 'arcane_archer',
        classId: 'fighter',
        name: 'Archer Arcanique',
        nameEn: 'Arcane Archer',
        description: 'Un guerrier qui tisse la magie dans ses flèches pour produire des effets surnaturels.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Savoir de l\'archer arcanique', description: 'Maîtrise d\'Arcanes ou Nature. Apprenez le sort mineur Prestidigitation ou Druidisme.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'arcana-or-nature' }, { type: 'select', name: 'Sort mineur', targetType: 'spell', count: 1, options: ['prestidigitation', 'druidcraft'] }] },
            { level: 3, name: 'Tir arcanique', description: 'Apprenez 2 options de Tir arcanique. 1/tour, appliquez un effet à une flèche (arc court/long). 2 utilisations par repos court ou long.', rules: [{ type: 'resource', id: 'arcane-shot', name: 'Tirs arcaniques', progression: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], recovery: 'short' }, { type: 'select', name: 'Options de Tir arcanique', targetType: 'trait', count: 2, options: ['arcane-shot-banishing', 'arcane-shot-beguiling', 'arcane-shot-bursting', 'arcane-shot-enfeebling', 'arcane-shot-grasping', 'arcane-shot-piercing', 'arcane-shot-seeking', 'arcane-shot-shadow', 'arcane-shot-transfixing'] }] },
            { level: 7, name: 'Flèche magique', description: 'Vos flèches non-magiques comptent comme magiques. Si vous manquez, action bonus pour relancer l\'attaque contre une autre cible à 18m.', rules: [{ type: 'condition', condition: 'magic-arrow', description: 'Flèches non-magiques comptent comme magiques' }, { type: 'grant', targetType: 'feature', targetId: 'magic-arrow-reroll' }] },
            { level: 10, name: 'Tir arcanique supplémentaire', description: 'Apprenez une option de Tir arcanique supplémentaire.', rules: [{ type: 'select', name: 'Option de Tir arcanique supplémentaire', targetType: 'trait', count: 1, options: ['arcane-shot-banishing', 'arcane-shot-beguiling', 'arcane-shot-bursting', 'arcane-shot-enfeebling', 'arcane-shot-grasping', 'arcane-shot-piercing', 'arcane-shot-seeking', 'arcane-shot-shadow', 'arcane-shot-transfixing'] }] },
            { level: 15, name: 'Tir toujours prêt', description: 'Si vous n\'avez plus de Tir arcanique au jet d\'initiative, vous en regagnez 1.', rules: [{ type: 'condition', condition: 'ever-ready-shot', description: 'Regagne 1 Tir arcanique au jet d\'initiative si épuisé' }] },
            { level: 18, name: 'Tir arcanique amélioré', description: 'Tous vos Tirs arcaniques voient leurs effets améliorés (dégâts augmentés).', rules: [{ type: 'damage_bonus', value: 0, condition: 'improved-arcane-shot', damageType: 'force' }] },
        ],
    },
    {
        id: 'cavalier',
        classId: 'fighter',
        name: 'Cavalier',
        nameEn: 'Cavalier',
        description: 'Un guerrier qui excelle au combat monté et à la protection de ses alliés.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise d\'une compétence (Dressage, Histoire, Perspicacité, Représentation ou Persuasion) ou d\'une langue.', rules: [{ type: 'select', name: 'Maîtrise supplémentaire', targetType: 'skill', count: 1, options: ['animal-handling', 'history', 'insight', 'performance', 'persuasion', 'language'] }] },
            { level: 3, name: 'Né en selle', description: 'Avantage aux JS pour ne pas tomber de monture. Monter/descendre ne coûte que 1,5m. Si vous tombez de ≤ 3m, atterrissez debout.', rules: [{ type: 'condition', condition: 'born-to-the-saddle', description: 'Avantage JS pour rester en selle, montée/descente 1,5m, chute ≤ 3m = debout' }] },
            { level: 3, name: 'Marque implacable', description: 'Marquez une créature touchée au CàC. Elle a désavantage aux attaques ne vous ciblant pas. Si elle blesse un autre, action bonus : attaque CàC avec avantage (+demi niv dégâts). Mod FOR fois par repos long.', rules: [{ type: 'resource', id: 'unyielding-mark', name: 'Marque implacable', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }, { type: 'condition', condition: 'unyielding-mark-effect', description: 'Marquée = désavantage aux attaques contre les autres' }] },
            { level: 7, name: 'Manœuvre protectrice', description: 'Réaction : +1d8 CA à vous, votre monture ou une créature à 1,5m. Si l\'attaque touche quand même, résistance aux dégâts. Mod CON fois par repos long.', rules: [{ type: 'resource', id: 'warding-maneuver', name: 'Manœuvre protectrice', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }] },
            { level: 10, name: 'Tenir la ligne', description: 'Les créatures à portée provoquent une attaque d\'opportunité si elles se déplacent de 1,5m+. Si vous touchez, vitesse réduite à 0.', rules: [{ type: 'condition', condition: 'hold-the-line', description: 'Attaque d\'opportunité si déplacement ≥ 1,5m, vitesse à 0 si touché' }] },
            { level: 15, name: 'Charge féroce', description: 'Si vous vous déplacez de 3m+ en ligne droite avant d\'attaquer, la cible doit réussir un JS FOR ou être mise à terre (1/tour).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'ferocious-charge' }] },
            { level: 18, name: 'Défenseur vigilant', description: 'Nombre illimité d\'attaques d\'opportunité par round (mais pas d\'autre réaction ce tour).', rules: [{ type: 'condition', condition: 'vigilant-defender', description: 'Attaques d\'opportunité illimitées (pas d\'autre réaction ce tour)' }] },
        ],
    },
    {
        id: 'samurai',
        classId: 'fighter',
        name: 'Samouraï',
        nameEn: 'Samurai',
        description: 'Un guerrier animé par un esprit combatif implacable, mêlant élégance et puissance au combat.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise d\'une compétence (Histoire, Perspicacité, Représentation ou Persuasion) ou d\'une langue.', rules: [{ type: 'select', name: 'Maîtrise supplémentaire', targetType: 'skill', count: 1, options: ['history', 'insight', 'performance', 'persuasion', 'language'] }] },
            { level: 3, name: 'Esprit combatif', description: 'Action bonus : avantage à toutes les attaques d\'arme ce tour + 5 PV temp (10 niv 10, 15 niv 15). 3/repos long.', rules: [{ type: 'resource', id: 'fighting-spirit', name: 'Esprit combatif', progression: [0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], recovery: 'long' }, { type: 'condition', condition: 'fighting-spirit-temp-hp', description: '5 PV temporaires (10 niv 10, 15 niv 15)' }] },
            { level: 7, name: 'Courtisan élégant', description: '+mod SAG aux jets de Persuasion. Maîtrise des JS Sagesse (ou INT/CHA si déjà maîtrisé).', rules: [{ type: 'save_bonus', value: 0, condition: 'elegant-courtier-wis-save', save: 'wis' }, { type: 'condition', condition: 'elegant-courtier-persuasion', description: '+mod SAG à Persuasion' }] },
            { level: 10, name: 'Esprit infatigable', description: 'Si plus d\'Esprit combatif au jet d\'initiative, regagnez 1 utilisation.', rules: [{ type: 'condition', condition: 'indomitable-spirit', description: 'Regagne 1 Esprit combatif au jet d\'initiative si épuisé' }] },
            { level: 15, name: 'Frappe rapide', description: 'Si vous avez avantage, renoncez-y sur une attaque pour effectuer une attaque supplémentaire (1/tour).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'rapid-strike' }] },
            { level: 18, name: 'Force avant la mort', description: 'Réaction à 0 PV : prenez un tour supplémentaire immédiatement (1/repos long).', rules: [{ type: 'resource', id: 'strength-before-death', name: 'Force avant la mort', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'psi_warrior',
        classId: 'fighter',
        name: 'Guerrier Psionique',
        nameEn: 'Psi Warrior',
        description: 'Un guerrier éveillé aux pouvoirs psioniques, augmentant ses prouesses avec des frappes et boucliers de force mentale.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Énergie psionique', description: 'Dés d\'énergie psionique (d6, 2 × bonus maîtrise). Champ protecteur (réaction : -dé-mod INT dégâts à 9m), Frappe psionique (1/tour : +dé+mod INT force), Mouvement télékinétique (action bonus : déplacez objet/créature à 9m).',
                rules: [
                    { type: 'resource', id: 'psionic-energy-dice', name: 'Dés d\'énergie psionique', progression: [0, 0, 4, 4, 4, 4, 6, 6, 6, 6, 6, 6, 8, 8, 8, 8, 8, 8, 8, 8], recovery: 'long' },
                    { type: 'condition', condition: 'psionic-power', description: 'Champ protecteur, Frappe psionique, Mouvement télékinétique' }
                ]
            },
            { level: 7, name: 'Adepte télékinétique', description: 'Saut psionique (action bonus : vol = 10 × dé m ce tour). Poussée télékinétique (sur Frappe psionique : JS FOR ou à terre/repoussé 3m).', rules: [{ type: 'condition', condition: 'telekinetic-adept', description: 'Saut psionique et Poussée télékinétique' }] },
            { level: 10, name: 'Esprit protégé', description: 'Résistance aux dégâts psychiques. Dépensez 1 dé pour mettre fin aux effets charmé/effrayé.', rules: [{ type: 'condition', condition: 'guarded-mind', description: 'Résistance aux dégâts psychiques, fin charme/peur avec 1 dé' }] },
            { level: 15, name: 'Rempart de force', description: 'Action bonus : jusqu\'à mod INT créatures à 9m gagnent un abri partiel pendant 1 minute (1/repos long ou 1 dé).', rules: [{ type: 'resource', id: 'bulwark-of-force', name: 'Rempart de force', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 18, name: 'Maître télékinétique', description: 'Lancez Télékinésie en action bonus sans emplacement (1/repos long ou 3 dés).', rules: [{ type: 'resource', id: 'telekinetic-master', name: 'Maître télékinétique', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'rune_knight',
        classId: 'fighter',
        name: 'Chevalier Runique',
        nameEn: 'Rune Knight',
        description: 'Un guerrier qui utilise le pouvoir surnaturel des runes des géants pour renforcer ses capacités martiales.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise des outils de forgeron. Parlez, lisez et écrivez le Géant.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'smiths-tools' }, { type: 'grant', targetType: 'language', targetId: 'giant' }] },
            { level: 3, name: 'Graveur de runes', description: 'Apprenez 2 runes (Feu, Givre, Pierre, Nuage). Inscrivez-les sur des objets au repos long. Chaque rune donne un bonus passif + un effet activable (1/repos court ou long).', rules: [{ type: 'select', name: 'Runes', targetType: 'trait', count: 2, options: ['rune-cloud', 'rune-fire', 'rune-frost', 'rune-stone'] }] },
            { level: 3, name: 'Puissance du géant', description: 'Action bonus : grandissez à taille G pendant 1 min. Avantage FOR + 1d6 dégâts supplémentaires 1/tour. Bonus de maîtrise utilisations par repos long.', rules: [{ type: 'resource', id: 'giant-might', name: 'Puissance du géant', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6], recovery: 'long' }, { type: 'damage_bonus', value: 0, condition: 'giant-might-damage', damageType: 'force' }] },
            { level: 7, name: 'Bouclier runique', description: 'Réaction : quand une créature à 18m touche une cible autre que vous, forcez-la à relancer l\'attaque.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'rune-shield' }] },
            { level: 10, name: 'Grande stature', description: 'Puissance du géant passe à +1d8. Vous grandissez de 3d10 cm.', rules: [{ type: 'condition', condition: 'great-stature', description: 'Puissance du géant +1d8, +3d10 cm' }] },
            { level: 15, name: 'Maître des runes', description: 'Chaque rune peut être invoquée 2 fois entre repos (au lieu de 1). Apprenez une rune supplémentaire.', rules: [{ type: 'select', name: 'Rune supplémentaire', targetType: 'trait', count: 1, options: ['rune-cloud', 'rune-fire', 'rune-frost', 'rune-stone'] }, { type: 'condition', condition: 'rune-master', description: 'Chaque rune invoquable 2 fois entre repos' }] },
            { level: 18, name: 'Juggernaut runique', description: 'Puissance du géant passe à +1d10. Vous pouvez grandir à taille TG et votre allonge augmente de 1,5m.', rules: [{ type: 'condition', condition: 'runic-juggernaut', description: 'Puissance du géant +1d10, taille TG, allonge +1,5m' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'open_hand',
        classId: 'monk',
        name: 'Voie de la Paume',
        nameEn: 'Way of the Open Hand',
        description: 'La maîtrise totale des arts martiaux, focalisée sur le combat à mains nues et la manipulation du Ki.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Technique de la paume', description: 'Après avoir touché avec Déluge de coups : poussez de 4,5m (JS DEX), mettez à terre (JS DEX), ou empêchez les réactions (pas de JS).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'open-hand-technique' }
                ]
            },
            {
                level: 6, name: 'Plénitude physique', description: 'En action, récupérez PV = 3 × niveau de Moine (1/repos long).',
                rules: [
                    { type: 'resource', id: 'wholeness-of-body', name: 'Plénitude physique', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Tranquillité', description: 'Au repos long, gagnez le bénéfice de Sanctuaire jusqu\'au début de votre prochain repos long (DD = 8 + mod SAG + bonus de maîtrise).',
                rules: [
                    { type: 'condition', condition: 'tranquility', description: 'Sanctuaire au repos long' }
                ]
            },
            {
                level: 17, name: 'Paume vibratoire', description: 'Touchez une créature et infligez-lui des vibrations. Vous pouvez les déclencher à tout moment pour la réduire à 0 PV (JS CON DD de Ki).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'quivering-palm' }
                ]
            },
        ],
    },
    {
        id: 'shadow',
        classId: 'monk',
        name: 'Voie de l\'Ombre',
        nameEn: 'Way of Shadow',
        description: 'Un ninja qui canalise le Ki pour maîtriser les ténèbres et se téléporter entre les ombres.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Arts de l\'ombre', description: 'Dépensez 2 Ki pour lancer Ténèbres, Vision dans le noir, Passage sans trace, ou Silence.',
                rules: [
                    { type: 'spell', spellId: 'darkness', alwaysKnown: true },
                    { type: 'spell', spellId: 'darkvision', alwaysKnown: true },
                    { type: 'spell', spellId: 'pass-without-trace', alwaysKnown: true },
                    { type: 'spell', spellId: 'silence', alwaysKnown: true }
                ]
            },
            {
                level: 6, name: 'Pas d\'ombre', description: 'Téléportez-vous de 18m d\'une zone de lumière faible/ténèbres à une autre en action bonus. Avantage à la première attaque de mêlée du même tour.',
                rules: [
                    { type: 'condition', condition: 'shadow-step', description: 'Téléportation entre ombres, avantage première attaque' }
                ]
            },
            {
                level: 11, name: 'Manteau d\'ombres', description: 'Devenez invisible dans une zone de lumière faible/ténèbres (en action). L\'invisibilité dure jusqu\'à ce que vous attaquiez ou lanciez un sort.',
                rules: [
                    { type: 'condition', condition: 'cloak-of-shadows', description: 'Invisible dans lumière faible/ténèbres' }
                ]
            },
            {
                level: 17, name: 'Opportuniste', description: 'Effectuez une attaque de mêlée en réaction lorsqu\'un allié touche une créature à 1,5m de vous.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'opportunist' }
                ]
            },
        ],
    },
    {
        id: 'drunken_master',
        classId: 'monk',
        name: 'Voie de l\'Ivrogne',
        nameEn: 'Way of the Drunken Master',
        description: 'Un moine qui se déplace de façon imprévisible et chancelante, rendant ses mouvements impossibles à anticiper.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Maîtrise supplémentaire', description: 'Maîtrise de Représentation et des outils de brasseur.',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_PERFORMANCE' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'brewers-supplies' }
                ]
            },
            {
                level: 3, name: 'Technique de l\'ivrogne', description: 'Quand vous utilisez Déluge de coups, vous bénéficiez de Désengagement et +3m de vitesse jusqu\'à la fin du tour.',
                rules: [
                    { type: 'condition', condition: 'drunken-technique', description: 'Déluge de coups = Désengagement +3m vitesse' }
                ]
            },
            {
                level: 6, name: 'Démarche chancelante', description: 'Se relever d\'à terre ne coûte que 1,5m. Réaction quand une attaque CàC vous manque : dépensez 1 Ki pour rediriger l\'attaque contre une créature à 1,5m.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'tipsy-sway' }
                ]
            },
            {
                level: 11, name: 'Chance de l\'ivrogne', description: 'Dépensez 2 Ki pour annuler le désavantage sur un jet de caractéristique, d\'attaque ou de sauvegarde.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'drunkards-luck' }
                ]
            },
            {
                level: 17, name: 'Frénésie enivrée', description: 'Déluge de coups : effectuez jusqu\'à 5 attaques (action bonus), chacune contre une cible différente.',
                rules: [
                    { type: 'condition', condition: 'intoxicated-frenzy', description: 'Déluge de coups = jusqu\'à 5 attaques contre cibles différentes' }
                ]
            },
        ],
    },
    {
        id: 'kensei',
        classId: 'monk',
        name: 'Voie du Kensei',
        nameEn: 'Way of the Kensei',
        description: 'Un maître d\'armes qui considère ses armes comme une extension de son corps, alliant précision et beauté martiale.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Voie du kensei', description: 'Choisissez 2 armes kensei (1 CàC, 1 à distance, non lourde/spéciale ou arc long). Parade agile (+2 CA si frappe à mains nues + arme kensei CàC). Tir du kensei (+1d4 dégâts à distance, action bonus). + calligraphie/peinture.',
                rules: [
                    { type: 'select', name: 'Armes Kensei', targetType: 'weapon', count: 2, options: ['longsword', 'shortsword', 'longbow', 'whip', 'scimitar'] },
                    { type: 'condition', condition: 'agile-parry', description: '+2 CA si frappe à mains nues + arme kensei CàC' },
                    { type: 'damage_bonus', value: 0, condition: 'kensei-shot', damageType: 'weapon' }
                ]
            },
            {
                level: 6, name: 'Un avec la lame', description: 'Armes kensei comptent comme magiques. Frappe habile : dépensez 1 Ki pour +dé d\'arts martiaux dégâts (1/tour).',
                rules: [
                    { type: 'condition', condition: 'magic-kensei-weapons', description: 'Armes kensei magiques' },
                    { type: 'damage_bonus', value: 0, condition: 'deft-strike', damageType: 'weapon' }
                ]
            },
            {
                level: 11, name: 'Affûter la lame', description: 'Action bonus : dépensez jusqu\'à 3 Ki pour +1/+2/+3 attaque et dégâts sur une arme kensei pendant 1 minute.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'sharpen-the-blade' }
                ]
            },
            {
                level: 17, name: 'Précision infaillible', description: 'Si vous manquez avec une arme de moine, relancez le jet (1/tour).',
                rules: [
                    { type: 'condition', condition: 'unerring-accuracy', description: 'Relance d\'un jet d\'attaque manqué 1/tour' }
                ]
            },
        ],
    },
    {
        id: 'sun_soul',
        classId: 'monk',
        name: 'Voie de l\'Âme Solaire',
        nameEn: 'Way of the Sun Soul',
        description: 'Un moine qui canalise son énergie vitale en rayons de lumière brûlante.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Rayon de soleil radiant', description: 'Attaque à distance (9m) infligeant dégâts radiants = dé d\'arts martiaux + mod DEX. Dépensez 1 Ki pour 2 attaques en action bonus.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'radiant-sun-bolt', damageType: 'radiant' }
                ]
            },
            {
                level: 6, name: 'Arc solaire brûlant', description: 'Après action Attaquer, dépensez 2 Ki pour lancer Mains brûlantes en action bonus. +1 Ki par niveau supérieur (max = demi niveau moine).',
                rules: [
                    { type: 'spell', spellId: 'burning-hands', alwaysKnown: true }
                ]
            },
            {
                level: 11, name: 'Explosion solaire', description: 'Action : orbe à 45m, sphère 6m. JS CON ou 2d6 radiants. Dépensez jusqu\'à 3 Ki (+2d6 par Ki).',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'searing-arc-strike' }
                ]
            },
            {
                level: 17, name: 'Bouclier solaire', description: 'Aura de lumière vive 9m. Réaction quand touché au CàC : 5 + mod SAG dégâts radiants.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'sun-shield', damageType: 'radiant' }
                ]
            },
        ],
    },
    {
        id: 'mercy',
        classId: 'monk',
        name: 'Voie de la Miséricorde',
        nameEn: 'Way of Mercy',
        description: 'Un moine masqué qui manipule la force vitale pour soigner ou infliger une mort rapide.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Instruments de miséricorde', description: 'Maîtrise de Perspicacité, Médecine et du kit d\'herboriste. Vous gagnez un masque.',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_INSIGHT' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_MEDICINE' },
                    { type: 'grant', targetType: 'proficiency', targetId: 'herbalism-kit' }
                ]
            },
            {
                level: 3, name: 'Mains guérisseuses', description: 'Action : dépensez 1 Ki, touchez une créature → soignez dé d\'arts martiaux + mod SAG PV. Gratuit si remplace une frappe de Déluge de coups.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'hand-of-harmony' }
                ]
            },
            {
                level: 3, name: 'Mains blessantes', description: '1 Ki quand vous touchez à mains nues : +dé d\'arts martiaux + mod SAG dégâts nécrotiques (1/tour).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'hand-of-harm', damageType: 'necrotic' }
                ]
            },
            {
                level: 6, name: 'Toucher du médecin', description: 'Mains guérisseuses : mettez aussi fin à 1 maladie ou état (aveuglé, assourdi, paralysé, empoisonné, étourdi). Mains blessantes : la cible est empoisonnée.',
                rules: [
                    { type: 'condition', condition: 'physicians-touch', description: 'Mains guérisseuses : soignent états. Mains blessantes : empoisonnent.' }
                ]
            },
            {
                level: 11, name: 'Déluge de soins et de blessures', description: 'Déluge de coups : remplacez les 2 frappes par Mains guérisseuses gratuites, ou utilisez Mains blessantes 1 fois gratuitement.',
                rules: [
                    { type: 'condition', condition: 'flurry-of-blows-healing', description: 'Déluge de coups peut soigner ou blesser gratuitement' }
                ]
            },
            {
                level: 17, name: 'Main de la miséricorde ultime', description: 'Action : touchez un cadavre (mort ≤ 24h), dépensez 5 Ki → résurrection avec 4d10 + mod SAG PV (1/repos long).',
                rules: [
                    { type: 'resource', id: 'hand-of-ultimate-mercy', name: 'Miséricorde ultime', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'astral_self',
        classId: 'monk',
        name: 'Voie de l\'Être Astral',
        nameEn: 'Way of the Astral Self',
        description: 'Un moine qui manifeste son véritable être sous forme astrale, une extension spectrale de son Ki.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Bras de l\'être astral', description: 'Action bonus, 1 Ki : bras spectraux 10 min. Portée CàC +1,5m, dégâts de force, utilisez SAG pour attaque/dégâts/tests FOR. À l\'apparition : 2 × dé arts martiaux force aux créatures à 3m (JS DEX).',
                rules: [
                    { type: 'condition', condition: 'arms-of-the-astral-self', description: 'Bras astraux : portée +1,5m, dégâts force, SAG pour attaque/dégâts/FOR' },
                    { type: 'damage_bonus', value: 0, condition: 'astral-arms-summon', damageType: 'force' }
                ]
            },
            {
                level: 6, name: 'Visage de l\'être astral', description: 'Action bonus, 1 Ki : visage spectral 10 min. Vision dans le noir magique, avantage Perspicacité et Intimidation, voix projetée à 180m.',
                rules: [
                    { type: 'condition', condition: 'visage-of-the-astral-self', description: 'Vision dans le noir magique, avantage Perspicacité/Intimidation, voix 180m' }
                ]
            },
            {
                level: 11, name: 'Corps de l\'être astral', description: 'Quand bras + visage actifs : Déviation d\'énergie (réaction : -1d10-mod SAG-niv moine dégâts acide/froid/feu/force/foudre/tonnerre). Bras renforcés (+dé arts martiaux 1/tour).',
                rules: [
                    { type: 'condition', condition: 'body-of-the-astral-self', description: 'Déviation d\'énergie, bras renforcés +dé arts martiaux' }
                ]
            },
            {
                level: 17, name: 'Être astral éveillé', description: '5 Ki : invoquez bras + visage + corps éveillés 10 min. +2 CA. Attaque supplémentaire : 3 attaques avec les bras astraux.',
                rules: [
                    { type: 'condition', condition: 'awakened-astral-self', description: '+2 CA, 3 attaques avec bras astraux' }
                ]
            },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'devotion',
        classId: 'paladin',
        name: 'Serment de Dévotion',
        nameEn: 'Oath of Devotion',
        description: 'L\'archétype du chevalier en armure étincelante, dévoué à la justice et à la vertu.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Arme sacrée', description: 'En action, ajoutez mod CHA au jet d\'attaque pendant 1 minute. L\'arme émet une lumière vive à 6m.', rules: [{ type: 'condition', condition: 'sacred-weapon', description: 'Action : +mod CHA aux jets d\'attaque pendant 1 min, lumière vive 6m' }] },
            { level: 3, name: 'Conduit divin : Renvoi des impies', description: 'Les fiélons et morts-vivants à 9m doivent réussir un JS Sagesse ou fuir pendant 1 minute.', rules: [{ type: 'condition', condition: 'turn-the-unholy', description: 'Fiélons et morts-vivants à 9m : JS SAG ou fuient 1 min' }] },
            { level: 7, name: 'Aura de dévotion', description: 'Vous et vos alliés à 3m ne pouvez pas être charmés.', rules: [{ type: 'condition', condition: 'aura-of-devotion', description: 'Immunité au charme pour vous et alliés à 3m (9m au niv 18)' }] },
            { level: 15, name: 'Pureté de l\'esprit', description: 'Vous êtes toujours sous l\'effet de Protection contre le bien et le mal.', rules: [{ type: 'condition', condition: 'purity-of-spirit', description: 'Protection contre le bien et le mal permanent' }] },
            { level: 20, name: 'Nimbe sacré', description: 'Lumière vive à 9m pendant 1 minute. +10 dégâts radiants. Les fiélons et morts-vivants ont un désavantage contre vous.', rules: [{ type: 'condition', condition: 'holy-nimbus', description: '1 min : lumière 9m, +10 radiants, désavantage fiélons/morts-vivants' }] },
        ],
    },
    {
        id: 'ancients',
        classId: 'paladin',
        name: 'Serment des Anciens',
        nameEn: 'Oath of the Ancients',
        description: 'Un paladin qui préserve la lumière et la vie contre les ténèbres et la destruction, en harmonie avec la nature.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Nature sauvage', description: 'Action : plantes à 9m s\'enroulent autour des créatures (JS FOR ou immobilisées, répétable).', rules: [{ type: 'condition', condition: 'natures-wrath', description: 'Action : immobilise créatures à 9m (JS FOR)' }] },
            { level: 3, name: 'Conduit divin : Rejet de la vie', description: 'Réaction quand une créature à 1,5m meurt : regagnez PV = 5 + niveau de paladin.', rules: [{ type: 'condition', condition: 'rebel-the-violent', description: 'Réaction : 5 + niv paladin PV quand créature meurt à 1,5m' }] },
            { level: 7, name: 'Aura de garde', description: 'Vous et les alliés à 3m gagnez la résistance aux dégâts de sorts. Portée 9m au niv 18.', rules: [{ type: 'condition', condition: 'aura-of-warding', description: 'Résistance aux dégâts de sorts pour vous et alliés à 3m (9m au niv 18)' }] },
            { level: 15, name: 'Vie éternelle', description: 'Vous ne pouvez pas vieillir magiquement. Vous ne pouvez pas être charmé.', rules: [{ type: 'condition', condition: 'undying-sentinel', description: 'Pas de vieillissement magique, immunité au charme' }] },
            { level: 20, name: 'Ancien champion', description: 'Action bonus, 1 min : lumière faible à 9m, avantage JS, ennemis à 9m désavantage JS, régénération 10 PV/tour.', rules: [{ type: 'condition', condition: 'elder-champion', description: '1 min : lumière 9m, avantage JS, ennemis désavantage JS, régénération 10 PV/tour' }] },
        ],
    },
    {
        id: 'vengeance',
        classId: 'paladin',
        name: 'Serment de Vengeance',
        nameEn: 'Oath of Vengeance',
        description: 'Un paladin qui a juré de punir ceux qui ont commis des péchés impardonnables.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Vœu d\'hostilité', description: 'En action bonus, avantage aux jets d\'attaque contre une créature pendant 1 minute.', rules: [{ type: 'condition', condition: 'vow-of-enmity', description: 'Action bonus : avantage aux attaques contre une cible pendant 1 min' }] },
            { level: 3, name: 'Conduit divin : Renvoi des impies', description: 'Comme le Serment de Dévotion.', rules: [{ type: 'condition', condition: 'abjure-enemy', description: 'Action : cible à 9m désavantage attaques/JS, vitesse 0 (JS SAG)' }] },
            { level: 7, name: 'Représailles implacables', description: 'Utilisez votre réaction pour effectuer une attaque d\'opportunité lorsqu\'un ennemi à 3m vous touche.', rules: [{ type: 'condition', condition: 'relentless-avenger', description: 'Réaction : attaque d\'opportunité quand un ennemi à 3m vous touche' }] },
            { level: 15, name: 'Âme de vengeance', description: 'Lorsque la cible de votre Vœu d\'hostilité est réduite à 0 PV, vous pouvez transférer le vœu à une autre créature.', rules: [{ type: 'condition', condition: 'soul-of-vengeance', description: 'Transfert du Vœu d\'hostilité quand cible meurt' }] },
            { level: 20, name: 'Ange vengeur', description: 'Ailes (vol 18m), aura de terreur à 9m, émettez 1/tour 1d6+CHA dégâts radiants à une créature.', rules: [{ type: 'condition', condition: 'avenging-angel', description: '1 min : vol 18m, aura de terreur 9m, 1d6+CHA radiants 1/tour' }] },
        ],
    },
    {
        id: 'conquest',
        classId: 'paladin',
        name: 'Serment de Conquête',
        nameEn: 'Oath of Conquest',
        description: 'Un paladin qui cherche à établir l\'ordre par la subjugation, écrasant la volonté de ses ennemis.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Présence conquérante', description: 'Action : les créatures à 9m doivent réussir un JS SAG ou être effrayées pendant 1 minute (nouveau JS chaque tour).', rules: [{ type: 'condition', condition: 'conquering-presence', description: 'Action : créatures à 9m effrayées 1 min (JS SAG)' }] },
            { level: 3, name: 'Conduit divin : Frappe guidée', description: '+10 à un jet d\'attaque (après le lancer, avant de savoir si ça touche).', rules: [{ type: 'condition', condition: 'guided-strike-conquest', description: '+10 à un jet d\'attaque après le lancer' }] },
            { level: 7, name: 'Aura de conquête', description: 'Les créatures effrayées par vous à 3m ont une vitesse réduite à 0 et subissent demi niv paladin dégâts psychiques. Portée 9m au niv 18.', rules: [{ type: 'condition', condition: 'aura-of-conquest', description: 'Créatures effrayées à 3m : vitesse 0, dégâts psychiques = moitié niv' }] },
            { level: 15, name: 'Réprimande méprisante', description: 'Quand une créature vous touche, elle subit mod CHA dégâts psychiques (si vous n\'êtes pas incapacité).', rules: [{ type: 'condition', condition: 'scornful-rebuke', description: 'Réaction : mod CHA dégâts psychiques quand touché' }] },
            { level: 20, name: 'Conquérant invincible', description: 'Action, 1 min : résistance à tous les dégâts, attaque supplémentaire, critique sur 19-20.', rules: [{ type: 'condition', condition: 'invincible-conqueror', description: '1 min : résistance tous dégâts, attaque supplémentaire, critique 19-20' }] },
        ],
    },
    {
        id: 'redemption',
        classId: 'paladin',
        name: 'Serment de Rédemption',
        nameEn: 'Oath of Redemption',
        description: 'Un paladin champion de la paix et de la miséricorde, croyant au potentiel de rédemption de tous les êtres.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Émissaire de la paix', description: 'Action bonus : +5 aux jets de Persuasion pendant 10 minutes.', rules: [{ type: 'condition', condition: 'emissary-of-peace', description: 'Action bonus : +5 Persuasion pendant 10 min' }] },
            { level: 3, name: 'Conduit divin : Réprimande du violent', description: 'Réaction quand une créature à 9m inflige des dégâts d\'attaque : l\'attaquant subit les mêmes dégâts en radiant (JS SAG pour moitié).', rules: [{ type: 'condition', condition: 'rebuke-the-violent', description: 'Réaction : attaquant subit mêmes dégâts en radiant (JS SAG moitié)' }] },
            { level: 7, name: 'Aura du gardien', description: 'Réaction : absorbez les dégâts subis par une créature à 3m (non réductibles). Portée 9m au niv 18.', rules: [{ type: 'condition', condition: 'aura-of-the-guardian', description: 'Réaction : absorbez les dégâts d\'un allié à 3m (9m au niv 18)' }] },
            { level: 15, name: 'Esprit protecteur', description: 'Si vous terminez votre tour avec moins de la moitié de vos PV max, récupérez 1d6 + demi niv paladin PV.', rules: [{ type: 'condition', condition: 'protective-spirit', description: '< 50% PV max à la fin du tour : 1d6 + moitié niv PV' }] },
            { level: 20, name: 'Émissaire de la rédemption', description: 'Résistance à tous les dégâts des autres créatures. Quand on vous touche, l\'attaquant subit demi dégâts radiants (cesse si vous attaquez/lancez un sort sur cette créature).', rules: [{ type: 'condition', condition: 'emissary-of-redemption', description: 'Résistance dégâts autres créatures, riposte radiante' }] },
        ],
    },
    {
        id: 'glory',
        classId: 'paladin',
        name: 'Serment de Gloire',
        nameEn: 'Oath of Glory',
        description: 'Un paladin qui cherche à accomplir des exploits légendaires et à inspirer la grandeur chez ses alliés.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Athlète hors pair', description: 'Action bonus : avantage Athlétisme et Acrobaties, double capacité de port, +3m sauts pendant 10 minutes.', rules: [{ type: 'condition', condition: 'peerless-athlete', description: 'Action bonus : avantage Athlétisme/Acrobaties, +3m sauts, 10 min' }] },
            { level: 3, name: 'Conduit divin : Châtiment inspirant', description: 'Après un Châtiment divin, action bonus : distribuez 2d8 + niv paladin PV temp à des créatures à 9m.', rules: [{ type: 'condition', condition: 'inspiring-smite', description: 'Après Châtiment divin : 2d8 + niv PV temp à alliés à 9m' }] },
            { level: 7, name: 'Aura de célérité', description: '+3m de vitesse pour vous. Les alliés débutant leur tour à 1,5m gagnent +3m ce tour. Portée 3m au niv 18.', rules: [{ type: 'speed', value: 3, condition: 'aura-of-alacrity' }] },
            { level: 15, name: 'Défense glorieuse', description: 'Réaction quand vous ou un allié à 3m êtes touché : +mod CHA à la CA (peut annuler le coup). Mod CHA fois par repos long.', rules: [{ type: 'resource', id: 'glorious-defense', name: 'Défense glorieuse', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 4, 4, 5], recovery: 'long' }] },
            { level: 20, name: 'Légende vivante', description: 'Action bonus, 1 min : avantage CHA, une attaque ratée peut toucher 1/tour, relancez un JS raté en réaction (1/repos long ou emplacement niv 5).', rules: [{ type: 'condition', condition: 'living-legend', description: '1 min : avantage CHA, attaque ratée peut toucher 1/tour, relance JS en réaction' }] },
        ],
    },
    {
        id: 'watchers',
        classId: 'paladin',
        name: 'Serment des Sentinelles',
        nameEn: 'Oath of the Watchers',
        description: 'Des paladins qui protègent le monde mortel contre les menaces extraplanaires.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Conduit divin : Volonté des sentinelles', description: 'Action : jusqu\'à mod CHA créatures à 9m gagnent avantage aux JS INT, SAG et CHA pendant 1 minute.', rules: [{ type: 'condition', condition: 'watchers-will', description: 'Action : mod CHA créatures à 9m, avantage JS INT/SAG/CHA 1 min' }] },
            { level: 3, name: 'Conduit divin : Abjurer l\'extraplanaire', description: 'Action : aberrations, célestes, élémentaires, fées et fiélons à 9m doivent réussir un JS SAG ou être renvoyés 1 minute.', rules: [{ type: 'condition', condition: 'abjure-the-extraplanar', description: 'Action : extraplanares à 9m renvoyés 1 min (JS SAG)' }] },
            { level: 7, name: 'Aura de la sentinelle', description: 'Vous et les créatures choisies à 3m gagnent +bonus de maîtrise à l\'initiative. Portée 9m au niv 18.', rules: [{ type: 'condition', condition: 'aura-of-the-sentinels', description: '+bonus de maîtrise à l\'initiative pour vous et alliés à 3m (9m au niv 18)' }] },
            { level: 15, name: 'Réprimande vigilante', description: 'Réaction quand un allié à 9m réussit un JS : infligez 2d8 + mod CHA dégâts psychiques à l\'auteur de l\'effet.', rules: [{ type: 'condition', condition: 'vigilant-rebuke', description: 'Réaction : 2d8 + mod CHA psychiques quand allié réussit un JS à 9m' }] },
            { level: 20, name: 'Rempart mortel', description: 'Action bonus, 1 min : vision véritable 36m, avantage aux attaques contre aberrations/célestes/élémentaires/fées/fiélons, bannissement sur coup (JS CHA, 1/repos long ou emplacement niv 5).', rules: [{ type: 'condition', condition: 'mortal-bulwark', description: '1 min : vision véritable 36m, avantage vs extraplanares, bannissement sur coup' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'hunter',
        classId: 'ranger',
        name: 'Chasseur',
        nameEn: 'Hunter',
        description: 'Un protecteur de la civilisation qui accepte de traquer les menaces les plus dangereuses.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Proie du chasseur', description: 'Choisissez : Tueur de colosses (+1d8 dégâts aux créatures avec tous leurs PV), Tueur de géants (pas d\'attaque d\'opportunité si vous touchez), ou Tueur de hordes (+1 attaque contre une créature adjacente).',
                rules: [
                    { type: 'select', name: 'Proie du chasseur', targetType: 'trait', count: 1, options: ['hunter-colossus', 'hunter-giant', 'hunter-horde'] }
                ]
            },
            {
                level: 7, name: 'Tactiques défensives', description: 'Choisissez : Échapper à la horde (désavantage des attaques d\'opportunité), Défense contre l\'assaut (avantage JS contre être renversé), ou Volonté de fer (avantage JS contre être effrayé).',
                rules: [
                    { type: 'select', name: 'Tactiques défensives', targetType: 'trait', count: 1, options: ['hunter-escape-horde', 'hunter-defense-assault', 'hunter-iron-will'] }
                ]
            },
            {
                level: 11, name: 'Attaque multiple', description: 'Choisissez : Volée (attaquez chaque créature à 3m), ou Attaque tourbillonnante (attaquez chaque créature à portée à 1,5m).',
                rules: [
                    { type: 'select', name: 'Attaque multiple', targetType: 'trait', count: 1, options: ['hunter-volley', 'hunter-whirlwind'] }
                ]
            },
            {
                level: 15, name: 'Défense supérieure', description: 'Choisissez : Esquive (demi-dégâts en réaction), Esquive surnaturelle, ou Riposte.',
                rules: [
                    { type: 'select', name: 'Défense supérieure', targetType: 'trait', count: 1, options: ['hunter-evasion', 'hunter-uncanny-dodge', 'hunter-riposte'] }
                ]
            },
        ],
    },
    {
        id: 'beast_master',
        classId: 'ranger',
        name: 'Maître des Bêtes',
        nameEn: 'Beast Master',
        description: 'Un rôdeur qui forme un lien mystique avec un compagnon animal, combattant côte à côte.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Compagnon du rôdeur', description: 'Gagnez un compagnon animal (FP 1/4 max, taille Moyenne ou inférieure). Il obéit à vos commandes et utilise votre bonus de maîtrise.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'ranger-companion' }
                ]
            },
            {
                level: 7, name: 'Entraînement exceptionnel', description: 'Votre compagnon peut Foncer, Se désengager ou Aider en action bonus.',
                rules: [
                    { type: 'condition', condition: 'exceptional-training', description: 'Le compagnon peut Foncer, Se désengager ou Aider en action bonus' }
                ]
            },
            {
                level: 11, name: 'Furie bestiale', description: 'Votre compagnon peut attaquer deux fois quand vous lui ordonnez d\'attaquer.',
                rules: [
                    { type: 'condition', condition: 'bestial-fury', description: 'Le compagnon attaque deux fois sur commande' }
                ]
            },
            {
                level: 15, name: 'Partager les sorts', description: 'Lorsque vous lancez un sort sur vous-même, votre compagnon en bénéficie aussi s\'il est à 9m.',
                rules: [
                    { type: 'condition', condition: 'share-spells', description: 'Le compagnon bénéficie aussi des sorts lancés sur vous-même à 9m' }
                ]
            },
        ],
    },
    {
        id: 'gloom_stalker',
        classId: 'ranger',
        name: 'Traqueur des Ombres',
        nameEn: 'Gloom Stalker',
        description: 'Un rôdeur maître des embuscades, à l\'aise dans les ténèbres les plus profondes.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Embuscade redoutable', description: '+mod SAG à l\'initiative. Au 1er tour : +3m de vitesse et 1 attaque supplémentaire (+1d8 dégâts si touche).',
                rules: [
                    { type: 'condition', condition: 'dread-ambusher-initiative', description: '+mod SAG à l\'initiative' },
                    { type: 'damage_bonus', value: 0, condition: 'dread-ambusher-first-turn', damageType: 'weapon' }
                ]
            },
            {
                level: 3, name: 'Vision dans l\'ombre', description: 'Vision dans le noir 18m (ou +9m si existante). Invisible aux créatures qui utilisent la vision dans le noir pour vous voir.',
                rules: [
                    { type: 'condition', condition: 'umbral-sight', description: 'Vision dans le noir 18m, invisible aux visions dans le noir' }
                ]
            },
            {
                level: 7, name: 'Esprit de fer', description: 'Maîtrise des JS Sagesse (ou INT/CHA si déjà maîtrisé).',
                rules: [
                    { type: 'grant', targetType: 'proficiency', targetId: 'ID_SAVE_WIS' }
                ]
            },
            {
                level: 11, name: 'Déluge du traqueur', description: 'Si vous manquez une attaque, effectuez une attaque supplémentaire dans la même action.',
                rules: [
                    { type: 'condition', condition: 'stalkers-flurry', description: 'Attaque supplémentaire si vous manquez une attaque' }
                ]
            },
            {
                level: 15, name: 'Esquive ténébreuse', description: 'Réaction quand une créature vous attaque (sans avantage) : imposez un désavantage à l\'attaque. Touché ou non, téléportez-vous à 9m.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'shadowy-dodge' }
                ]
            },
        ],
    },
    {
        id: 'horizon_walker',
        classId: 'ranger',
        name: 'Marcheur de l\'Horizon',
        nameEn: 'Horizon Walker',
        description: 'Un rôdeur qui protège le monde contre les menaces venues d\'autres plans d\'existence.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Détection de portail', description: 'Action : détectez la distance et direction du portail planaire le plus proche à 1,5 km (1/repos court ou long).',
                rules: [
                    { type: 'resource', id: 'detect-portal', name: 'Détection de portail', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }
                ]
            },
            {
                level: 3, name: 'Guerrier planaire', description: 'Action bonus : désignez une créature à 9m. Votre prochaine attaque ce tour inflige tous les dégâts en force +1d8 force (+2d8 au niv 11).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'planar-warrior', damageType: 'force' }
                ]
            },
            {
                level: 7, name: 'Pas éthéré', description: 'Action bonus : lancez Forme éthérée (fin au tour). Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'ethereal-step', name: 'Pas éthéré', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Frappe distante', description: 'Téléportez-vous de 3m avant chaque attaque. Si vous attaquez 2+ créatures différentes, 1 attaque supplémentaire contre une 3e.',
                rules: [
                    { type: 'condition', condition: 'distant-strike', description: 'Téléportation de 3m avant chaque attaque, attaque supplémentaire si 2+ cibles' }
                ]
            },
            {
                level: 15, name: 'Défense spectrale', description: 'Réaction quand vous subissez des dégâts : résistance à tous les dégâts de cette attaque ce tour.',
                rules: [
                    { type: 'condition', condition: 'spectral-defense', description: 'Résistance à tous les dégâts d\'une attaque en réaction' }
                ]
            },
        ],
    },
    {
        id: 'monster_slayer',
        classId: 'ranger',
        name: 'Pourfendeur',
        nameEn: 'Monster Slayer',
        description: 'Un rôdeur spécialisé dans la traque et la destruction des créatures surnaturelles.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Sens du chasseur', description: 'Action : apprenez les immunités, résistances ou vulnérabilités d\'une créature à 18m. Mod SAG fois par repos long.',
                rules: [
                    { type: 'resource', id: 'hunters-sense', name: 'Sens du chasseur', progression: [0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 4, 4], recovery: 'long' }
                ]
            },
            {
                level: 3, name: 'Proie du pourfendeur', description: 'Action bonus : désignez une créature à 18m. 1/tour, +1d6 dégâts à votre première attaque touchée. Dure jusqu\'au repos court/long.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'slayers-prey', damageType: 'weapon' }
                ]
            },
            {
                level: 7, name: 'Défense surnaturelle', description: '+1d6 aux JS et tests de caractéristique imposés par la cible de Proie du pourfendeur.',
                rules: [
                    { type: 'condition', condition: 'supernatural-defense', description: '+1d6 aux JS et tests imposés par la Proie' }
                ]
            },
            {
                level: 11, name: 'Némésis des mages', description: 'Réaction quand une créature à 18m lance un sort ou se téléporte : JS SAG ou le sort/téléportation échoue (1/repos court ou long).',
                rules: [
                    { type: 'resource', id: 'magic-users-nemesis', name: 'Némésis des mages', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }
                ]
            },
            {
                level: 15, name: 'Contre du pourfendeur', description: 'Réaction quand la cible de votre Proie vous force à faire un JS : effectuez une attaque d\'arme contre elle.',
                rules: [
                    { type: 'grant', targetType: 'feature', targetId: 'slayers-counter' }
                ]
            },
        ],
    },
    {
        id: 'fey_wanderer',
        classId: 'ranger',
        name: 'Vagabond Féerique',
        nameEn: 'Fey Wanderer',
        description: 'Un rôdeur imprégné de la magie de la Féerie, mêlant prouesses martiales et enchantements.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Frappes redoutables', description: '1/tour quand vous touchez une créature : +1d4 dégâts psychiques (+1d6 au niv 11).',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'dreadful-strikes', damageType: 'psychic' }
                ]
            },
            {
                level: 3, name: 'Charme surnaturel', description: '+mod SAG aux jets de Charisme. Maîtrise de Tromperie, Représentation ou Persuasion.',
                rules: [
                    { type: 'condition', condition: 'otherworldly-glamour', description: '+mod SAG aux jets de Charisme' },
                    { type: 'select', name: 'Compétence féerique', targetType: 'skill', count: 1, options: ['ID_SKILL_DECEPTION', 'ID_SKILL_PERFORMANCE', 'ID_SKILL_PERSUASION'] }
                ]
            },
            {
                level: 7, name: 'Charme retors', description: 'Avantage JS contre charmé/effrayé. Réaction quand une créature à 36m réussit un JS charmé/effrayé : forcez une autre créature à 36m à faire un JS SAG ou être charmée/effrayée 1 min.',
                rules: [
                    { type: 'condition', condition: 'beguiling-twist', description: 'Avantage JS contre charmé/effrayé, réaction pour transférer l\'effet' }
                ]
            },
            {
                level: 11, name: 'Renforts féeriques', description: 'Lancez Invoquer une fée 1/repos long sans emplacement (peut être sans concentration, durée 1 min).',
                rules: [
                    { type: 'spell', spellId: 'summon-fey', alwaysKnown: true }
                ]
            },
            {
                level: 15, name: 'Présence brumeuse', description: 'Réaction quand vous subissez des dégâts : devenez invisible et téléportez-vous à 9m (invisible jusqu\'au début de votre prochain tour). Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'misty-presence', name: 'Présence brumeuse', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },
    {
        id: 'swarmkeeper',
        classId: 'ranger',
        name: 'Gardien des Essaims',
        nameEn: 'Swarmkeeper',
        description: 'Un rôdeur lié à un essaim d\'esprits de la nature qui l\'assistent au combat.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            {
                level: 3, name: 'Essaim rassemblé', description: '1/tour après une attaque touchée : +1d6 perforants, OU JS FOR ou repoussé 4,5m, OU vous vous déplacez de 1,5m.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'gathered-swarm', damageType: 'piercing' }
                ]
            },
            {
                level: 3, name: 'Main de mage de l\'essaim', description: 'Apprenez Main de mage (forme d\'essaim). Sorts bonus : Lueurs féeriques, Toile d\'araignée, Forme gazeuse, Œil magique, Fléau d\'insectes.',
                rules: [
                    { type: 'spell', spellId: 'mage-hand', alwaysKnown: true }
                ]
            },
            {
                level: 7, name: 'Marée grouillante', description: 'Action bonus : vol 3m + vol stationnaire pendant 1 minute. Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'swarming-spirit', name: 'Marée grouillante', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
            {
                level: 11, name: 'Essaim puissant', description: 'Dégâts passent à 1d8. Poussée peut aussi mettre à terre. Déplacement personnel donne un abri partiel.',
                rules: [
                    { type: 'damage_bonus', value: 0, condition: 'mighty-swarm', damageType: 'piercing' }
                ]
            },
            {
                level: 15, name: 'Dispersion en essaim', description: 'Réaction quand vous subissez des dégâts : résistance aux dégâts et téléportation à 9m. Bonus de maîtrise fois par repos long.',
                rules: [
                    { type: 'resource', id: 'swarm dispersal', name: 'Dispersion en essaim', progression: [0, 0, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }
                ]
            },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'thief',
        classId: 'rogue',
        name: 'Voleur',
        nameEn: 'Thief',
        description: 'Un cambrioleur agile et rapide, expert dans l\'art de s\'emparer de ce qui ne lui appartient pas.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Mains lestes', description: 'Utilisez l\'action bonus Ruse pour tester Escamotage, utiliser outils de voleur, ou utiliser un objet.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'fast-hands' }] },
            { level: 3, name: 'Seconde histoire', description: 'Escaladez à vitesse normale. Les sauts en course augmentent de mod DEX × 0,3m.', rules: [{ type: 'condition', condition: 'second-story-work', description: 'Escalade à vitesse normale, sauts +mod DEX × 0,3m' }] },
            { level: 9, name: 'Discrétion suprême', description: 'Avantage aux tests de Discrétion si vous ne bougez pas de plus de la moitié de votre vitesse au même tour.', rules: [{ type: 'condition', condition: 'supreme-sneak', description: 'Avantage Discrétion si ≤ ½ vitesse' }] },
            { level: 13, name: 'Utilisation d\'objets magiques', description: 'Ignorez toutes les conditions de classe, race et niveau pour utiliser un objet magique.', rules: [{ type: 'condition', condition: 'use-magic-device', description: 'Ignore conditions pour objets magiques' }] },
            { level: 17, name: 'Réflexes de voleur', description: 'Prenez deux tours durant le premier round de combat.', rules: [{ type: 'condition', condition: 'thief-reflexes', description: '2 tours au premier round' }] },
        ],
    },
    {
        id: 'assassin',
        classId: 'rogue',
        name: 'Assassin',
        nameEn: 'Assassin',
        description: 'Un spécialiste de l\'infiltration et de l\'élimination, expert en poisons et en déguisement.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maîtrises supplémentaires', description: 'Maîtrise du kit d\'empoisonneur et du kit de déguisement.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'poisoners-kit' }, { type: 'grant', targetType: 'proficiency', targetId: 'disguise-kit' }] },
            { level: 3, name: 'Assassinat', description: 'Avantage aux attaques contre les créatures qui n\'ont pas encore agi. Coup critique automatique si la cible est surprise.', rules: [{ type: 'condition', condition: 'assassinate', description: 'Avantage contre créatures n\'ayant pas agi, critique auto si surprise' }] },
            { level: 9, name: 'Expert en infiltration', description: 'En 7 jours et 25 po, créez une identité factice incluant documents, contacts et déguisement.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'infiltration-expertise' }] },
            { level: 13, name: 'Imposteur', description: 'Après 3 heures d\'observation, imitez parfaitement la voix, l\'écriture et le comportement d\'une personne.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'impostor' }] },
            { level: 17, name: 'Coup de grâce', description: 'Si la cible est surprise et que vous la touchez, elle doit réussir un JS Constitution (DD 8 + mod DEX + bonus de maîtrise) ou doubler les dégâts.', rules: [{ type: 'damage_bonus', value: 0, condition: 'death-strike', damageType: 'piercing' }] },
        ],
    },
    {
        id: 'arcane_trickster',
        classId: 'rogue',
        name: 'Escroc Arcanique',
        nameEn: 'Arcane Trickster',
        description: 'Un roublard qui augmente sa furtivité grâce à l\'Enchantement, l\'Illusion et la Main du mage.',
        source: 'PHB',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Incantation', description: 'Lancez des sorts de Magicien (INT). Main du mage + 2 sorts mineurs + 3 sorts de niveau 1 (principalement Enchantement et Illusion).', rules: [{ type: 'spell', spellId: 'mage-hand', alwaysKnown: true }, { type: 'spell', spellId: 'arcane-trickster-spells', alwaysKnown: true }] },
            { level: 3, name: 'Main de mage améliorée', description: 'La Main du mage est invisible et peut crocheter, désarmer des pièges et manipuler des objets à distance.', rules: [{ type: 'condition', condition: 'mage-hand-legerdemain', description: 'Main du mage invisible, crochetage, pièges, manipulation' }] },
            { level: 9, name: 'Embuscade magique', description: 'Si vous êtes caché, la cible de votre sort a un désavantage à son jet de sauvegarde.', rules: [{ type: 'condition', condition: 'magical-ambush', description: 'Désavantage JS cible si caché' }] },
            { level: 13, name: 'Polyvalence magique', description: 'Lorsque vous lancez Main du mage, vous pouvez effectuer un test de Discrétion ou d\'Escamotage en action bonus.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'versatile-trickster' }] },
            { level: 17, name: 'Voleur de sorts', description: 'En réaction, annulez un sort de niveau 1-4 lancé contre vous et volez-le pour 8 heures.', rules: [{ type: 'resource', id: 'spell-thief', name: 'Voleur de sorts', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'inquisitive',
        classId: 'rogue',
        name: 'Inquisiteur',
        nameEn: 'Inquisitive',
        description: 'Un roublard expert en observation et en déduction, capable de percer les secrets et mensonges.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Oreille pour le mensonge', description: 'Jets de Perspicacité pour détecter un mensonge : minimum 8 sur le d20.', rules: [{ type: 'condition', condition: 'ear-for-deceit', description: 'Min 8 au d20 pour détecter mensonges' }] },
            { level: 3, name: 'Œil pour le détail', description: 'Action bonus : test de Perception (créature cachée) ou Investigation (indice).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'eye-for-detail' }] },
            { level: 3, name: 'Combat perspicace', description: 'Action bonus : Perspicacité vs Tromperie d\'une créature. Si réussi, Attaque sournoise sans avantage pendant 1 min.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'insightful-fighting' }] },
            { level: 9, name: 'Regard imperturbable', description: 'Avantage aux tests de Perception et Investigation si vous ne bougez pas de plus de la moitié de votre vitesse ce tour.', rules: [{ type: 'condition', condition: 'steady-eye', description: 'Avantage Perception/Investigation si ≤ ½ vitesse' }] },
            { level: 13, name: 'Œil infaillible', description: 'Action : détectez illusions, métamorphes et magie de tromperie à 9m. Mod SAG utilisations par repos long.', rules: [{ type: 'resource', id: 'unerring-eye', name: 'Œil infaillible', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 4, 4, 5], recovery: 'long' }] },
            { level: 17, name: 'Œil pour la faiblesse', description: 'Quand Combat perspicace est actif, +3d6 dégâts d\'Attaque sournoise contre cette cible.', rules: [{ type: 'damage_bonus', value: 0, condition: 'eye-for-weakness', damageType: 'piercing' }] },
        ],
    },
    {
        id: 'mastermind',
        classId: 'rogue',
        name: 'Cerveau',
        nameEn: 'Mastermind',
        description: 'Un maître de l\'intrigue, de la manipulation et de la tactique, spécialiste de l\'ombre et des complots.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Maître de l\'intrigue', description: 'Maîtrise du kit de déguisement, du kit de faussaire et d\'un set de jeu. 2 langues. Imitez l\'accent d\'une créature entendue 1 min.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'disguise-kit' }, { type: 'grant', targetType: 'proficiency', targetId: 'forgery-kit' }, { type: 'grant', targetType: 'language', targetId: 'any-two' }] },
            { level: 3, name: 'Maître tacticien', description: 'Action Aider en action bonus. L\'allié aidé peut être à 9m au lieu de 1,5m.', rules: [{ type: 'condition', condition: 'master-of-tactics', description: 'Aider en action bonus, portée 9m' }] },
            { level: 9, name: 'Manipulateur perspicace', description: 'Après 1 min d\'observation hors combat, apprenez si la créature est supérieure/égale/inférieure en 2 caractéristiques au choix.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'insightful-manipulator' }] },
            { level: 13, name: 'Mauvaise direction', description: 'Réaction quand touché et qu\'une créature à 1,5m vous couvre : redirigez l\'attaque sur elle.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'misdirection' }] },
            { level: 17, name: 'Âme de la tromperie', description: 'Vos pensées ne peuvent être lues. Vous ne pouvez pas être forcé de dire la vérité par magie.', rules: [{ type: 'condition', condition: 'soul-of-deceit', description: 'Immunité lecture de pensées, contrainte de vérité' }] },
        ],
    },
    {
        id: 'scout',
        classId: 'rogue',
        name: 'Éclaireur',
        nameEn: 'Scout',
        description: 'Un roublard expert en survie et en reconnaissance, à l\'aise dans les terres sauvages.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Escarmoucheur', description: 'Réaction quand un ennemi termine son tour à 1,5m : déplacez-vous de la moitié de votre vitesse sans provoquer d\'attaque d\'opportunité.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'skirmisher' }] },
            { level: 3, name: 'Survivaliste', description: 'Maîtrise de Nature et Survie (bonus doublé si déjà maîtrisé).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'nature-proficiency' }, { type: 'grant', targetType: 'feature', targetId: 'survival-proficiency' }] },
            { level: 9, name: 'Mobilité supérieure', description: '+3m de vitesse de marche (et d\'escalade/nage si existante).', rules: [{ type: 'speed', value: 3, condition: 'superior-mobility' }] },
            { level: 13, name: 'Maître de l\'embuscade', description: 'Avantage à l\'initiative. La première créature touchée au round 1 : les attaques contre elle ont avantage jusqu\'au début de votre prochain tour.', rules: [{ type: 'condition', condition: 'ambush-master', description: 'Avantage initiative, premier touché = avantage attaques contre elle' }] },
            { level: 17, name: 'Frappe soudaine', description: 'Attaque supplémentaire en action bonus. Peut bénéficier de l\'Attaque sournoise même si déjà utilisée ce tour (contre une cible différente).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'sudden-strike' }] },
        ],
    },
    {
        id: 'swashbuckler',
        classId: 'rogue',
        name: 'Bretteur',
        nameEn: 'Swashbuckler',
        description: 'Un duelliste charmeur et agile qui mise sur la vitesse, l\'élégance et l\'audace au combat.',
        source: 'XGtE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Jeu de jambes élégant', description: 'Si vous attaquez une créature au CàC, elle ne peut pas vous porter d\'attaque d\'opportunité ce tour.', rules: [{ type: 'condition', condition: 'fancy-footwork', description: 'Pas d\'attaque d\'opportunité de la cible touchée' }] },
            { level: 3, name: 'Audace téméraire', description: '+mod CHA à l\'initiative. Attaque sournoise sans avantage si seul à 1,5m de la cible (sans désavantage).', rules: [{ type: 'condition', condition: 'rakish-audacity', description: '+mod CHA initiative, Attaque sournoise sans avantage si duel' }] },
            { level: 9, name: 'Panache', description: 'Persuasion vs Perspicacité : hostile → désavantage aux attaques contre les autres ; non hostile → charmée 1 min.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'panache' }] },
            { level: 13, name: 'Manœuvre élégante', description: 'Action bonus : avantage au prochain test d\'Acrobaties ou Athlétisme ce tour.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'elegant-maneuver' }] },
            { level: 17, name: 'Maître duelliste', description: 'Si vous manquez une attaque, relancez avec avantage (1/repos court ou long).', rules: [{ type: 'resource', id: 'master-duelist', name: 'Maître duelliste', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], recovery: 'short' }] },
        ],
    },
    {
        id: 'phantom',
        classId: 'rogue',
        name: 'Fantôme',
        nameEn: 'Phantom',
        description: 'Un roublard connecté à la mort, puisant connaissance et pouvoir dans les esprits des défunts.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Murmures des morts', description: 'Au repos court/long, gagnez 1 maîtrise de compétence ou outil (perdue au prochain usage).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'whispers-of-the-dead' }] },
            { level: 3, name: 'Plaintes de la tombe', description: 'Après Attaque sournoise, une 2e créature à 9m subit demi dés d\'Attaque sournoise en nécrotique. Bonus de maîtrise fois par repos long.', rules: [{ type: 'resource', id: 'wails-from-the-grave', name: 'Plaintes de la tombe', progression: [0, 0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5], recovery: 'long' }, { type: 'damage_bonus', value: 0, condition: 'wails-from-the-grave', damageType: 'necrotic' }] },
            { level: 9, name: 'Reliques des défunts', description: 'Quand une créature meurt à 9m : gagnez un Bibelot d\'âme (max = bonus maîtrise). Action bonus : détruisez-le pour avantage à un jet ou Plaintes de la tombe gratuite.', rules: [{ type: 'resource', id: 'soul-trinkets', name: 'Bibelots d\'âme', progression: [0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4], recovery: 'long' }] },
            { level: 13, name: 'Marche fantôme', description: 'Action bonus : forme spectrale 10 min. Vol 3m + vol stationnaire. Traversez créatures/objets (1d10 force si vous terminez dedans). 1/repos long.', rules: [{ type: 'resource', id: 'ghost-walk', name: 'Marche fantôme', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 17, name: 'Ami de la mort', description: 'Plaintes de la tombe inflige désormais les dés complets d\'Attaque sournoise à la 2e cible.', rules: [{ type: 'damage_bonus', value: 0, condition: 'death-friend-full-wails', damageType: 'necrotic' }] },
        ],
    },
    {
        id: 'soulknife',
        classId: 'rogue',
        name: 'Âme-lame',
        nameEn: 'Soulknife',
        description: 'Un roublard qui manifeste des lames psychiques et des pouvoirs psioniques pour frapper et se faufiler.',
        source: 'TCoE',
        subclassLevel: 3,
        features: [
            { level: 3, name: 'Lames psychiques', description: 'Manifestez des lames (CàC finesse + lancer 18m, 1d6 psychique + mod). Action bonus : 2e attaque (1d4). Disparaissent après coup.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'psychic-blades' }] },
            { level: 3, name: 'Énergie psionique', description: 'Dés d\'énergie (d6, bonus maîtrise dés). Savoir renforcé : +dé à un test échoué (maîtrisé). Murmures psychiques : télépathie à 1,5 km pendant heures = dé.', rules: [{ type: 'resource', id: 'psionic-energy', name: 'Dés d\'énergie psionique', progression: [0, 0, 0, 2, 2, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 6, 6, 6, 6], recovery: 'long' }] },
            { level: 9, name: 'Lames de l\'âme', description: 'Frappes guidées : +dé à une attaque ratée. Téléportation psionique : lancez la lame à 10 × dé m, téléportez-vous.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'soul-blades' }] },
            { level: 13, name: 'Voile psychique', description: 'Action : invisibilité 1 heure (fin si vous attaquez ou lancez un sort). 1/repos long ou 1 dé.', rules: [{ type: 'resource', id: 'psychic-veil', name: 'Voile psychique', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 17, name: 'Déchirer l\'esprit', description: 'Sur Attaque sournoise avec lame psychique : JS SAG ou étourdi 1 min (nouveau JS chaque tour). 1/repos long ou 3 dés.', rules: [{ type: 'resource', id: 'rend-mind', name: 'Déchirer l\'esprit', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'draconic',
        classId: 'sorcerer',
        name: 'Lignée Draconique',
        nameEn: 'Draconic Bloodline',
        description: 'Votre magie innée provient d\'une ascendance draconique mêlée à votre lignée.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Ancêtre dragon', description: 'Choisissez un type de dragon. Vous parlez Draconique et doublez votre bonus de maîtrise pour les interactions avec les dragons.' },
            { level: 1, name: 'Résistance draconique', description: 'Vos PV max augmentent de 1 par niveau d\'Ensorceleur. Sans armure, CA = 13 + mod DEX.', rules: [{ type: 'ac', formula: '13 + dex', condition: 'no-armor' }] },
            { level: 6, name: 'Affinité élémentaire', description: 'Ajoutez mod CHA aux dégâts de sorts correspondant au type de votre ancêtre dragon. Dépensez 1 point de sorcellerie pour résistance à ce type pendant 1 heure.', rules: [{ type: 'damage_bonus', value: 0, condition: 'dragon-elemental-spell', damageType: 'elemental' }] },
            { level: 14, name: 'Ailes de dragon', description: 'En action bonus, déployez des ailes pour une vitesse de vol égale à votre vitesse.', rules: [{ type: 'speed', value: 0, condition: 'dragon-wings', mode: 'fly' }] },
            { level: 18, name: 'Présence draconique', description: 'Dépensez 5 points de sorcellerie pour une aura de crainte ou d\'émerveillement à 18m pendant 1 minute.', rules: [{ type: 'resource', id: 'draconic-presence', name: 'Présence draconique', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'wild_magic',
        classId: 'sorcerer',
        name: 'Magie Sauvage',
        nameEn: 'Wild Magic',
        description: 'Votre magie innée est chaotique et imprévisible, jaillissant de forces qui dépassent votre compréhension.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Sursaut de magie sauvage', description: 'Après chaque sort de niveau 1+, le MJ peut vous faire lancer 1d20. Sur un 1, lancez sur la table de Sursaut de magie sauvage (effets aléatoires).' },
            { level: 1, name: 'Marées du chaos', description: 'Gagnez l\'avantage à un jet d\'attaque, test de caractéristique ou jet de sauvegarde (1/repos long). Le MJ peut provoquer un Sursaut de magie lors de votre prochain sort.', rules: [{ type: 'resource', id: 'tides-of-chaos', name: 'Marées du chaos', progression: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 6, name: 'Chance en retour', description: 'Dépensez 2 points de sorcellerie en réaction pour lancer 1d4 et modifier un jet d\'attaque, de caractéristique ou de sauvegarde d\'une créature à 9m.' },
            { level: 14, name: 'Chaos contrôlé', description: 'Lancez 2 fois sur la table de Sursaut de magie sauvage et choisissez le résultat.', rules: [{ type: 'condition', condition: 'controlled-chaos', description: 'Lancez 2 fois sur la table de magie sauvage et choisissez' }] },
            { level: 18, name: 'Bombardement de sorts', description: 'Lorsque vous lancez un sort de dégâts, relancez un dé de dégâts qui montre le maximum. Utilisez le deuxième résultat.', rules: [{ type: 'condition', condition: 'spell-bombardment', description: 'Relancez les dés de dégâts max' }] },
        ],
    },
    {
        id: 'divine_soul',
        classId: 'sorcerer',
        name: 'Âme Divine',
        nameEn: 'Divine Soul',
        description: 'Un ensorceleur dont la magie provient d\'une source divine, mêlant sorts arcaniques et cléricaux.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Magie divine', description: 'Apprenez des sorts des listes d\'Ensorceleur ET de Clerc. Sort bonus selon affinité (Guérison, Blessure, Bénédiction, Fléau ou Protection contre le bien et le mal).' },
            { level: 1, name: 'Faveur des dieux', description: 'Si vous ratez un JS ou une attaque, +2d4 au résultat (1/repos court ou long).', rules: [{ type: 'resource', id: 'favored-by-the-gods', name: 'Faveur des dieux', progression: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 6, name: 'Guérison renforcée', description: '1 point de sorcellerie : relancez des dés de soin d\'un sort (vous ou allié à 1,5m, 1/tour).' },
            { level: 14, name: 'Ailes surnaturelles', description: 'Action bonus : ailes spectrales, vol = vitesse de marche.', rules: [{ type: 'speed', value: 0, condition: 'divine-wings', mode: 'fly' }] },
            { level: 18, name: 'Régénération surnaturelle', description: 'Action bonus quand < moitié PV max : récupérez PV = moitié PV max (1/repos long).', rules: [{ type: 'resource', id: 'supernatural-regeneration', name: 'Régénération surnaturelle', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'shadow_magic',
        classId: 'sorcerer',
        name: 'Magie de l\'Ombre',
        nameEn: 'Shadow Magic',
        description: 'Un ensorceleur qui canalise le pouvoir de l\'Obscur, manipulant les ténèbres et la mort.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Yeux des ténèbres', description: 'Vision dans le noir 36m. Au niv 3 : Ténèbres sans emplacement (2 pts sorcellerie) et voyez à travers.', rules: [{ type: 'condition', condition: 'eyes-of-dark', description: 'Vision dans le noir 36m, voyez à travers Ténèbres' }] },
            { level: 1, name: 'Force du tombeau', description: 'À 0 PV : JS CHA (DD 5 + dégâts). Réussite = 1 PV. Ne fonctionne pas contre dégâts radiants ou critiques (1/repos long).', rules: [{ type: 'resource', id: 'strength-of-grave', name: 'Force du tombeau', progression: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 6, name: 'Chien de mauvais augure', description: '3 pts sorcellerie, action bonus : invoquez un loup sombre (stats de loup sanguinaire, modifié). Cible à 36m : désavantage JS contre vos sorts à 1,5m du chien. Dure 5 min.' },
            { level: 14, name: 'Marche dans l\'ombre', description: 'Action bonus en lumière faible/ténèbres : téléportez-vous à 36m dans un espace en lumière faible/ténèbres.', rules: [{ type: 'condition', condition: 'shadow-walk', description: 'Téléportation dans les ténèbres' }] },
            { level: 18, name: 'Forme d\'ombre', description: '6 pts sorcellerie, action bonus : forme d\'ombre 1 min. Résistance à tous les dégâts sauf force et radiant. Traversez créatures et objets.', rules: [{ type: 'condition', condition: 'shadow-form', description: 'Résistance tous dégâts sauf force/radiant, traversez objets' }] },
        ],
    },
    {
        id: 'storm_sorcery',
        classId: 'sorcerer',
        name: 'Sorcellerie de Tempête',
        nameEn: 'Storm Sorcery',
        description: 'Un ensorceleur qui commande la puissance brute du climat : foudre, tonnerre et vent.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Langue du vent', description: 'Parlez, lisez et écrivez le Primordial (Aérien, Aquatique, Igneux, Terreux).' },
            { level: 1, name: 'Magie tempétueuse', description: 'Avant ou après un sort de niv 1+, action bonus : volez 3m sans provoquer d\'attaque d\'opportunité.', rules: [{ type: 'speed', value: 3, condition: 'tempestuous-magic', mode: 'fly' }] },
            { level: 6, name: 'Cœur de la tempête', description: 'Résistance foudre et tonnerre. Quand vous lancez un sort de niv 1+ infligeant foudre/tonnerre : créatures choisies à 3m subissent demi niv ensorceleur dégâts foudre ou tonnerre.', rules: [{ type: 'condition', condition: 'heart-of-storm', description: 'Résistance foudre/tonnerre, dégâts de zone' }] },
            { level: 14, name: 'Fureur de la tempête', description: 'Réaction quand touché au CàC : niv ensorceleur dégâts foudre + JS FOR ou repoussé 6m.', rules: [{ type: 'damage_bonus', value: 0, condition: 'storm-fury', damageType: 'lightning' }] },
            { level: 18, name: 'Âme du vent', description: 'Immunité foudre et tonnerre. Vol 18m. Action : réduisez à 9m pour 1h et donnez 9m de vol à 3+mod CHA créatures à 9m (1/repos court ou long).', rules: [{ type: 'condition', condition: 'soul-of-wind', description: 'Immunité foudre/tonnerre, vol 18m' }] },
        ],
    },
    {
        id: 'aberrant_mind',
        classId: 'sorcerer',
        name: 'Esprit Aberrant',
        nameEn: 'Aberrant Mind',
        description: 'Un ensorceleur aux pouvoirs psioniques, souvent dus à une influence extraplanaire alien.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Sorts psioniques', description: 'Sorts bonus (ne comptent pas) : Murmures dissonants, Bras de Hadar, etc. Remplaçables par sorts de divination/enchantement (ensorceleur/occultiste/magicien).' },
            { level: 1, name: 'Parole télépathique', description: 'Action bonus : lien télépathique avec une créature à 9m pendant niv ensorceleur minutes (portée = mod CHA km).', rules: [{ type: 'condition', condition: 'telepathic-speech', description: 'Télépathie à 9m' }] },
            { level: 6, name: 'Sorcellerie psionique', description: 'Lancez vos Sorts psioniques avec des pts de sorcellerie (= niv sort) au lieu d\'emplacements. Pas de composantes V/S.' },
            { level: 6, name: 'Défenses psychiques', description: 'Résistance aux dégâts psychiques. Avantage JS contre charmé et effrayé.', rules: [{ type: 'condition', condition: 'psychic-defenses', description: 'Résistance psychique, avantage charme/peur' }] },
            { level: 14, name: 'Révélation de la chair', description: 'Action bonus, 1+ pts sorcellerie, 10 min. Par pt : voir l\'invisible à 18m, vol = vitesse, nage = 2× vitesse + respiration aquatique, ou corps visqueux (traverse des espaces étroits).', rules: [{ type: 'condition', condition: 'revelation-in-flesh', description: 'Voir invisible, vol, nage, ou corps visqueux' }] },
            { level: 18, name: 'Implosion déformante', description: 'Action : téléportez-vous à 36m. Créatures dans 9m de l\'espace quitté : JS FOR ou 3d10 force + attirées. Réussite : demi dégâts (1/repos long ou 5 pts).', rules: [{ type: 'resource', id: 'warping-implosion', name: 'Implosion déformante', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'clockwork_soul',
        classId: 'sorcerer',
        name: 'Âme Mécanique',
        nameEn: 'Clockwork Soul',
        description: 'Un ensorceleur incarnant l\'ordre et la précision, puisant dans les royaumes structurés comme le Mécannus.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Magie mécanique', description: 'Sorts bonus (ne comptent pas) : Alarme, Protection contre le bien et le mal, etc. Remplaçables par sorts d\'abjuration/transmutation (ensorceleur/occultiste/magicien).' },
            { level: 1, name: 'Rétablir l\'équilibre', description: 'Réaction : annulez l\'avantage ou le désavantage d\'une créature à 18m sur un jet de d20. Bonus de maîtrise fois par repos long.', rules: [{ type: 'resource', id: 'restore-balance', name: 'Rétablir l\'équilibre', progression: [0, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6], recovery: 'long' }] },
            { level: 6, name: 'Bastion de la loi', description: 'Action : dépensez 1-5 pts de sorcellerie pour créer une protection (autant de d8). Le protégé peut dépenser des dés pour réduire les dégâts subis.' },
            { level: 14, name: 'Transe de l\'ordre', description: 'Action bonus, 1 min : pas d\'avantage contre vous, vos jets de d20 de 9 ou moins comptent comme 10 (1/repos long ou 5 pts).', rules: [{ type: 'resource', id: 'trance-of-order', name: 'Transe de l\'ordre', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 18, name: 'Cavalcade mécanique', description: 'Action : cube de 9m. Soignez jusqu\'à 100 PV (répartis), mettez fin aux états aveuglé/assourdi/paralysé/empoisonné, réparez les objets endommagés (1/repos long ou 7 pts).', rules: [{ type: 'resource', id: 'clockwork-cavalcade', name: 'Cavalcade mécanique', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], recovery: 'long' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'fiend',
        classId: 'warlock',
        name: 'Le Fiélon',
        nameEn: 'The Fiend',
        description: 'Un pacte avec un seigneur des plans inférieurs — démon ou diable — source de feu et de ténèbres.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Bénédiction du Sombre', description: 'Lorsque vous réduisez une créature hostile à 0 PV, gagnez mod CHA + niveau d\'Occultiste PV temporaires.', rules: [{ type: 'condition', condition: 'dark-ones-blessing', description: 'PV temporaires quand vous tuez' }] },
            { level: 6, name: 'Chance du Sombre', description: 'Ajoutez 1d10 à un test de caractéristique ou un jet de sauvegarde (1/repos court).', rules: [{ type: 'resource', id: 'dark-ones-own-luck', name: 'Chance du Sombre', progression: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 10, name: 'Résilience fiélonne', description: 'Au repos court, choisissez un type de dégâts. Vous y êtes résistant jusqu\'au prochain repos court.', rules: [{ type: 'condition', condition: 'fiendish-resilience', description: 'Résistance choisie au repos court' }] },
            { level: 14, name: 'Projection dans les Enfers', description: 'Lorsque vous touchez, infligez 10d10 dégâts psychiques et projetez la cible dans les plans inférieurs pour 1 tour (1/repos long).', rules: [{ type: 'resource', id: 'hurl-through-hell', name: 'Projection dans les Enfers', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'fey',
        classId: 'warlock',
        name: 'L\'Archifée',
        nameEn: 'The Archfey',
        description: 'Un pacte avec une créature féerique — un seigneur ou une dame de la Faérie aux pouvoirs insondables.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Présence féerique', description: 'En action, charmez ou effrayez les créatures dans un cube de 3m (JS Sagesse, 1/repos court).', rules: [{ type: 'resource', id: 'fey-presence', name: 'Présence féerique', progression: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 6, name: 'Repli brumeux', description: 'En réaction lorsque vous subissez des dégâts, devenez invisible et téléportez-vous de 18m (1/repos court).', rules: [{ type: 'resource', id: 'misty-escape', name: 'Repli brumeux', progression: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 10, name: 'Résistance au charme', description: 'Immunité au charme. Lorsqu\'une créature tente de vous charmer, retournez-lui le charme (JS Sagesse).', rules: [{ type: 'condition', condition: 'beguiling-defenses', description: 'Immunité charme, retour du charme' }] },
            { level: 14, name: 'Ruse sombre', description: 'En action, projetez une illusion dans l\'esprit d\'une créature. Elle est charmée ou effrayée pendant 1 minute (JS Sagesse, 1/repos court).', rules: [{ type: 'resource', id: 'dark-delirium', name: 'Ruse sombre', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
        ],
    },
    {
        id: 'great_old_one',
        classId: 'warlock',
        name: 'Le Grand Ancien',
        nameEn: 'The Great Old One',
        description: 'Un pacte avec une entité mystérieuse des confins de la réalité — incompréhensible et terrifiante.',
        source: 'PHB',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Esprit éveillé', description: 'Télépathie à 9m avec une créature consentante. Pas besoin de partager une langue.', rules: [{ type: 'condition', condition: 'awakened-mind', description: 'Télépathie à 9m' }] },
            { level: 6, name: 'Protection entropique', description: 'Réaction quand un jet d\'attaque vous cible : imposez un désavantage. Si l\'attaque rate, avantage à votre prochaine attaque ce tour (1/repos court ou long).', rules: [{ type: 'resource', id: 'entropic-warding', name: 'Protection entropique', progression: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 10, name: 'Bouclier de pensées', description: 'Résistance aux dégâts psychiques. Vos pensées ne peuvent être lues sauf si vous le permettez.', rules: [{ type: 'condition', condition: 'thought-shield', description: 'Résistance psychique, pensées protégées' }] },
            { level: 14, name: 'Création d\'asservi', description: 'Incapacitez un humanoïde charmé en le touchant. Il vous est sous-fifre jusqu\'à ce que Lever la malédiction soit lancé (1/repos long).', rules: [{ type: 'resource', id: 'create-thrall', name: 'Création d\'asservi', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'celestial',
        classId: 'warlock',
        name: 'Le Céleste',
        nameEn: 'The Celestial',
        description: 'Un pacte avec un être du plan supérieur — ange ou licorne — source de lumière et de guérison.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Sorts mineurs supplémentaires', description: 'Apprenez Lumière et Flamme sacrée (comptent comme sorts d\'Occultiste).' },
            { level: 1, name: 'Lumière guérisseuse', description: 'Pool de d6 = 1 + niv Occultiste. Action bonus : soignez une créature à 18m en dépensant des d6 (max = mod CHA d6/tour). Pool restaurée au repos long.', rules: [{ type: 'resource', id: 'healing-light', name: 'Lumière guérisseuse', progression: [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 21], recovery: 'long' }] },
            { level: 6, name: 'Âme radieuse', description: 'Résistance aux dégâts radiants. Quand un sort inflige des dégâts radiants ou de feu, +mod CHA à un jet de dégâts.', rules: [{ type: 'condition', condition: 'radiant-soul', description: 'Résistance radiants, +mod CHA dégâts radiants/feu' }] },
            { level: 10, name: 'Résistance céleste', description: 'Au repos court/long : PV temporaires = niv Occultiste + mod CHA. Choisissez aussi jusqu\'à 5 créatures : elles gagnent la moitié de ce montant.', rules: [{ type: 'condition', condition: 'celestial-resilience', description: 'PV temporaires au repos' }] },
            { level: 14, name: 'Vengeance brûlante', description: 'Au début de votre tour si JS contre la mort : remontez à moitié PV max, debout, 2d8 + mod CHA radiants aux créatures choisies à 9m + aveuglées (1/repos long).', rules: [{ type: 'resource', id: 'searing-vengeance', name: 'Vengeance brûlante', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'hexblade',
        classId: 'warlock',
        name: 'Le Maître des Lames',
        nameEn: 'The Hexblade',
        description: 'Un pacte avec une entité mystérieuse de l\'Obscur, qui se manifeste dans des armes sentientes.',
        source: 'XGtE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Malédiction du Maître des Lames', description: 'Action bonus : maudissez une créature à 9m pendant 1 min. +bonus de maîtrise aux dégâts, critique sur 19-20, regagnez niv Occultiste + mod CHA PV si elle meurt (1/repos court ou long).', rules: [{ type: 'resource', id: 'hexblades-curse', name: 'Malédiction du Maître des Lames', progression: [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 1, name: 'Guerrier maudit', description: 'Maîtrise armures intermédiaires, boucliers, armes de guerre. Utilisez CHA au lieu de FOR/DEX pour attaque/dégâts avec une arme (pas bimanuelle). S\'étend au pacte de la lame.', rules: [{ type: 'condition', condition: 'hex-warrior', description: 'Maîtrise armures intermédiaires, CHA pour attaque/dégâts' }] },
            { level: 6, name: 'Spectre maudit', description: 'Quand vous tuez un humanoïde : relevez son spectre loyal jusqu\'au prochain repos long. Il gagne mod CHA PV temporaires et bonus attaque.' },
            { level: 10, name: 'Armure du maudit', description: 'Réaction quand la cible de votre Malédiction vous touche : lancez 1d6, sur 4+ l\'attaque rate.', rules: [{ type: 'condition', condition: 'accursed-specter', description: 'Réaction : 1d6, 4+ attaque rate' }] },
            { level: 14, name: 'Maître des malédictions', description: 'Quand la cible de votre Malédiction meurt, transférez la malédiction à une autre créature à 9m (sans dépenser d\'utilisation).', rules: [{ type: 'condition', condition: 'master-of-hexes', description: 'Transfert de malédiction' }] },
        ],
    },
    {
        id: 'fathomless',
        classId: 'warlock',
        name: 'Le Fathomless',
        nameEn: 'The Fathomless',
        description: 'Un pacte avec une entité des profondeurs — kraken ou élémentaire aquatique ancestral.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Tentacule des profondeurs', description: 'Action bonus : tentacule spectral à 18m. Attaque de sort CàC, 1d8 froids + -3m vitesse (2d8 au niv 10). Bonus maîtrise fois/repos long.', rules: [{ type: 'resource', id: 'tentacle-of-the-deeps', name: 'Tentacule des profondeurs', progression: [0, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 6], recovery: 'long' }] },
            { level: 1, name: 'Don de la mer', description: 'Nage 12m et respiration aquatique.', rules: [{ type: 'speed', value: 12, condition: 'gift-of-the-sea', mode: 'swim' }] },
            { level: 6, name: 'Âme océanique', description: 'Résistance aux dégâts de froid. Submergé : comprenez et êtes compris de toute créature submergée.', rules: [{ type: 'condition', condition: 'oceanic-soul', description: 'Résistance froid, langage subaquatique' }] },
            { level: 6, name: 'Spirale protectrice', description: 'Réaction quand vous ou créature à 3m du tentacule subissez des dégâts : réduisez de 1d8 (2d8 au niv 10).', rules: [{ type: 'condition', condition: 'guardian-coil', description: 'Réduction dégâts 1d8/2d8' }] },
            { level: 10, name: 'Tentacules agrippants', description: 'Apprenez Tentacules noirs d\'Evard (sans compter). 1/repos long sans emplacement. Concentration incassable + niv Occultiste PV temporaires.', rules: [{ type: 'resource', id: 'grasping-tentacles', name: 'Tentacules agrippants', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Plongée dans les profondeurs', description: 'Action : téléportez-vous et jusqu\'à 5 créatures à 9m vers un plan d\'eau vu (jusqu\'à 1,5 km). 1/repos court ou long.', rules: [{ type: 'resource', id: 'fathomless-plunge', name: 'Plongée dans les profondeurs', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
        ],
    },
    {
        id: 'genie',
        classId: 'warlock',
        name: 'Le Génie',
        nameEn: 'The Genie',
        description: 'Un pacte avec un génie noble — dao, djinn, éfrit ou maride — offrant pouvoir élémentaire et refuge.',
        source: 'TCoE',
        subclassLevel: 1,
        features: [
            { level: 1, name: 'Réceptacle du génie', description: 'Objet-focus : Repos en bouteille (entrez dans un espace extradimensionnel de 6m, 2× bonus maîtrise heures). Colère du génie : 1/tour +bonus maîtrise dégâts (type selon génie).', rules: [{ type: 'condition', condition: 'genies-vessel', description: 'Réceptacle extradimensionnel, +maîtrise dégâts élémentaires' }] },
            { level: 6, name: 'Don élémentaire', description: 'Résistance à un type de dégâts (selon génie). Action bonus : vol 9m pendant 10 min (bonus maîtrise fois/repos long).', rules: [{ type: 'condition', condition: 'elemental-gift', description: 'Résistance élémentaire, vol 9m' }] },
            { level: 10, name: 'Sanctuaire du réceptacle', description: 'Quand vous entrez dans le réceptacle, jusqu\'à 5 créatures à 9m peuvent vous accompagner.', rules: [{ type: 'condition', condition: 'sanctuary-vessel', description: 'Jusqu\'à 5 créatures dans le réceptacle' }] },
            { level: 14, name: 'Souhait limité', description: 'Action : demandez l\'effet d\'un sort de niv 6 ou moins (temps d\'incantation 1 action, de n\'importe quelle liste). Pas de composantes. 1/1d4 repos longs.', rules: [{ type: 'resource', id: 'limited-wish', name: 'Souhait limité', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },

    // ═══════════════════════════════════════════
    {
        id: 'evocation',
        classId: 'wizard',
        name: 'École d\'Évocation',
        nameEn: 'School of Evocation',
        description: 'Spécialisé dans les sorts qui créent des effets élémentaires puissants : explosions, éclairs et flammes.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Évocateur savant', description: 'Le temps et le coût de copie de sorts d\'Évocation dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'evocation-savant', description: 'Copie sorts Évocation : temps et coût /2' }] },
            { level: 2, name: 'Sculpteur de sorts', description: 'Protégez 1 + niveau du sort créatures des effets de vos sorts d\'Évocation. Elles réussissent automatiquement leur JS et ne subissent aucun dégât.', rules: [{ type: 'condition', condition: 'sculpt-spells', description: 'Protège 1+niv du sort créatures des JS d\'Évocation' }] },
            { level: 6, name: 'Sort mineur puissant', description: 'Ajoutez mod INT aux dégâts de vos sorts mineurs de Magicien.', rules: [{ type: 'condition', condition: 'potent-cantrip', description: '+mod INT dégâts sorts mineurs' }] },
            { level: 10, name: 'Évocation renforcée', description: 'Ajoutez mod INT aux dégâts d\'un sort d\'Évocation de Magicien (à un seul jet de dégâts).', rules: [{ type: 'damage_bonus', value: 0, condition: 'empowered-evocation', damageType: 'spell' }] },
            { level: 14, name: 'Surincantation', description: 'Maximisez les dégâts d\'un sort d\'Évocation de niveau 5 ou inférieur (1 utilisation gratuite, puis 1 niveau d\'épuisement par utilisation).', rules: [{ type: 'resource', id: 'overchannel', name: 'Surincantation', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
        ],
    },
    {
        id: 'abjuration',
        classId: 'wizard',
        name: 'École d\'Abjuration',
        nameEn: 'School of Abjuration',
        description: 'Focalisé sur la protection, le bannissement et le blocage des effets magiques hostiles.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Abjurateur savant', description: 'Le temps et le coût de copie de sorts d\'Abjuration dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'abjuration-savant', description: 'Copie sorts Abjuration : temps et coût /2' }] },
            { level: 2, name: 'Protection arcanique', description: 'Lorsque vous lancez un sort d\'Abjuration de niveau 1+, créez un champ protecteur avec PV = 2 × niveau de Magicien + mod INT.', rules: [{ type: 'condition', condition: 'arcane-ward', description: 'Champ protecteur 2×niv+INT PV' }] },
            { level: 6, name: 'Protection projetée', description: 'Lorsqu\'une créature à 9m subit des dégâts, votre Protection arcanique les absorbe à sa place.', rules: [{ type: 'condition', condition: 'projected-ward', description: 'Protection arcanielle protège alliés à 9m' }] },
            { level: 10, name: 'Abjuration améliorée', description: 'Lorsque vous lancez un sort d\'Abjuration nécessitant un test de caractéristique (ex: Contresort), ajoutez votre bonus de maîtrise.', rules: [{ type: 'condition', condition: 'improved-abjuration', description: '+bonus maîtrise aux tests d\'Abjuration' }] },
            { level: 14, name: 'Résistance aux sorts', description: 'Avantage aux jets de sauvegarde contre les sorts, et résistance aux dégâts de sorts.', rules: [{ type: 'condition', condition: 'spell-resistance', description: 'Avantage JS contre sorts, résistance dégâts de sorts' }] },
        ],
    },
    {
        id: 'conjuration',
        classId: 'wizard',
        name: 'École de Conjuration',
        nameEn: 'School of Conjuration',
        description: 'Spécialisé dans l\'invocation de créatures, d\'objets et la téléportation.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Conjurateur savant', description: 'Le temps et le coût de copie de sorts de Conjuration dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'conjuration-savant', description: 'Copie sorts Conjuration : temps et coût /2' }] },
            { level: 2, name: 'Conjuration mineure', description: 'Action : conjurez un objet inanimé (max 90cm, 5 kg, non magique, déjà vu) dans votre main. Disparaît après 1h ou si dégâts.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'minor-conjuration' }] },
            { level: 6, name: 'Transposition bénigne', description: 'Action : téléportez-vous à 9m ou échangez de place avec une créature consentante P/M. 1/repos long ou sort de conjuration niv 1+.', rules: [{ type: 'resource', id: 'benign-transposition', name: 'Transposition bénigne', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 10, name: 'Conjuration focalisée', description: 'Votre concentration sur un sort de Conjuration ne peut être brisée par les dégâts.', rules: [{ type: 'condition', condition: 'focused-conjuration', description: 'Concentration Conjuration insensible aux dégâts' }] },
            { level: 14, name: 'Invocations durables', description: 'Les créatures invoquées par vos sorts de Conjuration gagnent 30 PV temporaires.', rules: [{ type: 'condition', condition: 'durable-summons', description: 'Invocations gagnent 30 PV temporaires' }] },
        ],
    },
    {
        id: 'divination',
        classId: 'wizard',
        name: 'École de Divination',
        nameEn: 'School of Divination',
        description: 'Spécialisé dans la vision de l\'avenir et la perception de vérités cachées.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Devin savant', description: 'Le temps et le coût de copie de sorts de Divination dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'divination-savant', description: 'Copie sorts Divination : temps et coût /2' }] },
            { level: 2, name: 'Présage', description: 'Après un repos long, lancez 2d20 et notez les résultats. Remplacez n\'importe quel jet d\'attaque, JS ou test de caractéristique (vous ou créature vue) par un de ces résultats.', rules: [{ type: 'resource', id: 'portent', name: 'Présage', progression: [0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2], recovery: 'long' }] },
            { level: 6, name: 'Divination experte', description: 'Quand vous lancez un sort de Divination de niv 2+, récupérez un emplacement dépensé (de niveau inférieur, max niv 5).', rules: [{ type: 'condition', condition: 'expert-divination', description: 'Récupère emplacement en lançant Divination niv 2+' }] },
            { level: 10, name: 'Le troisième œil', description: 'Action bonus : gagnez vision dans le noir 36m, lecture de toute langue, ou détection de l\'invisibilité (jusqu\'au repos court/long).', rules: [{ type: 'resource', id: 'third-eye', name: 'Troisième œil', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 14, name: 'Présage supérieur', description: 'Lancez 3d20 pour Présage au lieu de 2.', rules: [{ type: 'condition', condition: 'greater-portent', description: 'Présage avec 3d20 au lieu de 2' }] },
        ],
    },
    {
        id: 'enchantment',
        classId: 'wizard',
        name: 'École d\'Enchantement',
        nameEn: 'School of Enchantment',
        description: 'Spécialisé dans le charme, la manipulation et le contrôle des esprits.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Enchanteur savant', description: 'Le temps et le coût de copie de sorts d\'Enchantement dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'enchantment-savant', description: 'Copie sorts Enchantement : temps et coût /2' }] },
            { level: 2, name: 'Regard hypnotique', description: 'Action : charmez et incapacitez une créature à 1,5m (fin si vous vous éloignez, hors de vue/ouïe, ou dégâts subis).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'hypnotic-gaze' }] },
            { level: 6, name: 'Charme instinctif', description: 'Réaction quand une créature à 9m vous attaque : redirigez l\'attaque sur une autre créature (JS SAG de l\'attaquant).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'instinctive-charm' }] },
            { level: 10, name: 'Double enchantement', description: 'Quand vous lancez un sort d\'Enchantement niv 1+ ciblant une seule créature, ciblez-en une deuxième.', rules: [{ type: 'condition', condition: 'split-enchantment', description: 'Sorts Enchantement ciblent 2 créatures' }] },
            { level: 14, name: 'Altération des souvenirs', description: 'Quand un sort d\'Enchantement charme une créature, vous pouvez effacer sa mémoire d\'avoir été charmée (JS SAG).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'alter-memories' }] },
        ],
    },
    {
        id: 'illusion',
        classId: 'wizard',
        name: 'École d\'Illusion',
        nameEn: 'School of Illusion',
        description: 'Spécialisé dans la tromperie des sens, créant des mirages et des phantasmes.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Illusionniste savant', description: 'Le temps et le coût de copie de sorts d\'Illusion dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'illusion-savant', description: 'Copie sorts Illusion : temps et coût /2' }] },
            { level: 2, name: 'Illusion mineure améliorée', description: 'Apprenez Illusion mineure. Vous pouvez créer son et image en un seul lancer.', rules: [{ type: 'spell', spellId: 'minor-illusion', alwaysKnown: true }] },
            { level: 6, name: 'Illusions malléables', description: 'Action : changez la nature d\'un sort d\'Illusion en cours (durée 1 min+).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'malleable-illusions' }] },
            { level: 10, name: 'Moi illusoire', description: 'Réaction quand touché : un double illusoire intercepte l\'attaque (rate). 1/repos court ou long.', rules: [{ type: 'resource', id: 'illusory-self', name: 'Moi illusoire', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'short' }] },
            { level: 14, name: 'Réalité illusoire', description: 'Rendez réel un objet inanimé, non magique d\'une de vos illusions de niv 1+ pendant 1 minute.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'illusory-reality' }] },
        ],
    },
    {
        id: 'necromancy',
        classId: 'wizard',
        name: 'École de Nécromancie',
        nameEn: 'School of Necromancy',
        description: 'Spécialisé dans la manipulation de l\'énergie vitale, la mort et les morts-vivants.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Nécromancien savant', description: 'Le temps et le coût de copie de sorts de Nécromancie dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'necromancy-savant', description: 'Copie sorts Nécromancie : temps et coût /2' }] },
            { level: 2, name: 'Moisson sinistre', description: '1/tour quand vous tuez avec un sort de niv 1+ : récupérez PV = 2 × niv du sort (3× si Nécromancie). Pas sur constructions/morts-vivants.', rules: [{ type: 'condition', condition: 'grim-harvest', description: 'Soigne PV quand un sort tue (2×niv, 3× si Nécromancie)' }] },
            { level: 6, name: 'Serviteurs morts-vivants', description: 'Apprenez Animation des morts. Ciblez 1 cadavre supplémentaire. Vos morts-vivants gagnent +niv Magicien PV et +bonus maîtrise aux dégâts d\'arme.', rules: [{ type: 'spell', spellId: 'animate-dead', alwaysKnown: true }, { type: 'condition', condition: 'undead-thralls', description: 'Morts-vivants invoqués : +niv PV, +maîtrise dégâts' }] },
            { level: 10, name: 'Habitué de la non-mort', description: 'Résistance aux dégâts nécrotiques. Votre maximum de PV ne peut être réduit.', rules: [{ type: 'condition', condition: 'resistance-necrotic', description: 'Résistance nécrotique, max PV non réduit' }] },
            { level: 14, name: 'Commander les morts-vivants', description: 'Action : contrôlez un mort-vivant à 18m (JS CHA). S\'il rate, il vous obéit. Les intelligents ont avantage.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'command-undead' }] },
        ],
    },
    {
        id: 'transmutation',
        classId: 'wizard',
        name: 'École de Transmutation',
        nameEn: 'School of Transmutation',
        description: 'Spécialisé dans la modification de l\'énergie et de la matière, altérant les formes physiques.',
        source: 'PHB',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Transmutateur savant', description: 'Le temps et le coût de copie de sorts de Transmutation dans votre grimoire sont divisés par deux.', rules: [{ type: 'condition', condition: 'transmutation-savant', description: 'Copie sorts Transmutation : temps et coût /2' }] },
            { level: 2, name: 'Alchimie mineure', description: 'Transformez temporairement un objet (bois, pierre, fer, cuivre ou argent) en un autre de ces matériaux. Dure 1h ou fin de concentration.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'minor-alchemy' }] },
            { level: 6, name: 'Pierre du transmutateur', description: 'Créez une pierre offrant un bénéfice au porteur : vision dans le noir 18m, +3m vitesse, maîtrise JS CON, ou résistance à un type de dégâts élémentaire.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'transmuters-stone' }] },
            { level: 10, name: 'Métamorphe', description: 'Apprenez Polymorphe. Lancez-le 1/repos long sans emplacement.', rules: [{ type: 'spell', spellId: 'polymorph', alwaysKnown: true }, { type: 'resource', id: 'shapechanger', name: 'Métamorphe', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Grand transmutateur', description: 'Action : consumez votre Pierre pour un effet majeur : transmutation d\'objet, panacée (tous états soignés + PV pleins), ou Résurrection.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'master-transmuter' }] },
        ],
    },
    {
        id: 'war_magic',
        classId: 'wizard',
        name: 'Magie de Guerre',
        nameEn: 'War Magic',
        description: 'Un mage de guerre mêlant évocation et abjuration pour renforcer ses sorts et ses défenses.',
        source: 'XGtE',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Déviation arcanique', description: 'Réaction quand touché ou JS raté : +2 CA ou +4 au JS. Mais ne pouvez lancer que des sorts mineurs jusqu\'à la fin de votre prochain tour.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'arcane-deflection' }] },
            { level: 2, name: 'Ruse tactique', description: '+mod INT à l\'initiative.', rules: [{ type: 'condition', condition: 'tactical-wit', description: '+mod INT à l\'initiative' }] },
            { level: 6, name: 'Afflux de puissance', description: 'Stockez des afflux (max = mod INT). Gagnez-en au repos court (si 0) ou en réussissant Contresort/Dissipation. 1/tour : dépensez 1 = +demi niv Magicien dégâts de force.', rules: [{ type: 'resource', id: 'power-surge', name: 'Afflux de puissance', progression: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 10, name: 'Magie durable', description: 'Pendant la concentration sur un sort : +2 CA et +2 aux JS.', rules: [{ type: 'condition', condition: 'durable-magic', description: '+2 CA et +2 JS pendant concentration' }] },
            { level: 14, name: 'Linceul déviant', description: 'Quand vous utilisez Déviation arcanique, jusqu\'à 3 créatures à 18m subissent demi niv Magicien dégâts de force.', rules: [{ type: 'damage_bonus', value: 0, condition: 'deflecting-shroud', damageType: 'force' }] },
        ],
    },
    {
        id: 'bladesinging',
        classId: 'wizard',
        name: 'Chant de Lame',
        nameEn: 'Bladesinging',
        description: 'Un magicien qui combine magie et combat à l\'épée dans une danse martiale élégante.',
        source: 'TCoE',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Formation martiale', description: 'Maîtrise armures légères et 1 arme de CàC à une main. Maîtrise de Représentation.', rules: [{ type: 'grant', targetType: 'proficiency', targetId: 'ID_ARMOR_LIGHT' }, { type: 'select', name: 'Arme de CàC', targetType: 'weapon', count: 1, options: ['longsword', 'rapier', 'scimitar', 'shortsword'] }, { type: 'grant', targetType: 'proficiency', targetId: 'ID_SKILL_PERFORMANCE' }] },
            { level: 2, name: 'Chant de lame', description: 'Action bonus, 1 min (pas arm. moy/lourde ni bouclier) : +mod INT à la CA, +3m vitesse, avantage Acrobaties, +mod INT aux JS de concentration. Bonus maîtrise fois/repos long.', rules: [{ type: 'resource', id: 'bladesong', name: 'Chant de lame', progression: [0, 0, 2, 2, 2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5], recovery: 'short' }, { type: 'condition', condition: 'bladesong-ac', description: '+mod INT à la CA' }, { type: 'speed_bonus', value: 3, condition: 'bladesong' }, { type: 'condition', condition: 'bladesong-concentration', description: '+mod INT aux JS de concentration' }] },
            { level: 6, name: 'Attaque supplémentaire', description: 'Attaquez deux fois au lieu d\'une. L\'une des attaques peut être un sort mineur.', rules: [{ type: 'condition', condition: 'extra-attack-bladesinger', description: '2 attaques, l\'une peut être un sort mineur' }] },
            { level: 10, name: 'Chant de défense', description: 'Pendant le Chant de lame, réaction : dépensez un emplacement pour réduire les dégâts de 5 × niv de l\'emplacement.', rules: [{ type: 'grant', targetType: 'feature', targetId: 'song-of-defense' }] },
            { level: 14, name: 'Chant de victoire', description: 'Pendant le Chant de lame, ajoutez mod INT aux dégâts de vos attaques d\'arme au CàC.', rules: [{ type: 'damage_bonus', value: 0, condition: 'song-of-victory', damageType: 'weapon' }] },
        ],
    },
    {
        id: 'order_of_scribes',
        classId: 'wizard',
        name: 'Ordre des Scribes',
        nameEn: 'Order of Scribes',
        description: 'Un magicien dont le grimoire acquiert une conscience arcanique, offrant un contrôle unique sur les sorts.',
        source: 'TCoE',
        subclassLevel: 2,
        features: [
            { level: 2, name: 'Plume magique', description: 'Action bonus : conjurez une plume magique (pas d\'encre, temps de copie de sorts divisé par 2, peut effacer du texte).', rules: [{ type: 'grant', targetType: 'feature', targetId: 'awakened-spellbook' }] },
            { level: 2, name: 'Grimoire éveillé', description: 'Votre grimoire est votre focaliseur. Quand vous lancez un sort avec emplacement, remplacez son type de dégâts par celui d\'un autre sort de même niveau dans votre grimoire. Rituel sans emplacement 1/repos long.', rules: [{ type: 'condition', condition: 'awakened-spellbook-damage', description: 'Change le type de dégâts d\'un sort' }] },
            { level: 6, name: 'Esprit manifeste', description: 'Action bonus : invoquez un esprit incorporel TP à 18m. Focaliseur, lancez des sorts depuis son espace. Télépathie. Dure 10 min. 1/repos long ou emplacement.', rules: [{ type: 'resource', id: 'manifest-mind', name: 'Esprit manifeste', progression: [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 10, name: 'Maître scribe', description: 'Créez un parchemin magique de sort niv 1-2 de votre grimoire. Le sort compte comme 1 niv supérieur. 1/repos long.', rules: [{ type: 'resource', id: 'master-scrivener', name: 'Maître scribe', progression: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], recovery: 'long' }] },
            { level: 14, name: 'Ne faire qu\'un', description: 'Pendant que le grimoire est sur vous : avantage aux tests d\'Arcanes. Réaction sur dégâts : redirigez sur le grimoire (un sort disparaît par niv de sort de dégâts subis). Pas au niv 0 sorts.', rules: [{ type: 'condition', condition: 'one-with-the-word', description: 'Avantage Arcanes, réaction pour rediriger dégâts sur le grimoire' }] },
        ],
    },
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
    if (!sc) return []
    return sc.features.filter(f => f.level <= level)
}

// Helper : récupérer le niveau de choix de sous-classe pour une classe
export function getSubclassSelectionLevel(classId: string): number {
    const first = subclasses.find(sc => sc.classId === classId)
    return first?.subclassLevel ?? 3
}
