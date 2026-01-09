import { Monster, MonsterTrait, MonsterAction } from './types';

/**
 * Adapte les données d'un monstre pour les rendre complètes et cohérentes avec le format AideDD
 * @param monsterData Les données brutes du monstre
 * @returns Les données adaptées et normalisées
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function adaptMonsterDataFormat(monsterData: any): Monster | null {
  if (!monsterData) return null;

  // Créer une copie pour ne pas modifier l'original
  const adaptedMonster = { ...monsterData };

  // Extraire les données manquantes depuis le HTML si disponible
  if (adaptedMonster.fullHtml) {
    try {
      // Essayer d'extraire les données importantes qui pourraient manquer
      // Jets de sauvegarde
      if (!adaptedMonster.savingThrows) {
        const savingThrowsMatch = adaptedMonster.fullHtml.match(/<strong>Jets de sauvegarde<\/strong>([^<]+)<br>/);
        if (savingThrowsMatch && savingThrowsMatch[1]) {
          adaptedMonster.savingThrows = savingThrowsMatch[1].trim();
        }
      }

      // Compétences
      if (!adaptedMonster.skills) {
        const skillsMatch = adaptedMonster.fullHtml.match(/<strong>Compétences<\/strong>([^<]+)<br>/);
        if (skillsMatch && skillsMatch[1]) {
          adaptedMonster.skills = skillsMatch[1].trim();
        }
      }

      // Résistances aux dégâts
      if (!adaptedMonster.damageResistances) {
        const resistancesMatch = adaptedMonster.fullHtml.match(/<strong>Résistances aux dégâts<\/strong>([^<]+)<br>/);
        if (resistancesMatch && resistancesMatch[1]) {
          adaptedMonster.damageResistances = resistancesMatch[1].trim();
        }
      }

      // Immunités aux dégâts
      if (!adaptedMonster.damageImmunities) {
        const immunitiesMatch = adaptedMonster.fullHtml.match(/<strong>Immunités aux dégâts<\/strong>([^<]+)<br>/);
        if (immunitiesMatch && immunitiesMatch[1]) {
          adaptedMonster.damageImmunities = immunitiesMatch[1].trim();
        }
      }

      // Immunités aux états
      if (!adaptedMonster.conditionImmunities) {
        const conditionsMatch = adaptedMonster.fullHtml.match(/<strong>Immunités aux états<\/strong>([^<]+)<br>/);
        if (conditionsMatch && conditionsMatch[1]) {
          adaptedMonster.conditionImmunities = conditionsMatch[1].trim();
        }
      }

      // Sens
      if (!adaptedMonster.senses) {
        const sensesMatch = adaptedMonster.fullHtml.match(/<strong>Sens<\/strong>([^<]+)<br>/);
        if (sensesMatch && sensesMatch[1]) {
          adaptedMonster.senses = sensesMatch[1].trim();
        }
      }

      // Langues
      if (!adaptedMonster.languages) {
        const languagesMatch = adaptedMonster.fullHtml.match(/<strong>Langues<\/strong>([^<]+)<br>/);
        if (languagesMatch && languagesMatch[1]) {
          adaptedMonster.languages = languagesMatch[1].trim();
        }
      }

      // Puissance et XP
      if (!adaptedMonster.cr || adaptedMonster.cr === 0) {
        const crMatch = adaptedMonster.fullHtml.match(/<strong>Puissance<\/strong>([^(]+)\(([^)]+)/);
        if (crMatch && crMatch[1] && crMatch[2]) {
          adaptedMonster.cr = crMatch[1].trim();
          adaptedMonster.xp = parseInt(crMatch[2].trim().replace(/[^\d]/g, ''), 10);
        }
      }

      // Traits et capacités
      if (!adaptedMonster.traits || adaptedMonster.traits.length === 0) {
        const traitsSection = adaptedMonster.fullHtml.match(/<\/div><div><svg>.*?<\/svg><\/div>(.*?)<div class='rub'>Actions<\/div>/s);
        if (traitsSection && traitsSection[1]) {
          const traitMatches = [...traitsSection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
          if (traitMatches.length > 0) {
            adaptedMonster.traits = traitMatches.map((match) => ({
              name: match[1],
              description: match[2]
            }));
          }
        }
      }

      // Actions
      if (!adaptedMonster.actions || adaptedMonster.actions.length === 0) {
        const actionsSection = adaptedMonster.fullHtml.match(/<div class='rub'>Actions<\/div>(.*?)(?=<\/div><\/div>|<div class='rub'>)/s);
        if (actionsSection && actionsSection[1]) {
          const actionMatches = [...actionsSection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
          if (actionMatches.length > 0) {
            adaptedMonster.actions = actionMatches.map((match) => ({
              name: match[1],
              description: match[2]
            }));
          }
        }
      }

      // Actions légendaires
      if (!adaptedMonster.legendaryActions || adaptedMonster.legendaryActions.length === 0) {
        const legendarySection = adaptedMonster.fullHtml.match(/<div class='rub'>Actions légendaires<\/div>(.*?)(?=<\/div><\/div>)/s);
        if (legendarySection && legendarySection[1]) {
          // Ignorer le premier paragraphe qui est l'introduction
          const legendaryMatches = [...legendarySection[1].matchAll(/<strong><em>([^<]+)<\/em><\/strong>\. (.*?)(?=<\/p>)/g)];
          if (legendaryMatches.length > 0) {
            adaptedMonster.legendaryActions = legendaryMatches.map((match) => ({
              name: match[1],
              description: match[2]
            }));
            adaptedMonster.legendary = true;
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'extraction des données depuis le HTML:", error);
    }
  }

  // Normaliser les caractéristiques principales
  adaptedMonster.name = adaptedMonster.name || "Monstre inconnu";
  adaptedMonster.cr = typeof adaptedMonster.cr === 'string' ? parseFloat(adaptedMonster.cr) : (adaptedMonster.cr || 0);
  adaptedMonster.xp = adaptedMonster.xp || calculateXPFromCR(adaptedMonster.cr);
  adaptedMonster.type = adaptedMonster.type || "Inconnu";
  adaptedMonster.size = adaptedMonster.size || "M";
  adaptedMonster.alignment = adaptedMonster.alignment || "non aligné";

  // Normaliser AC et HP
  if (typeof adaptedMonster.ac === 'string') {
    // Essayer d'extraire la valeur numérique (ex: "18 (armure naturelle)" -> 18)
    const acMatch = adaptedMonster.ac.match(/^(\d+)/);
    adaptedMonster.ac = acMatch ? parseInt(acMatch[1], 10) : 10;
    adaptedMonster.acDetails = adaptedMonster.ac;
  } else {
    adaptedMonster.ac = adaptedMonster.ac || 10;
  }

  if (typeof adaptedMonster.hp === 'string') {
    // Essayer d'extraire la valeur numérique (ex: "184 (16d12 + 80)" -> 184)
    const hpMatch = adaptedMonster.hp.match(/^(\d+)/);
    adaptedMonster.hp = hpMatch ? parseInt(hpMatch[1], 10) : 0;
    adaptedMonster.hpDetails = adaptedMonster.hp;
  } else {
    adaptedMonster.hp = adaptedMonster.hp || 0;
  }

  // Normaliser la vitesse
  if (typeof adaptedMonster.speed === 'string') {
    adaptedMonster.speedText = adaptedMonster.speed;
    adaptedMonster.speed = {
      walk: 30,
      fly: adaptedMonster.speed.includes('vol') ? 60 : 0,
      swim: adaptedMonster.speed.includes('nage') ? 30 : 0,
      climb: adaptedMonster.speed.includes('escalade') ? 20 : 0
    };
  } else if (Array.isArray(adaptedMonster.speed)) {
    adaptedMonster.speedText = adaptedMonster.speed.join(', ');
    adaptedMonster.speed = {
      walk: 30,
      fly: adaptedMonster.speed.some((s: string) => s.includes('vol')) ? 60 : 0,
      swim: adaptedMonster.speed.some((s: string) => s.includes('nage')) ? 30 : 0,
      climb: adaptedMonster.speed.some((s: string) => s.includes('escalade')) ? 20 : 0
    };
  } else if (!adaptedMonster.speed) {
    adaptedMonster.speed = { walk: 30 };
    adaptedMonster.speedText = "9 m";
  }

  // Normaliser les sens et les langues
  adaptedMonster.senses = adaptedMonster.senses || "";
  adaptedMonster.languages = adaptedMonster.languages || "";

  // Normaliser les actions et les traits
  adaptedMonster.traits = Array.isArray(adaptedMonster.traits) ? adaptedMonster.traits : [];
  adaptedMonster.actions = Array.isArray(adaptedMonster.actions) ? adaptedMonster.actions : [];
  adaptedMonster.legendaryActions = Array.isArray(adaptedMonster.legendaryActions) ? adaptedMonster.legendaryActions : [];

  // Normaliser l'environnement
  adaptedMonster.environment = Array.isArray(adaptedMonster.environment) ? adaptedMonster.environment : [];

  // Ajouter l'URL vers la fiche AideDD si elle n'existe pas
  if (!adaptedMonster.url) {
    const slug = adaptedMonster.id || adaptedMonster.name.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, '-');
    adaptedMonster.url = `https://www.aidedd.org/dnd/monstres.php?vf=${slug}`;
  }

  return adaptedMonster as Monster;
}

/**
 * Calcule l'XP en fonction du Challenge Rating (CR)
 */
