/**
 * Hook React pour charger les données Aurora V2
 * Compatible avec le système de données existant
 */

import { useState, useEffect, useCallback } from 'react'
import type { RaceV2, ClassV2 } from '../types/aurora-v2'
import { 
  loadRaces, 
  loadClasses, 
  getRaceById, 
  getClassById,
  getClassFeatures,
  getRacialTraitById,
  auroraIdToOldId,
  oldIdToAuroraId
} from '../data/aurora-loader'

interface UseAuroraDataReturn {
  races: RaceV2[]
  classes: ClassV2[]
  traits: Record<string, any>
  loading: boolean
  error: string | null
  getRace: (id: string) => Promise<RaceV2 | undefined>
  getClass: (id: string) => Promise<ClassV2 | undefined>
  getFeatures: (classId: string, level: number) => Promise<any[]>
  getTrait: (traitId: string) => Promise<any | undefined>
  convertAuroraId: (auroraId: string) => string
  convertOldId: (oldId: string, type?: 'class' | 'race') => string | undefined
}

/**
 * Hook pour charger toutes les données Aurora
 */
export function useAuroraData(): UseAuroraDataReturn {
  const [races, setRaces] = useState<RaceV2[]>([])
  const [classes, setClasses] = useState<ClassV2[]>([])
  const [traits, setTraits] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadData() {
      try {
        setLoading(true)
        
        const [racesData, classesData] = await Promise.all([
          loadRaces(),
          loadClasses()
        ])
        
        if (!mounted) return
        
        setRaces(racesData.races)
        setTraits(racesData.traits)
        setClasses(classesData.classes)
        setError(null)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
        console.error('Error loading Aurora data:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadData()

    return () => {
      mounted = false
    }
  }, [])

  const getRace = useCallback(async (id: string) => {
    // Si les données sont déjà chargées, cherche localement d'abord
    const localRace = races.find(r => r.id === id)
    if (localRace) return localRace
    
    // Sinon charge depuis le loader
    return getRaceById(id)
  }, [races])

  const getClass = useCallback(async (id: string) => {
    const localClass = classes.find(c => c.id === id)
    if (localClass) return localClass
    
    return getClassById(id)
  }, [classes])

  const getFeatures = useCallback(async (classId: string, level: number) => {
    return getClassFeatures(classId, level)
  }, [])

  const getTrait = useCallback(async (traitId: string) => {
    // Si les traits sont déjà chargés
    if (traits[traitId]) return traits[traitId]
    
    return getRacialTraitById(traitId)
  }, [traits])

  const convertAuroraId = useCallback((auroraId: string) => {
    return auroraIdToOldId(auroraId)
  }, [])

  const convertOldId = useCallback((oldId: string, type: 'class' | 'race' = 'class') => {
    return oldIdToAuroraId(oldId, type)
  }, [])

  return {
    races,
    classes,
    traits,
    loading,
    error,
    getRace,
    getClass,
    getFeatures,
    getTrait,
    convertAuroraId,
    convertOldId
  }
}

/**
 * Hook pour récupérer les capacités d'un personnage
 * Combine les anciennes et nouvelles données
 */
export function useCharacterFeatures(
  characterClassId: string | undefined,
  level: number,
  subclassId?: string
) {
  const [features, setFeatures] = useState<any[]>([])
  const [subclassFeatures, setSubclassFeatures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getFeatures, getClass, convertOldId } = useAuroraData()

  useEffect(() => {
    if (!characterClassId || level <= 0) {
      setFeatures([])
      setSubclassFeatures([])
      setLoading(false)
      return
    }

    async function loadCharacterFeatures() {
      setLoading(true)
      
      if (!characterClassId) {
        setFeatures([])
        setLoading(false)
        return
      }
      
      try {
        // Convertir l'ID si nécessaire (ancien format -> Aurora)
        const auroraId = characterClassId.startsWith('ID_') 
          ? characterClassId 
          : convertOldId(characterClassId, 'class') || characterClassId

        // Charger les capacités de classe
        const classFeatures = await getFeatures(auroraId, level)
        setFeatures(classFeatures)

        // Charger les capacités de sous-classe si applicable
        if (subclassId) {
          const subId = subclassId // Capture in local const
          const characterClass = await getClass(auroraId)
          if (characterClass?.subclasses) {
            const subclass = characterClass.subclasses.find(s => 
              s.id === subId || s.id.toLowerCase().includes(subId.toLowerCase())
            )
            
            if (subclass?.features) {
              const subFeatures: any[] = []
              for (let i = 1; i <= level; i++) {
                const levelFeatures = subclass.features[i]
                if (levelFeatures) {
                  subFeatures.push(...levelFeatures)
                }
              }
              setSubclassFeatures(subFeatures)
            }
          }
        }
      } catch (error) {
        console.error('Error loading character features:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCharacterFeatures()
  }, [characterClassId, level, subclassId, getFeatures, getClass, convertOldId])

  return { features, subclassFeatures, loading }
}

/**
 * Hook pour récupérer les traits raciaux d'un personnage
 */
export function useRacialTraits(
  raceId: string | undefined,
  traitIds: string[] = []
) {
  const [traits, setTraits] = useState<Array<{ id: string; name: string; description: string }>>([])
  const [loading, setLoading] = useState(true)
  const { getTrait, getRace, traits: allTraits, convertOldId } = useAuroraData()

  useEffect(() => {
    if (!raceId) {
      setTraits([])
      setLoading(false)
      return
    }

    async function loadRacialTraits() {
      setLoading(true)
      
      if (!raceId) {
        setTraits([])
        setLoading(false)
        return
      }
      
      try {
        // Convertir l'ID si nécessaire
        const auroraId = raceId.startsWith('ID_')
          ? raceId
          : convertOldId(raceId, 'race') || raceId

        // Récupérer la race
        const race = await getRace(auroraId)
        
        if (!race) {
          // Fallback : essayer avec les traits passés directement
          const loadedTraits = await Promise.all(
            traitIds.map(async (traitId) => {
              const trait = await getTrait(traitId)
              if (trait) {
                return {
                  id: traitId,
                  name: trait.name || traitId,
                  description: trait.description || 'Description non disponible'
                }
              }
              return null
            })
          )
          
          setTraits(loadedTraits.filter((t): t is { id: string; name: string; description: string } => t !== null))
          setLoading(false)
          return
        }

        // Récupérer les traits de la race
        const raceTraitIds = race.traits || []
        const loadedTraits = await Promise.all(
          raceTraitIds.map(async (traitId: string) => {
            const trait = allTraits[traitId] || await getTrait(traitId)
            if (trait) {
              return {
                id: traitId,
                name: trait.name,
                description: trait.description
              }
            }
            return null
          })
        )

        setTraits(loadedTraits.filter((t): t is { id: string; name: string; description: string } => t !== null))
      } catch (error) {
        console.error('Error loading racial traits:', error)
      } finally {
        setLoading(false)
      }
    }

    loadRacialTraits()
  }, [raceId, traitIds, getTrait, getRace, allTraits, convertOldId])

  return { traits, loading }
}

// ============================================================================
// HOOK POUR CHARGER L'ÉQUIPEMENT
// ============================================================================

export function useEquipment() {
  const [weapons, setWeapons] = useState<any[]>([])
  const [armor, setArmor] = useState<any[]>([])
  const [gear, setGear] = useState<any[]>([])
  const [packs, setPacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const { loadEquipment } = await import('../data/aurora-loader')
        const data = await loadEquipment()
        setWeapons(data.weapons)
        setArmor(data.armor)
        setGear(data.adventuringGear)
        setPacks(data.equipmentPacks)
      } catch (error) {
        console.error('Error loading equipment:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { weapons, armor, gear, packs, loading }
}

// ============================================================================
// HOOK POUR CHARGER LES DONS
// ============================================================================

export function useFeats() {
  const [feats, setFeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const { loadFeats } = await import('../data/aurora-loader')
        const data = await loadFeats()
        setFeats(data.feats)
      } catch (error) {
        console.error('Error loading feats:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { feats, loading }
}

// ============================================================================
// HOOK POUR CHARGER LES BACKGROUNDS
// ============================================================================

export function useBackgrounds() {
  const [backgrounds, setBackgrounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        const { loadBackgrounds } = await import('../data/aurora-loader')
        const data = await loadBackgrounds()
        setBackgrounds(data.backgrounds)
      } catch (error) {
        console.error('Error loading backgrounds:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  return { backgrounds, loading }
}
