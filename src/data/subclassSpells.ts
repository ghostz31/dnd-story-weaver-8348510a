/**
 * Sorts de sous-classes (toujours préparés, ne comptent pas dans la limite)
 *
 * Chaque sous-classe accorde des sorts supplémentaires à certains niveaux.
 * Ces sorts sont automatiquement préparés et ne comptent pas dans le nombre
 * de sorts que le personnage peut préparer.
 *
 * Les noms correspondent exactement à ceux de spells-complete.json (AideDD)
 */

export interface SubclassSpellEntry {
    /** Niveau de personnage auquel les sorts sont acquis */
    characterLevel: number
    /** Noms des sorts (FR, correspondant à spells-complete.json) */
    spells: string[]
}

export interface SubclassSpellList {
    subclassId: string
    classId: string
    /** Label affiché (ex: "Sorts de serment", "Sorts de domaine") */
    label: string
    entries: SubclassSpellEntry[]
}

// ═══════════════════════════════════════════════
// PALADIN — Sorts de serment
// ═══════════════════════════════════════════════

const devotionSpells: SubclassSpellList = {
    subclassId: 'devotion',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Protection contre le mal et le bien', 'Sanctuaire'] },
        { characterLevel: 5, spells: ['Restauration partielle', 'Zone de vérité'] },
        { characterLevel: 9, spells: ['Lueur d\'espoir', 'Dissipation de la magie'] },
        { characterLevel: 13, spells: ['Gardien de la foi', 'Liberté de mouvement'] },
        { characterLevel: 17, spells: ['Communion', 'Colonne de flamme'] },
    ],
}

const ancientsSpells: SubclassSpellList = {
    subclassId: 'ancients',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Frappe piégeuse', 'Communication avec les animaux'] },
        { characterLevel: 5, spells: ['Pas brumeux', 'Rayon lunaire'] },
        { characterLevel: 9, spells: ['Croissance végétale', 'Protection contre une énergie'] },
        { characterLevel: 13, spells: ['Tempête de grêle', 'Peau de pierre'] },
        { characterLevel: 17, spells: ['Communion avec la nature', 'Passage par les arbres'] },
    ],
}

const vengeanceSpells: SubclassSpellList = {
    subclassId: 'vengeance',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Fléau', 'Marque du chasseur'] },
        { characterLevel: 5, spells: ['Immobilisation de personne', 'Foulée brumeuse'] },
        { characterLevel: 9, spells: ['Hâte', 'Protection contre une énergie'] },
        { characterLevel: 13, spells: ['Bannissement', 'Frappe piégeuse'] },
        { characterLevel: 17, spells: ['Immobilisation de monstre', 'Scrutation'] },
    ],
}

const conquestSpells: SubclassSpellList = {
    subclassId: 'conquest',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Armure d\'Agathys', 'Grillement'] },
        { characterLevel: 5, spells: ['Pas brumeux', 'Couronne de folie'] },
        { characterLevel: 9, spells: ['Cruauté mentale', 'Animation de morts'] },
        { characterLevel: 13, spells: ['Terreur', 'Frappe vide'] },
        { characterLevel: 17, spells: ['Cône de froid', 'Tempête de grêle'] },
    ],
}

const redemptionSpells: SubclassSpellList = {
    subclassId: 'redemption',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Sanctuaire', 'Soins'] },
        { characterLevel: 5, spells: ['Rayon de vérité', 'Immobilisation de personne'] },
        { characterLevel: 9, spells: ['Lueur d\'espoir', 'Contre-charme'] },
        { characterLevel: 13, spells: ['Restauration supérieure', 'Zone de vérité'] },
        { characterLevel: 17, spells: ['Projection astrale', 'Rappel à la vie'] },
    ],
}

const glorySpells: SubclassSpellList = {
    subclassId: 'glory',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Saut', 'Flèche guidée'] },
        { characterLevel: 5, spells: ['Augure', 'Pas brumeux'] },
        { characterLevel: 9, spells: ['Hâte', 'Liberté de mouvement'] },
        { characterLevel: 13, spells: ['Arme supérieure', 'Nuée filante'] },
        { characterLevel: 17, spells: ['Vision lucide', 'Voyage sans trace'] },
    ],
}

