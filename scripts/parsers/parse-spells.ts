/**
 * Parser des sorts Aurora XML → JSON
 * 
 * Convertit le format XML d'Aurora en SpellV2 pour Besace
 */

interface SpellV2 {
  id: string
  name: string
  nameEn: string
  source: string
  
  // Mécaniques
  level: number
  school: string
  castingTime: {
    type: 'action' | 'bonus' | 'reaction' | 'minute' | 'hour'
    value?: number
    condition?: string
  }
  range: {
    type: 'self' | 'touch' | 'ranged' | 'unlimited'
    distance?: number
    unit?: 'feet' | 'miles'
    area?: {
      shape: 'sphere' | 'cone' | 'line' | 'cube' | 'cylinder'
      size: number
    }
  }
  components: {
    verbal: boolean
    somatic: boolean
    material?: {
      text: string
      consumed?: boolean
      cost?: number
    }
  }
  duration: {
    type: 'instant' | 'timed' | 'permanent' | 'special'
    concentration?: boolean
    time?: string
  }
  
  // Contenu
  description: {
    short: string
    full: string
    higherLevels?: string
  }
  
  // Listes de classes
  spellLists: string[]
  keywords: string[]
}

// Mapping des écoles de magie
const SCHOOL_MAP: Record<string, string> = {
  'Abjuration': 'abjuration',
  'Conjuration': 'conjuration',
  'Divination': 'divination',
  'Enchantment': 'enchantment',
  'Evocation': 'evocation',
  'Illusion': 'illusion',
  'Necromancy': 'necromancy',
  'Transmutation': 'transmutation',
}

// Mapping des classes vers IDs Besace
const CLASS_MAP: Record<string, string> = {
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

/**
 * Parse le XML des sorts Aurora
 */
export function parseSpells(xmlContent: string): SpellV2[] {
  const spells: SpellV2[] = []
  
  // Regex pour extraire les éléments <element> de type Spell
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

/**
 * Parse un élément de sort individuel
 */
function parseSpellElement(xml: string): SpellV2 | null {
  // Extraire les attributs
  const nameMatch = xml.match(/name="([^"]+)"/)
  const idMatch = xml.match(/id="([^"]+)"/)
  const sourceMatch = xml.match(/source="([^"]+)"/)
  
  if (!nameMatch || !idMatch) return null
  
  const nameEn = nameMatch[1]
  const id = idMatch[1]
  const source = sourceMatch ? sourceMatch[1] : 'Player\'s Handbook'
  
  // Extraire les supports (classes)
  const supportsMatch = xml.match(/<supports>([^<]+)<\/supports>/)
  const spellLists = supportsMatch 
    ? supportsMatch[1].split(',').map(s => s.trim()).filter(Boolean)
    : []
  
  // Mapper les classes vers IDs Besace
  const mappedClasses = spellLists
    .map(cls => CLASS_MAP[cls])
    .filter(Boolean)
  
  // Extraire le setters (propriétés)
  const setters: Record<string, string> = {}
  const setterRegex = /<set name="([^"]+)">([^<]*)<\/set>/g
  let setterMatch
  while ((setterMatch = setterRegex.exec(xml)) !== null) {
    setters[setterMatch[1]] = setterMatch[2].trim()
  }
  
  // Extraire la description
  const descriptionMatch = xml.match(/<description>([\s\S]*?)<\/description>/)
  const descriptionHTML = descriptionMatch ? descriptionMatch[1] : ''
  
  // Parser la description
  const description = parseDescription(descriptionHTML)
  
  // Extraire les keywords
  const keywords = setters['keywords'] 
    ? setters['keywords'].split(',').map(k => k.trim()).filter(Boolean)
    : []
  
  return {
    id,
    name: translateSpellName(nameEn), // Traduction française
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

/**
 * Parse la description HTML
 */
function parseDescription(html: string): { short: string; full: string; higherLevels?: string } {
  // Extraire la section "At Higher Levels"
  const higherMatch = html.match(/<b><i>At Higher Levels\.<\/i><\/b>([^]+?)(?:<\/p>|$)/)
  const higherLevels = higherMatch ? cleanHTML(higherMatch[1]) : undefined
  
  // Nettoyer le HTML pour obtenir le texte
  const full = cleanHTML(html)
  
  // Générer un résumé (premier paragraphe)
  const short = full.split('.')[0] + '.'
  
  return { short, full, higherLevels }
}

/**
 * Nettoie le HTML pour obtenir du texte lisible
 */
function cleanHTML(html: string): string {
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

/**
 * Parse le temps d'incantation
 */
function parseCastingTime(time: string): SpellV2['castingTime'] {
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

/**
 * Parse la portée
 */
function parseRange(range: string, setters: Record<string, string>): SpellV2['range'] {
  const rangeLower = range.toLowerCase()
  
  if (rangeLower.includes('self')) {
    // Vérifier si c'est une zone d'effet
    const areaMatch = range.match(/(\d+)-foot[- ](\w+)/)
    if (areaMatch) {
      return {
        type: 'self',
        area: {
          shape: areaMatch[2] as any,
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
  
  // Extraire la distance numérique
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

/**
 * Parse la durée
 */
function parseDuration(duration: string, concentration: boolean): SpellV2['duration'] {
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

/**
 * Traduit le nom du sort en français
 * TODO : Utiliser un vrai dictionnaire de traduction
 */
function translateSpellName(nameEn: string): string {
  // Dictionnaire minimal pour les sorts courants
  const translations: Record<string, string> = {
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
  
  return translations[nameEn] || nameEn
}

export { parseSpells }
export type { SpellV2 }
