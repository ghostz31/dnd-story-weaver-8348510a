import { Monster } from '../types';
import { v4 as uuid } from 'uuid';
import { generateUniqueId } from '../monsterUtils';
import { calculateXPFromCR } from './xpCalculator';
import { loadMonstersIndex } from './dbInit';
import { fetchMonsterFromAideDD } from './aideddClient';

// Local Storage Keys
export const MONSTERS_KEY = 'dnd_monsters_v2';

// Cache en mémoire pour les détails complets des monstres (lazy loading)
const monsterDetailsCache = new Map<string, any>();

// Fonction pour obtenir les détails complets d'un monstre (avec cache)
export async function getMonsterDetails(monsterId: string, monsterName: string): Promise<any> {
  // 1. Vérifier le cache
  const cacheKey = monsterId || monsterName.toLowerCase();
  if (monsterDetailsCache.has(cacheKey)) {
    console.log(`[Cache Hit] Détails de ${monsterName} récupérés depuis le cache`);
    return monsterDetailsCache.get(cacheKey);
  }

  console.log(`[Cache Miss] Chargement des détails pour ${monsterName}...`);

  // 2. Charger les détails complets
  try {
    const details = await fetchMonsterFromAideDD(monsterName);

    // 3. Mettre en cache
    if (details) {
      monsterDetailsCache.set(cacheKey, details);
      console.log(`[Cache] Détails de ${monsterName} mis en cache`);
    }

    return details;
  } catch (error) {
    console.error(`Erreur lors du chargement des détails pour ${monsterName}:`, error);
    return null;
  }
}

// Fonction pour vider le cache (utile pour les tests ou le rafraîchissement)
export function clearMonsterDetailsCache(): void {
  monsterDetailsCache.clear();
  console.log('[Cache] Cache des détails de monstres vidé');
}


// ====== Monsters ======

// Fonction pour récupérer tous les monstres (mise à jour pour utiliser l'index)
export function getMonsters(): Monster[] {
  try {
    // Vérifier d'abord s'il y a des monstres en localStorage
    const storedMonsters = localStorage.getItem(MONSTERS_KEY);
    if (storedMonsters) {
      const parsedMonsters = JSON.parse(storedMonsters);
      if (Array.isArray(parsedMonsters) && parsedMonsters.length > 0) {
        console.log(`${parsedMonsters.length} monstres récupérés depuis localStorage`);
        return parsedMonsters;
      }
    }

    // S'il n'y a pas de monstres en localStorage, retourner au moins les monstres par défaut
    return [
      {
        id: 'goblin',
        name: 'Gobelin',
        cr: 0.25,
        xp: 50,
        type: 'Humanoïde',
        size: 'P',
        source: 'MM',
        environment: ['forêt', 'collines', 'montagne', 'souterrain'],
        legendary: false,
        alignment: 'neutre mauvais',
        ac: 15,
        hp: 7
      },
      {
        id: 'kobold',
        name: 'Kobold',
        cr: 0.125,
        xp: 25,
        type: 'Humanoïde',
        size: 'P',
        source: 'MM',
        environment: ['forêt', 'montagne', 'souterrain'],
        legendary: false,
        alignment: 'loyal mauvais',
        ac: 12,
        hp: 5
      }
    ];
  } catch (error) {
    console.error("Erreur lors de la récupération des monstres:", error);
    return [];
  }
}

