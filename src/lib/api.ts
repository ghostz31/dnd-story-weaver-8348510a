import { Monster, Player, Party, Encounter, EncounterMonster, getEncounterMultiplier, xpThresholds } from './types';
import { v4 as uuid } from 'uuid';

// Local Storage Keys
const MONSTERS_KEY = 'dnd_monsters';
const PARTIES_KEY = 'dnd_parties';
const ENCOUNTERS_KEY = 'dnd_encounters';
const FAVORITES_KEY = 'dnd_favorite_monsters';

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

// Récupérer tous les monstres (local storage ou défaut)
export const getMonsters = (): Monster[] => {
  const storedMonsters = localStorage.getItem(MONSTERS_KEY);
  if (storedMonsters) {
    return JSON.parse(storedMonsters);
  }
  // Utiliser la version synchrone pour le chargement initial
  return getDefaultMonstersSync();
};

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
    const response = await fetch('/data/monsters.json');
    if (!response.ok) {
      throw new Error('Impossible de charger les monstres');
    }
    return await response.json();
  } catch (error) {
    console.error('Erreur lors du chargement des monstres:', error);
    // Retourner un tableau vide en cas d'échec
    return [];
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
    if (filters.type && monster.type !== filters.type) {
      return false;
    }
    
    // Filtre par environnement
    if (filters.environment && filters.environment !== 'all') {
      if (!monster.environment?.includes(filters.environment)) {
        return false;
      }
    }
    
    // Filtre par taille
    if (filters.size && monster.size !== filters.size) {
      return false;
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

// Calculer l'XP à partir du CR
export const calculateXPFromCR = (cr: number): number => {
  const crTable: Record<string, number> = {
    '0': 10,
    '1/8': 25,
    '1/4': 50,
    '1/2': 100,
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
    '30': 155000
  };

  return crTable[cr.toString()] || 0;
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
    players: players.map(player => ({ ...player, id: uuid() }))
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
  const encounters = getEncounters();
  
  // Calculer la difficulté et l'XP
  const { totalXP, adjustedXP, difficulty } = calculateEncounterDifficulty(party, monsters);
  
  const newEncounter: Encounter = {
    id: uuid(),
    name,
    party,
    monsters,
    difficulty,
    totalXP,
    adjustedXP,
    environment
  };
  
  encounters.push(newEncounter);
  localStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));
  
  return newEncounter;
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
  
  // Créer la rencontre mise à jour
  const updatedEncounter = { ...encounters[encounterIndex], ...updates };
  
  // Recalculer l'XP et la difficulté si nécessaire
  if (updates.monsters || updates.party) {
    const { totalXP, adjustedXP, difficulty } = calculateEncounterDifficulty(
      updatedEncounter.party,
      updatedEncounter.monsters
    );
    
    updatedEncounter.totalXP = totalXP;
    updatedEncounter.adjustedXP = adjustedXP;
    updatedEncounter.difficulty = difficulty;
  }
  
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
  
  // Calculer le multiplicateur en fonction du nombre de monstres et de la taille du groupe
  const monsterCount = monsters.reduce((sum, { quantity }) => sum + quantity, 0);
  const multiplier = getEncounterMultiplier(monsterCount, party.players.length);
  
  // Calculer l'XP ajusté
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

// ====== Favoris ======

// Récupérer les monstres favoris
export const getFavoriteMonsters = (): string[] => {
  const storedFavorites = localStorage.getItem(FAVORITES_KEY);
  if (storedFavorites) {
    return JSON.parse(storedFavorites);
  }
  return [];
};

// Ajouter un monstre aux favoris
export const addMonsterToFavorites = (monsterId: string): boolean => {
  const favorites = getFavoriteMonsters();
  
  if (favorites.includes(monsterId)) {
    return false;
  }
  
  favorites.push(monsterId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  
  return true;
};

// Retirer un monstre des favoris
export const removeMonsterFromFavorites = (monsterId: string): boolean => {
  const favorites = getFavoriteMonsters();
  const newFavorites = favorites.filter(id => id !== monsterId);
  
  if (newFavorites.length === favorites.length) {
    return false;
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
  return true;
};

// Vérifier si un monstre est dans les favoris
export const isMonsterFavorite = (monsterId: string): boolean => {
  const favorites = getFavoriteMonsters();
  return favorites.includes(monsterId);
}; 