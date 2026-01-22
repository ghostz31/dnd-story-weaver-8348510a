import { Monster, Player, Party, Encounter, EncounterMonster, getEncounterMultiplier, xpThresholds } from './types';
import { v4 as uuid } from 'uuid';
import { createMonsterDataIframe } from '../createMonsterDataIframe';

// Local Storage Keys
const MONSTERS_KEY = 'dnd_monsters';
const PARTIES_KEY = 'dnd_parties';
const ENCOUNTERS_KEY = 'dnd_encounters';

// API AideDD ou DnD 5e API
const API_URL = 'https://www.dnd5eapi.co/api';

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

// Récupérer les monstres depuis l'API
export const fetchMonstersFromAPI = async (): Promise<Monster[]> => {
  try {
    const response = await fetch(`${API_URL}/monsters`);
    const data = await response.json();

    // Récupérer les détails de chaque monstre
    const monsterPromises = data.results.map(async (monster: any) => {
      const detailResponse = await fetch(`${API_URL}${monster.url}`);
      const monsterDetail = await detailResponse.json();

      // Convertir les données au format attendu
      return {
        id: uuid(),
        name: monsterDetail.name,
        cr: monsterDetail.challenge_rating,
        xp: calculateXPFromCR(monsterDetail.challenge_rating),
        type: monsterDetail.type,
        size: monsterDetail.size,
        alignment: monsterDetail.alignment,
        environment: monsterDetail.environment || [],
        source: 'SRD',
        ac: monsterDetail.armor_class[0]?.value || 10,
        hp: monsterDetail.hit_points,
        speed: {
          walk: monsterDetail.speed.walk ? parseInt(monsterDetail.speed.walk.replace(' ft.', '')) : 0,
          fly: monsterDetail.speed.fly ? parseInt(monsterDetail.speed.fly.replace(' ft.', '')) : 0,
          swim: monsterDetail.speed.swim ? parseInt(monsterDetail.speed.swim.replace(' ft.', '')) : 0,
          climb: monsterDetail.speed.climb ? parseInt(monsterDetail.speed.climb.replace(' ft.', '')) : 0,
        },
        str: monsterDetail.strength,
        dex: monsterDetail.dexterity,
        con: monsterDetail.constitution,
        int: monsterDetail.intelligence,
        wis: monsterDetail.wisdom,
        cha: monsterDetail.charisma,
        legendary: monsterDetail.legendary_actions?.length > 0
      };
    });

    const monsters = await Promise.all(monsterPromises);
    // Sauvegarder dans le localStorage
    localStorage.setItem(MONSTERS_KEY, JSON.stringify(monsters));
    return monsters;
  } catch (error) {
    console.error('Erreur lors de la récupération des monstres:', error);
    return getDefaultMonsters();
  }
};

