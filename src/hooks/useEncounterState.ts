import { useReducer, useCallback, useMemo } from 'react';
import { EncounterParticipant } from '@/lib/types';

// Types pour la gestion d'état centralisée
interface EncounterState {
  // État principal de la rencontre
  encounter: {
    name: string;
    participants: EncounterParticipant[];
    currentTurn: number;
    round: number;
  };
  
  // États des modals
  modals: {
    hpEditor: {
      isOpen: boolean;
      participant: {
        id: string;
        name: string;
        currentHp: number;
        maxHp: number;
      };
    };
    maxHpEditor: {
      isOpen: boolean;
      participants: Array<{
        id: string;
        name: string;
        currentMaxHp: number;
        newMaxHp: number;
        isPC: boolean;
      }>;
    };
    initiativeEditor: {
      isOpen: boolean;
      initiatives: Array<{
        id: string;
        name: string;
        initiative: number;
        modifier: number;
      }>;
    };
    conditionSelector: {
      isOpen: boolean;
      participantId: string | null;
    };
    treasure: {
      isOpen: boolean;
      monsters: Array<{name: string, cr: number}>;
      partyLevel: number;
    };
  };
  
  // Configuration de l'interface
  ui: {
    currentView: 'grid' | 'list' | 'compact';
    showHpModifier: string | null;
    hpModifierValue: number;
  };
}

// Actions pour le reducer
type EncounterAction =
  | { type: 'LOAD_ENCOUNTER'; payload: any }
  | { type: 'UPDATE_PARTICIPANT'; payload: { id: string; updates: Partial<EncounterParticipant> } }
  | { type: 'ADD_PARTICIPANT'; payload: EncounterParticipant }
  | { type: 'REMOVE_PARTICIPANT'; payload: string }
  | { type: 'NEXT_TURN' }
  | { type: 'PREVIOUS_TURN' }
  | { type: 'SET_INITIATIVE'; payload: { id: string; initiative: number } }
  | { type: 'TOGGLE_CONDITION'; payload: { participantId: string; condition: string } }
  | { type: 'OPEN_HP_EDITOR'; payload: { id: string; name: string; currentHp: number; maxHp: number } }
  | { type: 'CLOSE_HP_EDITOR' }
  | { type: 'OPEN_MAX_HP_EDITOR'; payload: Array<{id: string; name: string; currentMaxHp: number; newMaxHp: number; isPC: boolean}> }
  | { type: 'CLOSE_MAX_HP_EDITOR' }
  | { type: 'OPEN_INITIATIVE_EDITOR'; payload: Array<{id: string; name: string; initiative: number; modifier: number}> }
  | { type: 'CLOSE_INITIATIVE_EDITOR' }
  | { type: 'OPEN_CONDITION_SELECTOR'; payload: string }
  | { type: 'CLOSE_CONDITION_SELECTOR' }
  | { type: 'OPEN_TREASURE_MODAL'; payload: { monsters: Array<{name: string, cr: number}>; partyLevel: number } }
  | { type: 'CLOSE_TREASURE_MODAL' }
  | { type: 'SET_VIEW'; payload: 'grid' | 'list' | 'compact' }
  | { type: 'SET_HP_MODIFIER'; payload: { participantId: string | null; value: number } };

// État initial
const initialState: EncounterState = {
  encounter: {
    name: 'Nouvelle Rencontre',
    participants: [],
    currentTurn: 0,
    round: 1
  },
  modals: {
    hpEditor: {
      isOpen: false,
      participant: { id: '', name: '', currentHp: 0, maxHp: 0 }
    },
    maxHpEditor: {
      isOpen: false,
      participants: []
    },
    initiativeEditor: {
      isOpen: false,
      initiatives: []
    },
    conditionSelector: {
      isOpen: false,
      participantId: null
    },
    treasure: {
      isOpen: false,
      monsters: [],
      partyLevel: 1
    }
  },
  ui: {
    currentView: 'grid',
    showHpModifier: null,
    hpModifierValue: 1
  }
};