const watchersSpells: SubclassSpellList = {
    subclassId: 'watchers',
    classId: 'paladin',
    label: 'Sorts de serment',
    entries: [
        { characterLevel: 3, spells: ['Alarme', 'Détection de la magie'] },
        { characterLevel: 5, spells: ['Lumière du jour', 'Vue dans le noir'] },
        { characterLevel: 9, spells: ['Aura de vitalité', 'Disparition de masse'] },
        { characterLevel: 13, spells: ['Vision lucide', 'Bannissement'] },
        { characterLevel: 17, spells: ['Regard perçant', 'Mur de force'] },
    ],
}

// ═══════════════════════════════════════════════
// CLERC — Sorts de domaine
// ═══════════════════════════════════════════════

const lifeDomainSpells: SubclassSpellList = {
    subclassId: 'life',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Bénédiction', 'Soins'] },
        { characterLevel: 3, spells: ['Restauration partielle', 'Arme spirituelle'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Retour à la vie'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Protection contre la mort'] },
        { characterLevel: 9, spells: ['Soins de groupe', 'Rappel à la vie'] },
    ],
}

const warDomainSpells: SubclassSpellList = {
    subclassId: 'war',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Bouclier de la foi', 'Faveur divine'] },
        { characterLevel: 3, spells: ['Arme magique', 'Arme spirituelle'] },
        { characterLevel: 5, spells: ['Aura du croisé', 'Esprits gardiens'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Liberté de mouvement'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Immobilisation de monstre'] },
    ],
}

const lightDomainSpells: SubclassSpellList = {
    subclassId: 'light',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Mains brûlantes', 'Lueurs féeriques'] },
        { characterLevel: 3, spells: ['Sphère de feu', 'Rayon ardent'] },
        { characterLevel: 5, spells: ['Boule de feu', 'Lumière du jour'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Mur de feu'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Scrutation'] },
    ],
}

const knowledgeDomainSpells: SubclassSpellList = {
    subclassId: 'knowledge',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Commandement', 'Identification'] },
        { characterLevel: 3, spells: ['Augure', 'Suggestion'] },
        { characterLevel: 5, spells: ['Clairvoyance', 'Langues'] },
        { characterLevel: 7, spells: ['Arme spirituelle', 'Localisation d\'objet'] },
        { characterLevel: 9, spells: ['Scrutation', 'Vision lucide'] },
    ],
}

