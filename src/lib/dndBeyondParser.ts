import { Player } from './types';

// Interface pour les données brutes extraites de D&D Beyond
export interface DnDBeyondCharacterData {
  name: string;
  level: number;
  class: string;
  race: string;
  background?: string;
  ac: number;
  hp: number;
  maxHp: number;
  speed: number;
  proficiencyBonus: number;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  savingThrows: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: Record<string, number>;
  spellcastingAbility?: string;
  spellSlots?: Record<string, number>;
  features: string[];
  equipment: string[];
}

// Correspondance des classes D&D Beyond vers français
const CLASS_MAPPING: Record<string, string> = {
  'Artificer': 'Artificier',
  'Barbarian': 'Barbare',
  'Bard': 'Barde',
  'Cleric': 'Clerc',
  'Druid': 'Druide',
  'Fighter': 'Guerrier',
  'Monk': 'Moine',
  'Paladin': 'Paladin',
  'Ranger': 'Rôdeur',
  'Rogue': 'Roublard',
  'Sorcerer': 'Ensorceleur',
  'Warlock': 'Occultiste',
  'Wizard': 'Magicien'
};

// Correspondance des races D&D Beyond vers français
const RACE_MAPPING: Record<string, string> = {
  'Dragonborn': 'Drakéide',
  'Dwarf': 'Nain',
  'Elf': 'Elfe',
  'Gnome': 'Gnome',
  'Half-Elf': 'Demi-Elfe',
  'Half-Orc': 'Demi-Orc',
  'Halfling': 'Halfelin',
  'Human': 'Humain',
  'Tiefling': 'Tieffelin',
  'Aasimar': 'Aasimar',
  'Genasi': 'Génasi',
  'Goliath': 'Goliath',
  'Tabaxi': 'Tabaxi',
  'Firbolg': 'Firbolg',
  'Kenku': 'Kenku',
  'Lizardfolk': 'Homme-Lézard',
  'Triton': 'Triton',
  'Bugbear': 'Gobelours',
  'Goblin': 'Gobelin',
  'Hobgoblin': 'Hobgobelin',
  'Kobold': 'Kobold',
  'Orc': 'Orc',
  'Yuan-Ti': 'Yuan-Ti'
};