// Fonction pour récupérer tous les monstres de manière asynchrone en utilisant l'index
export async function getMonstersAsync(): Promise<Monster[]> {
  try {
    // Vérifier d'abord s'il y a des monstres en localStorage
    const storedMonsters = localStorage.getItem(MONSTERS_KEY);
    if (storedMonsters) {
      const parsedMonsters = JSON.parse(storedMonsters);
      if (Array.isArray(parsedMonsters) && parsedMonsters.length > 0) {
        console.log(`${parsedMonsters.length} monstres récupérés depuis localStorage`);
        return parsedMonsters;
      }
    }

    // Essayer de charger depuis l'index des fichiers individuels
    console.log("Tentative de chargement des monstres depuis l'index");
    const monstersIndex = await loadMonstersIndex();

    if (monstersIndex && monstersIndex.length > 0) {
      console.log(`${monstersIndex.length} monstres chargés depuis l'index`);

      // Transformer l'index au format Monster pour l'application
      const formattedMonsters = monstersIndex.map((monster: any) => ({
        id: monster.id,
        name: monster.name,
        originalName: monster.originalName,
        cr: parseFloat(monster.cr) || 0,
        xp: calculateXPFromCR(parseFloat(monster.cr) || 0),
        type: monster.type || 'Inconnu',
        size: monster.size || 'M',
        source: 'AideDD',
        environment: [],
        legendary: false,
        alignment: 'non-aligné',
        ac: 10,
        hp: 10,
        image: monster.image
      }));

      // Sauvegarder dans localStorage pour les prochaines visites
      localStorage.setItem(MONSTERS_KEY, JSON.stringify(formattedMonsters));
      return formattedMonsters;
    }

    // S'il n'y a pas de monstres dans l'index, essayer le fichier JSON complet
    const response = await fetch('/data/monsters-complete.json');
    if (response.ok) {
      const monstersData = await response.json();
      if (Array.isArray(monstersData) && monstersData.length > 0) {
        // Transformer les données au format attendu par l'application
        const monsters = monstersData.map((monster: any) => ({
          id: monster.id || generateUniqueId(),
          name: monster.name,
          cr: monster.cr,
          xp: monster.xp,
          type: monster.type,
          size: monster.size,
          source: monster.source || 'MM',
          environment: monster.environment || [],
          legendary: monster.legendary || false,
          alignment: monster.alignment || 'non-aligné',
          ac: monster.ac || 10,
          hp: monster.hp || 10
        }));

        // Sauvegarder dans localStorage pour les prochaines visites
        localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters));
        return monsters;
      }
    }

    // S'il n'y a pas de monstres, retourner au moins les monstres par défaut
    return [
      {
        id: 'goblin',
        name: 'Gobelin',
        cr: 0.25,
        xp: 50,
        type: 'Humanoïde',
        size: 'P',
        source: 'MM',
        environment: ['forêt', 'collines', 'montagne', 'souterrain'],
        legendary: false,
        alignment: 'neutre mauvais',
        ac: 15,
        hp: 7
      },
      {
        id: 'kobold',
        name: 'Kobold',
        cr: 0.125,
        xp: 25,
        type: 'Humanoïde',
        size: 'P',
        source: 'MM',
        environment: ['forêt', 'montagne', 'souterrain'],
        legendary: false,
        alignment: 'loyal mauvais',
        ac: 12,
        hp: 5
      }
    ];
  } catch (error) {
    console.error("Erreur lors de la récupération des monstres:", error);
    return [];
  }
}

// Initialiser les monstres au chargement de l'application
export const initializeMonsters = async (): Promise<void> => {
  const storedMonsters = localStorage.getItem(MONSTERS_KEY);
  if (!storedMonsters) {
    try {
      const monsters = await getDefaultMonsters();
      if (monsters && monsters.length > 0) {
        localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters));
        console.log('Monstres chargés avec succès:', monsters.length);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation des monstres:', error);
    }
  }
};

// Charger des monstres à partir du fichier JSON
export const getDefaultMonsters = async (): Promise<Monster[]> => {
  try {
    // Utiliser le nouveau fichier avec la liste des monstres
    const response = await fetch('/data/aidedd-monsters-all.json');
    if (!response.ok) {
      console.warn(`Erreur lors du chargement du fichier de monstres (status: ${response.status})`);
      // Utiliser le fallback synchrone en cas d'échec
      return getDefaultMonstersSync();
    }

    const monsters = await response.json();
    console.log(`Monstres chargés avec succès: ${monsters.length} monstres`);

    // Transformer les données pour correspondre au format attendu
    return monsters.map((monster: any) => ({
      id: uuid(),
      name: monster.name,
      cr: typeof monster.cr === 'string' ? parseFloat(monster.cr) : monster.cr,
      challengeRating: typeof monster.cr === 'string' ? parseFloat(monster.cr) : monster.cr,
      xp: monster.xp || calculateXPFromCR(typeof monster.cr === 'string' ? parseFloat(monster.cr) : monster.cr),
      type: monster.type,
      size: monster.size,
      alignment: monster.alignment || 'non aligné',
      environment: Array.isArray(monster.environment) ? monster.environment : [],
      source: monster.source || 'MM',
      ac: typeof monster.ac === 'string' ? parseInt(monster.ac, 10) : monster.ac || 10,
      hp: typeof monster.hp === 'string' ? parseInt(monster.hp, 10) : monster.hp || 0,
      speed: monster.speed ?
        (Array.isArray(monster.speed) ? {
          walk: 30,
          fly: monster.speed.some((s: string) => s.includes('vol')) ? 60 : 0,
          swim: monster.speed.some((s: string) => s.includes('nage')) ? 30 : 0,
          climb: monster.speed.some((s: string) => s.includes('escalade')) ? 20 : 0
        } : { walk: 30 }) : { walk: 30 },
      str: monster.str || 10,
      dex: monster.dex || 10,
      con: monster.con || 10,
      int: monster.int || 10,
      wis: monster.wis || 10,
      cha: monster.cha || 10,
      legendary: monster.legendary || false
    }));
  } catch (error) {
    console.error('Erreur lors du chargement des monstres:', error);
    // Retourner le tableau par défaut en cas d'échec
    return getDefaultMonstersSync();
  }
};