function calculateXPFromCR(cr: number): number {
  const xpTable: Record<string, number> = {
    '0': 10,
    '0.125': 25,
    '0.25': 50,
    '0.5': 100,
    '1': 200,
    '2': 450,
    '3': 700,
    '4': 1100,
    '5': 1800,
    '6': 2300,
    '7': 2900,
    '8': 3900,
    '9': 5000,
    '10': 5900,
    '11': 7200,
    '12': 8400,
    '13': 10000,
    '14': 11500,
    '15': 13000,
    '16': 15000,
    '17': 18000,
    '18': 20000,
    '19': 22000,
    '20': 25000,
    '21': 33000,
    '22': 41000,
    '23': 50000,
    '24': 62000,
    '25': 75000,
    '26': 90000,
    '27': 105000,
    '28': 120000,
    '29': 135000,
    '30': 155000
  };

  const crStr = cr.toString();
  return xpTable[crStr] || 0;
}

/**
 * Obtient le dé de vie approprié pour la taille du monstre
 * @param size La taille du monstre
 * @returns La valeur du dé de vie
 */
function getHitDieForSize(size: string): number {
  switch (size) {
    case 'TP': return 4;
    case 'P': return 6;
    case 'M': return 8;
    case 'G': return 10;
    case 'TG': return 12;
    case 'Gig': return 20;
    default: return 8;
  }
}