const natureDomainSpells: SubclassSpellList = {
    subclassId: 'nature',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Bourrasque', 'Enchevêtrement'] },
        { characterLevel: 3, spells: ['Barrage d\'épines', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Croissance végétale'] },
        { characterLevel: 7, spells: ['Contrôle de l\'eau', 'Arbre marche'] },
        { characterLevel: 9, spells: ['Communion avec la nature', 'Insectes géants'] },
    ],
}

const tempestDomainSpells: SubclassSpellList = {
    subclassId: 'tempest',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Brouillard', 'Décharge foudroyante'] },
        { characterLevel: 3, spells: ['Vent violent', 'Éclatement'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Pas brumeux'] },
        { characterLevel: 7, spells: ['Contrôle de l\'eau', 'Glace d\'hiver'] },
        { characterLevel: 9, spells: ['Tempête destructrice', 'Contrôle des vents'] },
    ],
}

const trickeryDomainSpells: SubclassSpellList = {
    subclassId: 'trickery',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Clignotement', 'Déguisement'] },
        { characterLevel: 3, spells: ['Charme-personne', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Brouillard', 'Image majeure'] },
        { characterLevel: 7, spells: ['Polymorphisme', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Modification de la mémoire', 'Scrutation'] },
    ],
}

const forgeDomainSpells: SubclassSpellList = {
    subclassId: 'forge',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Identification', 'Deuil purificateur'] },
        { characterLevel: 3, spells: ['Arme magique', 'Flamme durable'] },
        { characterLevel: 5, spells: ['Croissance végétale', 'Protection contre les énergies'] },
        { characterLevel: 7, spells: ['Mur de feu', 'Arme supérieure'] },
        { characterLevel: 9, spells: ['Animation de morts', 'Création'] },
    ],
}

const graveDomainSpells: SubclassSpellList = {
    subclassId: 'grave',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Détection de la magie', 'Deuil purificateur'] },
        { characterLevel: 3, spells: ['Arme spirituelle', 'Rayon de faiblesse'] },
        { characterLevel: 5, spells: ['Animation de morts', 'Vision dans le noir'] },
        { characterLevel: 7, spells: ['Banishment', 'Protection contre la mort'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Rappel à la vie'] },
    ],
}

const orderDomainSpells: SubclassSpellList = {
    subclassId: 'order',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Commandement', 'Détection de la magie'] },
        { characterLevel: 3, spells: ['Immobilisation de personne', 'Zone de vérité'] },
        { characterLevel: 5, spells: ['Masse blessante', 'Pas brumeux'] },
        { characterLevel: 7, spells: ['Arme supérieure', 'Contrainte'] },
        { characterLevel: 9, spells: ['Communion', 'Domination de personne'] },
    ],
}

const peaceDomainSpells: SubclassSpellList = {
    subclassId: 'peace',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Amitié', 'Bannissement du mal et du bien'] },
        { characterLevel: 3, spells: ['Aide', 'Protection contre les énergies'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Rayon de vérité'] },
        { characterLevel: 7, spells: ['Aura de vitalité', 'Bannissement'] },
        { characterLevel: 9, spells: ['Soins de groupe', 'Restauration supérieure'] },
    ],
}

const twilightDomainSpells: SubclassSpellList = {
    subclassId: 'twilight',
    classId: 'cleric',
    label: 'Sorts de domaine',
    entries: [
        { characterLevel: 1, spells: ['Mains brûlantes', 'Vue dans le noir'] },
        { characterLevel: 3, spells: ['Brouillard', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Aura de vitalité', 'Lueurs féeriques'] },
        { characterLevel: 7, spells: ['Protection contre la mort', 'Garde des ombres'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Vision lucide'] },
    ],
}

// ═══════════════════════════════════════════════
// DRUIDE — Sorts de cercle
// ═══════════════════════════════════════════════

const landForestSpells: SubclassSpellList = {
    subclassId: 'land',
    classId: 'druid',
    label: 'Sorts de cercle (Terre)',
    entries: [
        { characterLevel: 3, spells: ['Peau d\'écorce', 'Pattes d\'araignée'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Croissance végétale'] },
        { characterLevel: 7, spells: ['Divination', 'Liberté de mouvement'] },
        { characterLevel: 9, spells: ['Communion avec la nature', 'Passage par les arbres'] },
    ],
}

const moonCircleSpells: SubclassSpellList = {
    subclassId: 'moon',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [],
}

const dreamsSpells: SubclassSpellList = {
    subclassId: 'dreams',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        { characterLevel: 2, spells: ['Sommeil', 'Sanctuaire'] },
        { characterLevel: 3, spells: ['Pas brumeux', 'Filo-enchantement'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Protection contre les énergies'] },
        { characterLevel: 7, spells: ['Garde des ombres', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Vision lacunaire', 'Rappel à la vie'] },
    ],
}

const shepherdSpells: SubclassSpellList = {
    subclassId: 'shepherd',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        { characterLevel: 2, spells: ['Parler aux bêtes', 'Bénédiction'] },
        { characterLevel: 3, spells: ['Barrage d\'épines', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Arbre marcheur'] },
        { characterLevel: 7, spells: ['Congélation', 'Communication avec les plantes'] },
        { characterLevel: 9, spells: ['Insectes géants', 'Communion avec la nature'] },
    ],
}

const sporesSpells: SubclassSpellList = {
    subclassId: 'spores',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        { characterLevel: 2, spells: ['Rayon de faiblesse', 'Charme-personne'] },
        { characterLevel: 3, spells: ['Brouillard', 'Rayon de maladie'] },
        { characterLevel: 5, spells: ['Animation de morts', 'Gangrène'] },
        { characterLevel: 7, spells: ['Confusion', 'Glace d\'hiver'] },
        { characterLevel: 9, spells: ['Nuée filante', 'Contagion'] },
    ],
}

const starsSpells: SubclassSpellList = {
    subclassId: 'stars',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        { characterLevel: 2, spells: ['Guérison des blessures', 'Lueurs féeriques'] },
        { characterLevel: 3, spells: ['Augure', 'Flèche guidée'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Éclair d\'étoiles'] },
        { characterLevel: 7, spells: ['Arme spirituelle', 'Protection contre les énergies'] },
        { characterLevel: 9, spells: ['Vision lucide', 'Mur de force'] },
    ],
}

const wildfireSpells: SubclassSpellList = {
    subclassId: 'wildfire',
    classId: 'druid',
    label: 'Sorts de cercle',
    entries: [
        { characterLevel: 2, spells: ['Détection de la magie', 'Bouclier'] },
        { characterLevel: 3, spells: ['Flamme durable', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Boule de feu', 'Protection contre les énergies'] },
        { characterLevel: 7, spells: ['Porte dimensionnelle', 'Arme spirituelle'] },
        { characterLevel: 9, spells: ['Mur de feu', 'Congélation'] },
    ],
}

// ═══════════════════════════════════════════════
// ENSORCELEUR — Sorts de lignée
// ═══════════════════════════════════════════════

const draconicSpells: SubclassSpellList = {
    subclassId: 'draconic',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Détection de la magie', 'Rayon de givre'] },
        { characterLevel: 3, spells: ['Bouclier', 'Flamme durable'] },
        { characterLevel: 5, spells: ['Boule de feu', 'Lévitation'] },
        { characterLevel: 7, spells: ['Protection contre les énergies', 'Mur de feu'] },
        { characterLevel: 9, spells: ['Nuée filante', 'Congélation'] },
    ],
}

const wildMagicSpells: SubclassSpellList = {
    subclassId: 'wild_magic',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Brouillard', 'Rayon ardent'] },
        { characterLevel: 3, spells: ['Pas brumeux', 'Image silencieuse'] },
        { characterLevel: 5, spells: ['Bourrasque', 'Lévitation'] },
        { characterLevel: 7, spells: ['Dédale', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Modification de la mémoire', 'Vision lucide'] },
    ],
}

const divineSoulSpells: SubclassSpellList = {
    subclassId: 'divine_soul',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Bénédiction', 'Aide'] },
        { characterLevel: 3, spells: ['Arme spirituelle', 'Soins'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Restauration partielle'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Liberté de mouvement'] },
        { characterLevel: 9, spells: ['Soins de groupe', 'Rappel à la vie'] },
    ],
}

const shadowMagicSpells: SubclassSpellList = {
    subclassId: 'shadow_magic',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Brouillard', 'Rayon de givre'] },
        { characterLevel: 3, spells: ['Pas brumeux', 'Ténèbres'] },
        { characterLevel: 5, spells: ['Rayon de faiblesse', 'Lévitation'] },
        { characterLevel: 7, spells: ['Garde des ombres', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Scrutation'] },
    ],
}

const stormSorcerySpells: SubclassSpellList = {
    subclassId: 'storm_sorcery',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Bouclier', 'Décharge foudroyante'] },
        { characterLevel: 3, spells: ['Vent violent', 'Brouillard'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Sphère de feu'] },
        { characterLevel: 7, spells: ['Contrôle de l\'eau', 'Glace d\'hiver'] },
        { characterLevel: 9, spells: ['Tempête destructrice', 'Colonne de flamme'] },
    ],
}

const aberrantMindSpells: SubclassSpellList = {
    subclassId: 'aberrant_mind',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Détection de la magie', 'Armure d\'Agathys'] },
        { characterLevel: 3, spells: ['Décharge foudroyante', 'Charme-personne'] },
        { characterLevel: 5, spells: ['Cruauté mentale', 'Détection de pensées'] },
        { characterLevel: 7, spells: ['Garde des ombres', 'Clairvoyance'] },
        { characterLevel: 9, spells: ['Domination de personne', 'Vision lucide'] },
    ],
}

const clockworkSoulSpells: SubclassSpellList = {
    subclassId: 'clockwork_soul',
    classId: 'sorcerer',
    label: 'Sorts de lignée',
    entries: [
        { characterLevel: 1, spells: ['Rayon ardent', 'Bouclier'] },
        { characterLevel: 3, spells: ['Aide', 'Protection contre les énergies'] },
        { characterLevel: 5, spells: ['Arme spirituelle', 'Restauration partielle'] },
        { characterLevel: 7, spells: ['Arme supérieure', 'Bannissement'] },
        { characterLevel: 9, spells: ['Soins de groupe', 'Restauration supérieure'] },
    ],
}

// ═══════════════════════════════════════════════
// RÔDEUR — Sorts de conclave
// ═══════════════════════════════════════════════

const hunterSpells: SubclassSpellList = {
    subclassId: 'hunter',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Détection de la magie', 'Détection du poison et des maladies'] },
        { characterLevel: 5, spells: ['Pas brumeux', 'Protection contre les énergies'] },
        { characterLevel: 9, spells: ['Lueur d\'espoir', 'Communication avec les plantes'] },
        { characterLevel: 13, spells: ['Localisation de créature', 'Liberté de mouvement'] },
        { characterLevel: 17, spells: ['Vision lucide', 'Garde de la nature'] },
    ],
}

const beastMasterSpells: SubclassSpellList = {
    subclassId: 'beast_master',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Parler aux bêtes', 'Bénédiction'] },
        { characterLevel: 5, spells: ['Augure', 'Pas brumeux'] },
        { characterLevel: 9, spells: ['Appel du familier', 'Connivence avec la nature'] },
        { characterLevel: 13, spells: ['Localisation de créature', 'Liberté de mouvement'] },
        { characterLevel: 17, spells: ['Communication avec les plantes', 'Scrutation'] },
    ],
}

const gloomStalkerSpells: SubclassSpellList = {
    subclassId: 'gloom_stalker',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Déguisement', 'Flèche guidée'] },
        { characterLevel: 5, spells: ['Brouillard', 'Pas brumeux'] },
        { characterLevel: 9, spells: ['Ténèbres', 'Protection contre les énergies'] },
        { characterLevel: 13, spells: ['Garde des ombres', 'Frappe vide'] },
        { characterLevel: 17, spells: ['Vision lucide', 'Scrutation'] },
    ],
}

const horizonWalkerSpells: SubclassSpellList = {
    subclassId: 'horizon_walker',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Détection de la magie', 'Détection du poison et des maladies'] },
        { characterLevel: 5, spells: ['Pas brumeux', 'Bouclier de la foi'] },
        { characterLevel: 9, spells: ['Lueur d\'espoir', 'Protection contre les énergies'] },
        { characterLevel: 13, spells: ['Bannissement', 'Porte dimensionnelle'] },
        { characterLevel: 17, spells: ['Vision lucide', 'Téléportation'] },
    ],
}

const monsterSlayerSpells: SubclassSpellList = {
    subclassId: 'monster_slayer',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Détection de la magie', 'Marque du chasseur'] },
        { characterLevel: 5, spells: ['Rayon de faiblesse', 'Pas brumeux'] },
        { characterLevel: 9, spells: ['Protection contre les énergies', 'Communication avec les animaux'] },
        { characterLevel: 13, spells: ['Bannissement', 'Localisation de créature'] },
        { characterLevel: 17, spells: ['Domination de personne', 'Vision lucide'] },
    ],
}

const feyWandererSpells: SubclassSpellList = {
    subclassId: 'fey_wanderer',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Charme-personne', 'Lueurs féeriques'] },
        { characterLevel: 5, spells: ['Pas brumeux', 'Image silencieuse'] },
        { characterLevel: 9, spells: ['Disparition', 'Lévitation'] },
        { characterLevel: 13, spells: ['Bannissement', 'Porte dimensionnelle'] },
        { characterLevel: 17, spells: ['Charme de masse', 'Scrutation'] },
    ],
}

const swarmkeeperSpells: SubclassSpellList = {
    subclassId: 'swarmkeeper',
    classId: 'ranger',
    label: 'Sorts de conclave',
    entries: [
        { characterLevel: 3, spells: ['Bourrasque', 'Liaison de Guidance'] },
        { characterLevel: 5, spells: ['Barrage d\'épines', 'Pas brumeux'] },
        { characterLevel: 9, spells: ['Appel de la foudre', 'Gangrène'] },
        { characterLevel: 13, spells: ['Insectes géants', 'Protection contre les énergies'] },
        { characterLevel: 17, spells: ['Nuée filante', 'Scrutation'] },
    ],
}

// ═══════════════════════════════════════════════
// OCCULTISTE — Sorts de protecteur
// ═══════════════════════════════════════════════

const archfeySpells: SubclassSpellList = {
    subclassId: 'archfey',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Bannissement du mal et du bien', 'Lueurs féeriques'] },
        { characterLevel: 3, spells: ['Immobilisation de personne', 'Pas brumeux'] },
        { characterLevel: 5, spells: ['Clignotement', 'Ralentir'] },
        { characterLevel: 7, spells: ['Polymorphisme', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Domination de personne', 'Modification de la mémoire'] },
    ],
}

const fiendSpells: SubclassSpellList = {
    subclassId: 'fiend',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Fléau', 'Bouclier de la foi'] },
        { characterLevel: 3, spells: ['Sphère de feu', 'Flamme durable'] },
        { characterLevel: 5, spells: ['Boule de feu', 'Rayon de faiblesse'] },
        { characterLevel: 7, spells: ['Garde des ombres', 'Mur de feu'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Scrutation'] },
    ],
}

const greatOldOneSpells: SubclassSpellList = {
    subclassId: 'great_old_one',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Détection de la magie', 'Communication avec les animaux'] },
        { characterLevel: 3, spells: ['Charme-personne', 'Rayon de faiblesse'] },
        { characterLevel: 5, spells: ['Clairvoyance', 'Déplacement rapide'] },
        { characterLevel: 7, spells: ['Confusion', 'Envoûtement'] },
        { characterLevel: 9, spells: ['Domination de personne', 'Vision lucide'] },
    ],
}

const celestialSpells: SubclassSpellList = {
    subclassId: 'celestial',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Flèche guidée', 'Soins'] },
        { characterLevel: 3, spells: ['Flamme durable', 'Rayon ardent'] },
        { characterLevel: 5, spells: ['Lueur d\'espoir', 'Restauration partielle'] },
        { characterLevel: 7, spells: ['Gardien de la foi', 'Mur de feu'] },
        { characterLevel: 9, spells: ['Flamme supérieure', 'Rappel à la vie'] },
    ],
}

const hexbladeSpells: SubclassSpellList = {
    subclassId: 'hexblade',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Fléau', 'Bouclier'] },
        { characterLevel: 3, spells: ['Flamme durable', 'Arme magique'] },
        { characterLevel: 5, spells: ['Brouillard', 'Arme spirituelle'] },
        { characterLevel: 7, spells: ['Fantôme', 'Congélation'] },
        { characterLevel: 9, spells: ['Animation de morts', 'Arme supérieure'] },
    ],
}

const undyingSpells: SubclassSpellList = {
    subclassId: 'undying',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Bannissement du mal et du bien', 'Flamme durable'] },
        { characterLevel: 3, spells: ['Aveuglement', 'Faux-semblant'] },
        { characterLevel: 5, spells: ['Arme magique', 'Rayon de faiblesse'] },
        { characterLevel: 7, spells: ['Arme supérieure', 'Fantôme'] },
        { characterLevel: 9, spells: ['Contagion', 'Vision lucide'] },
    ],
}

const fathomlessSpells: SubclassSpellList = {
    subclassId: 'fathomless',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Création de vague', 'Rayon de givre'] },
        { characterLevel: 3, spells: ['Immobilisation de personne', 'Rayon de faiblesse'] },
        { characterLevel: 5, spells: ['Appel de la foudre', 'Protection contre les énergies'] },
        { characterLevel: 7, spells: ['Contrôle de l\'eau', 'Envoûtement'] },
        { characterLevel: 9, spells: ['Colonne de flamme', 'Songe'] },
    ],
}

const genieSpells: SubclassSpellList = {
    subclassId: 'genie',
    classId: 'warlock',
    label: 'Sorts de protecteur',
    entries: [
        { characterLevel: 1, spells: ['Bannissement du mal et du bien', 'Lueurs féeriques'] },
        { characterLevel: 3, spells: ['Pas brumeux', 'Flamme durable'] },
        { characterLevel: 5, spells: ['Création de vague', 'Protection contre les énergies'] },
        { characterLevel: 7, spells: ['Garde des ombres', 'Porte dimensionnelle'] },
        { characterLevel: 9, spells: ['Création', 'Scrutation'] },
    ],
}

// ═══════════════════════════════════════════════
// ROUBLARD — Sorts d'escroc arcanique
// ═══════════════════════════════════════════════

const arcaneTricksterSpells: SubclassSpellList = {
    subclassId: 'arcane_trickster',
    classId: 'rogue',
    label: 'Sorts d\'escroc',
    entries: [
        { characterLevel: 3, spells: ['Charme-personne', 'Image silencieuse', 'Sommeil', 'Main du mage'] },
        { characterLevel: 7, spells: ['Invisibilité', 'Miroir illusoire'] },
        { characterLevel: 13, spells: ['Hâte', 'Vol'] },
        { characterLevel: 19, spells: ['Dominer un humanoïde', 'Modification de mémoire'] },
    ],
}

// ═══════════════════════════════════════════════
// Registre complet
// ═══════════════════════════════════════════════

export const allSubclassSpells: SubclassSpellList[] = [
    // Paladin
    devotionSpells,
    ancientsSpells,
    vengeanceSpells,
    conquestSpells,
    redemptionSpells,
    glorySpells,
    watchersSpells,
    // Clerc
    lifeDomainSpells,
    warDomainSpells,
    lightDomainSpells,
    knowledgeDomainSpells,
    natureDomainSpells,
    tempestDomainSpells,
    trickeryDomainSpells,
    forgeDomainSpells,
    graveDomainSpells,
    orderDomainSpells,
    peaceDomainSpells,
    twilightDomainSpells,
    // Druide
    landForestSpells,
    moonCircleSpells,
    dreamsSpells,
    shepherdSpells,
    sporesSpells,
    starsSpells,
    wildfireSpells,
    // Ensorceleur
    draconicSpells,
    wildMagicSpells,
    divineSoulSpells,
    shadowMagicSpells,
    stormSorcerySpells,
    aberrantMindSpells,
    clockworkSoulSpells,
    // Rôdeur
    hunterSpells,
    beastMasterSpells,
    gloomStalkerSpells,
    horizonWalkerSpells,
    monsterSlayerSpells,
    feyWandererSpells,
    swarmkeeperSpells,
    // Occultiste
    archfeySpells,
    fiendSpells,
    greatOldOneSpells,
    celestialSpells,
    hexbladeSpells,
    undyingSpells,
    fathomlessSpells,
    genieSpells,
    // Roublard
    arcaneTricksterSpells,
]

/**
 * Récupère les sorts de sous-classe "toujours préparés" pour un personnage
 * @param subclassId ID de la sous-classe
 * @param characterLevel Niveau actuel du personnage
 * @returns Liste des noms de sorts toujours préparés
 */
export function getAlwaysPreparedSpells(subclassId: string | undefined, characterLevel: number): string[] {
    if (!subclassId) return []

    const subclassSpellList = allSubclassSpells.find(s => s.subclassId === subclassId)
    if (!subclassSpellList) return []

    const spellNames: string[] = []
    for (const entry of subclassSpellList.entries) {
        if (characterLevel >= entry.characterLevel) {
            spellNames.push(...entry.spells)
        }
    }
    return spellNames
}

/**
 * Récupère le label du type de sorts de sous-classe
 */
export function getSubclassSpellLabel(subclassId: string | undefined): string {
    if (!subclassId) return 'Sorts de sous-classe'
    const subclassSpellList = allSubclassSpells.find(s => s.subclassId === subclassId)
    return subclassSpellList?.label ?? 'Sorts de sous-classe'
}

/**
 * Vérifie si un sort est un sort de sous-classe toujours préparé
 */
export function isAlwaysPreparedSpell(spellName: string, subclassId: string | undefined, characterLevel: number): boolean {
    const alwaysPrepared = getAlwaysPreparedSpells(subclassId, characterLevel)
    return alwaysPrepared.includes(spellName)
}