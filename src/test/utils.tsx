// Utilitaires de test - Configuration pour Jest/React Testing Library
// Note: Ce fichier nécessite l'installation des dépendances de test

// Types de base pour les tests
export interface TestEncounterParticipant {
  id: string;
  name: string;
  initiative: number;
  ac: number;
  currentHp: number;
  maxHp: number;
  isPC: boolean;
  conditions: string[];
  notes: string;
  cr?: string;
  type?: string;
  size?: string;
  dex?: number;
  hasUsedAction?: boolean;
  hasUsedBonusAction?: boolean;
  hasUsedReaction?: boolean;
  remainingMovement?: number;
}

// Mock d'un participant d'encounter pour les tests
export const mockEncounterParticipant = {
  id: 'test-participant-1',
  name: 'Test Participant',
  initiative: 15,
  ac: 16,
  currentHp: 30,
  maxHp: 30,
  isPC: false,
  conditions: [],
  notes: '',
  cr: '1',
  type: 'humanoid',
  size: 'Medium',
  dex: 14,
  hasUsedAction: false,
  hasUsedBonusAction: false,
  hasUsedReaction: false,
  remainingMovement: 30
};

// Mock d'une encounter complète
export const mockEncounter = {
  name: 'Test Encounter',
  participants: [mockEncounterParticipant],
  currentTurn: 0,
  round: 1
};

// Mock du sessionStorage pour les tests
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key]);
    }
  };
};

// Mock des APIs Firebase
export const mockFirebaseApi = {
  getParties: () => Promise.resolve([]),
  createParty: () => Promise.resolve('test-id'),
  updateParty: () => Promise.resolve(),
  deleteParty: () => Promise.resolve(),
  getEncounters: () => Promise.resolve([]),
  createEncounter: () => Promise.resolve('test-encounter-id'),
  updateEncounter: () => Promise.resolve(),
  deleteEncounter: () => Promise.resolve()
};

// Mock des APIs de monstres
export const mockMonsterApi = {
  getMonsterFromAideDD: () => Promise.resolve(mockEncounterParticipant),
  getMonsterFromCompleteDB: () => Promise.resolve(mockEncounterParticipant),
  findMonsterInIndex: () => Promise.resolve('test-monster'),
  loadMonsterFromIndividualFile: () => Promise.resolve(mockEncounterParticipant)
};

// Utilitaires de test pour les hooks
export const createMockHook = (returnValue: any) => {
  return () => returnValue;
};

// Utilitaire pour simuler des erreurs
export const simulateError = (message: string) => {
  return new Error(`Test Error: ${message}`);
};

// Note: Les exports de testing-library seront ajoutés une fois les dépendances installées
// export { customRender as render };
// export * from '@testing-library/react'; 