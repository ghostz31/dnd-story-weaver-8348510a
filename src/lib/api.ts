import { Monster, Player, Party, Encounter, EncounterMonster, getEncounterMultiplier, xpThresholds } from './types';
import { v4 as uuid } from 'uuid';
import { createMonsterDataIframe } from '../createMonsterDataIframe';

// Local Storage Keys
const MONSTERS_KEY = 'dnd_monsters';
const PARTIES_KEY = 'dnd_parties';
const ENCOUNTERS_KEY = 'dnd_encounters';

// API AideDD ou DnD 5e API
const API_URL = 'https://www.dnd5eapi.co/api';

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
    const response = await fetch('/data/aidedd-monsters-all.json');
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
    const validatedMonsters = monsters.map(({ monster, quantity }) => {
      // S'assurer que toutes les propriétés nécessaires sont présentes
      return {
        id: monster.id || generateUniqueId(),
        name: monster.name || "Monstre inconnu",
        originalName: monster.originalName || monster.name || "Monstre inconnu",
        cr: monster.cr || 0,
        xp: monster.xp || calculateXPFromCR(monster.cr || 0),
        type: monster.type || "Inconnu",
        size: monster.size || "M",
        source: monster.source || "Manuel",
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
          return matchedMonster;
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
        return matchedMonster;
      }
      
      // Si pas de correspondance exacte, essayer une correspondance partielle
      const partialMatch = monsters.find((m: any) => 
        m.name.toLowerCase().includes(normalizedName) || 
        (m.originalName && m.originalName.toLowerCase().includes(normalizedName))
      );
      
      if (partialMatch) {
        console.log(`Correspondance partielle trouvée dans le JSON local (fallback): ${partialMatch.name}`);
        return partialMatch;
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
    
    // 3. Utiliser les fallbacks spécifiques
    
    // Fallback pour l'Ankheg
    if (normalizedName.toLowerCase() === 'ankheg') {
      return {
        id: 'ankheg-special',
        name: 'Ankheg',
        originalName: 'Ankheg',
        cr: 2,
        xp: 450,
        type: 'Monstruosité',
        size: 'G',
        alignment: 'sans alignement',
        ac: '14 (armure naturelle, 11 lorsqu\'il est à terre)',
        hp: '39 (6d10 + 6)',
        speed: ['marche 9 m', 'creusement 3 m'],
        abilities: {
          str: 17,
          dex: 11,
          con: 13,
          int: 1,
          wis: 13,
          cha: 6
        },
        str: 17,
        dex: 11,
        con: 13,
        int: 1,
        wis: 13,
        cha: 6,
        senses: 'perception des vibrations 18 m, Perception passive 11',
        languages: '-',
        traits: [
          {
            name: 'Sensibilité à la lumière du soleil',
            description: 'L\'ankheg subit un désavantage aux jets d\'attaque et aux tests de Sagesse (Perception) basés sur la vue lorsqu\'il est exposé à la lumière du soleil.'
          }
        ],
        actions: [
          {
            name: 'Morsure',
            description: 'Attaque d\'arme au corps à corps : +5 au toucher, allonge 1,50 m, une cible. Touché : 10 (2d6 + 3) dégâts tranchants plus 3 (1d6) dégâts d\'acide. Si la cible est une créature de taille G ou inférieure, elle est agrippée (évasion DD 13). Jusqu\'à la fin de cette empoignade, l\'ankheg ne peut mordre qu\'une créature agrippée, et il est avantagé à ses jets d\'attaque pour le faire.'
          },
          {
            name: 'Jet d\'acide (Recharge 6)',
            description: 'L\'ankheg crache de l\'acide sur une ligne de 9 mètres de long pour 1,50 mètre de large, à condition qu\'il n\'empoigne aucune créature. Chaque créature sur cette ligne doit effectuer un jet de sauvegarde de Dextérité DD 13 ; elle subit 10 (3d6) dégâts d\'acide en cas d\'échec, ou la moitié de ces dégâts en cas de réussite.'
          }
        ]
      };
    }
    
    // Fallback pour le Chevalier
    if (normalizedName.toLowerCase() === 'chevalier') {
      return {
        id: 'chevalier-special',
        name: 'Chevalier',
        originalName: 'Knight',
        cr: 3,
        xp: 700,
        type: 'Humanoïde',
        subtype: 'toute race',
        size: 'M',
        ac: '18 (plate)',
        hp: '52 (8d8 + 16)',
        speed: ['marche 9 m'],
        alignment: 'tout alignement',
        abilities: {
          str: 16,
          dex: 11,
          con: 14,
          int: 11,
          wis: 11,
          cha: 15
        },
        str: 16,
        dex: 11,
        con: 14,
        int: 11,
        wis: 11,
        cha: 15,
        savingThrows: 'Con +4, Sag +2',
        senses: 'Perception passive 10',
        languages: 'une langue au choix (généralement le commun)',
        traits: [
          {
            name: 'Brave',
            description: 'Le chevalier est avantagé aux jets de sauvegarde contre l\'état effrayé.'
          }
        ],
        actions: [
          {
            name: 'Attaques multiples',
            description: 'Le chevalier effectue deux attaques au corps à corps.'
          },
          {
            name: 'Épée longue',
            description: 'Attaque au corps à corps avec une arme : +5 au toucher, allonge 1,50 m, une cible. Touché : 10 (2d6 + 3) dégâts tranchants.'
          },
          {
            name: 'Arbalète lourde',
            description: 'Attaque à distance avec une arme : +2 au toucher, portée 30/120 m, une cible. Touché : 5 (1d10) dégâts perforants.'
          },
          {
            name: 'Leadership (Recharge après un repos court ou long)',
            description: 'Pendant 1 minute, le chevalier peut donner un ordre ou un avertissement spécial chaque fois qu\'une créature non hostile qu\'il voit dans un rayon de 9 mètres effectue un jet d\'attaque ou de sauvegarde. La créature peut ajouter un d4 à son jet, à condition qu\'elle puisse entendre et comprendre le chevalier. Une créature ne peut bénéficier que d\'un seul dé de Leadership à la fois. Cet effet prend fin si le chevalier est incapable d\'agir.'
          }
        ],
        reactions: [
          {
            name: 'Parade',
            description: 'Le chevalier ajoute 2 à sa CA contre une attaque au corps à corps qui devrait le toucher. Pour ce faire, le chevalier doit voir son agresseur et manier une arme de corps à corps.'
          }
        ],
        source: "Monster Manual (SRD)"
      };
    }
    
    // Fallback pour l'Espion
    if (normalizedName.toLowerCase() === 'espion') {
      return {
        id: 'espion-special',
        name: 'Espion',
        originalName: 'Spy',
        cr: 1,
        xp: 200,
        type: 'Humanoïde',
        subtype: 'toute race',
        size: 'M',
        ac: 12,
        hp: '27 (6d8)',
        speed: ['marche 9 m'],
        alignment: 'tout alignement',
        abilities: {
          str: 10,
          dex: 15,
          con: 10,
          int: 12,
          wis: 14,
          cha: 16
        },
        str: 10,
        dex: 15,
        con: 10,
        int: 12,
        wis: 14,
        cha: 16,
        skills: "Discrétion +4, Escamotage +4, Investigation +5, Perception +6, Perspicacité +4, Persuasion +5, Tromperie +5",
        senses: "Perception passive 16",
        languages: "deux langues au choix",
        traits: [
          {
            name: "Action rusée",
            description: "À chacun de ses tours, l'espion peut effectuer une action bonus pour Foncer, se Désengager ou se Cacher."
          },
          {
            name: "Attaque sournoise (1/tour)",
            description: "L'espion inflige 7 (2d6) dégâts supplémentaires quand il touche une cible avec une attaque d'arme et qu'il a l'avantage au jet d'attaque, ou lorsque la cible est à 1,50 mètre ou moins d'un de ses alliés qui n'est pas incapacité et que l'espion n'a pas de désavantage au jet d'attaque."
          }
        ],
        actions: [
          {
            name: "Attaques multiples",
            description: "L'espion effectue deux attaques au corps à corps."
          },
          {
            name: "Épée courte",
            description: "Attaque au corps à corps avec une arme : +4 au toucher, allonge 1,50 m, une cible. Touché : 5 (1d6 + 2) dégâts perforants."
          },
          {
            name: "Arbalète de poing",
            description: "Attaque à distance avec une arme : +4 au toucher, portée 9/36 m, une cible. Touché : 5 (1d6 + 2) dégâts perforants."
          }
        ],
        source: "Monster Manual (SRD)"
      };
    }
    
    // Fallback pour le Kobold Aile
    if (normalizedName.toLowerCase() === 'kobold aile') {
      return {
        id: 'kobold-aile-special',
        name: 'Kobold Aile',
        originalName: 'Winged Kobold',
        cr: 0.25,
        xp: 50,
        type: 'Humanoïde',
        subtype: 'kobold',
        size: 'P',
        ac: 13,
        hp: '7 (3d6 - 3)',
        speed: ['marche 9 m', 'vol 9 m'],
        alignment: 'loyal mauvais',
        abilities: {
          str: 7,
          dex: 16,
          con: 9,
          int: 8,
          wis: 7,
          cha: 8
        },
        str: 7,
        dex: 16,
        con: 9,
        int: 8,
        wis: 7,
        cha: 8,
        senses: 'vision dans le noir 18 m, Perception passive 8',
        languages: 'commun, draconique',
        traits: [
          {
            name: 'Sensibilité à la lumière du soleil',
            description: 'Le kobold est désavantagé aux jets d\'attaque lorsqu\'il est exposé à la lumière du soleil, ainsi qu\'aux jets de Sagesse (Perception) basés sur la vue.'
          },
          {
            name: 'Tactique de groupe',
            description: 'Le kobold est avantagé aux jets d\'attaque contre une créature si au moins un des alliés du kobold se trouve à 1,50 mètre ou moins de la créature et n\'est pas incapacité.'
          }
        ],
        actions: [
          {
            name: 'Dague',
            description: 'Attaque au corps à corps avec une arme : +5 au toucher, allonge 1,50 m, une cible. Touché : 5 (1d4 + 3) dégâts perforants.'
          },
          {
            name: 'Rocher lâché',
            description: 'Attaque à distance avec une arme : +5 au toucher, une cible directement en dessous du kobold. Touché : 6 (1d6 + 3) dégâts contondants.'
          }
        ],
        source: 'Monster Manual',
        environment: ['montagne', 'souterrain']
      };
    }
    
    // Pour les autres créatures, on utilise une approche de données hardcodées
    throw new Error(`Impossible de récupérer les données pour ${monsterName}`);
  } catch (error) {
    console.error(`Erreur lors de la récupération des données pour ${monsterName}:`, error);
    
    // Données de fallback génériques
    return {
      name: monsterName,
      cr: "0",
      xp: 0,
      type: "Inconnu",
      size: "M",
      ac: 10,
      hp: 10,
      speed: [],
      alignment: "neutre",
      actions: [
        {
          name: "Attaque",
          description: `${monsterName} effectue une attaque de base.`
        }
      ]
    };
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
    // Créer un DOM temporaire pour parser le HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Extraire les informations de base
    const nameElement = doc.querySelector('.titre');
    const name = nameElement?.textContent?.trim() || monsterName;
    
    // Extraire le type, la taille et l'alignement
    const typeElement = doc.querySelector('.sousTitreTaille');
    const typeText = typeElement?.textContent || '';
    
    // Extraction de la taille et du type
    let type = '';
    let size = '';
    let alignment = '';
    
    if (typeText) {
      // Format typique: "Monstre de taille M, tout alignement"
      const typeMatch = typeText.match(/([^,]+) de taille ([^,]+),\s+(.+)/i);
      if (typeMatch) {
        type = typeMatch[1].trim();
        size = typeMatch[2].trim();
        alignment = typeMatch[3].trim();
      }
    }
    
    // Extraire CA et PV
    const statBlocks = Array.from(doc.querySelectorAll('.carac'));
    let ac = '';
    let hp = '';
    let speed = '';
    
    statBlocks.forEach(block => {
      const title = block.querySelector('.titreCarac')?.textContent || '';
      const value = block.querySelector('.valeur')?.textContent || '';
      
      if (title.includes('Classe d\'armure')) {
        ac = value.trim();
      } else if (title.includes('Points de vie')) {
        hp = value.trim();
      } else if (title.includes('Vitesse')) {
        speed = value.trim();
      }
    });
    
    // Extraire les caractéristiques
    const abilities: Record<string, number> = {
      str: 10,
      dex: 10,
      con: 10,
      int: 10,
      wis: 10,
      cha: 10
    };
    
    const abilityBlock = doc.querySelector('.carac2');
    if (abilityBlock) {
      const abilityValues = Array.from(abilityBlock.querySelectorAll('.valeur'));
      const abilityNames = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
      
      abilityValues.forEach((element, index) => {
        if (index < abilityNames.length) {
          const value = parseInt(element.textContent || '10', 10);
          abilities[abilityNames[index]] = isNaN(value) ? 10 : value;
        }
      });
    }
    
    // Extraire les compétences, résistances, etc.
    const sections = Array.from(doc.querySelectorAll('.bloc'));
    let skills = '';
    let senses = '';
    let languages = '';
    let damageResistances = '';
    let damageImmunities = '';
    let conditionImmunities = '';
    let cr = '';
    
    sections.forEach(section => {
      const title = section.querySelector('.titreBloc')?.textContent || '';
      const content = section.querySelector('.description')?.textContent || '';
      
      if (title.includes('Compétences')) {
        skills = content.trim();
      } else if (title.includes('Sens')) {
        senses = content.trim();
      } else if (title.includes('Langues')) {
        languages = content.trim();
      } else if (title.includes('Résistances aux dégâts')) {
        damageResistances = content.trim();
      } else if (title.includes('Immunités aux dégâts')) {
        damageImmunities = content.trim();
      } else if (title.includes('Immunités aux conditions')) {
        conditionImmunities = content.trim();
      } else if (title.includes('Puissance')) {
        cr = content.trim();
      }
    });
    
    // Extraire FP et XP
    const crMatch = cr.match(/(\d+(?:\/\d+)?)\s+\((\d+)\s+PX\)/);
    const crValue = crMatch ? crMatch[1] : '0';
    const xp = crMatch ? parseInt(crMatch[2], 10) : 0;
    
    // Extraire les actions
    const actions: any[] = [];
    const traits: any[] = [];
    const legendaryActions: any[] = [];
    
    // Trouver le bloc d'actions
    const actionBlock = Array.from(doc.querySelectorAll('.bloc')).find(
      block => block.querySelector('.titreBloc')?.textContent?.includes('Actions')
    );
    
    if (actionBlock) {
      // Extraire chaque action individuelle
      const actionElements = Array.from(actionBlock.querySelectorAll('.description > div'));
      
      actionElements.forEach(element => {
        const actionText = element.innerHTML;
        const nameMatch = actionText.match(/<strong>([^<]+)<\/strong>/);
        
        if (nameMatch) {
          const actionName = nameMatch[1].trim();
          // Remplacer le nom de l'action et le tag strong par une chaîne vide pour obtenir la description
          const actionDesc = actionText
            .replace(/<strong>[^<]+<\/strong>/, '')
            .trim()
            .replace(/\.\s+/, '') // Enlever le point après le nom
            .trim();
          
          actions.push({
            name: actionName,
            description: actionDesc
          });
        }
      });
    }
    
    // Trouver le bloc de traits
    const traitBlock = Array.from(doc.querySelectorAll('.bloc')).find(
      block => block.querySelector('.titreBloc')?.textContent?.includes('Traits')
    );
    
    if (traitBlock) {
      // Extraire chaque trait individuel
      const traitElements = Array.from(traitBlock.querySelectorAll('.description > div'));
      
      traitElements.forEach(element => {
        const traitText = element.innerHTML;
        const nameMatch = traitText.match(/<strong>([^<]+)<\/strong>/);
        
        if (nameMatch) {
          const traitName = nameMatch[1].trim();
          // Remplacer le nom du trait et le tag strong par une chaîne vide pour obtenir la description
          const traitDesc = traitText
            .replace(/<strong>[^<]+<\/strong>/, '')
            .trim()
            .replace(/\.\s+/, '') // Enlever le point après le nom
            .trim();
          
          traits.push({
            name: traitName,
            description: traitDesc
          });
        }
      });
    }
    
    // Trouver le bloc d'actions légendaires
    const legendaryBlock = Array.from(doc.querySelectorAll('.bloc')).find(
      block => block.querySelector('.titreBloc')?.textContent?.includes('Actions légendaires')
    );
    
    let legendary = false;
    
    if (legendaryBlock) {
      legendary = true;
      // Extraire chaque action légendaire
      const legendaryElements = Array.from(legendaryBlock.querySelectorAll('.description > div'));
      
      legendaryElements.forEach(element => {
        const actionText = element.innerHTML;
        const nameMatch = actionText.match(/<strong>([^<]+)<\/strong>/);
        
        if (nameMatch) {
          const actionName = nameMatch[1].trim();
          // Remplacer le nom de l'action et le tag strong par une chaîne vide pour obtenir la description
          const actionDesc = actionText
            .replace(/<strong>[^<]+<\/strong>/, '')
            .trim()
            .replace(/\.\s+/, '') // Enlever le point après le nom
            .trim();
          
          legendaryActions.push({
            name: actionName,
            description: actionDesc
          });
        }
      });
    }
    
    // Construire l'objet monstre
    return {
      id: `aidedd-${name.toLowerCase().replace(/\s+/g, '-')}`,
      name,
      originalName: name, // Utiliser le même nom pour l'instant
      cr: crValue,
      xp,
      type,
      size,
      ac,
      hp,
      speed: speed.split(',').map(s => s.trim()),
      alignment,
      str: abilities.str,
      dex: abilities.dex,
      con: abilities.con,
      int: abilities.int,
      wis: abilities.wis,
      cha: abilities.cha,
      abilities,
      skills,
      senses,
      languages,
      damageResistances,
      damageImmunities,
      conditionImmunities,
      actions,
      traits,
      legendaryActions,
      legendary,
      source: "AideDD",
      environment: []
    };
    
  } catch (error) {
    console.error(`Erreur lors du parsing des données pour ${monsterName}:`, error);
    return {
      name: monsterName,
      cr: "0",
      xp: 0,
      type: "Inconnu",
      size: "M",
      ac: 10,
      hp: 10,
      speed: [],
      alignment: "neutre",
      actions: [
        {
          name: "Attaque",
          description: `${monsterName} effectue une attaque de base.`
        }
      ]
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
  
  // Formatage des vitesses en tableau
  let speedArray: string[] = [];
  if (monsterData.speed) {
    const speedStr = monsterData.speed.toString();
    const speedMatches = speedStr.match(/(\d+\s*m\.?(?:\s*de\s*)?(?:vol|nage|creusement|escalade)?)/g);
    if (speedMatches) {
      speedArray = speedMatches.map((s: string) => s.trim());
    }
  }
  
  // Créer un objet au format attendu par l'application
  return {
    id: `${monsterData.name.toLowerCase().replace(/\s+/g, '-')}-complete`,
    name: monsterData.name,
    originalName: monsterData.originalName || monsterData.name,
    cr: monsterData.cr || "0",
    xp: monsterData.xp || 0,
    type: monsterData.type || "Inconnu",
    subtype: monsterData.subtype || "",
    size: monsterData.size || "M",
    ac: monsterData.ac || 10,
    hp: monsterData.hp || "10 (1d8+2)",
    speed: speedArray,
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
    skills: monsterData.skills || "",
    senses: monsterData.senses || "",
    languages: monsterData.languages || "",
    damageResistances: monsterData.damageResistances || "",
    damageImmunities: monsterData.damageImmunities || "",
    conditionImmunities: monsterData.conditionImmunities || "",
    savingThrows: monsterData.savingThrows || "",
    traits: monsterData.traits || [],
    actions: monsterData.actions || [],
    legendaryActions: monsterData.legendaryActions || [],
    reactions: monsterData.reactions || [],
    source: monsterData.source || "Monster Manual",
    environment: monsterData.environment || [],
    image: monsterData.localImagePath ? `/data/aidedd-complete/${monsterData.localImagePath}` : null
  };
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