// Fonction pour récupérer tous les monstres (mise à jour pour utiliser l'index)
export function getMonsters(): Monster[] {
  try {
    // Vérifier d'abord s'il y a des monstres en localStorage
    const storedMonsters = localStorage.getItem('dnd_monsters');
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
    const storedMonsters = localStorage.getItem('dnd_monsters');
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
      localStorage.setItem('dnd_monsters', JSON.stringify(formattedMonsters));
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
        localStorage.setItem('dnd_monsters', JSON.stringify(monsters));
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

// Fonction utilitaire pour générer des identifiants uniques
function generateUniqueId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Fonction pour calculer l'XP à partir du CR
function calculateXPFromCR(cr: number): number {
  if (cr <= 0) return 10;
  if (cr <= 0.25) return 50;
  if (cr <= 0.5) return 100;
  if (cr <= 1) return 200;
  if (cr <= 2) return 450;
  if (cr <= 3) return 700;
  if (cr <= 4) return 1100;
  if (cr <= 5) return 1800;
  if (cr <= 6) return 2300;
  if (cr <= 7) return 2900;
  if (cr <= 8) return 3900;
  if (cr <= 9) return 5000;
  if (cr <= 10) return 5900;
  if (cr <= 11) return 7200;
  if (cr <= 12) return 8400;
  if (cr <= 13) return 10000;
  if (cr <= 14) return 11500;
  if (cr <= 15) return 13000;
  if (cr <= 16) return 15000;
  if (cr <= 17) return 18000;
  if (cr <= 18) return 20000;
  if (cr <= 19) return 22000;
  if (cr <= 20) return 25000;
  if (cr <= 21) return 33000;
  if (cr <= 22) return 41000;
  if (cr <= 23) return 50000;
  if (cr <= 24) return 62000;
  if (cr <= 25) return 75000;
  if (cr <= 26) return 90000;
  if (cr <= 27) return 105000;
  if (cr <= 28) return 120000;
  if (cr <= 29) return 135000;
  return 155000;
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

// ====== Parties ======

// Récupérer toutes les parties
export const getParties = (): Party[] => {
  const storedParties = localStorage.getItem(PARTIES_KEY);
  if (storedParties) {
    return JSON.parse(storedParties);
  }
  return [];
};

// Créer une nouvelle partie
export const createParty = (name: string, players: Omit<Player, 'id'>[] = []): Party => {
  const parties = getParties();

  const newParty: Party = {
    id: uuid(),
    name,
    players: players.map(player => ({ ...player, id: uuid() })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  parties.push(newParty);
  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));

  return newParty;
};

// Mettre à jour une partie existante
export const updateParty = (partyId: string, updates: Partial<Omit<Party, 'id'>>): Party | null => {
  const parties = getParties();
  const partyIndex = parties.findIndex(p => p.id === partyId);

  if (partyIndex === -1) {
    return null;
  }

  const updatedParty = { ...parties[partyIndex], ...updates };
  parties[partyIndex] = updatedParty;

  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  return updatedParty;
};

// Supprimer une partie
export const deleteParty = (partyId: string): boolean => {
  const parties = getParties();
  const newParties = parties.filter(p => p.id !== partyId);

  if (newParties.length === parties.length) {
    return false;
  }

  localStorage.setItem(PARTIES_KEY, JSON.stringify(newParties));
  return true;
};

// Ajouter un joueur à une partie
export const addPlayerToParty = (partyId: string, player: Omit<Player, 'id'>): Player | null => {
  const parties = getParties();
  const party = parties.find(p => p.id === partyId);

  if (!party) {
    return null;
  }

  const newPlayer = { ...player, id: uuid() };
  party.players.push(newPlayer);

  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  return newPlayer;
};

// Mettre à jour un joueur
export const updatePlayer = (partyId: string, playerId: string, updates: Partial<Omit<Player, 'id'>>): Player | null => {
  const parties = getParties();
  const party = parties.find(p => p.id === partyId);

  if (!party) {
    return null;
  }

  const playerIndex = party.players.findIndex(p => p.id === playerId);
  if (playerIndex === -1) {
    return null;
  }

  const updatedPlayer = { ...party.players[playerIndex], ...updates };
  party.players[playerIndex] = updatedPlayer;

  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  return updatedPlayer;
};

// Supprimer un joueur
export const removePlayerFromParty = (partyId: string, playerId: string): boolean => {
  const parties = getParties();
  const party = parties.find(p => p.id === partyId);

  if (!party) {
    return false;
  }

  const initialLength = party.players.length;
  party.players = party.players.filter(p => p.id !== playerId);

  if (party.players.length === initialLength) {
    return false;
  }

  localStorage.setItem(PARTIES_KEY, JSON.stringify(parties));
  return true;
};

// ====== Encounters ======

// Récupérer toutes les rencontres
export const getEncounters = (): Encounter[] => {
  const storedEncounters = localStorage.getItem(ENCOUNTERS_KEY);
  if (storedEncounters) {
    return JSON.parse(storedEncounters);
  }
  return [];
};

// Créer une nouvelle rencontre
export const createEncounter = (
  name: string,
  party: Party,
  monsters: EncounterMonster[] = [],
  environment?: string
): Encounter => {
  try {
    // Vérification et validation des données
    if (!name) throw new Error("Le nom de la rencontre est obligatoire");
    if (!party || !party.id) throw new Error("Le groupe de joueurs est invalide");

    // S'assurer que party a toutes les propriétés requises
    const completeParty: Party = {
      ...party,
      createdAt: party.createdAt || new Date().toISOString(),
      updatedAt: party.updatedAt || new Date().toISOString()
    };

    // Valider les monstres
    const validatedMonsters: EncounterMonster[] = monsters.map(({ monster, quantity }) => {
      // S'assurer que toutes les propriétés nécessaires sont présentes
      const validatedMonster: Monster = {
        ...monster, // Keep all original properties
        id: monster.id || generateUniqueId(),
        name: monster.name || "Monstre inconnu",
        originalName: monster.originalName || monster.name || "Monstre inconnu",
        cr: monster.cr || 0,
        xp: monster.xp || calculateXPFromCR(monster.cr || 0),
        type: monster.type || "Inconnu",
        size: monster.size || "M",
        source: monster.source || "Manuel",
        ac: monster.ac || 10,
        hp: monster.hp || 10,
        speed: monster.speed || { walk: 30 },
        alignment: monster.alignment || "non-aligné",
        legendary: monster.legendary || false,
        // Ensure stats have defaults if missing
        str: monster.str || 10, dex: monster.dex || 10, con: monster.con || 10,
        int: monster.int || 10, wis: monster.wis || 10, cha: monster.cha || 10,
      };

      return {
        monster: validatedMonster,
        quantity: quantity || 1
      };
    });

    const { totalXP, adjustedXP, difficulty } = calculateEncounterDifficulty(completeParty, monsters);

    // Créer la rencontre
    const encounter: Encounter = {
      id: uuid(),
      name,
      partyId: completeParty.id,
      monsters: validatedMonsters,
      environment: environment || 'any',
      totalXP,
      adjustedXP,
      difficulty,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sauvegarder en localStorage
    const encounters = getEncounters();
    const updatedEncounters = [...encounters, encounter];
    localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(updatedEncounters));

    console.log(`Rencontre "${name}" créée avec succès, ID: ${encounter.id}`);
    return encounter;
  } catch (error) {
    console.error("Erreur lors de la création de la rencontre:", error);
    throw error;
  }
};

// Mettre à jour une rencontre
export const updateEncounter = (
  encounterId: string,
  updates: Partial<Omit<Encounter, 'id' | 'totalXP' | 'adjustedXP' | 'difficulty'>>
): Encounter | null => {
  const encounters = getEncounters();
  const encounterIndex = encounters.findIndex(e => e.id === encounterId);

  if (encounterIndex === -1) {
    return null;
  }

  const currentEncounter = encounters[encounterIndex];

  // Mettre à jour les informations de base
  const updatedEncounter: Encounter = {
    ...currentEncounter,
    ...updates,
    updatedAt: new Date().toISOString()
  };

  // Recalculer l'XP et la difficulté si nécessaire
  if (updates.monsters || updates.partyId) {
    // Si le groupe a changé, récupérer le nouveau groupe
    const party = updates.partyId
      ? getParties().find(p => p.id === updates.partyId)
      : getParties().find(p => p.id === currentEncounter.partyId);

    if (!party) {
      console.error("Groupe introuvable pour recalculer la difficulté");
      return null;
    }

    // Créer un tableau d'EncounterMonster à partir des données de monstre
    const encounterMonsters = (updates.monsters || currentEncounter.monsters).map(monster => {
      if ('quantity' in monster) {
        // Si c'est déjà un EncounterMonster, le renvoyer tel quel
        return monster as unknown as EncounterMonster;
      } else {
        // Sinon, le convertir en EncounterMonster
        return {
          monster: monster as Monster,
          quantity: 1
        };
      }
    });

    // Recalculer la difficulté
    const { totalXP, adjustedXP, difficulty } = calculateEncounterDifficulty(party, encounterMonsters);

    updatedEncounter.totalXP = totalXP;
    updatedEncounter.adjustedXP = adjustedXP;
    updatedEncounter.difficulty = difficulty;
  }

  // Mettre à jour dans le localStorage
  encounters[encounterIndex] = updatedEncounter;
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));

  return updatedEncounter;
};

// Supprimer une rencontre
export const deleteEncounter = (encounterId: string): boolean => {
  const encounters = getEncounters();
  const newEncounters = encounters.filter(e => e.id !== encounterId);

  if (newEncounters.length === encounters.length) {
    return false;
  }

  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(newEncounters));
  return true;
};