// Reducer pour gérer les actions
function encounterReducer(state: EncounterState, action: EncounterAction): EncounterState {
  switch (action.type) {
    case 'LOAD_ENCOUNTER':
      return {
        ...state,
        encounter: action.payload
      };
      
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        encounter: {
          ...state.encounter,
          participants: state.encounter.participants.map(p =>
            p.id === action.payload.id ? { ...p, ...action.payload.updates } : p
          )
        }
      };
      
    case 'ADD_PARTICIPANT':
      return {
        ...state,
        encounter: {
          ...state.encounter,
          participants: [...state.encounter.participants, action.payload]
        }
      };
      
    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        encounter: {
          ...state.encounter,
          participants: state.encounter.participants.filter(p => p.id !== action.payload)
        }
      };
      
    case 'NEXT_TURN':
      const nextTurn = (state.encounter.currentTurn + 1) % state.encounter.participants.length;
      return {
        ...state,
        encounter: {
          ...state.encounter,
          currentTurn: nextTurn,
          round: nextTurn === 0 ? state.encounter.round + 1 : state.encounter.round
        }
      };
      
    case 'PREVIOUS_TURN':
      const prevTurn = state.encounter.currentTurn === 0 
        ? state.encounter.participants.length - 1 
        : state.encounter.currentTurn - 1;
      return {
        ...state,
        encounter: {
          ...state.encounter,
          currentTurn: prevTurn,
          round: state.encounter.currentTurn === 0 ? Math.max(1, state.encounter.round - 1) : state.encounter.round
        }
      };
      
    case 'TOGGLE_CONDITION':
      return {
        ...state,
        encounter: {
          ...state.encounter,
          participants: state.encounter.participants.map(p => {
            if (p.id === action.payload.participantId) {
              const conditions = p.conditions || [];
              const hasCondition = conditions.includes(action.payload.condition);
              return {
                ...p,
                conditions: hasCondition
                  ? conditions.filter(c => c !== action.payload.condition)
                  : [...conditions, action.payload.condition]
              };
            }
            return p;
          })
        }
      };
      
    case 'OPEN_HP_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          hpEditor: {
            isOpen: true,
            participant: action.payload
          }
        }
      };
      
    case 'CLOSE_HP_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          hpEditor: {
            ...state.modals.hpEditor,
            isOpen: false
          }
        }
      };
      
    case 'OPEN_MAX_HP_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          maxHpEditor: {
            isOpen: true,
            participants: action.payload
          }
        }
      };
      
    case 'CLOSE_MAX_HP_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          maxHpEditor: {
            ...state.modals.maxHpEditor,
            isOpen: false
          }
        }
      };
      
    case 'OPEN_INITIATIVE_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          initiativeEditor: {
            isOpen: true,
            initiatives: action.payload
          }
        }
      };
      
    case 'CLOSE_INITIATIVE_EDITOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          initiativeEditor: {
            ...state.modals.initiativeEditor,
            isOpen: false
          }
        }
      };
      
    case 'OPEN_CONDITION_SELECTOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          conditionSelector: {
            isOpen: true,
            participantId: action.payload
          }
        }
      };
      
    case 'CLOSE_CONDITION_SELECTOR':
      return {
        ...state,
        modals: {
          ...state.modals,
          conditionSelector: {
            isOpen: false,
            participantId: null
          }
        }
      };
      
    case 'OPEN_TREASURE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          treasure: {
            isOpen: true,
            monsters: action.payload.monsters,
            partyLevel: action.payload.partyLevel
          }
        }
      };
      
    case 'CLOSE_TREASURE_MODAL':
      return {
        ...state,
        modals: {
          ...state.modals,
          treasure: {
            ...state.modals.treasure,
            isOpen: false
          }
        }
      };
      
    case 'SET_VIEW':
      return {
        ...state,
        ui: {
          ...state.ui,
          currentView: action.payload
        }
      };
      
    case 'SET_HP_MODIFIER':
      return {
        ...state,
        ui: {
          ...state.ui,
          showHpModifier: action.payload.participantId,
          hpModifierValue: action.payload.value
        }
      };
      
    default:
      return state;
  }
}