// Version synchrone (fallback)
export const getDefaultMonstersSync = (): Monster[] => {
  return [
    {
      id: uuid(),
      name: 'Gobelin',
      cr: 0.25,
      xp: 50,
      type: 'humanoïde',
      size: 'P',
      alignment: 'neutre mauvais',
      environment: ['forêt', 'montagne', 'souterrain'],
      source: 'MM',
      ac: 15,
      hp: 7,
      speed: { walk: 30 },
      str: 8,
      dex: 14,
      con: 10,
      int: 10,
      wis: 8,
      cha: 8
    },
    {
      id: uuid(),
      name: 'Loup',
      cr: 0.25,
      xp: 50,
      type: 'bête',
      size: 'M',
      alignment: 'non-aligné',
      environment: ['forêt', 'plaine'],
      source: 'MM',
      ac: 13,
      hp: 11,
      speed: { walk: 40 },
      str: 12,
      dex: 15,
      con: 12,
      int: 3,
      wis: 12,
      cha: 6
    }
  ];
};

// Rechercher des monstres avec filtre
export const searchMonsters = (query: string, filters: Record<string, any> = {}): Monster[] => {
  const monsters = getMonsters();

  return monsters.filter(monster => {
    // Recherche par nom
    if (query && !monster.name.toLowerCase().includes(query.toLowerCase())) {
      return false;
    }

    // Filtre par CR
    if (filters.crMin !== undefined && monster.cr < filters.crMin) {
      return false;
    }

    if (filters.crMax !== undefined && monster.cr > filters.crMax) {
      return false;
    }

    // Filtre par type
    if (filters.type && filters.type !== 'all') {
      if (monster.type !== filters.type) {
        return false;
      }
    }

    // Filtre par taille
    if (filters.size && filters.size !== 'all') {
      if (monster.size !== filters.size) {
        return false;
      }
    }

    // Filtre par catégorie
    if (filters.category === 'animal') {
      // Seules les bêtes sont des animaux
      if (monster.type !== 'Bête') {
        return false;
      }
    } else if (filters.category === 'pnj') {
      // Seuls les humanoïdes sont des PNJ
      if (!monster.type.includes('Humanoïde')) {
        return false;
      }
    } else if (filters.category === 'monstre') {
      // Les monstres sont tout ce qui n'est pas spécifiquement des animaux ou des PNJ
      if (monster.type === 'Bête' || monster.type.includes('Humanoïde')) {
        // On garde certains humanoïdes qui sont des monstres comme les gobelins, kobolds, etc.
        // On pourrait affiner avec d'autres critères si nécessaire
        if (!monster.name.toLowerCase().includes('gobelin') &&
          !monster.name.toLowerCase().includes('kobold') &&
          !monster.name.toLowerCase().includes('yuan-ti')) {
          return false;
        }
      }
    }

    // Filtre par environnement
    if (filters.environment && filters.environment !== 'all') {
      if (!monster.environment || !monster.environment.includes(filters.environment)) {
        return false;
      }
    }

    return true;
  });
};

// Ajouter un monstre personnalisé
export const addCustomMonster = (monster: Omit<Monster, 'id'>): Monster => {
  const monsters = getMonsters();
  const newMonster = { ...monster, id: uuid() };

  monsters.push(newMonster);
  localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters));

  return newMonster;
};