// Calculer la difficulté d'une rencontre
export const calculateEncounterDifficulty = (
  party: Party,
  monsters: EncounterMonster[]
): { totalXP: number; adjustedXP: number; difficulty: 'easy' | 'medium' | 'hard' | 'deadly' } => {
  // Calculer l'XP total des monstres
  const totalXP = monsters.reduce((sum, { monster, quantity }) => sum + monster.xp * quantity, 0);

  // Appliquer le multiplicateur selon le nombre de monstres
  const monsterCount = monsters.reduce((count, { quantity }) => count + quantity, 0);
  const multiplier = getEncounterMultiplier(monsterCount, party.players.length);
  const adjustedXP = Math.floor(totalXP * multiplier);

  // Calculer les seuils de difficulté pour le groupe
  const partyThresholds = {
    easy: 0,
    medium: 0,
    hard: 0,
    deadly: 0
  };

  // Additionner les seuils de chaque joueur
  party.players.forEach(player => {
    const level = Math.min(player.level, 20); // Maximum level 20
    const threshold = xpThresholds[level];

    partyThresholds.easy += threshold.easy;
    partyThresholds.medium += threshold.medium;
    partyThresholds.hard += threshold.hard;
    partyThresholds.deadly += threshold.deadly;
  });

  // Déterminer la difficulté
  let difficulty: 'easy' | 'medium' | 'hard' | 'deadly';

  if (adjustedXP >= partyThresholds.deadly) {
    difficulty = 'deadly';
  } else if (adjustedXP >= partyThresholds.hard) {
    difficulty = 'hard';
  } else if (adjustedXP >= partyThresholds.medium) {
    difficulty = 'medium';
  } else {
    difficulty = 'easy';
  }

  return { totalXP, adjustedXP, difficulty };
};

// Renommer la fonction existante pour correspondre à l'import dans MonsterBrowser
export const fetchMonsterFromAideDD = async (monsterName: string): Promise<any> => {
  try {
    console.log(`Tentative de récupération des données pour ${monsterName} via fetchMonsterFromAideDD`);

    // Essayer d'abord de récupérer depuis notre JSON local
    try {
      console.log(`Tentative de récupération depuis le JSON local pour ${monsterName}`);
      const response = await fetch('/data/aidedd-monsters-all.json');

      if (!response.ok) {
        throw new Error(`Impossible de charger le fichier JSON local (${response.status})`);
      }

      const monsters = await response.json();

      // Normaliser le nom pour la recherche
      const normalizedName = monsterName.trim().toLowerCase();

      // Rechercher par nom
      const matchedMonster = monsters.find((m: any) =>
        m.name.toLowerCase() === normalizedName ||
        (m.originalName && m.originalName.toLowerCase() === normalizedName)
      );

      if (matchedMonster) {
        console.log(`Monstre trouvé dans le JSON local: ${matchedMonster.name}`);

        // Si le monstre a des données complètes (pas de type "Inconnu"), le retourner directement
        if (matchedMonster.type !== "Inconnu" && matchedMonster.hp !== 10 && matchedMonster.ac !== 10) {
          // Ensure image field is set from imageUrl if not already present
          return {
            ...matchedMonster,
            image: matchedMonster.image || matchedMonster.imageUrl || undefined
          };
        }
      }

      // Si pas de correspondance exacte ou données incomplètes, continuer
    } catch (jsonError) {
      console.error(`Erreur lors de la récupération du JSON local:`, jsonError);
      // Continuer avec la récupération via AideDD
    }

    // Si le JSON local ne fonctionne pas, essayer AideDD
    const aideddData = await getMonsterFromAideDD(monsterName);

    // Si on a réussi, retourner les données
    if (aideddData) {
      console.log(`Données récupérées avec succès depuis AideDD pour ${monsterName}`);
      return aideddData;
    }
  } catch (error) {
    console.error(`Erreur lors de la récupération via AideDD pour ${monsterName}:`, error);

    // En cas d'erreur, essayer de récupérer depuis notre JSON local comme fallback
    try {
      console.log(`Tentative de récupération depuis le JSON local (fallback) pour ${monsterName}`);
      const response = await fetch('/data/aidedd-monsters-all.json');

      if (!response.ok) {
        throw new Error(`Impossible de charger le fichier JSON local (${response.status})`);
      }

      const monsters = await response.json();

      // Normaliser le nom pour la recherche
      const normalizedName = monsterName.trim().toLowerCase();

      // Rechercher par nom
      const matchedMonster = monsters.find((m: any) =>
        m.name.toLowerCase() === normalizedName ||
        (m.originalName && m.originalName.toLowerCase() === normalizedName)
      );

      if (matchedMonster) {
        console.log(`Monstre trouvé dans le JSON local (fallback): ${matchedMonster.name}`);
        return {
          ...matchedMonster,
          image: matchedMonster.image || matchedMonster.imageUrl || undefined
        };
      }

      // Si pas de correspondance exacte, essayer une correspondance partielle
      const partialMatch = monsters.find((m: any) =>
        m.name.toLowerCase().includes(normalizedName) ||
        (m.originalName && m.originalName.toLowerCase().includes(normalizedName))
      );

      if (partialMatch) {
        console.log(`Correspondance partielle trouvée dans le JSON local (fallback): ${partialMatch.name}`);
        return {
          ...partialMatch,
          image: partialMatch.image || partialMatch.imageUrl || undefined
        };
      }

      // Si toujours pas de résultat, générer des données génériques
      console.warn(`Aucune correspondance trouvée dans le JSON local pour ${monsterName}, génération de données génériques`);
    } catch (jsonError) {
      console.error(`Erreur lors de la récupération du JSON local (fallback):`, jsonError);
    }
  }

  // En dernier recours, générer des données génériques
  console.warn(`Génération de données génériques pour ${monsterName}`);
  return {
    name: monsterName,
    cr: 0,
    xp: 10,
    type: "Inconnu",
    size: "M",
    alignment: "neutre",
    ac: 10,
    hp: "10 (1d8 + 2)",
    speed: ["marche 9 m"],
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    actions: [
      {
        name: "Attaque",
        description: `${monsterName} effectue une attaque de base.`
      }
    ]
  };
};