/**
 * Formate un modificateur de caractéristique avec le signe approprié
 * @param modifier Le modificateur à formater
 * @returns Le modificateur formaté avec un signe
 */
function formatModifier(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Traduit le nom d'une compétence en français
 * @param skill Le nom de la compétence en anglais
 * @returns Le nom de la compétence en français
 */
function translateSkill(skill: string): string {
  const skillTranslation: Record<string, string> = {
    'acrobatics': 'Acrobaties',
    'animal handling': 'Dressage',
    'arcana': 'Arcanes',
    'athletics': 'Athlétisme',
    'deception': 'Tromperie',
    'history': 'Histoire',
    'insight': 'Perspicacité',
    'intimidation': 'Intimidation',
    'investigation': 'Investigation',
    'medicine': 'Médecine',
    'nature': 'Nature',
    'perception': 'Perception',
    'performance': 'Représentation',
    'persuasion': 'Persuasion',
    'religion': 'Religion',
    'sleight of hand': 'Escamotage',
    'stealth': 'Discrétion',
    'survival': 'Survie'
  };

  return skillTranslation[skill.toLowerCase()] || skill;
}

/**
 * Génère un slug pour l'URL AideDD à partir du nom du monstre
 * @param name Le nom du monstre
 * @returns Le slug pour l'URL
 */
function getAideDDMonsterSlug(name: string): string {
  return name.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
    .replace(/ /g, '-')              // Remplacer les espaces par des tirets
    .replace(/[^a-z0-9-]/g, '');     // Supprimer les caractères non alphanumériques
} 