// Hook principal pour la gestion d'état des rencontres
export function useEncounterState(initialEncounter?: any) {
  const [state, dispatch] = useReducer(encounterReducer, {
    ...initialState,
    encounter: initialEncounter || initialState.encounter
  });
  
  // Actions mémorisées pour éviter les re-renders
  const actions = useMemo(() => ({
    // Gestion de la rencontre
    loadEncounter: (encounter: any) => dispatch({ type: 'LOAD_ENCOUNTER', payload: encounter }),
    updateParticipant: (id: string, updates: Partial<EncounterParticipant>) => 
      dispatch({ type: 'UPDATE_PARTICIPANT', payload: { id, updates } }),
    addParticipant: (participant: EncounterParticipant) => 
      dispatch({ type: 'ADD_PARTICIPANT', payload: participant }),
    removeParticipant: (id: string) => dispatch({ type: 'REMOVE_PARTICIPANT', payload: id }),
    
    // Gestion des tours
    nextTurn: () => dispatch({ type: 'NEXT_TURN' }),
    previousTurn: () => dispatch({ type: 'PREVIOUS_TURN' }),
    
    // Gestion des conditions
    toggleCondition: (participantId: string, condition: string) =>
      dispatch({ type: 'TOGGLE_CONDITION', payload: { participantId, condition } }),
    
    // Gestion des modals
    openHpEditor: (participant: { id: string; name: string; currentHp: number; maxHp: number }) =>
      dispatch({ type: 'OPEN_HP_EDITOR', payload: participant }),
    closeHpEditor: () => dispatch({ type: 'CLOSE_HP_EDITOR' }),
    
    openMaxHpEditor: (participants: Array<{id: string; name: string; currentMaxHp: number; newMaxHp: number; isPC: boolean}>) =>
      dispatch({ type: 'OPEN_MAX_HP_EDITOR', payload: participants }),
    closeMaxHpEditor: () => dispatch({ type: 'CLOSE_MAX_HP_EDITOR' }),
    
    openInitiativeEditor: (initiatives: Array<{id: string; name: string; initiative: number; modifier: number}>) =>
      dispatch({ type: 'OPEN_INITIATIVE_EDITOR', payload: initiatives }),
    closeInitiativeEditor: () => dispatch({ type: 'CLOSE_INITIATIVE_EDITOR' }),
    
    openConditionSelector: (participantId: string) =>
      dispatch({ type: 'OPEN_CONDITION_SELECTOR', payload: participantId }),
    closeConditionSelector: () => dispatch({ type: 'CLOSE_CONDITION_SELECTOR' }),
    
    openTreasureModal: (monsters: Array<{name: string, cr: number}>, partyLevel: number) =>
      dispatch({ type: 'OPEN_TREASURE_MODAL', payload: { monsters, partyLevel } }),
    closeTreasureModal: () => dispatch({ type: 'CLOSE_TREASURE_MODAL' }),
    
    // Gestion de l'interface
    setView: (view: 'grid' | 'list' | 'compact') => dispatch({ type: 'SET_VIEW', payload: view }),
    setHpModifier: (participantId: string | null, value: number) =>
      dispatch({ type: 'SET_HP_MODIFIER', payload: { participantId, value } })
  }), []);
  
  // Sélecteurs mémorisés
  const selectors = useMemo(() => ({
    // Participant actuel
    currentParticipant: state.encounter.participants[state.encounter.currentTurn],
    
    // Participants triés par initiative
    sortedParticipants: [...state.encounter.participants].sort((a, b) => b.initiative - a.initiative),
    
    // Statistiques de la rencontre
    encounterStats: {
      totalParticipants: state.encounter.participants.length,
      playersCount: state.encounter.participants.filter(p => p.isPC).length,
      monstersCount: state.encounter.participants.filter(p => !p.isPC).length,
      aliveParticipants: state.encounter.participants.filter(p => p.currentHp > 0).length
    },
    
    // État des modals
    isAnyModalOpen: Object.values(state.modals).some(modal => modal.isOpen)
  }), [state]);
  
  return {
    state,
    actions,
    selectors
  };
} 