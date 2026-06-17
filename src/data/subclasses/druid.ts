import type { Subclass } from './types'

export const druidSubclasses: Subclass[] = [
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
]
