import { useMemo, useCallback, useRef, useEffect } from 'react';
import { EncounterParticipant } from '@/lib/types';
import { EncounterService } from '@/services/EncounterService';

/**
 * Hook d'optimisation pour les calculs coûteux des rencontres
 */
export function useEncounterOptimizations(participants: EncounterParticipant[]) {
  const participantsRef = useRef(participants);
  const calculationCache = useRef(new Map());
  
  // Mise à jour de la référence
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);
  
  // Participants triés par initiative (mémorisé)
  const sortedParticipants = useMemo(() => {
    const cacheKey = `sorted-${participants.map(p => `${p.id}-${p.initiative}`).join(',')}`;
    
    if (calculationCache.current.has(cacheKey)) {
      return calculationCache.current.get(cacheKey);
    }
    
    const sorted = EncounterService.sortParticipantsByInitiative(participants);
    calculationCache.current.set(cacheKey, sorted);
    
    // Limiter la taille du cache
    if (calculationCache.current.size > 50) {
      const firstKey = calculationCache.current.keys().next().value;
      calculationCache.current.delete(firstKey);
    }
    
    return sorted;
  }, [participants]);
  
  // Statistiques de rencontre (mémorisées)
  const encounterStats = useMemo(() => {
    return {
      totalParticipants: participants.length,
      playersCount: participants.filter(p => p.isPC).length,
      monstersCount: participants.filter(p => !p.isPC).length,
      aliveParticipants: participants.filter(p => p.currentHp > 0).length,
      unconsciousParticipants: participants.filter(p => 
        p.currentHp === 0 || (p.conditions && p.conditions.includes('Inconscient'))
      ).length,
      averageLevel: participants.filter(p => p.isPC && p.level).length > 0 
        ? Math.round(
            participants
              .filter(p => p.isPC && p.level)
              .reduce((sum, p) => sum + (p.level || 1), 0) / 
            participants.filter(p => p.isPC && p.level).length
          )
        : 1
    };
  }, [participants]);
  
  // Difficulté de rencontre (mémorisée)
  const encounterDifficulty = useMemo(() => {
    const monsters = participants
      .filter(p => !p.isPC && p.cr)
      .map(p => ({ cr: typeof p.cr === 'number' ? p.cr : parseFloat(p.cr as string || '0.25') }));
    
    if (monsters.length === 0) return null;
    
    const partySize = encounterStats.playersCount || 4;
    const partyLevel = encounterStats.averageLevel;
    
    return EncounterService.calculateEncounterDifficulty(monsters, partyLevel, partySize);
  }, [participants, encounterStats]);
  
  // Fonctions optimisées avec useCallback
  const getParticipantById = useCallback((id: string) => {
    return participantsRef.current.find(p => p.id === id);
  }, []);
  
  const getParticipantsByCondition = useCallback((condition: string) => {
    return participantsRef.current.filter(p => 
      p.conditions && p.conditions.includes(condition)
    );
  }, []);
  
  const getActiveParticipants = useCallback(() => {
    return participantsRef.current.filter(p => 
      EncounterService.canParticipantAct(p)
    );
  }, []);
  
  const getParticipantsByType = useCallback((isPC: boolean) => {
    return participantsRef.current.filter(p => p.isPC === isPC);
  }, []);
  
  // Validation des données
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    participants.forEach(p => {
      if (!p.name || p.name.trim() === '') {
        errors.push(`Participant ${p.id} n'a pas de nom`);
      }
      if (p.currentHp < 0) {
        errors.push(`${p.name} a des PV négatifs`);
      }
      if (p.currentHp > p.maxHp) {
        errors.push(`${p.name} a plus de PV actuels que maximum`);
      }
      if (p.ac < 0) {
        errors.push(`${p.name} a une CA négative`);
      }
    });
    
    return errors;
  }, [participants]);
  
  // Métriques de performance
  const performanceMetrics = useMemo(() => {
    const now = performance.now();
    
    return {
      participantCount: participants.length,
      cacheSize: calculationCache.current.size,
      lastCalculation: now,
      hasErrors: validationErrors.length > 0
    };
  }, [participants, validationErrors]);
  
  return {
    // Données optimisées
    sortedParticipants,
    encounterStats,
    encounterDifficulty,
    validationErrors,
    performanceMetrics,
    
    // Fonctions utilitaires
    getParticipantById,
    getParticipantsByCondition,
    getActiveParticipants,
    getParticipantsByType
  };
}

/**
 * Hook pour la virtualisation des listes de participants
 */
export function useVirtualizedParticipants(
  participants: EncounterParticipant[], 
  itemHeight: number = 80,
  containerHeight: number = 400
) {
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2; // Buffer
  
  const getVisibleItems = useCallback((scrollTop: number) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount, participants.length);
    
    return {
      startIndex,
      endIndex,
      items: participants.slice(startIndex, endIndex),
      totalHeight: participants.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [participants, itemHeight, visibleCount]);
  
  return { getVisibleItems, itemHeight };
}

/**
 * Hook pour la persistance optimisée
 */
export function useEncounterPersistence(encounterId?: string) {
  const saveTimeout = useRef<NodeJS.Timeout>();
  const lastSaved = useRef<string>('');
  
  const debouncedSave = useCallback((data: any) => {
    const dataString = JSON.stringify(data);
    
    // Éviter les sauvegardes inutiles
    if (dataString === lastSaved.current) return;
    
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }
    
    saveTimeout.current = setTimeout(() => {
      try {
        if (encounterId) {
          // Sauvegarder en base de données
          localStorage.setItem(`encounter-${encounterId}`, dataString);
        } else {
          // Sauvegarder en session
          sessionStorage.setItem('currentEncounter', dataString);
        }
        lastSaved.current = dataString;
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    }, 1000); // Débounce de 1 seconde
    
  }, [encounterId]);
  
  const loadSavedData = useCallback(() => {
    try {
      const key = encounterId ? `encounter-${encounterId}` : 'currentEncounter';
      const storage = encounterId ? localStorage : sessionStorage;
      const data = storage.getItem(key);
      
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      return null;
    }
  }, [encounterId]);
  
  return { debouncedSave, loadSavedData };
} 