#!/usr/bin/env node
/**
 * Script d'importation des données Aurora Builder
 * 
 * Ce script télécharge et convertit toutes les données d'Aurora
 * depuis leur repository GitHub public
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ============================================================================
// CONFIGURATION
// ============================================================================

const AURORA_BASE_URL = 'https://raw.githubusercontent.com/aurorabuilder/elements/master/core/players-handbook'

const FILES_TO_DOWNLOAD = {
  spells: `${AURORA_BASE_URL}/spells.xml`,
  races: [
    `${AURORA_BASE_URL}/races/race-dwarf.xml`,
    `${AURORA_BASE_URL}/races/race-elf.xml`,
    `${AURORA_BASE_URL}/races/race-halfling.xml`,
    `${AURORA_BASE_URL}/races/race-human.xml`,
    `${AURORA_BASE_URL}/races/race-dragonborn.xml`,
    `${AURORA_BASE_URL}/races/race-gnome.xml`,
    `${AURORA_BASE_URL}/races/race-half-elf.xml`,
    `${AURORA_BASE_URL}/races/race-half-orc.xml`,
    `${AURORA_BASE_URL}/races/race-tiefling.xml`,
  ],
  classes: [
    `${AURORA_BASE_URL}/classes/class-barbarian.xml`,
    `${AURORA_BASE_URL}/classes/class-bard.xml`,
    `${AURORA_BASE_URL}/classes/class-cleric.xml`,
    `${AURORA_BASE_URL}/classes/class-druid.xml`,
    `${AURORA_BASE_URL}/classes/class-fighter.xml`,
    `${AURORA_BASE_URL}/classes/class-monk.xml`,
    `${AURORA_BASE_URL}/classes/class-paladin.xml`,
    `${AURORA_BASE_URL}/classes/class-ranger.xml`,
    `${AURORA_BASE_URL}/classes/class-rogue.xml`,
    `${AURORA_BASE_URL}/classes/class-sorcerer.xml`,
    `${AURORA_BASE_URL}/classes/class-warlock.xml`,
    `${AURORA_BASE_URL}/classes/class-wizard.xml`,
  ],
  items: [
    `${AURORA_BASE_URL}/items/items-weapons.xml`,
    `${AURORA_BASE_URL}/items/items-armor.xml`,
    `${AURORA_BASE_URL}/items/items-equipment.xml`,
  ],
  feats: `${AURORA_BASE_URL}/feats.xml`,
  backgrounds: `${AURORA_BASE_URL}/backgrounds.xml`,
}

const OUTPUT_DIR = join(__dirname, '..', 'public', 'data', 'aurora')

// ============================================================================
// UTILITAIRES
// ============================================================================

async function fetchXML(url) {
  console.log(`📥 Téléchargement : ${url}`)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status} pour ${url}`)
  }
  return response.text()
}

function ensureDirectory(dir) {
  try {
    mkdirSync(dir, { recursive: true })
  } catch (e) {
    // Directory already exists
  }
}

// ============================================================================
// PARSER DES SORTS
// ============================================================================

const SCHOOL_MAP = {
  'Abjuration': 'abjuration',
  'Conjuration': 'conjuration',
  'Divination': 'divination',
  'Enchantment': 'enchantment',
  'Evocation': 'evocation',
  'Illusion': 'illusion',
  'Necromancy': 'necromancy',
  'Transmutation': 'transmutation',
}

const CLASS_MAP = {
  'Artificer': 'artificer',
  'Bard': 'bard',
  'Cleric': 'cleric',
  'Druid': 'druid',
  'Paladin': 'paladin',
  'Ranger': 'ranger',
  'Sorcerer': 'sorcerer',
  'Warlock': 'warlock',
  'Wizard': 'wizard',
}

// Traductions des sorts (les plus courants)
const SPELL_TRANSLATIONS = {
  'Acid Splash': 'Aspersion acide',
  'Aid': 'Aide',
  'Alarm': 'Alarme',
  'Alter Self': 'Métamorphose',
  'Animal Friendship': 'Amitié avec les animaux',
  'Animal Messenger': 'Messager animal',
  'Animal Shapes': 'Formes animales',
  'Animate Dead': 'Animation des morts',
  'Animate Objects': 'Animation des objets',
  'Antilife Shell': 'Carapace antivie',
  'Antimagic Field': 'Champ antimagie',
  'Antipathy/Sympathy': 'Antipathie/Sympathie',
  'Arcane Eye': 'Œil arcanique',
  'Arcane Gate': 'Porte arcanique',
  'Arcane Lock': 'Verrouillage arcanique',
  'Armor of Agathys': 'Armure d\'Agathys',
  'Arms of Hadar': 'Bras de Hadar',
  'Astral Projection': 'Projection astrale',
  'Augury': 'Augure',
  'Aura of Life': 'Aura de vie',
  'Aura of Purity': 'Aura de pureté',
  'Aura of Vitality': 'Aura de vitalité',
  'Awaken': 'Éveil',
  'Bane': 'Fléau',
  'Banishing Smite': 'Châtiment bannissant',
  'Banishment': 'Bannissement',
  'Barkskin': 'Peau d\'écorce',
  'Beacon of Hope': 'Signal de l\'espoir',
  'Beast Sense': 'Sens de la bête',
  'Bestow Curse': 'Imprécation',
  'Bigby\'s Hand': 'Main de Bigby',
  'Blade Barrier': 'Barrière de lames',
  'Blade Ward': 'Protection contre les lames',
  'Bless': 'Bénédiction',
  'Blight': 'Flétrissement',
  'Blindness/Deafness': 'Cécité/Surdité',
  'Blink': 'Clignotement',
  'Blur': 'Flou',
  'Burning Hands': 'Mains brûlantes',
  'Call Lightning': 'Appel de la foudre',
  'Calm Emotions': 'Apaisement des émotions',
  'Chain Lightning': 'Chaîne d\'éclairs',
  'Charm Person': 'Charme-personne',
  'Chill Touch': 'Toucher glacial',
  'Chromatic Orb': 'Orbe chromatique',
  'Circle of Death': 'Cercle de mort',
  'Circle of Power': 'Cercle de puissance',
  'Clairvoyance': 'Clairvoyance',
  'Clone': 'Clone',
  'Cloud of Daggers': 'Nuage de dagues',
  'Cloudkill': 'Nuage mortel',
  'Color Spray': 'Décharge chromatique',
  'Command': 'Ordre',
  'Commune': 'Communion',
  'Commune with Nature': 'Communion avec la nature',
  'Comprehend Languages': 'Compréhension des langues',
  'Compulsion': 'Compulsion',
  'Cone of Cold': 'Cône de froid',
  'Confusion': 'Confusion',
  'Conjure Animals': 'Conjuration d\'animaux',
  'Conjure Barrage': 'Barrage de projectiles',
  'Conjure Celestial': 'Conjuration d\'un céleste',
  'Conjure Elemental': 'Conjuration d\'élémentaire',
  'Conjure Fey': 'Conjuration de féerique',
  'Conjure Minor Elementals': 'Conjuration d\'élémentaires mineurs',
  'Conjure Volley': 'Volée de projectiles',
  'Conjure Woodland Beings': 'Conjuration d\'êtres des bois',
  'Contact Other Plane': 'Contact avec un autre plan',
  'Contagion': 'Contagion',
  'Contingency': 'Contingence',
  'Continual Flame': 'Flamme éternelle',
  'Control Water': 'Contrôle de l\'eau',
  'Control Weather': 'Contrôle du climat',
  'Cordon of Arrows': 'Cordon de flèches',
  'Counterspell': 'Contresort',
  'Create Food and Water': 'Création de nourriture et d\'eau',
  'Create or Destroy Water': 'Création ou destruction d\'eau',
  'Create Undead': 'Création de mort-vivant',
  'Creation': 'Création',
  'Crown of Madness': 'Couronne de folie',
  'Crusader\'s Mantle': 'Manteau du croisé',
  'Cure Wounds': 'Soins',
  'Dancing Lights': 'Lumières dansantes',
  'Darkness': 'Ténèbres',
  'Darkvision': 'Vision dans le noir',
  'Daylight': 'Lumière du jour',
  'Death Ward': 'Protection contre la mort',
  'Delayed Blast Fireball': 'Boule de feu à explosion retardée',
  'Demiplane': 'Démiplan',
  'Destructive Wave': 'Vague destructrice',
  'Detect Evil and Good': 'Détection du mal et du bien',
  'Detect Magic': 'Détection de la magie',
  'Detect Poison and Disease': 'Détection du poison et des maladies',
  'Detect Thoughts': 'Détection des pensées',
  'Dimension Door': 'Porte dimensionnelle',
  'Disguise Self': 'Déguisement',
  'Disintegrate': 'Désintégration',
  'Dispel Evil and Good': 'Dissipation du mal et du bien',
  'Dispel Magic': 'Dissipation de la magie',
  'Dissonant Whispers': 'Murmures dissonants',
  'Divination': 'Divination',
  'Divine Favor': 'Faveur divine',
  'Divine Word': 'Parole divine',
  'Dominate Beast': 'Domination de bête',
  'Dominate Monster': 'Domination de monstre',
  'Dominate Person': 'Domination de personne',
  'Dragon\'s Breath': 'Souffle du dragon',
  'Drawmij\'s Instant Summons': 'Convocation instantanée de Drawmij',
  'Dream': 'Rêve',
  'Druidcraft': 'Druidisme',
  'Earthquake': 'Tremblement de terre',
  'Eldritch Blast': 'Détonation occulte',
  'Elemental Bane': 'Fléau élémentaire',
  'Elemental Weapon': 'Arme élémentaire',
  'Enhance Ability': 'Amélioration de caractéristique',
  'Enlarge/Reduce': 'Agrandissement/Rapetissement',
  'Ensnaring Strike': 'Frappe piégeuse',
  'Entangle': 'Enchevêtrement',
  'Enthrall': 'Envoûtement',
  'Etherealness': 'Forme éthérée',
  'Evard\'s Black Tentacles': 'Tentacules noirs d\'Evard',
  'Expeditious Retreat': 'Retraite expéditive',
  'Eyebite': 'Morsure du regard',
  'Fabricate': 'Fabrication',
  'Faerie Fire': 'Lumière féerique',
  'False Life': 'Fausse vie',
  'Fear': 'Peur',
  'Feather Fall': 'Lentitude',
  'Feeblemind': 'Idiotie',
  'Find Familiar': 'Familier',
  'Find Steed': 'Monture',
  'Find the Path': 'Trouver le chemin',
  'Find Traps': 'Détection des pièges',
  'Finger of Death': 'Doigt de mort',
  'Fireball': 'Boule de feu',
  'Fire Bolt': 'Éclat de feu',
  'Fire Shield': 'Bouclier de feu',
  'Fire Storm': 'Tempête de feu',
  'Flame Blade': 'Lame de feu',
  'Flame Strike': 'Frappe de flamme',
  'Flaming Sphere': 'Sphère de feu',
  'Flesh to Stone': 'Chair en pierre',
  'Fly': 'Vol',
  'Fog Cloud': 'Nuage brumeux',
  'Forbiddance': 'Interdiction',
  'Forcecage': 'Cage de force',
  'Foresight': 'Prémonition',
  'Freedom of Movement': 'Liberté de mouvement',
  'Friends': 'Amitié',
  'Gaseous Form': 'Forme gazeuse',
  'Gate': 'Portail',
  'Geas': 'Geas',
  'Gentle Repose': 'Préservation des morts',
  'Giant Insect': 'Insecte géant',
  'Glibness': 'Glibesse',
  'Globe of Invulnerability': 'Globe d\'invulnérabilité',
  'Glyph of Warding': 'Glyphe de protection',
  'Goodberry': 'Baies bienfaisantes',
  'Grasping Vine': 'Saisie de la vigne',
  'Grease': 'Graisse',
  'Greater Invisibility': 'Invisibilité supérieure',
  'Greater Restoration': 'Restauration supérieure',
  'Guardian of Faith': 'Gardien de la foi',
  'Guards and Wards': 'Gardes et barriers',
  'Guidance': 'Assistance',
  'Guiding Bolt': 'Trait de lumière',
  'Gust of Wind': 'Rafale de vent',
  'Hallow': 'Sanctification',
  'Hallucinatory Terrain': 'Terrain hallucinatoire',
  'Harm': 'Affliction',
  'Haste': 'Hâte',
  'Heal': 'Soins supérieurs',
  'Healing Word': 'Mot de guérison',
  'Heat Metal': 'Métal brûlant',
  'Hellish Rebuke': 'Réprimande infernale',
  'Heroes\' Feast': 'Festin des héros',
  'Heroism': 'Héroïsme',
  'Hideous Laughter': 'Rire hideux',
  'Hold Monster': 'Immobilisation de monstre',
  'Hold Person': 'Immobilisation de personne',
  'Holy Aura': 'Aura sacrée',
  'Hunger of Hadar': 'Faim de Hadar',
  'Hunter\'s Mark': 'Marque du chasseur',
  'Hypnotic Pattern': 'Motif hypnotique',
  'Ice Knife': 'Couteau de glace',
  'Ice Storm': 'Tempête de glace',
  'Identify': 'Identification',
  'Illusory Dragon': 'Dragon illusoire',
  'Illusory Script': 'Écriture illusoire',
  'Immovable Object': 'Objet immobile',
  'Imprisonment': 'Emprisonnement',
  'Incendiary Cloud': 'Nuage incendiaire',
  'Inflict Wounds': 'Blessure',
  'Insect Plague': 'Plague d\'insectes',
  'Invisibility': 'Invisibilité',
  'Investiture of Flame': 'Investiture de la flamme',
  'Investiture of Ice': 'Investiture de la glace',
  'Investiture of Stone': 'Investiture de la pierre',
  'Investiture of Wind': 'Investiture du vent',
  'Invulnerability': 'Invulnérabilité',
  'Jump': 'Saut',
  'Knock': 'Heurtoir',
  'Legend Lore': 'Légende',
  'Leomund\'s Secret Chest': 'Coffre secret de Léomund',
  'Leomund\'s Tiny Hut': 'Petite hutte de Léomund',
  'Lesser Restoration': 'Restauration inférieure',
  'Levitate': 'Lévitation',
  'Light': 'Lumière',
  'Lightning Arrow': 'Flèche de foudre',
  'Lightning Bolt': 'Trait de foudre',
  'Locate Animals or Plants': 'Localisation d\'animaux ou de plantes',
  'Locate Creature': 'Localisation de créature',
  'Locate Object': 'Localisation d\'objet',
  'Longstrider': 'Amplitude',
  'Maddening Darkness': 'Ténèbres démentes',
  'Maelstrom': 'Maelström',
  'Mage Armor': 'Armure du mage',
  'Mage Hand': 'Main du mage',
  'Magic Circle': 'Cercle magique',
  'Magic Jar': 'Jarre magique',
  'Magic Missile': 'Projectile magique',
  'Magic Mouth': 'Bouche magique',
  'Magic Weapon': 'Arme magique',
  'Major Image': 'Image majeure',
  'Mass Cure Wounds': 'Soins de masse',
  'Mass Heal': 'Soins supérieurs de masse',
  'Mass Healing Word': 'Mot de guérison de masse',
  'Mass Suggestion': 'Suggestion de masse',
  'Maze': 'Labyrinthe',
  'Meld into Stone': 'Fusion dans la pierre',
  'Melf\'s Acid Arrow': 'Flèche acide de Melf',
  'Melf\'s Minute Meteors': 'Petites météores de Melf',
  'Mending': 'Réparation',
  'Message': 'Message',
  'Meteor Swarm': 'Pluie de météores',
  'Mind Blank': 'Esprit impénétrable',
  'Minor Illusion': 'Image mineure',
  'Mirage Arcane': 'Mirage arcanique',
  'Mirror Image': 'Image miroir',
  'Mislead': 'Fausse apparence',
  'Misty Step': 'Pas brumeux',
  'Modify Memory': 'Modification de mémoire',
  'Moonbeam': 'Rayon lunaire',
  'Mordenkainen\'s Faithful Hound': 'Chien fidèle de Mordenkainen',
  'Mordenkainen\'s Magnificent Mansion': 'Magnifique manoir de Mordenkainen',
  'Mordenkainen\'s Private Sanctum': 'Sanctuaire privé de Mordenkainen',
  'Mordenkainen\'s Sword': 'Épée de Mordenkainen',
  'Move Earth': 'Déplacement de la terre',
  'Nondetection': 'Non-détection',
  'Nystul\'s Magic Aura': 'Aura magique de Nystul',
  'Otiluke\'s Freezing Sphere': 'Sphère de glace d\'Otiluke',
  'Otiluke\'s Resilient Sphere': 'Sphère résiliente d\'Otiluke',
  'Otto\'s Irresistible Dance': 'Danse irrésistible d\'Otto',
  'Pass without Trace': 'Passage sans trace',
  'Passwall': 'Passe-muraille',
  'Phantasmal Force': 'Force fantasmagorique',
  'Phantasmal Killer': 'Tueur fantasmagorique',
  'Phantom Steed': 'Monture fantôme',
  'Planar Ally': 'Allié planaire',
  'Planar Binding': 'Lien planaire',
  'Plane Shift': 'Changement de plan',
  'Plant Growth': 'Croissance végétale',
  'Poison Spray': 'Vapeur toxique',
  'Polymorph': 'Métamorphose',
  'Power Word Heal': 'Mot de pouvoir : Guérison',
  'Power Word Kill': 'Mot de pouvoir : Mort',
  'Power Word Pain': 'Mot de pouvoir : Douleur',
  'Power Word Stun': 'Mot de pouvoir : Stupeur',
  'Prayer of Healing': 'Prière de guérison',
  'Prestidigitation': 'Prestidigitation',
  'Prismatic Spray': 'Rayon prismatique',
  'Prismatic Wall': 'Mur prismatique',
  'Produce Flame': 'Flamme sacrée',
  'Programmed Illusion': 'Illusion programmée',
  'Project Image': 'Projection d\'image',
  'Protection from Energy': 'Protection contre l\'énergie',
  'Protection from Evil and Good': 'Protection contre le mal et le bien',
  'Protection from Poison': 'Protection contre le poison',
  'Psychic Scream': 'Cri psychique',
  'Purify Food and Drink': 'Purification de la nourriture et de l\'eau',
  'Pyrotechnics': 'Pyrotechnie',
  'Raise Dead': 'Rappel à la vie',
  'Rary\'s Telepathic Bond': 'Lien télépathique de Rary',
  'Ray of Enfeeblement': 'Rayon d\'affaiblissement',
  'Ray of Frost': 'Rayon de givre',
  'Ray of Sickness': 'Rayon de maladie',
  'Regenerate': 'Régénération',
  'Reincarnate': 'Réincarnation',
  'Remove Curse': 'Suppression de la malédiction',
  'Resistance': 'Résistance',
  'Resurrection': 'Résurrection',
  'Reverse Gravity': 'Inversion de la gravité',
  'Revivify': 'Réanimation',
  'Rope Trick': 'Truc du cordage',
  'Sacred Flame': 'Flamme sacrée',
  'Sanctuary': 'Sanctuaire',
  'Scatter': 'Dispersion',
  'Scorching Ray': 'Rayon brûlant',
  'Scrying': 'Scrutation',
  'Searing Smite': 'Châtiment brûlant',
  'See Invisibility': 'Vision de l\'invisible',
  'Seeming': 'Semblance',
  'Sending': 'Transmission de message',
  'Sequester': 'Séquestration',
  'Shapechange': 'Changement de forme',
  'Shatter': 'Fracassement',
  'Shield': 'Bouclier',
  'Shield of Faith': 'Bouclier de la foi',
  'Shillelagh': 'Shillelagh',
  'Shocking Grasp': 'Poigne électrique',
  'Silence': 'Silence',
  'Silent Image': 'Image silencieuse',
  'Simulacrum': 'Simulacre',
  'Skill Empowerment': 'Renforcement de compétence',
  'Sleep': 'Sommeil',
  'Sleet Storm': 'Tempête de grêle',
  'Slow': 'Lenteur',
  'Soul Cage': 'Cage à âme',
  'Spare the Dying': 'Préservation des mourants',
  'Speak with Animals': 'Communication avec les animaux',
  'Speak with Dead': 'Communication avec les morts',
  'Speak with Plants': 'Communication avec les plantes',
  'Spider Climb': 'Escalade araignée',
  'Spike Growth': 'Croissance de ronces',
  'Spirit Guardians': 'Gardiens spirituels',
  'Spiritual Weapon': 'Arme spirituelle',
  'Staggering Smite': 'Châtiment assommant',
  'Stinking Cloud': 'Nuage puant',
  'Stone Shape': 'Façonnage de la pierre',
  'Stoneskin': 'Peau de pierre',
  'Storm of Vengeance': 'Tempête de vengeance',
  'Suggestion': 'Suggestion',
  'Sunbeam': 'Rayon de soleil',
  'Sunburst': 'Explosion solaire',
  'Swift Quiver': 'Carquois rapide',
  'Sword Burst': 'Éclatement d\'épées',
  'Symbol': 'Symbole',
  'Synaptic Static': 'Static synaptique',
  'Tasha\'s Hideous Laughter': 'Rire hideux de Tasha',
  'Telekinesis': 'Télékinésie',
  'Telepathy': 'Télépathie',
  'Teleport': 'Téléportation',
  'Teleportation Circle': 'Cercle de téléportation',
  'Teleportation': 'Téléportation',
  'Tenser\'s Floating Disk': 'Disque flottant de Tenser',
  'Tensers Transformation': 'Transformation de Tenser',
  'Thaumaturgy': 'Thaumaturgie',
  'Thorn Whip': 'Fouet de ronces',
  'Thunderous Smite': 'Châtiment tonitruant',
  'Thunderwave': 'Onde de tonnerre',
  'Tidal Wave': 'Raz-de-marée',
  'Time Stop': 'Arrêt du temps',
  'Tiny Hut': 'Petite hutte',
  'Toll the Dead': 'Sonner les morts',
  'Tongues': 'Langues',
  'Transmute Rock': 'Transmutation de la roche',
  'Transport via Plants': 'Transport par les plantes',
  'Trap the Soul': 'Piégeage d\'âme',
  'True Polymorph': 'Métamorphose véritable',
  'True Resurrection': 'Résurrection véritable',
  'True Seeing': 'Vision lucide',
  'True Strike': 'Frappe véritable',
  'Tsunami': 'Tsunami',
  'Unseen Servant': 'Serviteur invisible',
  'Vampiric Touch': 'Toucher vampirique',
  'Wall of Fire': 'Mur de feu',
  'Wall of Force': 'Mur de force',
  'Wall of Ice': 'Mur de glace',
  'Wall of Stone': 'Mur de pierre',
  'Wall of Thorns': 'Mur de ronces',
  'Warding Wind': 'Vent de protection',
  'Water Breathing': 'Respiration aquatique',
  'Water Walk': 'Marche sur l\'eau',
  'Watery Sphere': 'Sphère aqueuse',
  'Web': 'Toile',
  'Weird': 'Terreur',
  'Wind Walk': 'Marche dans le vent',
  'Wind Wall': 'Mur de vent',
  'Wish': 'Souhait',
  'Witch Bolt': 'Faisceau de sorcière',
  'Word of Recall': 'Mot de rappel',
  'Wrath of Nature': 'Courroux de la nature',
  'Wrathful Smite': 'Châtiment vengeur',
  'Zone of Truth': 'Zone de vérité',
}

function translateSpellName(nameEn) {
  return SPELL_TRANSLATIONS[nameEn] || nameEn
}

function parseSpellElement(xml) {
  const nameMatch = xml.match(/name="([^"]+)"/)
  const idMatch = xml.match(/id="([^"]+)"/)
  const sourceMatch = xml.match(/source="([^"]+)"/)
  
  if (!nameMatch || !idMatch) return null
  
  const nameEn = nameMatch[1]
  const id = idMatch[1]
  const source = sourceMatch ? sourceMatch[1] : "Player's Handbook"
  
  const supportsMatch = xml.match(/<supports>([^<]+)<\/supports>/)
  const spellLists = supportsMatch 
    ? supportsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : []
  
  const mappedClasses = spellLists
    .map(cls => CLASS_MAP[cls])
    .filter(Boolean)
  
  const setters = {}
  const setterRegex = /<set name="([^"]+)">([^<]*)<\/set>/g
  let setterMatch
  while ((setterMatch = setterRegex.exec(xml)) !== null) {
    setters[setterMatch[1]] = setterMatch[2].trim()
  }
  
  const descriptionMatch = xml.match(/<description>([\s\S]*?)<\/description>/)
  const descriptionHTML = descriptionMatch ? descriptionMatch[1] : ''
  
  const description = parseDescription(descriptionHTML)
  
  const keywords = setters['keywords'] 
    ? setters['keywords'].split(',').map(k => k.trim()).filter(Boolean)
    : []
  
  return {
    id,
    name: translateSpellName(nameEn),
    nameEn,
    source,
    level: parseInt(setters['level'] || '0'),
    school: SCHOOL_MAP[setters['school'] || ''] || 'evocation',
    castingTime: parseCastingTime(setters['time'] || '1 action'),
    range: parseRange(setters['range'] || 'Self', setters),
    components: {
      verbal: setters['hasVerbalComponent'] === 'true',
      somatic: setters['hasSomaticComponent'] === 'true',
      material: setters['hasMaterialComponent'] === 'true' ? {
        text: setters['materialComponent'] || '',
      } : undefined,
    },
    duration: parseDuration(
      setters['duration'] || 'Instantaneous',
      setters['isConcentration'] === 'true'
    ),
    description,
    spellLists: mappedClasses,
    keywords,
  }
}

function parseDescription(html) {
  const higherMatch = html.match(/<b><i>At Higher Levels\.<\/i><\/b>([^]+?)(?:<\/p>|$)/)
  const higherLevels = higherMatch ? cleanHTML(higherMatch[1]) : undefined
  
  const full = cleanHTML(html)
  const short = full.split('.')[0] + '.'
  
  return { short, full, higherLevels }
}

function cleanHTML(html) {
  return html
    .replace(/<p[^>]*>/g, '\n')
    .replace(/<\/p>/g, '')
    .replace(/<ul>/g, '')
    .replace(/<\/ul>/g, '')
    .replace(/<li>/g, '• ')
    .replace(/<\/li>/g, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim()
}

function parseCastingTime(time) {
  if (time.toLowerCase().includes('bonus')) {
    return { type: 'bonus' }
  }
  if (time.toLowerCase().includes('reaction')) {
    return { type: 'reaction', condition: time.replace('reaction', '').trim() }
  }
  if (time.toLowerCase().includes('minute')) {
    const minutes = parseInt(time)
    return { type: 'minute', value: isNaN(minutes) ? 1 : minutes }
  }
  if (time.toLowerCase().includes('hour')) {
    const hours = parseInt(time)
    return { type: 'hour', value: isNaN(hours) ? 1 : hours }
  }
  return { type: 'action' }
}

function parseRange(range, setters) {
  const rangeLower = range.toLowerCase()
  
  if (rangeLower.includes('self')) {
    const areaMatch = range.match(/(\d+)-foot[- ](\w+)/)
    if (areaMatch) {
      return {
        type: 'self',
        area: {
          shape: areaMatch[2],
          size: parseInt(areaMatch[1]),
        }
      }
    }
    return { type: 'self' }
  }
  
  if (rangeLower.includes('touch')) {
    return { type: 'touch' }
  }
  
  if (rangeLower.includes('unlimited') || rangeLower.includes('sight') || rangeLower.includes('plane')) {
    return { type: 'unlimited' }
  }
  
  const distanceMatch = range.match(/(\d+)\s*(feet|foot|mile|miles)/)
  if (distanceMatch) {
    return {
      type: 'ranged',
      distance: parseInt(distanceMatch[1]),
      unit: distanceMatch[2].startsWith('mile') ? 'miles' : 'feet',
    }
  }
  
  return { type: 'ranged' }
}

function parseDuration(duration, concentration) {
  if (duration.toLowerCase().includes('instant')) {
    return { type: 'instant' }
  }
  
  if (duration.toLowerCase().includes('permanent') || duration.toLowerCase().includes('until dispelled')) {
    return { type: 'permanent' }
  }
  
  if (duration.toLowerCase().includes('special')) {
    return { type: 'special' }
  }
  
  return {
    type: 'timed',
    concentration,
    time: duration.replace('Concentration,', '').replace('up to', '').trim(),
  }
}

function parseSpells(xmlContent) {
  const spells = []
  const elementRegex = /<element[^>]*type="Spell"[^>]*>([\s\S]*?)<\/element>/g
  
  let match
  while ((match = elementRegex.exec(xmlContent)) !== null) {
    const elementXML = match[0]
    
    try {
      const spell = parseSpellElement(elementXML)
      if (spell) {
        spells.push(spell)
      }
    } catch (error) {
      console.warn('⚠️ Erreur parsing sort :', error)
    }
  }
  
  return spells
}

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

async function importAuroraData() {
  console.log('🚀 Importation des données Aurora Builder\n')
  
  ensureDirectory(OUTPUT_DIR)
  
  try {
    // 1. Importer les sorts
    console.log('✨ Importation des sorts...')
    const spellsXML = await fetchXML(FILES_TO_DOWNLOAD.spells)
    const spells = parseSpells(spellsXML)
    
    writeFileSync(
      join(OUTPUT_DIR, 'spells.json'),
      JSON.stringify(spells, null, 2)
    )
    
    console.log(`   ✅ ${spells.length} sorts importés`)
    console.log(`   📁 Fichier : public/data/aurora/spells.json\n`)
    
    // 2. Importer les autres fichiers (TODO: parsers complets)
    console.log('📋 Autres fichiers :')
    console.log('   ⏳ Races (parsers à compléter)')
    console.log('   ⏳ Classes (parsers à compléter)')
    console.log('   ⏳ Équipement (parsers à compléter)')
    console.log('   ⏳ Dons (parsers à compléter)\n')
    
    console.log('✅ Importation partielle terminée !')
    console.log('\n📊 Résumé :')
    console.log(`   • ${spells.length} sorts`)
    console.log(`   • 0 races (TODO)`)
    console.log(`   • 0 classes (TODO)`)
    console.log(`   • 0 objets (TODO)`)
    
    // Afficher quelques exemples de sorts
    console.log('\n🎲 Exemples de sorts importés :')
    spells.slice(0, 5).forEach(spell => {
      console.log(`   • ${spell.name} (${spell.nameEn}) - Niv. ${spell.level}`)
    })
    
    return {
      success: true,
      spells,
      outputDir: OUTPUT_DIR,
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'importation :', error)
    throw error
  }
}

// Exécution
importAuroraData()
