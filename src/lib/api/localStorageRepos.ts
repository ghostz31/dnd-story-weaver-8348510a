import { Player, Party, Encounter, EncounterMonster, Monster } from '../types';
import { v4 as uuid } from 'uuid';
import { generateUniqueId } from '../monsterUtils';
import { calculateXPFromCR, calculateEncounterDifficulty } from './xpCalculator';

// Local Storage Keys
const PARTIES_KEY = 'dnd_parties';
const ENCOUNTERS_KEY = 'dnd_encounters';

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
