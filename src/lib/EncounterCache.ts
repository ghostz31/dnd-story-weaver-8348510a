/**
 * Système de cache intelligent pour les rencontres
 * Optimise les calculs répétitifs et la persistance des données
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live en millisecondes
  hits: number;
}

export class EncounterCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize: number;
  private defaultTTL: number;
  
  constructor(maxSize: number = 100, defaultTTL: number = 5 * 60 * 1000) { // 5 minutes par défaut
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
  }
  
  /**
   * Stocke une valeur dans le cache
   */
  set<T>(key: string, value: T, ttl?: number): void {
    // Nettoyer le cache si nécessaire
    if (this.cache.size >= this.maxSize) {
      this.evictLeastUsed();
    }
    
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * Récupère une valeur du cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Vérifier si l'entrée a expiré
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Incrémenter le compteur d'utilisation
    entry.hits++;
    
    return entry.data as T;
  }
  
  /**
   * Vérifie si une clé existe dans le cache
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Vérifier l'expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Supprime une entrée du cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }
  
  /**
   * Vide le cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Supprime les entrées les moins utilisées
   */
  private evictLeastUsed(): void {
    let leastUsedKey = '';
    let minHits = Infinity;
    let oldestTimestamp = Infinity;
    
    for (const [key, entry] of this.cache.entries()) {
      // Priorité aux entrées les moins utilisées, puis aux plus anciennes
      if (entry.hits < minHits || (entry.hits === minHits && entry.timestamp < oldestTimestamp)) {
        minHits = entry.hits;
        oldestTimestamp = entry.timestamp;
        leastUsedKey = key;
      }
    }
    
    if (leastUsedKey) {
      this.cache.delete(leastUsedKey);
    }
  }
  
  /**
   * Nettoie les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Statistiques du cache
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{key: string; hits: number; age: number}>;
  } {
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: Date.now() - entry.timestamp
    }));
    
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const hitRate = entries.length > 0 ? totalHits / entries.length : 0;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries: entries.sort((a, b) => b.hits - a.hits)
    };
  }
}

// Instance globale du cache
export const encounterCache = new EncounterCache();

// Nettoyer le cache périodiquement
setInterval(() => {
  encounterCache.cleanup();
}, 60000); // Toutes les minutes

/**
 * Décorateur pour mettre en cache les résultats de méthodes
 */
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = function (...args: any[]) {
      const cacheKey = `${target.constructor.name}.${propertyName}:${JSON.stringify(args)}`;
      
      // Essayer de récupérer depuis le cache
      let result = encounterCache.get(cacheKey);
      
      if (result === null) {
        // Calculer et mettre en cache
        result = method.apply(this, args);
        encounterCache.set(cacheKey, result, ttl);
      }
      
      return result;
    };
  };
}

/**
 * Utilitaires pour la gestion des clés de cache
 */
export class CacheKeys {
  static encounterDifficulty(monsters: Array<{cr: number}>, partyLevel: number, partySize: number): string {
    return `difficulty:${JSON.stringify(monsters)}-${partyLevel}-${partySize}`;
  }
  
  static sortedParticipants(participants: Array<{id: string; initiative: number}>): string {
    return `sorted:${participants.map(p => `${p.id}-${p.initiative}`).join(',')}`;
  }
  
  static participantStats(participantId: string, hp: number, conditions: string[]): string {
    return `stats:${participantId}-${hp}-${conditions.join(',')}`;
  }
  
  static initiativeRoll(participantId: string, dex: number): string {
    return `initiative:${participantId}-${dex}`;
  }
}

/**
 * Gestionnaire de cache spécialisé pour les rencontres
 */
export class EncounterCacheManager {
  private cache: EncounterCache;
  
  constructor(cache: EncounterCache = encounterCache) {
    this.cache = cache;
  }
  
  /**
   * Met en cache la difficulté d'une rencontre
   */
  cacheDifficulty(
    monsters: Array<{cr: number}>, 
    partyLevel: number, 
    partySize: number, 
    difficulty: any
  ): void {
    const key = CacheKeys.encounterDifficulty(monsters, partyLevel, partySize);
    this.cache.set(key, difficulty, 10 * 60 * 1000); // 10 minutes
  }
  
  /**
   * Récupère la difficulté depuis le cache
   */
  getDifficulty(monsters: Array<{cr: number}>, partyLevel: number, partySize: number): any | null {
    const key = CacheKeys.encounterDifficulty(monsters, partyLevel, partySize);
    return this.cache.get(key);
  }
  
  /**
   * Met en cache les participants triés
   */
  cacheSortedParticipants(participants: any[], sorted: any[]): void {
    const key = CacheKeys.sortedParticipants(participants);
    this.cache.set(key, sorted, 2 * 60 * 1000); // 2 minutes
  }
  
  /**
   * Récupère les participants triés depuis le cache
   */
  getSortedParticipants(participants: any[]): any[] | null {
    const key = CacheKeys.sortedParticipants(participants);
    return this.cache.get(key);
  }
  
  /**
   * Invalide le cache pour un participant spécifique
   */
  invalidateParticipant(participantId: string): void {
    const keysToDelete: string[] = [];
    
    for (const [key] of this.cache['cache'].entries()) {
      if (key.includes(participantId)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.cache.delete(key));
  }
  
  /**
   * Invalide tout le cache lié aux rencontres
   */
  invalidateAll(): void {
    this.cache.clear();
  }
}

// Instance globale du gestionnaire
export const encounterCacheManager = new EncounterCacheManager(); 