// Fonction pour adapter les données AideDD au format de l'application
export function adaptAideDDData(aideddData: any): any {
  if (!aideddData) return null;

  return {
    id: `aidedd-${aideddData.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: aideddData.name,
    cr: aideddData.cr || "0",
    xp: aideddData.xp || 0,
    type: aideddData.type || "Inconnu",
    size: aideddData.size || "M",
    source: aideddData.source || "AideDD",
    environment: Array.isArray(aideddData.environment) ? aideddData.environment : [],
    legendary: aideddData.legendary || false,
    alignment: aideddData.alignment || "non-aligné",
    ac: aideddData.ac || 10,
    hp: aideddData.hp || 10,
    // Image - check both imageUrl and image fields
    image: aideddData.image || aideddData.imageUrl || undefined,
    // Inclure toutes les autres propriétés disponibles
    abilities: aideddData.abilities,
    actions: aideddData.actions,
    traits: aideddData.traits,
    legendaryActions: aideddData.legendaryActions,
    speed: aideddData.speed,
    skills: aideddData.skills,
    senses: aideddData.senses,
    languages: aideddData.languages,
    damageResistances: aideddData.damageResistances,
    damageImmunities: aideddData.damageImmunities,
    conditionImmunities: aideddData.conditionImmunities
  };
}

// Fonction pour obtenir les données d'un monstre depuis AideDD
export async function getMonsterFromAideDD(monsterName: string, forceRefresh: boolean = false): Promise<any> {
  try {
    console.log(`Recherche des détails pour ${monsterName}${forceRefresh ? ' (rafraîchissement forcé)' : ''}`);
    const normalizedName = getAideDDMonsterSlug(monsterName);

    // 1. D'abord, essayer de récupérer depuis notre base complète (sauf si refresh forcé)
    if (!forceRefresh) {
      try {
        const monsterFromCompleteDB = await getMonsterFromCompleteDB(monsterName);
        console.log(`Monstre ${monsterName} trouvé dans la base de données complète`);
        return monsterFromCompleteDB;
      } catch (error) {
        console.log(`Monstre ${monsterName} non trouvé dans la base complète, tentative avec les autres méthodes...`);
      }
    } else {
      console.log("Chargement forcé depuis AideDD, base de données locale ignorée");
    }

    // 2. Ensuite, essayer de récupérer via iframe
    try {
      console.log(`Tentative via iframe pour ${monsterName}`);
      const monsterData = await fetchMonsterFromAideDD(monsterName);
      console.log(`Données récupérées via iframe pour ${monsterName}`);
      return adaptAideDDData(monsterData);
    } catch (error) {
      console.log(`Échec avec l'iframe, utilisation du fallback:`, error);
    }
    return null;
  } catch (error) {
    console.error(`Erreur getMonsterFromAideDD pour ${monsterName}:`, error);
    return null;
  }
}