// Fonction pour extraire l'ID du personnage depuis l'URL
export const extractCharacterIdFromUrl = (url: string): string | null => {
  const patterns = [
    /characters\/(\d+)/,
    /character\/(\d+)/,
    /\/(\d+)$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Fonction pour valider une URL D&D Beyond
export const isValidDnDBeyondUrl = (url: string): boolean => {
  const patterns = [
    /^https?:\/\/(www\.)?dndbeyond\.com\/characters?\/\d+/,
    /^https?:\/\/(www\.)?ddb\.ac\/characters?\/\d+/
  ];
  
  return patterns.some(pattern => pattern.test(url));
};

// Fonction principale pour parser une page D&D Beyond
export const parseDnDBeyondCharacter = async (url: string): Promise<Player> => {
  if (!isValidDnDBeyondUrl(url)) {
    throw new Error('URL D&D Beyond invalide');
  }

  try {
    // Essayer d'abord AllOrigins (service public gratuit)
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    return parseCharacterFromHtml(data.contents);
  } catch (error) {
    console.error('Erreur lors du parsing D&D Beyond:', error);
    // Si l'import automatique échoue, ouvrir la page pour copie manuelle
    window.open(url, '_blank');
    throw new Error('Import automatique impossible. La page D&D Beyond s\'est ouverte pour copie manuelle des informations.');
  }
};

// Parser le HTML de la page D&D Beyond
const parseCharacterFromHtml = (html: string): Player => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  try {
    // Extraire les données JSON embarquées
    const scriptTags = doc.querySelectorAll('script');
    let characterData: any = null;
    
    // Chercher les données dans les scripts
    for (const script of scriptTags) {
      const content = script.textContent || '';
      
      // Chercher le script contenant les données du personnage
      if (content.includes('window.__INITIAL_STATE__') || content.includes('characterData')) {
        try {
          // Extraire les données JSON
          const jsonMatch = content.match(/window\.__INITIAL_STATE__\s*=\s*({.+?});/) ||
                           content.match(/characterData\s*:\s*({.+?}),/) ||
                           content.match(/character\s*:\s*({.+?}),/);
          
          if (jsonMatch) {
            characterData = JSON.parse(jsonMatch[1]);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    // Si pas de données JSON, parser le HTML directement
    if (!characterData) {
      return parseCharacterFromDom(doc);
    }
    
    return parseCharacterFromJson(characterData);
  } catch (error) {
    console.error('Erreur parsing HTML:', error);
    // Fallback vers parsing DOM
    return parseCharacterFromDom(doc);
  }
};

// Parser depuis les données JSON extraites
const parseCharacterFromJson = (data: any): Player => {
  const character = data.character || data;
  
  return {
    id: `dndb-${character.id || Date.now()}`,
    name: character.name || 'Personnage sans nom',
    level: character.level || 1,
    characterClass: CLASS_MAPPING[character.class] || character.class || 'Guerrier',
    race: RACE_MAPPING[character.race] || character.race || '',
    background: character.background || '',
    ac: character.armorClass || 10,
    maxHp: character.hitPoints?.maximum || character.maxHp || 10,
    currentHp: character.hitPoints?.current || character.currentHp || character.hitPoints?.maximum || 10,
    speed: character.speed || 30,
    proficiencyBonus: character.proficiencyBonus || Math.ceil(character.level / 4) + 1,
    stats: {
      strength: character.stats?.strength || 10,
      dexterity: character.stats?.dexterity || 10,
      constitution: character.stats?.constitution || 10,
      intelligence: character.stats?.intelligence || 10,
      wisdom: character.stats?.wisdom || 10,
      charisma: character.stats?.charisma || 10
    },
    savingThrows: character.savingThrows || {},
    skills: character.skills || {},
    spellcastingAbility: character.spellcastingAbility,
    spellSlots: character.spellSlots || {},
    features: character.features || [],
    equipment: character.equipment || []
  };
};

// Parser depuis le DOM HTML
const parseCharacterFromDom = (doc: Document): Player => {
  // Fonction utilitaire pour extraire du texte
  const getText = (selector: string, defaultValue = ''): string => {
    const element = doc.querySelector(selector);
    return element?.textContent?.trim() || defaultValue;
  };
  
  // Fonction utilitaire pour extraire un nombre
  const getNumber = (selector: string, defaultValue = 0): number => {
    const text = getText(selector);
    const number = parseInt(text.replace(/\D/g, ''), 10);
    return isNaN(number) ? defaultValue : number;
  };
  
  // Extraire les informations de base
  const name = getText('.ddbc-character-tidbits__heading h1') || 
               getText('.character-name') || 
               getText('h1') || 
               'Personnage sans nom';
  
  const level = getNumber('.ddbc-character-progression-summary__level', 1);
  
  const classRace = getText('.ddbc-character-tidbits__classes') || '';
  const [characterClass, race] = classRace.split(' ');
  
  const ac = getNumber('[data-testid="armor-class-summary"] .ddbc-armor-class-box__value', 10);
  const maxHp = getNumber('[data-testid="hit-points-summary"] .ddbc-hit-points-summary__hp-item--max', 10);
  const currentHp = getNumber('[data-testid="hit-points-summary"] .ddbc-hit-points-summary__hp-item--current', maxHp);
  
  // Extraire les caractéristiques
  const stats = {
    strength: getNumber('[data-testid="ability-strength"] .ddbc-ability-summary__primary', 10),
    dexterity: getNumber('[data-testid="ability-dexterity"] .ddbc-ability-summary__primary', 10),
    constitution: getNumber('[data-testid="ability-constitution"] .ddbc-ability-summary__primary', 10),
    intelligence: getNumber('[data-testid="ability-intelligence"] .ddbc-ability-summary__primary', 10),
    wisdom: getNumber('[data-testid="ability-wisdom"] .ddbc-ability-summary__primary', 10),
    charisma: getNumber('[data-testid="ability-charisma"] .ddbc-ability-summary__primary', 10)
  };
  
  return {
    id: `dndb-${Date.now()}`,
    name,
    level,
    characterClass: CLASS_MAPPING[characterClass] || characterClass || 'Guerrier',
    race: RACE_MAPPING[race] || race || '',
    ac,
    maxHp,
    currentHp,
    speed: 30, // Valeur par défaut
    proficiencyBonus: Math.ceil(level / 4) + 1,
    stats,
    savingThrows: {},
    skills: {},
    features: [],
    equipment: []
  };
};

// Fonction pour tester la connexion à D&D Beyond
export const testDnDBeyondConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch('https://api.allorigins.win/get?url=https://www.dndbeyond.com');
    return response.ok;
  } catch {
    return false;
  }
};

// Fonction pour extraire un aperçu rapide depuis l'URL
export const getCharacterPreview = async (url: string): Promise<{
  name: string;
  level: number;
  class: string;
  race: string;
} | null> => {
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const response = await fetch(proxyUrl);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const parser = new DOMParser();
    const doc = parser.parseFromString(data.contents, 'text/html');
    
    const title = doc.querySelector('title')?.textContent || '';
    const match = title.match(/(.+?)\s*-\s*Level\s*(\d+)\s*(.+?)\s*(.+?)\s*-/);
    
    if (match) {
      return {
        name: match[1].trim(),
        level: parseInt(match[2]),
        class: match[3].trim(),
        race: match[4].trim()
      };
    }
    
    return null;
  } catch {
    return null;
  }
}; 