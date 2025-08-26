// Parser pour extraire les données des créatures depuis les pages AideDD
// Utilise un proxy CORS pour récupérer le HTML et extraire les informations

export interface CreatureStats {
  name: string;
  ac: number | null;
  hp: number | null;
  hpFormula: string | null;
  speed: string | null;
  cr: string | null;
  xp: number | null;
  abilities: {
    str: number | null;
    dex: number | null;
    con: number | null;
    int: number | null;
    wis: number | null;
    cha: number | null;
  };
  type: string | null;
  size: string | null;
  alignment: string | null;
}

// Fonction pour récupérer les données d'une créature depuis AideDD
export const fetchCreatureStats = async (creatureName: string, aideddUrl: string): Promise<CreatureStats | null> => {
  try {
    console.log(`Récupération des stats pour ${creatureName} depuis ${aideddUrl}`);
    
    // Utiliser AllOrigins comme proxy CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(aideddUrl)}`;
    
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const data = await response.json();
    const htmlContent = data.contents;
    
    if (!htmlContent) {
      throw new Error('Contenu HTML vide');
    }
    
    return parseCreatureHTML(creatureName, htmlContent);
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats pour ${creatureName}:`, error);
    return null;
  }
};

// Parser le HTML d'AideDD pour extraire les statistiques
const parseCreatureHTML = (creatureName: string, html: string): CreatureStats => {
  // Créer un parser DOM temporaire
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  const stats: CreatureStats = {
    name: creatureName,
    ac: null,
    hp: null,
    hpFormula: null,
    speed: null,
    cr: null,
    xp: null,
    abilities: {
      str: null,
      dex: null,
      con: null,
      int: null,
      wis: null,
      cha: null
    },
    type: null,
    size: null,
    alignment: null
  };
  
  try {
    // Extraire la CA (Classe d'armure)
    const acMatch = html.match(/<strong>Classe d'armure<\/strong>\s*(\d+)/i);
    if (acMatch) {
      stats.ac = parseInt(acMatch[1]);
    }
    
    // Extraire les PV (Points de vie) avec formule
    const hpMatch = html.match(/<strong>Points de vie<\/strong>\s*(\d+)\s*\(([^)]+)\)/i);
    if (hpMatch) {
      stats.hp = parseInt(hpMatch[1]);
      stats.hpFormula = hpMatch[2];
    } else {
      // Essayer sans formule
      const hpSimpleMatch = html.match(/<strong>Points de vie<\/strong>\s*(\d+)/i);
      if (hpSimpleMatch) {
        stats.hp = parseInt(hpSimpleMatch[1]);
      }
    }
    
    // Extraire la vitesse
    const speedMatch = html.match(/<strong>Vitesse<\/strong>\s*([^<]+)/i);
    if (speedMatch) {
      stats.speed = speedMatch[1].trim();
    }
    
    // Extraire le CR (Challenge Rating)
    const crMatch = html.match(/<strong>Puissance<\/strong>\s*([^<(]+)/i);
    if (crMatch) {
      stats.cr = crMatch[1].trim();
    }
    
    // Extraire l'XP
    const xpMatch = html.match(/\((\d+)\s*PX\)/i);
    if (xpMatch) {
      stats.xp = parseInt(xpMatch[1]);
    }
    
    // Extraire le type et la taille
    const typeMatch = html.match(/<div class='type'>([^<]+)<\/div>/i);
    if (typeMatch) {
      const typeText = typeMatch[1];
      // Format: "Bête de taille G, neutre bon"
      const sizeTypeMatch = typeText.match(/(\w+)\s+de taille\s+([A-Z]+),?\s*(.+)?/i);
      if (sizeTypeMatch) {
        stats.type = sizeTypeMatch[1];
        stats.size = sizeTypeMatch[2];
        stats.alignment = sizeTypeMatch[3]?.trim() || null;
      } else {
        // Format alternatif
        stats.type = typeText.split(',')[0]?.trim() || null;
        stats.alignment = typeText.split(',')[1]?.trim() || null;
      }
    }
    
    // Extraire les capacités (FOR, DEX, CON, INT, SAG, CHA)
    const abilities = ['FOR', 'DEX', 'CON', 'INT', 'SAG', 'CHA'];
    const abilityKeys: (keyof typeof stats.abilities)[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
    
    abilities.forEach((ability, index) => {
      const regex = new RegExp(`<strong>${ability}</strong><br>(\\d+)\\s*\\([^)]+\\)`, 'i');
      const match = html.match(regex);
      if (match) {
        stats.abilities[abilityKeys[index]] = parseInt(match[1]);
      }
    });
    
  } catch (error) {
    console.error('Erreur lors du parsing HTML:', error);
  }
  
  return stats;
};

// Fonction utilitaire pour calculer le modificateur d'une capacité
export const getAbilityModifier = (score: number | null): number => {
  if (score === null) return 0;
  return Math.floor((score - 10) / 2);
};

// Fonction pour formater les statistiques pour l'affichage
export const formatCreatureStats = (stats: CreatureStats): string => {
  const parts: string[] = [];
  
  if (stats.ac !== null) {
    parts.push(`CA ${stats.ac}`);
  }
  
  if (stats.hp !== null) {
    if (stats.hpFormula) {
      parts.push(`PV ${stats.hp} (${stats.hpFormula})`);
    } else {
      parts.push(`PV ${stats.hp}`);
    }
  }
  
  if (stats.speed) {
    parts.push(`Vitesse ${stats.speed}`);
  }
  
  if (stats.cr) {
    parts.push(`CR ${stats.cr}`);
  }
  
  return parts.join(' • ');
};

// Cache pour éviter les requêtes répétées
const statsCache = new Map<string, CreatureStats>();

// Fonction avec cache pour récupérer les stats
export const getCachedCreatureStats = async (creatureName: string, aideddUrl: string): Promise<CreatureStats | null> => {
  const cacheKey = `${creatureName}-${aideddUrl}`;
  
  // Vérifier le cache d'abord
  if (statsCache.has(cacheKey)) {
    return statsCache.get(cacheKey) || null;
  }
  
  // Récupérer depuis AideDD
  const stats = await fetchCreatureStats(creatureName, aideddUrl);
  
  // Mettre en cache si succès
  if (stats) {
    statsCache.set(cacheKey, stats);
  }
  
  return stats;
}; 