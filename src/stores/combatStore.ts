/**
 * Combat State Management
 * 
 * Gère:
 * - Les actions résolues calculées dynamiquement
 * - Le rafraîchissement automatique lors des changements d'équipement
 * - Les trackers de ressources (charges, emplacements de sorts)
 * - La logique de repos court/long
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Character } from '../types/character'
import type { ItemV2 } from '../types/aurora-v2'
import type { WildShapeBeast } from '../types/wild-shape'
import type { ResolvedAction } from '../utils/combat-engine'
import { generateResolvedActions } from '../utils/combat-engine'
import { applyCharacterRules } from '../data/apply-character-rules'
import { getMaxUses } from '../utils/feature-helpers'
import { subclasses } from '../data/subclasses'
import { applyWildShape } from '../utils/wild-shape'

// ============================================================================
// TYPES
// ============================================================================

interface CombatLogEntry {
  id: string
  turn: number
  type: 'action' | 'resource' | 'effect' | 'turn'
  label: string
  detail?: string
  timestamp: number
}

interface CombatState {
  // Données du personnage
  character: Character | null
  equippedItems: ItemV2[]

  // Actions calculées
  resolvedActions: ResolvedAction[]
  isCalculating: boolean
  lastCalculationError: string | null

  // Ressources trackées (séparé du character pour mutations rapides)
  trackedResources: Record<string, TrackedResource>

  // UI State
  selectedCategory: ActionCategory
  expandedActionId: string | null

  // Tour de combat
  actionsUsedThisTurn: {
    action: boolean
    bonus: boolean
    reaction: boolean
  }
  turnNumber: number

  // Journal de combat
  combatLog: CombatLogEntry[]

  // Effets actifs toggleables (rage, attaque téméraire, etc.)
  activeEffects: string[]

  // Forme sauvage
  wildShapeBeast: WildShapeBeast | null
}

interface TrackedResource {
  id: string
  name: string
  current: number
  max: number
  resetOn: 'short' | 'long' | 'dawn' | 'never'
  sourceType: 'class' | 'feat' | 'item'
  sourceId: string
}

type ActionCategory = 'all' | 'action' | 'bonus' | 'reaction' | 'limited' | 'other'

interface CombatActions {
  // Initialisation
  initializeCombat: (character: Character, equippedItems: ItemV2[]) => Promise<void>
  
  // Recalcul
  recalculateActions: () => Promise<void>
  
  // Équipement
  equipItem: (item: ItemV2) => void
  unequipItem: (itemId: string) => void
  
  // Ressources
  consumeResource: (resourceId: string, amount?: number) => boolean
  restoreResource: (resourceId: string, amount?: number) => void
  restoreAllResources: (restType: 'short' | 'long') => void
  
  // UI
  setSelectedCategory: (category: ActionCategory) => void
  toggleActionExpansion: (actionId: string) => void
  expandAction: (actionId: string) => void
  collapseAction: () => void
  
  // Tour de combat
  startTurn: () => void
  consumeActionType: (type: 'action' | 'bonus' | 'reaction') => boolean

  // Sync with CharacterContext
  syncResourcesFromCharacter: (character: Character) => void
  syncCharacter: (character: Character) => void

  // Effets actifs
  toggleActiveEffect: (effect: string) => void
  setActiveEffects: (effects: string[]) => void
  clearActiveEffects: () => void

  // Journal de combat
  logAction: (entry: Omit<CombatLogEntry, 'id' | 'timestamp'>) => void
  clearCombatLog: () => void

  // Forme sauvage
  setWildShapeBeast: (beast: WildShapeBeast | null) => void
}

// ============================================================================
// STORE
// ============================================================================

export const useCombatStore = create<CombatState & CombatActions>()(
  persist(
    (set, get) => ({
      // État initial
      character: null,
      equippedItems: [],
      resolvedActions: [],
      isCalculating: false,
      lastCalculationError: null,
      trackedResources: {},
      selectedCategory: 'all',
      expandedActionId: null,
      actionsUsedThisTurn: { action: false, bonus: false, reaction: false },
      turnNumber: 1,
      combatLog: [],
      activeEffects: [],
      wildShapeBeast: null,

      // =========================================================================
      // INITIALISATION
      // =========================================================================

      initializeCombat: async (character, equippedItems) => {
        console.log('[CombatStore] initializeCombat called with', equippedItems.length, 'items')
        set({
          character,
          equippedItems,
          isCalculating: true,
          lastCalculationError: null
        })
        
        try {
          // 1. Appliquer les rules du personnage
          console.log('[CombatStore] Calling applyCharacterRules...')
          const buildResult = await applyCharacterRules(character)
          console.log('[CombatStore] applyCharacterRules result:', buildResult.success, 'errors:', buildResult.errors, 'warnings:', buildResult.warnings)
          
          if (!buildResult.success) {
            console.error('[CombatStore] Build failed:', buildResult.errors)
            set({ 
              lastCalculationError: buildResult.errors.join(', '),
              isCalculating: false 
            })
            return
          }
          
          // 2. Appliquer la forme sauvage si active
          let combatCharacter = buildResult.character
          const wildShapeBeast = get().wildShapeBeast
          if (wildShapeBeast) {
            combatCharacter = applyWildShape(combatCharacter, wildShapeBeast)
          }

          // 3. Générer les actions résolues
          console.log('[CombatStore] Calling generateResolvedActions with', equippedItems.length, 'items')
          const activeEffects = get().activeEffects
          const resolvedActions = await generateResolvedActions(
            combatCharacter,
            equippedItems,
            activeEffects,
            wildShapeBeast
          )
          console.log('[CombatStore] Generated', resolvedActions.length, 'actions')
          
          // 3. Extraire les ressources trackables
          const trackedResources = extractResources(resolvedActions, buildResult.character)
          
          set({
            resolvedActions,
            trackedResources,
            isCalculating: false
          })
          
        } catch (error) {
          console.error('[CombatStore] Error in initializeCombat:', error)
          set({
            lastCalculationError: error instanceof Error ? error.message : 'Erreur de calcul',
            isCalculating: false
          })
        }
      },
      
      // =========================================================================
      // RECALCUL
      // =========================================================================
      
      recalculateActions: async () => {
        const { character, equippedItems } = get()
        if (!character) return
        
        set({ isCalculating: true })
        
        try {
          const buildResult = await applyCharacterRules(character)

          // Appliquer la forme sauvage si active
          let combatCharacter = buildResult.character
          const wildShapeBeast = get().wildShapeBeast
          if (wildShapeBeast) {
            combatCharacter = applyWildShape(combatCharacter, wildShapeBeast)
          }

          const activeEffects = get().activeEffects
          const resolvedActions = await generateResolvedActions(
            combatCharacter,
            equippedItems,
            activeEffects,
            wildShapeBeast
          )
          
          // Fusionner avec les ressources trackées existantes
          const newResources = extractResources(resolvedActions, combatCharacter)
          const existingResources = get().trackedResources
          
          // Préserver l'état des ressources qui existent déjà
          const mergedResources: Record<string, TrackedResource> = {}
          
          Object.entries(newResources).forEach(([id, newResource]) => {
            const existing = existingResources[id]
            if (existing) {
              // Conserver l'état actuel mais mettre à jour le max si nécessaire
              mergedResources[id] = {
                ...newResource,
                current: Math.min(existing.current, newResource.max)
              }
            } else {
              mergedResources[id] = newResource
            }
          })
          
          set({
            resolvedActions,
            trackedResources: mergedResources,
            isCalculating: false
          })
          
        } catch (error) {
          set({
            lastCalculationError: error instanceof Error ? error.message : 'Erreur de recalcul',
            isCalculating: false
          })
        }
      },
      
      // =========================================================================
      // ÉQUIPEMENT
      // =========================================================================
      
      equipItem: (item) => {
        const { equippedItems } = get()
        
        const newEquipped = [...equippedItems, item]
        set({ equippedItems: newEquipped })
        
        get().recalculateActions()
      },
      
      unequipItem: (itemId) => {
        const { equippedItems } = get()
        const newEquipped = equippedItems.filter(i => i.id !== itemId)
        set({ equippedItems: newEquipped })
        
        get().recalculateActions()
      },
      
      // =========================================================================
      // RESSOURCES
      // =========================================================================
      
      consumeResource: (resourceId, amount = 1) => {
        const { trackedResources, character, turnNumber, combatLog } = get()
        const resource = trackedResources[resourceId]

        if (!resource || resource.current < amount) {
          return false  // Pas assez de ressource
        }

        const newResource = {
          ...resource,
          current: resource.current - amount
        }

        set({
          trackedResources: {
            ...trackedResources,
            [resourceId]: newResource
          },
          combatLog: [
            ...combatLog,
            {
              id: Math.random().toString(36).substring(2, 9),
              turn: turnNumber,
              type: 'resource',
              label: resource.name,
              detail: `${newResource.current}/${resource.max} restant${newResource.current > 1 ? 's' : ''}`,
              timestamp: Date.now(),
            },
          ],
        })

        // Mettre à jour aussi dans le character original (local state)
        if (character && resource.sourceType === 'class') {
          const updatedCharacter = {
            ...character,
            classResourcesUsed: {
              ...character.classResourcesUsed,
              [resource.id]: (character.classResourcesUsed?.[resource.id] || resource.max) - amount
            }
          }
          set({ character: updatedCharacter })
        }

        return true
      },
      
      restoreResource: (resourceId, amount = 999) => {
        const { trackedResources } = get()
        const resource = trackedResources[resourceId]
        
        if (!resource) return
        
        const newAmount = Math.min(resource.current + amount, resource.max)
        
        set({
          trackedResources: {
            ...trackedResources,
            [resourceId]: {
              ...resource,
              current: newAmount
            }
          }
        })
      },
      
      restoreAllResources: (restType) => {
        const { trackedResources } = get()
        
        const restored: Record<string, TrackedResource> = {}
        
        Object.entries(trackedResources).forEach(([id, resource]) => {
          // Restaurer si:
          // - Repos court: ressources qui se reset sur short
          // - Repos long: toutes les ressources sauf "never"
          const shouldRestore = 
            restType === 'long' 
              ? resource.resetOn !== 'never'
              : resource.resetOn === 'short'
          
          if (shouldRestore) {
            restored[id] = {
              ...resource,
              current: resource.max
            }
          } else {
            restored[id] = resource
          }
        })
        
        set({ trackedResources: restored })
      },
      
      // =========================================================================
      // UI
      // =========================================================================
      
      setSelectedCategory: (category) => {
        set({ selectedCategory: category })
      },
      
      toggleActionExpansion: (actionId) => {
        const { expandedActionId } = get()
        set({
          expandedActionId: expandedActionId === actionId ? null : actionId
        })
      },
      
      expandAction: (actionId) => {
        set({ expandedActionId: actionId })
      },
      
      collapseAction: () => {
        set({ expandedActionId: null })
      },
      
      // =========================================================================
      // TOUR DE COMBAT
      // =========================================================================
      
      startTurn: () => {
        const { turnNumber, combatLog } = get()
        const newTurn = turnNumber + 1
        set({
          actionsUsedThisTurn: { action: false, bonus: false, reaction: false },
          turnNumber: newTurn,
          combatLog: [
            ...combatLog,
            {
              id: Math.random().toString(36).substring(2, 9),
              turn: newTurn,
              type: 'turn',
              label: `Tour ${newTurn}`,
              timestamp: Date.now(),
            },
          ],
        })
      },

      consumeActionType: (type) => {
        const { actionsUsedThisTurn, turnNumber, combatLog } = get()
        if (actionsUsedThisTurn[type]) {
          return false // Déjà utilisé ce tour
        }
        const labels = { action: 'Action', bonus: 'Action bonus', reaction: 'Réaction' }
        set({
          actionsUsedThisTurn: {
            ...actionsUsedThisTurn,
            [type]: true
          },
          combatLog: [
            ...combatLog,
            {
              id: Math.random().toString(36).substring(2, 9),
              turn: turnNumber,
              type: 'action',
              label: labels[type],
              timestamp: Date.now(),
            },
          ],
        })
        return true
      },
      
      // =========================================================================
      // SYNC WITH CHARACTER CONTEXT
      // =========================================================================
      
      syncResourcesFromCharacter: (character) => {
        const { trackedResources } = get()
        const classId = character.class?.id || ''
        const level = character.level
        const used = character.classResourcesUsed || {}

        // Ressources par classe (base)
        const CLASS_RESOURCES: Record<string, string[]> = {
          barbarian: ['rages'],
          monk: ['ki'],
          cleric: ['channelDivinity'],
          druid: ['wildShape'],
          fighter: ['secondWind', 'actionSurge', 'indomitable'],
          paladin: ['layOnHands', 'divineSmite'],
          ranger: ['favoredEnemy'],
          rogue: [],
          sorcerer: ['sorceryPoints'],
          warlock: ['eldritchInvocations'],
          wizard: ['arcaneRecovery'],
          bard: ['bardicInspiration'],
        }

        const allowedKeys = CLASS_RESOURCES[classId] || []

        // Conserver toutes les ressources existantes (sous-classes, items, etc.)
        const synced: Record<string, TrackedResource> = { ...trackedResources }

        const resourceDefs: Array<{ key: string; name: string; resetOn: TrackedResource['resetOn'] }> = [
          { key: 'rages', name: 'Rages', resetOn: 'long' },
          { key: 'ki', name: 'Points de Ki', resetOn: 'short' },
          { key: 'channelDivinity', name: 'Canal divin', resetOn: 'short' },
          { key: 'sorceryPoints', name: 'Points de sorcellerie', resetOn: 'long' },
          { key: 'secondWind', name: 'Second souffle', resetOn: 'short' },
          { key: 'actionSurge', name: 'Fougue', resetOn: 'short' },
          { key: 'indomitable', name: 'Indomptable', resetOn: 'long' },
          { key: 'wildShape', name: 'Forme sauvage', resetOn: 'short' },
          { key: 'arcaneRecovery', name: 'Récupération arcanique', resetOn: 'long' },
          { key: 'bardicInspiration', name: 'Inspiration bardique', resetOn: 'short' },
          { key: 'layOnHands', name: 'Imposition des mains', resetOn: 'long' },
          { key: 'divineSmite', name: 'Châtiment divin', resetOn: 'long' },
          { key: 'eldritchInvocations', name: 'Invocations occultes', resetOn: 'long' },
          { key: 'favoredEnemy', name: 'Ennemi juré', resetOn: 'long' },
        ]

        for (const def of resourceDefs) {
          if (!allowedKeys.includes(def.key)) continue

          const max = getMaxUses(def.key, level)
          if (max <= 0) continue

          const usedCount = used[def.key] || 0
          const current = Math.max(0, max - usedCount)

          const existing = synced[def.key]

          synced[def.key] = {
            id: def.key,
            name: def.name,
            current: existing ? Math.min(existing.current, max) : current,
            max,
            resetOn: def.resetOn,
            sourceType: 'class',
            sourceId: classId,
          }
        }

        set({ trackedResources: synced })
      },

      syncCharacter: (character) => {
        set({ character })
        get().recalculateActions()
      },

      // =========================================================================
      // EFFETS ACTIFS
      // =========================================================================

      toggleActiveEffect: (effect) => {
        const { activeEffects, combatLog, turnNumber } = get()
        const isActivating = !activeEffects.includes(effect)
        const newEffects = isActivating
          ? [...activeEffects, effect]
          : activeEffects.filter(e => e !== effect)
        set({
          activeEffects: newEffects,
          combatLog: [
            ...combatLog,
            {
              id: Math.random().toString(36).substring(2, 9),
              turn: turnNumber,
              type: 'effect',
              label: isActivating ? `Active ${effect}` : `Désactive ${effect}`,
              timestamp: Date.now(),
            },
          ],
        })
        // Recalculer les actions avec les nouveaux effets
        get().recalculateActions()
      },

      setActiveEffects: (effects) => {
        set({ activeEffects: effects })
        get().recalculateActions()
      },

      clearActiveEffects: () => {
        set({ activeEffects: [] })
        get().recalculateActions()
      },

      logAction: (entry) => {
        const { combatLog } = get()
        set({
          combatLog: [
            ...combatLog,
            {
              ...entry,
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
            },
          ],
        })
      },

      clearCombatLog: () => {
        set({ combatLog: [], turnNumber: 1 })
      },

      setWildShapeBeast: (beast) => {
        set({ wildShapeBeast: beast })
        // Si on choisit une bête, on active automatiquement wild-shape
        if (beast) {
          const { activeEffects } = get()
          if (!activeEffects.includes('wild-shape')) {
            set({ activeEffects: [...activeEffects, 'wild-shape'] })
          }
        } else {
          // Si on désactive, on retire wild-shape
          const { activeEffects } = get()
          set({ activeEffects: activeEffects.filter(e => e !== 'wild-shape') })
        }
        get().recalculateActions()
      },
    }),
    {
      name: 'combat-storage-v2',
      partialize: (state) => ({
        // Ne persister que les ressources trackées
        trackedResources: state.trackedResources
      })
    }
  )
)

// ============================================================================
// HOOKS UTILITAIRES
// ============================================================================

export function useCombatActions(category?: ActionCategory) {
  const { resolvedActions, selectedCategory } = useCombatStore()
  
  const filter = category || selectedCategory
  
  if (filter === 'all') return resolvedActions
  
  return resolvedActions.filter(action => {
    if (filter === 'limited') {
      return action.actionType === 'limited' || 
             (action.resource && action.resource.max > 0)
    }
    return action.actionType === filter
  })
}

export function useResourceTracker(resourceId: string) {
  const { trackedResources, consumeResource, restoreResource } = useCombatStore()
  
  const resource = trackedResources[resourceId]
  
  return {
    resource,
    use: (amount?: number) => consumeResource(resourceId, amount),
    restore: (amount?: number) => restoreResource(resourceId, amount)
  }
}

// ============================================================================
// FONCTIONS UTILITAIRES
// ============================================================================

function extractResources(
  actions: ResolvedAction[],
  character: Character
): Record<string, TrackedResource> {
  const resources: Record<string, TrackedResource> = {}
  
  // Extraire des actions (hors emplacements de sorts, déjà gérés par CharacterContext)
  actions.forEach(action => {
    if (action.resource && action.resource.max > 0 && action.resource.type !== 'slot') {
      const isClassResource = action.source.type === 'class'
      const resourceId = isClassResource ? action.source.id : action.id
      resources[resourceId] = {
        id: resourceId,
        name: action.name,
        current: action.resource.current,
        max: action.resource.max,
        resetOn: action.resource.resetOn,
        sourceType: isClassResource ? 'class' : 'item',
        sourceId: action.source.id
      }
    }
  })

  // Ajouter les ressources de sous-classe (ResourceRule)
  if (character.subclass) {
    const subclass = subclasses.find(s => s.id === character.subclass)
    if (subclass) {
      subclass.features.forEach(feature => {
        if (feature.level > character.level) return
        if (!feature.rules) return
        feature.rules.forEach(rule => {
          if (rule.type === 'resource' && 'progression' in rule) {
            const max = (rule as any).progression[Math.min(character.level, 20) - 1] || 0
            if (max > 0) {
              resources[rule.id] = {
                id: rule.id,
                name: (rule as any).name || rule.id,
                current: max,
                max,
                resetOn: ((rule as any).recovery || 'long') as TrackedResource['resetOn'],
                sourceType: 'class',
                sourceId: subclass.id,
              }
            }
          }
        })
      })
    }
  }

  return resources
}