// Fonction pour charger le mapping des URLs
async function loadUrlMapping(): Promise<Record<string, string>> {
  try {
    const response = await fetch('/data/aidedd-monster-urls.json');
    if (!response.ok) {
      throw new Error('Impossible de charger le mapping des URLs');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement du mapping des URLs:', error);
    return {};
  }
}

// Fonction pour parser le HTML de AideDD et extraire les données du monstre
function parseAideDDMonsterHTML(html: string, monsterName: string): any {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 1. Initialisation de l'objet monstre avec des valeurs par défaut
    const monster: any = {
      id: `aidedd-${monsterName.toLowerCase().replace(/\s+/g, '-')}`,
      name: monsterName,
      originalName: monsterName,
      size: "M",
      type: "Inconnu",
      alignment: "neutre",
      ac: 10,
      hp: 10,
      speed: [],
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10,
      abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      savingThrows: "",
      skills: "",
      senses: "",
      languages: "",
      challengeRating: 0,
      cr: "0",
      xp: 0,
      traits: [],
      actions: [],
      reactions: [],
      legendaryActions: [],
      damageVulnerabilities: "",
      damageResistances: "",
      damageImmunities: "",
      conditionImmunities: "",
      source: "AideDD"
    };

    // 2. Extraction du titre et du sous-titre (Type, Taille, Alignement)
    const h1 = doc.querySelector('h1');
    if (h1) monster.name = h1.textContent?.trim() || monsterName;

    // Traduction/Nom original
    const tradDiv = doc.querySelector('.trad');
    if (tradDiv) {
      const match = tradDiv.textContent?.match(/\[\s*(.*?)\s*\]/);
      if (match) monster.originalName = match[1];
    }

    const typeDiv = doc.querySelector('.type');
    if (typeDiv && typeDiv.textContent) {
      const typeText = typeDiv.textContent.trim();
      // Format: "Humanoïde (aarakocra) de taille M, neutre bon"
      const parts = typeText.split(',');
      if (parts.length >= 2) {
        monster.alignment = parts[parts.length - 1].trim();
        const firstPart = parts.slice(0, parts.length - 1).join(',');

        const sizeMatch = firstPart.match(/de taille\s+(\S+)/i);
        if (sizeMatch) monster.size = sizeMatch[1];

        const typePart = firstPart.replace(/de taille\s+\S+/i, '').trim();
        monster.type = typePart;
      }
    }

    // 3. Extraction du bloc rouge (.red) pour CA, PV, Vitesse, Caracs, Skills, etc.
    const redDiv = doc.querySelector('.red');
    if (redDiv) {
      // Pour CA, PV, Vitesse, on cherche les lignes de texte directes ou balises
      const textContent = redDiv.innerHTML;

      // Regex pour extraire les valeurs clés
      const acMatch = textContent.match(/<strong>Classe d'armure<\/strong>\s*([^<]+)/i);
      if (acMatch) monster.ac = parseInt(acMatch[1]) || acMatch[1].trim(); // keep string if complex

      const hpMatch = textContent.match(/<strong>Points de vie<\/strong>\s*([^<]+)/i);
      if (hpMatch) monster.hp = hpMatch[1].trim();

      const speedMatch = textContent.match(/<strong>Vitesse<\/strong>\s*([^<]+)/i);
      if (speedMatch) {
        monster.speed = speedMatch[1].split(',').map(s => s.trim());
      }

      const savingThrowsMatch = textContent.match(/<strong>Jets de sauvegarde<\/strong>\s*([^<]+)/i);
      if (savingThrowsMatch) monster.savingThrows = savingThrowsMatch[1].trim();

      // Caractéristiques (.carac)
      const caracs = redDiv.querySelectorAll('.carac');
      caracs.forEach(c => {
        const label = c.querySelector('strong')?.textContent?.trim().toLowerCase();
        const valueText = c.childNodes[c.childNodes.length - 1].textContent?.trim() || "10";
        const value = parseInt(valueText.split(' ')[0]);

        if (label && !isNaN(value)) {
          if (label.includes('for')) { monster.str = value; monster.abilities.str = value; }
          if (label.includes('dex')) { monster.dex = value; monster.abilities.dex = value; }
          if (label.includes('con')) { monster.con = value; monster.abilities.con = value; }
          if (label.includes('int')) { monster.int = value; monster.abilities.int = value; }
          if (label.includes('sag')) { monster.wis = value; monster.abilities.wis = value; }
          if (label.includes('cha')) { monster.cha = value; monster.abilities.cha = value; }
        }
      });

      // Autres propriétés (Skills, Senses, etc.) souvent après les caracs
      // On peut utiliser des regex sur tout le contenu du .red car c'est un bloc de texte

      const skillsMatch = textContent.match(/<strong>Compétences<\/strong>\s*([^<]+)/i);
      if (skillsMatch) monster.skills = skillsMatch[1].trim();

      const sensesMatch = textContent.match(/<strong>Sens<\/strong>\s*([^<]+)/i);
      if (sensesMatch) monster.senses = sensesMatch[1].trim();

      const langMatch = textContent.match(/<strong>Langues<\/strong>\s*([^<]+)/i);
      if (langMatch) monster.languages = langMatch[1].trim();

      const crMatch = textContent.match(/<strong>Puissance<\/strong>\s*([^<]+)/i);
      if (crMatch) {
        monster.cr = crMatch[1].split('(')[0].trim();
        const xpMatch = crMatch[1].match(/\((\d+)\s*PX\)/i);
        if (xpMatch) monster.xp = parseInt(xpMatch[1]);
      }

      const vulnMatch = textContent.match(/<strong>Vulnérabilités aux dégâts<\/strong>\s*([^<]+)/i);
      if (vulnMatch) monster.damageVulnerabilities = vulnMatch[1].trim();

      const resMatch = textContent.match(/<strong>Résistances aux dégâts<\/strong>\s*([^<]+)/i);
      if (resMatch) monster.damageResistances = resMatch[1].trim();

      const immMatch = textContent.match(/<strong>Immunités aux dégâts<\/strong>\s*([^<]+)/i);
      if (immMatch) monster.damageImmunities = immMatch[1].trim();

      const condMatch = textContent.match(/<strong>Immunités aux états<\/strong>\s*([^<]+)/i);
      if (condMatch) monster.conditionImmunities = condMatch[1].trim();

      const saveMatch = textContent.match(/<strong>Jets de sauvegarde<\/strong>\s*([^<]+)/i);
      if (saveMatch) monster.savingThrows = saveMatch[1].trim();
    }

    // 4. Extraction des Traits, Actions, Réactions, Légendaires
    // On parcourt les éléments frères dans .sansSerif après le .red
    const container = doc.querySelector('.sansSerif');
    if (container) {
      let currentSection = 'traits'; // 'traits', 'actions', 'reactions', 'legendary'
      const children = Array.from(container.children);

      let passedRed = false;

      children.forEach(child => {
        // Identifier le début de la zone de contenu (après .red)
        if (child.classList.contains('red')) {
          passedRed = true;
          return;
        }
        if (!passedRed) return; // Ignorer ce qui est avant/dans le bloc rouge (déjà traité)

        // Détection des sections
        if (child.classList.contains('rub')) {
          const text = child.textContent?.trim().toLowerCase();
          if (text === 'actions') currentSection = 'actions';
          else if (text === 'réactions' || text === 'reac tions') currentSection = 'reactions'; // AideDD typo handling
          else if (text === 'actions légendaires') currentSection = 'legendary';
          else if (text === 'actions de repaire') currentSection = 'lair'; // Future proof
          return;
        }

        // Traitement des paragraphes <p>
        if (child.tagName === 'P') {
          const strong = child.querySelector('strong');
          let name = '';
          let desc = '';

          if (strong) {
            name = strong.textContent?.trim().replace(/\.$/, '') || ''; // Remove trailing dot
            // La description est tout le texte sauf le titre.
            // Parfois le titre est <strong><em>Nom</em></strong>.
            let htmlContent = child.innerHTML;

            // Nettoyer le nom du début de la chaine HTML
            // Regex simple pour enlever le tag strong du début
            htmlContent = htmlContent.replace(/^<strong[^>]*>.*?<\/strong>\.?\s*/i, '');
            desc = htmlContent.trim();
          } else {
            // Cas où c'est juste du texte (ex: description introductive des actions légendaires)
            // On peut l'ajouter comme une 'note' ou l'ignorer, ou l'ajouter au trait précédent.
            // Pour l'instant on ignore si pas de titre, sauf si c'est pour compléter une description.
            // Simple heuristic: if no strong tag, append to last item of current section
            const targetArray = monster[currentSection === 'legendary' ? 'legendaryActions' : currentSection];
            if (targetArray && targetArray.length > 0) {
              targetArray[targetArray.length - 1].desc += "<br/><br/>" + child.innerHTML;
            }
            return;
          }

          const item = { name, desc };

          if (currentSection === 'traits') monster.traits.push(item);
          else if (currentSection === 'actions') monster.actions.push(item);
          else if (currentSection === 'reactions') monster.reactions.push(item);
          else if (currentSection === 'legendary') monster.legendaryActions.push(item);
        }
      });
    }

    // Normaliser les données finales
    monster.legendary = monster.legendaryActions.length > 0;

    return monster;

  } catch (error) {
    console.error(`Erreur critique parsing HTML pour ${monsterName}:`, error);
    return {
      name: monsterName,
      error: "Parsing failed"
    };
  }
}

// Fonction pour charger les données complètes des monstres depuis notre base locale
export async function loadCompleteAideDDMonsters(): Promise<any[]> {
  try {
    // Charger le fichier JSON contenant toutes les données des monstres
    const response = await fetch('/data/aidedd-complete/monsters.json');
    if (!response.ok) {
      throw new Error('Impossible de charger la base de données complète des monstres');
    }

    const monstersData = await response.json();
    console.log(`Base de données complète chargée: ${monstersData.length} monstres disponibles`);
    return monstersData;
  } catch (error) {
    console.error('Erreur lors du chargement de la base de données complète:', error);
    return [];
  }
}

// Fonction pour récupérer les détails d'un monstre depuis notre base complète
export async function getMonsterFromCompleteDB(monsterName: string): Promise<any> {
  try {
    // Normaliser le nom pour la recherche
    const normalizedName = monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Charger toutes les données
    const allMonsters = await loadCompleteAideDDMonsters();

    // Rechercher le monstre par son nom
    const monster = allMonsters.find(m => {
      const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mName === normalizedName;
    });

    if (!monster) {
      throw new Error(`Monstre ${monsterName} non trouvé dans la base de données complète`);
    }

    // Adapter les données au format attendu par l'application
    return adaptCompleteMonsterData(monster);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données pour ${monsterName} depuis la base complète:`, error);
    throw error;
  }
}

// Fonction pour adapter les données de monstre de la base complète au format de l'application
function adaptCompleteMonsterData(monsterData: any): any {
  // Si le nom est vide mais que le HTML contient un nom, extraire le nom du HTML
  if (!monsterData.name || monsterData.name === "") {
    try {
      // Tenter d'extraire le nom du titre dans le HTML
      const nameMatch = monsterData.fullHtml.match(/<h1>([^<]+)<\/h1>/);
      if (nameMatch && nameMatch[1]) {
        console.log(`Nom extrait du HTML pour: ${nameMatch[1]}`);
        monsterData.name = nameMatch[1];
      }
    } catch (e) {
      console.error("Erreur lors de l'extraction du nom du HTML:", e);
    }
  }

  // Formatage des vitesses en objet
  const speedObj: { walk?: number; fly?: number; swim?: number; climb?: number } = {};
  if (monsterData.speed) {
    const speedStr = monsterData.speed.toString();
    // Regex pour capturer la valeur et le type
    // Ex: "9 m", "vol 18 m", "nage 12 m"
    const regex = /(?:(vol|nage|escalade|creusement)\s+)?(\d+(?:,\d+)?)\s*m/gi;
    let match;

    // Si pas de type précisé au début, c'est la marche (souvent le premier)
    // On va itérer sur toutes les correspondances
    while ((match = regex.exec(speedStr)) !== null) {
      const type = match[1] ? match[1].toLowerCase() : 'walk';
      const value = parseInt(match[2].replace(',', '.')); // Gérer décimales si besoin, mais souvent entiers

      switch (type) {
        case 'walk': speedObj.walk = value; break;
        case 'vol': speedObj.fly = value; break;
        case 'nage': speedObj.swim = value; break;
        case 'escalade': speedObj.climb = value; break;
        // 'creusement' ignored for now as per type def, or map to closest?
      }
    }

    // Fallback simple si regex fail ou format simple "9 m"
    if (Object.keys(speedObj).length === 0) {
      const simpleMatch = speedStr.match(/(\d+)/);
      if (simpleMatch) speedObj.walk = parseInt(simpleMatch[1]);
    }
  }

  // Fallback parsing from HTML if structured data is missing
  let traits = monsterData.traits || [];
  let actions = monsterData.actions || [];
  let legendaryActions = monsterData.legendaryActions || [];
  let reactions = monsterData.reactions || [];
  let skills = monsterData.skills || "";
  let senses = monsterData.senses || "";
  let languages = monsterData.languages || "";
  let damageResistances = monsterData.damageResistances || "";
  let damageImmunities = monsterData.damageImmunities || "";
  let conditionImmunities = monsterData.conditionImmunities || "";
  let savingThrows = monsterData.savingThrows || "";

  // Fallback parsing from HTML if structured data is missing OR if key stats are missing
  const missingStructuredData = actions.length === 0 || (traits.length === 0 && monsterData.fullHtml && monsterData.fullHtml.length > 500);
  const missingStats = !savingThrows && !senses && !languages;

  if (monsterData.fullHtml && (missingStructuredData || missingStats)) {
    console.log(`[adaptCompleteMonsterData] Données ou stats manquantes pour ${monsterData.name}, tentative de parsing du HTML..., fullHtml length: ${monsterData.fullHtml.length}`);
    const parsed = parseAideDDMonsterHTML(monsterData.fullHtml, monsterData.name);

    console.log(`[adaptCompleteMonsterData] Parsed ${monsterData.name}:`, {
      traits: parsed.traits?.length || 0,
      actions: parsed.actions?.length || 0,
      reactions: parsed.reactions?.length || 0,
      legendaryActions: parsed.legendaryActions?.length || 0
    });

    // Merge/Fill missing data
    if (traits.length === 0) traits = parsed.traits;
    if (actions.length === 0) actions = parsed.actions;
    if (legendaryActions.length === 0) legendaryActions = parsed.legendaryActions;
    if (reactions.length === 0) reactions = parsed.reactions;

    // Fill stats if missing
    if (!skills) skills = parsed.skills;
    if (!senses) senses = parsed.senses;
    if (!languages) languages = parsed.languages;
    if (!damageResistances) damageResistances = parsed.damageResistances;
    if (!damageImmunities) damageImmunities = parsed.damageImmunities;
    if (!conditionImmunities) conditionImmunities = parsed.conditionImmunities;
    if (!savingThrows) savingThrows = parsed.savingThrows;

    // Also try to recover AC/HP/Speed if they are default
    if (monsterData.ac === 10 && parsed.ac !== 10) monsterData.ac = parsed.ac;
    if (monsterData.hp === 10 && parsed.hp !== 10) monsterData.hp = parsed.hp;

    // Fix CR/XP if 0
    if ((monsterData.cr === "0" || monsterData.cr === 0) && parsed.cr !== "0") {
      monsterData.cr = parsed.cr;
      monsterData.challengeRating = parsed.cr; // legacy compat
    }
    if ((monsterData.xp === 0) && parsed.xp !== 0) monsterData.xp = parsed.xp;

    // Speed merging is complex, relying on adaptCompleteMonsterData's own speed parsing which happens earlier
  }

  // Créer un objet au format attendu par l'application
  const result = {
    id: `${monsterData.name.toLowerCase().replace(/\s+/g, '-')}-complete`,
    name: monsterData.name,
    originalName: monsterData.originalName || monsterData.name,
    cr: monsterData.cr || "0",
    xp: monsterData.xp || 0,
    type: monsterData.type || "Inconnu",
    subtype: monsterData.subtype || "",
    size: monsterData.size || "M",
    ac: monsterData.ac || 10,
    hp: monsterData.hp || 10,
    speed: speedObj,
    alignment: monsterData.alignment || "sans alignement",
    legendary: monsterData.isLegendary || false,
    abilities: monsterData.abilities || {
      str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
    },
    str: monsterData.abilities?.str || 10,
    dex: monsterData.abilities?.dex || 10,
    con: monsterData.abilities?.con || 10,
    int: monsterData.abilities?.int || 10,
    wis: monsterData.abilities?.wis || 10,
    cha: monsterData.abilities?.cha || 10,
    skills: skills,
    senses: senses,
    languages: languages,
    damageResistances: damageResistances,
    damageImmunities: damageImmunities,
    conditionImmunities: conditionImmunities,
    savingThrows: savingThrows,
    traits: traits,
    actions: actions,
    legendaryActions: legendaryActions,
    reactions: reactions,
    source: monsterData.source || "Monster Manual",
    environment: monsterData.environment || [],
    image: monsterData.localImagePath ? `/data/aidedd-complete/${monsterData.localImagePath}` : null
  };

  console.log(`[adaptCompleteMonsterData] Returning ${result.name} with ${result.traits?.length || 0} traits, ${result.actions?.length || 0} actions`);

  return result;
}

// Fonction pour normaliser les noms de monstres en slugs utilisables dans les URLs
export function getAideDDMonsterSlug(monsterName: string): string {
  // Normaliser le nom pour recherche
  const normalizedName = monsterName.trim();

  // Vérifier les cas spéciaux
  const specialCases: Record<string, string> = {
    'Dragon d\'ombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
    'Dragon d\'ombre rouge, jeune': 'dragon-d-ombre-rouge-jeune',
    'Dragon d\'ombre rouge': 'dragon-d-ombre-rouge-jeune',
    'Dragon dombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
    'Béhir': 'behir',
    'Behir': 'behir',
    'Arbre éveillé': 'arbre-eveille',
    'Balor': 'balor',
    'Dragon d\'airain ancien': 'dragon-d-airain-ancien',
    'Dragon d\'or ancien': 'dragon-d-or-ancien',
    'Allosaure': 'allosaure',
    'Allosaurus': 'allosaure',
    'Androsphinx': 'androsphinx',
    'Ankheg': 'ankheg'
  };

  if (specialCases[normalizedName]) {
    return specialCases[normalizedName];
  }

  // Convertir en format URL si pas trouvé dans les cas spéciaux
  let slug = normalizedName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Enlever les accents

  // Correction spéciale pour les apostrophes: 'd'ombre' devient 'd-ombre'
  slug = slug.replace(/'(\w)/g, '-$1');

  // Traitement spécial pour les apostrophes
  slug = slug.replace(/([a-z])\'([a-z])/g, '$1-$2');

  // Remplacer les espaces par des tirets
  slug = slug.replace(/ /g, '-');

  // Supprimer les caractères non alphanumériques (sauf les tirets)
  slug = slug.replace(/[^a-z0-9-]/g, '');

  // Éviter les tirets consécutifs
  slug = slug.replace(/-+/g, '-');

  return slug;
}

// Fonction pour initialiser la base de données complète
export async function initializeCompleteMonsterDatabase(): Promise<void> {
  try {
    console.log("Initialisation de la base de données complète des monstres...");

    // Précharger la base de données complète
    const monstersData = await loadCompleteAideDDMonsters();
    console.log(`Base de données complète initialisée avec ${monstersData.length} monstres`);

    // Vérifier quelques entrées pour s'assurer que tout fonctionne correctement
    if (monstersData.length > 0) {
      const sampleMonsters = ["Dragon", "Gobelin", "Zombie", "Squelette", "Troll"];
      for (const monsterName of sampleMonsters) {
        try {
          // Tester la recherche
          const monster = monstersData.find(m => {
            const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return mName.includes(monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
          });

          if (monster) {
            console.log(`Test réussi: monstre "${monsterName}" trouvé: ${monster.name}`);
          } else {
            console.log(`Test: monstre "${monsterName}" non trouvé dans la base de données complète`);
          }
        } catch (error) {
          console.error(`Erreur lors du test pour "${monsterName}":`, error);
        }
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données complète:", error);
  }
}

// Fonction pour charger les données d'un monstre depuis son fichier individuel
export async function loadMonsterFromIndividualFile(monsterSlug: string): Promise<any> {
  try {
    // Charger le fichier JSON du monstre spécifique
    const response = await fetch(`/data/monsters/${monsterSlug}.json`);
    if (!response.ok) {
      throw new Error(`Impossible de charger les données pour le monstre ${monsterSlug}`);
    }

    const monsterData = await response.json();
    console.log(`Données chargées depuis le fichier individuel pour: ${monsterData.name}`);

    // Adapter les données au format attendu par l'application
    return adaptCompleteMonsterData(monsterData);
  } catch (error) {
    console.error(`Erreur lors du chargement du monstre ${monsterSlug}:`, error);
    throw error;
  }
}

// Fonction pour charger l'index des monstres individuels
export async function loadMonstersIndex(): Promise<any[]> {
  try {
    console.log("Chargement de l'index des monstres...");

    // Essayer d'abord le nouvel index étendu
    const completeIndexResponse = await fetch('/data/aidedd-complete/monsters-index.json');
    if (completeIndexResponse.ok) {
      const indexData = await completeIndexResponse.json();
      console.log(`Index étendu chargé avec succès: ${indexData.length} monstres`);
      return indexData;
    }

    // Si l'index étendu n'est pas disponible, essayer l'index standard
    const indexResponse = await fetch('/data/monsters/index.json');
    if (indexResponse.ok) {
      const indexData = await indexResponse.json();
      console.log(`Index standard chargé avec succès: ${indexData.length} monstres`);
      return indexData;
    }

    // Si aucun index n'est disponible, générer un index de base
    console.error("Aucun index disponible. Création d'un index par défaut...");
    return [
      {
        id: "gobelin",
        name: "Gobelin",
        originalName: "Goblin",
        cr: "0.25",
        type: "Humanoïde",
        size: "P"
      },
      {
        id: "squelette",
        name: "Squelette",
        originalName: "Skeleton",
        cr: "0.25",
        type: "Mort-vivant",
        size: "M"
      },
      {
        id: "zombie",
        name: "Zombie",
        originalName: "Zombie",
        cr: "0.25",
        type: "Mort-vivant",
        size: "M"
      }
    ];
  } catch (error) {
    console.error("Erreur lors du chargement de l'index des monstres:", error);
    return [];
  }
}

// Fonction pour rechercher un monstre par son nom dans l'index
export async function findMonsterInIndex(monsterName: string): Promise<string | null> {
  try {
    // Normaliser le nom pour la recherche
    const normalizedName = monsterName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Charger l'index
    const monstersIndex = await loadMonstersIndex();

    // Rechercher le monstre par son nom
    const monster = monstersIndex.find(m => {
      const mName = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const mOrigName = m.originalName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return mName === normalizedName || mOrigName === normalizedName;
    });

    if (!monster) {
      return null;
    }

    return monster.id;
  } catch (error) {
    console.error(`Erreur lors de la recherche de ${monsterName} dans l'index:`, error);
    return null;
  }
} 