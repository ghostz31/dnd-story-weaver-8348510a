/**
 * Fiche de Combat Unifiée
 *
 * Page unique fusionnant : combat, capacités, traits, dons, ressources,
 * conditions et épuisement. Tout ce dont le joueur a besoin pendant une session.
 */

import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronLeftIcon,
  BoltIcon,
  ShieldCheckIcon,
  StarIcon,
  SparklesIcon,
  FireIcon,
  ArrowPathIcon,
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  BookOpenIcon,
  HeartIcon,
} from '@heroicons/react/24/solid'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'
import { useCharacter } from '../contexts/CharacterContext'
import { useCombatStore } from '../stores/combatStore'
import { calculateInitiative, getProficiencyBonus } from '../utils/rules-engine'
import { formatAttackBonus, calculateACFromInventory, type ResolvedAction } from '../utils/combat-engine'
import { useCharacterFeatures, useRacialTraits } from '../hooks/useAuroraData'
import { getClassActions, type ClassAction } from '../data/classFeatures'
import { getFeatById } from '../data/feats'
import { racialTraitDetails } from '../data/races'
import { SectionTabs } from '../components/ui'
import { Dialog, DialogFooter } from '../components/ui/Dialog'
import { DiceRollButton } from '../components/DiceRollButton'
import { DiceHistoryPanel } from '../components/DiceHistoryPanel'
import { CombatLogPanel } from '../components/CombatLogPanel'
import { ConditionBadge } from '../components/combat/ConditionBadge'
import { ExhaustionDisplay } from '../components/combat/ExhaustionDisplay'
import { ManualAttacksSection } from '../components/combat/ManualAttacksSection'
import { ClassResourcePill } from '../components/combat/ClassResourcePill'
import { ActiveEffectToggle } from '../components/combat/ActiveEffectToggle'
import { FeatTogglesBar } from '../components/combat/FeatTogglesBar'
import { WildShapeModal } from '../components/combat/WildShapeModal'
import {
  normalizeClassId,
  normalizeRaceId,
  categorizeFeature,
  formatResourceMax,
} from '../utils/feature-helpers'
import { getEquippedItemsAsItemV2 } from '../utils/inventory-adapter'
import { storedCharacterToCombatCharacter } from '../utils/character-adapter'
import {
  getConditionIcon,
  getConditionDescription,
  getAllConditions,
} from '../utils/conditions-engine'
import { useSettings } from '../hooks/useSettings'

// ============================================================================
// TYPES
// ============================================================================

type ViewMode = 'combat' | 'features' | 'all'
type FeatureCategory = 'all' | 'actions' | 'bonus' | 'reactions' | 'passives' | 'traits' | 'feats'

const CATEGORIZE_MAP: Record<string, FeatureCategory> = {
  action: 'actions',
  bonus: 'bonus',
  reaction: 'reactions',
  passive: 'passives',
}

function categorizeFeatureForPage(name: string): FeatureCategory {
  return CATEGORIZE_MAP[categorizeFeature(name)] || 'passives'
}

// ============================================================================
// PAGE PRINCIPALE
// ============================================================================

export function CombatSheetPage() {
  const { character, updateConditions, getModifier, getSavingThrowBonus, getSpellSlotsForLevel } = useCharacter()
  const { settings } = useSettings()
  const beginnerMode = settings.beginnerMode
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [featureCategory, setFeatureCategory] = useState<FeatureCategory>('all')
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [showWildShapeModal, setShowWildShapeModal] = useState(false)

  // Combat state
  const {
    resolvedActions,
    isCalculating,
    trackedResources,
    consumeResource,
    restoreResource,
    actionsUsedThisTurn,
    startTurn,
    consumeActionType,
    activeEffects,
    toggleActiveEffect,
    wildShapeBeast,
    setWildShapeBeast,
  } = useCombatStore()
  
  // Active conditions
  const activeConditions = character?.activeConditions || []

  
  // Features data
  const normalizedClassId = normalizeClassId(character?.characterClass?.id)
  const normalizedRaceId = normalizeRaceId(character?.race?.id)
  
  const { features: auroraFeatures, subclassFeatures: auroraSubclassFeatures } = useCharacterFeatures(
    character?.characterClass?.id,
    character?.level || 0,
    character?.subclass
  )
  
  const { traits: auroraTraits } = useRacialTraits(
    character?.race?.id,
    character?.race?.traits || []
  )
  
  // Initialize combat store with character and equipped inventory items
  const { initializeCombat, syncResourcesFromCharacter } = useCombatStore()
  
  useEffect(() => {
    if (!character) return
    
    const inventory = character.inventory?.items || []
    console.log('[CombatPage] Character:', character.name, 'Inventory items:', inventory.length, 'Equipped:', inventory.filter(i => i.equipped).map(i => i.name))
    
    // Async IIFE because useEffect callback cannot be async directly
    ;(async () => {
      const equippedItemsV2 = await getEquippedItemsAsItemV2(inventory)
      console.log('[CombatPage] Equipped as ItemV2:', equippedItemsV2.length, equippedItemsV2.map(i => i.name))
      
      const characterForCombat = storedCharacterToCombatCharacter(character)
      
      console.log('[CombatPage] Calling initializeCombat with class:', characterForCombat.class?.id, 'level:', characterForCombat.level)
      
      // initializeCombat is async and handles trackedResources internally
      // syncResourcesFromCharacter must run AFTER initializeCombat completes
      initializeCombat(characterForCombat, equippedItemsV2).then(() => {
        console.log('[CombatPage] initializeCombat completed, syncing resources')
        syncResourcesFromCharacter(characterForCombat)
      })
    })()
  }, [
    character?.id,
    character?.level,
    character?.inventory?.items?.map(i => `${i.id}:${i.equipped}:${i.attuned}`).join(','),
    JSON.stringify(character?.featToggles),
  ])
  
  // Calculated values
  const inventoryItems = character?.inventory?.items || []
  const baseAc = character ? calculateACFromInventory(character as any, inventoryItems) : 10
  const baseInitiative = character ? calculateInitiative(character as any) : 0
  const proficiencyBonus = character ? getProficiencyBonus(character.level) : 2

  // Spellcasting (pour la section Sorts sur fiche combat)
  const spellcastingAbility = character?.characterClass?.spellcasting?.ability || 'int'
  const spellcastingMod = character ? getModifier(spellcastingAbility) : 0
  const spellSaveDC = 8 + proficiencyBonus + spellcastingMod
  const spellAttackBonus = proficiencyBonus + spellcastingMod
  const isSpellcasterClass = !!character?.characterClass?.spellcasting
  const maxSpellLevel = character?.characterClass?.spellcasting
    ? (character.characterClass.spellcasting.spellSlots?.[(character.level - 1)] || []).length
    : 0

  // Emplacements de sorts disponibles (pour affichage dans Châtiment divin)
  const spellSlotSummary = useMemo(() => {
    if (!isSpellcasterClass || maxSpellLevel === 0) return []
    return Array.from({ length: maxSpellLevel }, (_, i) => {
      const level = i + 1
      const { used, max } = getSpellSlotsForLevel(level)
      return { level, available: max - used, max }
    }).filter(s => s.max > 0)
  }, [isSpellcasterClass, maxSpellLevel, getSpellSlotsForLevel])

  // Overrides en forme sauvage
  const displayAc = wildShapeBeast ? wildShapeBeast.ac : baseAc
  const displayInitiative = wildShapeBeast
    ? Math.floor((wildShapeBeast.abilityScores.dex - 10) / 2)
    : baseInitiative
  const displaySpeed = wildShapeBeast ? wildShapeBeast.speed.walk : (character?.race?.speed || 30)
  
  // Mapping style de combat pour affichage
  const FIGHTING_STYLE_LABELS: Record<string, { name: string; description: string }> = {
    'id_fighting_style_archery': { name: 'Style de combat : Archerie', description: '+2 aux jets d\'attaque avec des armes à distance.' },
    'id_fighting_style_defense': { name: 'Style de combat : Défense', description: '+1 à la CA si vous portez une armure.' },
    'id_fighting_style_dueling': { name: 'Style de combat : Duel', description: '+2 aux dégâts si vous tenez une arme à une main et aucune autre arme.' },
    'id_fighting_style_great_weapon': { name: 'Style de combat : Combat à deux mains', description: 'Relancez les 1 et 2 sur les dés de dégâts des armes à deux mains.' },
    'id_fighting_style_protection': { name: 'Style de combat : Protection', description: 'Imposez un désavantage à une attaque contre un allié proche si vous avez un bouclier.' },
    'id_fighting_style_two_weapon': { name: 'Style de combat : Combat à deux armes', description: 'Ajoutez votre modificateur de caractéristique aux dégâts de la seconde attaque.' },
    'id_fighting_style_thrown_weapon': { name: 'Style de combat : Armes de jet', description: '+2 aux dégâts avec les armes de jet.' },
    'id_fighting_style_interception': { name: 'Style de combat : Interception', description: 'Réduisez les dégâts subis par un allié de 1d10 + bonus de maîtrise (réaction, bouclier requis).' },
    'archery': { name: 'Style de combat : Archerie', description: '+2 aux jets d\'attaque avec des armes à distance.' },
    'defense': { name: 'Style de combat : Défense', description: '+1 à la CA si vous portez une armure.' },
    'dueling': { name: 'Style de combat : Duel', description: '+2 aux dégâts si vous tenez une arme à une main et aucune autre arme.' },
    'great-weapon-fighting': { name: 'Style de combat : Combat à deux mains', description: 'Relancez les 1 et 2 sur les dés de dégâts des armes à deux mains.' },
    'protection': { name: 'Style de combat : Protection', description: 'Imposez un désavantage à une attaque contre un allié proche si vous avez un bouclier.' },
    'two-weapon-fighting': { name: 'Style de combat : Combat à deux armes', description: 'Ajoutez votre modificateur de caractéristique aux dégâts de la seconde attaque.' },
    'thrown-weapon-fighting': { name: 'Style de combat : Armes de jet', description: '+2 aux dégâts avec les armes de jet.' },
    'interception': { name: 'Style de combat : Interception', description: 'Réduisez les dégâts subis par un allié de 1d10 + bonus de maîtrise (réaction, bouclier requis).' },
  }

  // Organiser les capacités par catégorie
  const organizedFeatures = useMemo(() => {
    if (!character) return { actions: [], bonus: [], reactions: [], passives: [], traits: [], feats: [] }

    const features = {
      actions: [] as Array<{ name: string; description: string; level: number; uses?: ClassAction }>,
      bonus: [] as Array<{ name: string; description: string; level: number; uses?: ClassAction }>,
      reactions: [] as Array<{ name: string; description: string; level: number; uses?: ClassAction }>,
      passives: [] as Array<{ name: string; description: string; level: number; uses?: ClassAction }>,
      traits: [] as Array<{ name: string; description: string; source: string }>,
      feats: [] as Array<{ name: string; description: string; prerequisite?: string }>
    }

    // Class features (base + subclass)
    const classFeatures = collectClassFeatures(character, normalizedClassId, auroraFeatures, auroraSubclassFeatures)
    classFeatures.forEach(f => {
      const category = categorizeFeatureForPage(f.name)
      ;(features as any)[category].push(f)
    })

    // Fighting style
    const fsId = character.classOptions?.fightingStyle?.toLowerCase()
    if (fsId && FIGHTING_STYLE_LABELS[fsId]) {
      const fs = FIGHTING_STYLE_LABELS[fsId]
      features.passives.push({
        name: fs.name,
        description: fs.description,
        level: 0,
      })
    }

    // Racial traits
    const traits = collectRacialTraits(character, normalizedRaceId, auroraTraits)
    features.traits = traits

    // Feats
    const feats = (character.feats || []).map(featId => {
      const feat = getFeatById(featId)
      if (!feat) return null
      return {
        name: feat.name,
        description: feat.description,
        prerequisite: feat.prerequisite
      }
    }).filter(f => f !== null) as typeof features.feats
    features.feats = feats

    return features
  }, [character, normalizedClassId, normalizedRaceId, auroraFeatures, auroraSubclassFeatures, auroraTraits])
  
  // Filtrer les actions de combat
  const combatActions = useMemo(() => {
    return resolvedActions.filter(a => 
      a.actionType === 'action' || 
      a.actionType === 'bonus' || 
      a.actionType === 'reaction'
    )
  }, [resolvedActions])
  
  // Actions limitées avec ressources
  const limitedActions = useMemo(() => {
    return resolvedActions.filter(a => 
      a.actionType === 'limited' || 
      (a.resource && a.resource.max > 0)
    )
  }, [resolvedActions])
  
  if (!character) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center px-4">
        <p className="text-muted-foreground mb-4">Sélectionnez d'abord un personnage</p>
        <Link to="/" className="btn btn-primary">Retour à l'accueil</Link>
      </div>
    )
  }
  
  const tabs = [
    { id: 'all', label: 'Vue Globale', icon: StarIcon },
    { id: 'combat', label: 'Combat', icon: FireIcon },
    { id: 'features', label: 'Capacités', icon: SparklesIcon },
  ]
  
  return (
    <div className="flex flex-col gap-4 pb-8 animate-fade-in">
      {/* Header */}
      <header className="px-4 pt-4">
        <div className="flex items-center gap-3 mb-4">
          <Link
            to={`/character/${character.id}`}
            className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeftIcon className="w-6 h-6 text-muted-foreground" />
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-xl md:text-2xl font-cinzel flex items-center gap-2">
              <BoltIcon className="w-6 h-6 text-magic" />
              Fiche de Combat
            </h1>
            <p className="text-sm text-muted-foreground">
              {character.name} • Niv. {character.level} • {character.characterClass?.name}
            </p>
          </div>
        </div>

        {/* Indicateur forme sauvage */}
        {wildShapeBeast && (
          <div className="mb-3 p-3 rounded-lg bg-hp-high/15 border border-hp-high/30 flex items-center gap-3">
            <span className="text-2xl">🐺</span>
            <div className="flex-1">
              <p className="font-bold text-sm text-hp-high">Forme sauvage active</p>
              <p className="text-xs text-muted-foreground">
                {wildShapeBeast.name} • {wildShapeBeast.hp} PV • CA {wildShapeBeast.ac} • {displaySpeed} m
              </p>
            </div>
            <button
              onClick={() => setWildShapeBeast(null)}
              className="text-xs px-2 py-1 rounded bg-hp-high/20 text-hp-high hover:bg-hp-high/30 transition-colors"
            >
              Annuler
            </button>
          </div>
        )}

        {/* Stats de combat rapides */}
        <div className="grid grid-cols-4 gap-2">
          <QuickStat
            icon={ShieldCheckIcon}
            label="CA"
            value={displayAc}
            color="text-ac"
          />
          <QuickStat
            icon={BoltIcon}
            label="Init"
            value={displayInitiative >= 0 ? `+${displayInitiative}` : displayInitiative}
            color="text-magic"
          />
          <QuickStat
            icon={StarIcon}
            label="Bonus"
            value={`+${proficiencyBonus}`}
            color="text-magic"
          />
          {normalizedClassId === 'fighter' && character.level >= 5 && (
            <QuickStat
              icon={BoltIcon}
              label="Attaques"
              value={character.level >= 20 ? '4' : character.level >= 11 ? '3' : '2'}
              color="text-hp-crit"
            />
          )}
          {normalizedClassId === 'fighter' && character.subclass === 'champion' && (
            <QuickStat
              icon={SparklesIcon}
              label="Critique"
              value={character.level >= 15 ? '18+' : character.level >= 3 ? '19+' : '20'}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'ranger' && character.level >= 1 && (
            <QuickStat
              icon={StarIcon}
              label="Ennemis"
              value={character.level >= 14 ? '3' : character.level >= 6 ? '2' : '1'}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'ranger' && character.level >= 5 && (
            <QuickStat
              icon={BoltIcon}
              label="Attaques"
              value="2"
              color="text-hp-crit"
            />
          )}
          {normalizedClassId === 'ranger' && character.level >= 20 && (
            <QuickStat
              icon={SparklesIcon}
              label="Tueur"
              value="+SAG"
              color="text-magic"
            />
          )}
          {normalizedClassId === 'druid' && character.level >= 2 && (
            <QuickStat
              icon={MoonIcon}
              label="Forme"
              value={character.level >= 20 ? '∞' : '2'}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'druid' && character.level >= 2 && (
            <QuickStat
              icon={StarIcon}
              label="FP max"
              value={character.level >= 8 ? '1' : character.level >= 4 ? '½' : '¼'}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'monk' && character.level >= 2 && (
            <QuickStat
              icon={SunIcon}
              label="Ki"
              value={String(character.level)}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'monk' && character.level >= 2 && (
            <QuickStat
              icon={BoltIcon}
              label="Mvt"
              value={`+${Math.floor((character.level >= 18 ? 9 : character.level >= 14 ? 7.5 : character.level >= 10 ? 6 : character.level >= 6 ? 4.5 : 3))}m`}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'monk' && character.level >= 1 && (
            <QuickStat
              icon={FireIcon}
              label="Arts"
              value={character.level >= 17 ? 'd10' : character.level >= 11 ? 'd8' : character.level >= 5 ? 'd6' : 'd4'}
              color="text-hp-crit"
            />
          )}
          {normalizedClassId === 'wizard' && character.level >= 1 && (
            <QuickStat
              icon={SparklesIcon}
              label="Recup"
              value={`+${Math.ceil(character.level / 2)}`}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'wizard' && character.level >= 1 && (
            <QuickStat
              icon={BookOpenIcon}
              label="Prep"
              value={`${character.level + Math.max(-5, Math.floor((character.abilityScores?.int || 10) - 10) / 2)}`}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'bard' && character.level >= 1 && (
            <QuickStat
              icon={MusicalNoteIcon}
              label="Inspi"
              value={character.level >= 15 ? 'd12' : character.level >= 10 ? 'd10' : character.level >= 5 ? 'd8' : 'd6'}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'bard' && character.level >= 1 && (
            <QuickStat
              icon={HeartIcon}
              label="Chant"
              value={character.level >= 17 ? 'd12' : character.level >= 13 ? 'd10' : character.level >= 9 ? 'd8' : 'd6'}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'sorcerer' && character.level >= 2 && (
            <QuickStat
              icon={SparklesIcon}
              label="Sorc"
              value={`${character.level}`}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'sorcerer' && character.level >= 2 && (
            <QuickStat
              icon={StarIcon}
              label="Méta"
              value={character.level >= 17 ? '4' : character.level >= 10 ? '3' : '2'}
              color="text-hp-crit"
            />
          )}
          {normalizedClassId === 'warlock' && character.level >= 1 && (
            <QuickStat
              icon={SparklesIcon}
              label="Niv"
              value={`${character.level >= 9 ? 5 : character.level >= 5 ? 3 : character.level >= 3 ? 2 : 1}`}
              color="text-magic"
            />
          )}
          {normalizedClassId === 'warlock' && character.level >= 1 && (
            <QuickStat
              icon={BookOpenIcon}
              label="Empl"
              value={`${character.level >= 17 ? 4 : character.level >= 11 ? 3 : character.level >= 2 ? 2 : 1}`}
              color="text-hp-high"
            />
          )}
          {normalizedClassId === 'warlock' && character.level >= 2 && (
            <QuickStat
              icon={StarIcon}
              label="Invo"
              value={character.level >= 18 ? 8 : character.level >= 15 ? 7 : character.level >= 12 ? 6 : character.level >= 9 ? 5 : character.level >= 7 ? 4 : character.level >= 5 ? 3 : 2}
              color="text-hp-crit"
            />
          )}
        </div>

        {/* Jets de sauvegarde + Sorts — visibles en permanence sur fiche combat */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Sauvegardes */}
          <div className="card p-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3.5 h-3.5" />
              Jets de sauvegarde
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {(['str', 'dex', 'con', 'int', 'wis', 'cha'] as const).map((ability) => {
                const labels: Record<string, string> = { str: 'FOR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'SAG', cha: 'CHA' }
                const bonus = character ? getSavingThrowBonus(ability) : 0
                return (
                  <div key={ability} className="flex items-center justify-between bg-muted/40 rounded-lg px-2.5 py-1.5 gap-1">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">{labels[ability]}</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${bonus >= 0 ? 'text-hp-high' : 'text-hp'}`}>
                        {bonus >= 0 ? `+${bonus}` : bonus}
                      </span>
                      <DiceRollButton
                        label={`JS ${labels[ability]}`}
                        count={1}
                        sides={20}
                        modifier={bonus}
                        size="sm"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Sorts rapides */}
          {isSpellcasterClass && (
            <div className="card p-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                <SparklesIcon className="w-3.5 h-3.5" />
                Incantation
              </h3>
              <div className="grid grid-cols-3 gap-2 mb-2">
                <div className="text-center bg-muted/40 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] block text-muted-foreground">DD</span>
                  <span className="text-sm font-bold text-magic">{spellSaveDC}</span>
                  <DiceRollButton label="DD Sort" count={1} sides={20} modifier={spellSaveDC - 8} size="sm" />
                </div>
                <div className="text-center bg-muted/40 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] block text-muted-foreground">Attaque</span>
                  <span className="text-sm font-bold text-magic">+{spellAttackBonus}</span>
                  <DiceRollButton label="Attaque sort" count={1} sides={20} modifier={spellAttackBonus} size="sm" />
                </div>
                <div className="text-center bg-muted/40 rounded-lg px-2 py-1.5">
                  <span className="text-[10px] block text-muted-foreground">Carac</span>
                  <span className="text-sm font-bold text-magic">{spellcastingAbility.toUpperCase()}</span>
                </div>
              </div>
              {maxSpellLevel > 0 && (
                <div className="flex flex-wrap gap-1">
                  {Array.from({ length: maxSpellLevel }, (_, i) => i + 1).map((level) => {
                    const { used, max } = getSpellSlotsForLevel(level)
                    const available = max - used
                    return (
                      <div
                        key={level}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                          available === 0 ? 'bg-muted text-muted-foreground/40' : 'bg-magic/10 text-magic'
                        }`}
                        title={`Niveau ${level} : ${available}/${max} restant${available > 1 ? 's' : ''}`}
                      >
                        <span className="font-bold">{level}</span>
                        <span>{available}/{max}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toggles de dons actifs — masqué en mode débutant */}
        {!beginnerMode && <FeatTogglesBar character={character} />}

        {/* Ressources de classe (ignore les ressources illimitées max >= 999) */}
        {Object.values(trackedResources).filter(r => r.max > 0 && r.max < 999).length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.values(trackedResources)
              .filter(r => r.max > 0 && r.max < 999)
              .map(resource => (
                <ClassResourcePill
                  key={resource.id}
                  resource={resource}
                  onUse={() => consumeResource(resource.id, 1)}
                  onRestore={() => restoreResource(resource.id, 1)}
                />
              ))}
          </div>
        )}

        {/* Actions du tour */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Tour:</span>
          <button
            onClick={startTurn}
            className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Nouveau tour
          </button>
          <div className="flex gap-1.5 ml-2">
            {(['action', 'bonus', 'reaction'] as const).map(type => {
              const used = actionsUsedThisTurn[type]
              const labels = { action: 'Action', bonus: 'Bonus', reaction: 'Réaction' }
              const colors = { action: 'bg-hp-crit', bonus: 'bg-magic', reaction: 'bg-ac' }
              return (
                <div
                  key={type}
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium transition-colors ${
                    used ? 'bg-muted text-muted-foreground line-through' : 'bg-primary/10 text-primary'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${used ? 'bg-muted-foreground/50' : colors[type]}`} />
                  {labels[type]}
                </div>
              )
            })}
          </div>
        </div>

        {/* Conditions actives */}
        {activeConditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeConditions.map(cond => (
              <ConditionBadge
                key={cond}
                condition={cond}
                onRemove={() => {
                  const newConditions = activeConditions.filter(c => c !== cond)
                  updateConditions(newConditions)
                }}
              />
            ))}
            {!beginnerMode && (
              <button
                onClick={() => setShowConditionPicker(true)}
                className="text-xs px-2 py-1 rounded-full border border-dashed border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                + Ajouter
              </button>
            )}
          </div>
        )}

        {/* Effets actifs toggleables — masqués en mode débutant */}
        {!beginnerMode && normalizedClassId === 'barbarian' && (
          <div className="flex flex-wrap gap-2 mt-3">
            <ActiveEffectToggle
              label="Rage"
              active={activeEffects.includes('rage')}
              onToggle={() => toggleActiveEffect('rage')}
              color="bg-rage"
            />
            {character.level >= 2 && (
              <ActiveEffectToggle
                label="Attaque téméraire"
                active={activeEffects.includes('reckless-attack')}
                onToggle={() => toggleActiveEffect('reckless-attack')}
                color="bg-destructive"
              />
            )}
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'rogue' && (
          <div className="flex flex-wrap gap-2 mt-3">
            <ActiveEffectToggle
              label="Attaque sournoise"
              active={activeEffects.includes('sneak-attack')}
              onToggle={() => toggleActiveEffect('sneak-attack')}
              color="bg-hp-crit"
            />
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'ranger' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'gloom_stalker' && (
              <ActiveEffectToggle
                label="Embuscade redoutable"
                active={activeEffects.includes('dread-ambusher')}
                onToggle={() => toggleActiveEffect('dread-ambusher')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'horizon_walker' && (
              <ActiveEffectToggle
                label="Guerrier planaire"
                active={activeEffects.includes('planar-warrior')}
                onToggle={() => toggleActiveEffect('planar-warrior')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'monster_slayer' && (
              <ActiveEffectToggle
                label="Proie du pourfendeur"
                active={activeEffects.includes('slayers-prey')}
                onToggle={() => toggleActiveEffect('slayers-prey')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'fey_wanderer' && (
              <ActiveEffectToggle
                label="Frappes redoutables"
                active={activeEffects.includes('dreadful-strikes')}
                onToggle={() => toggleActiveEffect('dreadful-strikes')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'swarmkeeper' && (
              <ActiveEffectToggle
                label="Essaim rassemblé"
                active={activeEffects.includes('gathered-swarm')}
                onToggle={() => toggleActiveEffect('gathered-swarm')}
                color="bg-hp-high"
              />
            )}
            {character.level >= 20 && (
              <ActiveEffectToggle
                label="Tueur d'ennemis"
                active={activeEffects.includes('foe-slayer')}
                onToggle={() => toggleActiveEffect('foe-slayer')}
                color="bg-destructive"
              />
            )}
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'druid' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.level >= 2 && (
              <ActiveEffectToggle
                label={wildShapeBeast ? `Forme: ${wildShapeBeast.name}` : 'Forme sauvage'}
                active={!!wildShapeBeast}
                onToggle={() => {
                  if (wildShapeBeast) {
                    setWildShapeBeast(null)
                  } else {
                    setShowWildShapeModal(true)
                  }
                }}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'spores' && (
              <ActiveEffectToggle
                label="Entité symbiotique"
                active={activeEffects.includes('symbiotic-entity')}
                onToggle={() => toggleActiveEffect('symbiotic-entity')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'stars' && (
              <ActiveEffectToggle
                label="Forme stellaire"
                active={activeEffects.includes('starry-form')}
                onToggle={() => toggleActiveEffect('starry-form')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'wildfire' && (
              <ActiveEffectToggle
                label="Esprit des flammes"
                active={activeEffects.includes('wildfire-spirit')}
                onToggle={() => toggleActiveEffect('wildfire-spirit')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'shepherd' && character.level >= 2 && (
              <ActiveEffectToggle
                label="Totem spirituel"
                active={activeEffects.includes('spirit-totem')}
                onToggle={() => toggleActiveEffect('spirit-totem')}
                color="bg-hp-high"
              />
            )}
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'monk' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'shadow' && (
              <ActiveEffectToggle
                label="Pas d'ombre"
                active={activeEffects.includes('shadow-step')}
                onToggle={() => toggleActiveEffect('shadow-step')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'shadow' && (
              <ActiveEffectToggle
                label="Manteau d'ombres"
                active={activeEffects.includes('cloak-of-shadows')}
                onToggle={() => toggleActiveEffect('cloak-of-shadows')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'sun_soul' && (
              <ActiveEffectToggle
                label="Rayon solaire"
                active={activeEffects.includes('radiant-sun-bolt')}
                onToggle={() => toggleActiveEffect('radiant-sun-bolt')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'astral_self' && (
              <ActiveEffectToggle
                label="Être astral"
                active={activeEffects.includes('arms-of-the-astral-self')}
                onToggle={() => toggleActiveEffect('arms-of-the-astral-self')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'kensei' && (
              <ActiveEffectToggle
                label="Frappe habile"
                active={activeEffects.includes('deft-strike')}
                onToggle={() => toggleActiveEffect('deft-strike')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'mercy' && (
              <ActiveEffectToggle
                label="Mains blessantes"
                active={activeEffects.includes('hand-of-harm')}
                onToggle={() => toggleActiveEffect('hand-of-harm')}
                color="bg-destructive"
              />
            )}
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'wizard' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'bladesinging' && (
              <ActiveEffectToggle
                label="Chant de lame"
                active={activeEffects.includes('bladesong')}
                onToggle={() => toggleActiveEffect('bladesong')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'war_magic' && (
              <ActiveEffectToggle
                label="Déviation arcanique"
                active={activeEffects.includes('arcane-deflection')}
                onToggle={() => toggleActiveEffect('arcane-deflection')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'evocation' && (
              <ActiveEffectToggle
                label="Surincantation"
                active={activeEffects.includes('overchannel')}
                onToggle={() => toggleActiveEffect('overchannel')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'necromancy' && (
              <ActiveEffectToggle
                label="Moisson sinistre"
                active={activeEffects.includes('grim-harvest')}
                onToggle={() => toggleActiveEffect('grim-harvest')}
                color="bg-destructive"
              />
            )}
            {character.level >= 18 && (
              <ActiveEffectToggle
                label="Maîtrise des sorts"
                active={activeEffects.includes('spell-mastery')}
                onToggle={() => toggleActiveEffect('spell-mastery')}
                color="bg-hp-high"
              />
            )}
            {character.level >= 20 && (
              <ActiveEffectToggle
                label="Sorts de prédilection"
                active={activeEffects.includes('signature-spells')}
                onToggle={() => toggleActiveEffect('signature-spells')}
                color="bg-magic"
              />
            )}
          </div>
        )}
        {!beginnerMode && normalizedClassId === 'bard' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'glamour' && (
              <ActiveEffectToggle
                label="Manteau d'inspiration"
                active={activeEffects.includes('mantle-of-inspiration')}
                onToggle={() => toggleActiveEffect('mantle-of-inspiration')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'whispers' && (
              <ActiveEffectToggle
                label="Lames psychiques"
                active={activeEffects.includes('psychic-blades')}
                onToggle={() => toggleActiveEffect('psychic-blades')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'swords' && (
              <ActiveEffectToggle
                label="Épanouissement martial"
                active={activeEffects.includes('blade-flourish')}
                onToggle={() => toggleActiveEffect('blade-flourish')}
                color="bg-hp-high"
              />
            )}
            {character.level >= 20 && (
              <ActiveEffectToggle
                label="Inspiration supérieure"
                active={activeEffects.includes('superior-inspiration')}
                onToggle={() => toggleActiveEffect('superior-inspiration')}
                color="bg-hp-crit"
              />
            )}
          </div>
        )}

        {!beginnerMode && normalizedClassId === 'sorcerer' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'draconic' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Ailes de dragon"
                active={activeEffects.includes('dragon-wings')}
                onToggle={() => toggleActiveEffect('dragon-wings')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'draconic' && character.level >= 18 && (
              <ActiveEffectToggle
                label="Présence draconique"
                active={activeEffects.includes('draconic-presence')}
                onToggle={() => toggleActiveEffect('draconic-presence')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'wild_magic' && (
              <ActiveEffectToggle
                label="Marées du chaos"
                active={activeEffects.includes('tides-of-chaos')}
                onToggle={() => toggleActiveEffect('tides-of-chaos')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'wild_magic' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Chaos contrôlé"
                active={activeEffects.includes('controlled-chaos')}
                onToggle={() => toggleActiveEffect('controlled-chaos')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'divine_soul' && (
              <ActiveEffectToggle
                label="Faveur des dieux"
                active={activeEffects.includes('favored-by-the-gods')}
                onToggle={() => toggleActiveEffect('favored-by-the-gods')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'divine_soul' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Ailes surnaturelles"
                active={activeEffects.includes('divine-wings')}
                onToggle={() => toggleActiveEffect('divine-wings')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'shadow_magic' && (
              <ActiveEffectToggle
                label="Force du tombeau"
                active={activeEffects.includes('strength-of-grave')}
                onToggle={() => toggleActiveEffect('strength-of-grave')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'shadow_magic' && character.level >= 18 && (
              <ActiveEffectToggle
                label="Forme d'ombre"
                active={activeEffects.includes('shadow-form')}
                onToggle={() => toggleActiveEffect('shadow-form')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'storm_sorcery' && (
              <ActiveEffectToggle
                label="Magie tempétueuse"
                active={activeEffects.includes('tempestuous-magic')}
                onToggle={() => toggleActiveEffect('tempestuous-magic')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'storm_sorcery' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Fureur de la tempête"
                active={activeEffects.includes('storm-fury')}
                onToggle={() => toggleActiveEffect('storm-fury')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'aberrant_mind' && (
              <ActiveEffectToggle
                label="Parole télépathique"
                active={activeEffects.includes('telepathic-speech')}
                onToggle={() => toggleActiveEffect('telepathic-speech')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'aberrant_mind' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Révélation de la chair"
                active={activeEffects.includes('revelation-in-flesh')}
                onToggle={() => toggleActiveEffect('revelation-in-flesh')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'clockwork_soul' && (
              <ActiveEffectToggle
                label="Rétablir l'équilibre"
                active={activeEffects.includes('restore-balance')}
                onToggle={() => toggleActiveEffect('restore-balance')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'clockwork_soul' && character.level >= 14 && (
              <ActiveEffectToggle
                label="Transe de l'ordre"
                active={activeEffects.includes('trance-of-order')}
                onToggle={() => toggleActiveEffect('trance-of-order')}
                color="bg-magic"
              />
            )}
          </div>
        )}

        {!beginnerMode && normalizedClassId === 'warlock' && (
          <div className="flex flex-wrap gap-2 mt-3">
            {character.subclass === 'fiend' && (
              <ActiveEffectToggle
                label="Bénédiction du Sombre"
                active={activeEffects.includes('dark-ones-blessing')}
                onToggle={() => toggleActiveEffect('dark-ones-blessing')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'fiend' && (
              <ActiveEffectToggle
                label="Chance du Sombre"
                active={activeEffects.includes('dark-ones-own-luck')}
                onToggle={() => toggleActiveEffect('dark-ones-own-luck')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'fiend' && (
              <ActiveEffectToggle
                label="Résilience fiélonne"
                active={activeEffects.includes('fiendish-resilience')}
                onToggle={() => toggleActiveEffect('fiendish-resilience')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'fey' && (
              <ActiveEffectToggle
                label="Présence féerique"
                active={activeEffects.includes('fey-presence')}
                onToggle={() => toggleActiveEffect('fey-presence')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'fey' && (
              <ActiveEffectToggle
                label="Repli brumeux"
                active={activeEffects.includes('misty-escape')}
                onToggle={() => toggleActiveEffect('misty-escape')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'great_old_one' && (
              <ActiveEffectToggle
                label="Protection entropique"
                active={activeEffects.includes('entropic-warding')}
                onToggle={() => toggleActiveEffect('entropic-warding')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'celestial' && (
              <ActiveEffectToggle
                label="Lumière guérisseuse"
                active={activeEffects.includes('healing-light')}
                onToggle={() => toggleActiveEffect('healing-light')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'celestial' && (
              <ActiveEffectToggle
                label="Âme radieuse"
                active={activeEffects.includes('radiant-soul')}
                onToggle={() => toggleActiveEffect('radiant-soul')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'hexblade' && (
              <ActiveEffectToggle
                label="Malédiction du Maître des Lames"
                active={activeEffects.includes('hexblades-curse')}
                onToggle={() => toggleActiveEffect('hexblades-curse')}
                color="bg-destructive"
              />
            )}
            {character.subclass === 'hexblade' && (
              <ActiveEffectToggle
                label="Guerrier maudit"
                active={activeEffects.includes('hex-warrior')}
                onToggle={() => toggleActiveEffect('hex-warrior')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'fathomless' && (
              <ActiveEffectToggle
                label="Tentacule des profondeurs"
                active={activeEffects.includes('tentacle-of-the-deeps')}
                onToggle={() => toggleActiveEffect('tentacle-of-the-deeps')}
                color="bg-magic"
              />
            )}
            {character.subclass === 'fathomless' && (
              <ActiveEffectToggle
                label="Âme océanique"
                active={activeEffects.includes('oceanic-soul')}
                onToggle={() => toggleActiveEffect('oceanic-soul')}
                color="bg-hp-high"
              />
            )}
            {character.subclass === 'genie' && (
              <ActiveEffectToggle
                label="Réceptacle du génie"
                active={activeEffects.includes('genies-vessel')}
                onToggle={() => toggleActiveEffect('genies-vessel')}
                color="bg-hp-crit"
              />
            )}
            {character.subclass === 'genie' && (
              <ActiveEffectToggle
                label="Don élémentaire"
                active={activeEffects.includes('elemental-gift')}
                onToggle={() => toggleActiveEffect('elemental-gift')}
                color="bg-magic"
              />
            )}
          </div>
        )}

        {/* Épuisement — masqué en mode débutant */}
        {!beginnerMode && <ExhaustionDisplay exhaustionLevel={character?.exhaustionLevel ?? 0} />}

        {/* Message mode débutant */}
        {beginnerMode && (
          <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border/50 text-xs text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Mode débutant activé</p>
            <p>Les options avancées (effets actifs, toggles de dons, épuisement) sont masquées. Rendez-vous dans Paramètres pour désactiver ce mode.</p>
          </div>
        )}
      </header>
      
      {/* Navigation des vues */}
      <div className="px-4">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as ViewMode)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                viewMode === tab.id 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* CONTENU PRINCIPAL */}
      <div className="px-4 space-y-4">
        {/* SECTION COMBAT */}
        {(viewMode === 'combat' || viewMode === 'all') && (
          <>
            <CombatSection
              actions={combatActions}
              limitedActions={limitedActions}
              isCalculating={isCalculating}
              onUseAction={(action) => handleUseAction(action, consumeResource, consumeActionType)}
              actionsUsedThisTurn={actionsUsedThisTurn}
            />
            {character.attacks && character.attacks.length > 0 && (
              <ManualAttacksSection
                attacks={character.attacks}
                proficiencyBonus={proficiencyBonus}
                getModifier={getModifier as any}
              />
            )}
          </>
        )}
        
        {/* HISTORIQUE DES LANCERS + JOURNAL DE COMBAT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DiceHistoryPanel />
          <CombatLogPanel />
        </div>

        {/* SECTION CAPACITÉS */}
        {(viewMode === 'features' || viewMode === 'all') && (
          <FeaturesSection
            features={organizedFeatures}
            category={featureCategory}
            onCategoryChange={setFeatureCategory}
            trackedResources={trackedResources}
            onUseResource={consumeResource}
            spellSlotSummary={spellSlotSummary}
          />
        )}
      </div>
      
      {/* Condition picker — using shared Dialog */}
      <Dialog
        open={showConditionPicker}
        onOpenChange={(open) => { if (!open) setShowConditionPicker(false) }}
        title="Conditions"
        className="max-w-md"
      >
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {getAllConditions().map(cond => {
            const isActive = activeConditions.includes(cond)
            return (
              <button
                key={cond}
                onClick={() => {
                  const newConditions = isActive
                    ? activeConditions.filter(c => c !== cond)
                    : [...activeConditions, cond]
                  updateConditions(newConditions)
                }}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getConditionIcon(cond)}</span>
                  <div className="flex-1">
                    <p className="font-medium">{cond.charAt(0).toUpperCase() + cond.slice(1)}</p>
                    <p className="text-xs text-muted-foreground">{getConditionDescription(cond)}</p>
                  </div>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isActive ? 'bg-primary border-primary' : 'border-border'
                  }`}>
                    {isActive && <span className="text-primary-foreground text-xs">✓</span>}
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        <DialogFooter>
          <button onClick={() => setShowConditionPicker(false)} className="btn btn-ghost flex-1">
            Fermer
          </button>
        </DialogFooter>
      </Dialog>

      {/* Forme sauvage */}
      <WildShapeModal
        open={showWildShapeModal}
        level={character?.level ?? 1}
        subclass={character?.subclass}
        onClose={() => setShowWildShapeModal(false)}
        onSelect={(beast) => {
            setWildShapeBeast(beast)
            setShowWildShapeModal(false)
          }}
        />
    </div>
  )
}

// ============================================================================
// SOUS-COMPOSANTS
// ============================================================================

function QuickStat({ icon: Icon, label, value, color }: { 
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="card p-2 flex flex-col items-center">
      <Icon className={`w-4 h-4 ${color} mb-1`} />
      <span className="text-lg font-bold font-cinzel">{value}</span>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
    </div>
  )
}

function CombatSection({ 
  actions, 
  limitedActions, 
  isCalculating,
  onUseAction,
  actionsUsedThisTurn
}: { 
  actions: ResolvedAction[]
  limitedActions: ResolvedAction[]
  isCalculating: boolean
  onUseAction: (action: ResolvedAction) => void
  actionsUsedThisTurn: { action: boolean; bonus: boolean; reaction: boolean }
}) {
  const [activeTab, setActiveTab] = useState('weapons')
  
  const weaponActions = actions.filter(a => a.source.type === 'item')
  const otherActions = actions.filter(a => a.source.type !== 'item')
  
  const tabs = [
    { id: 'weapons', label: 'Armes', count: weaponActions.length },
    { id: 'actions', label: 'Actions', count: otherActions.filter(a => a.actionType === 'action').length },
    { id: 'bonus', label: 'Bonus', count: otherActions.filter(a => a.actionType === 'bonus').length },
    { id: 'reactions', label: 'Réactions', count: otherActions.filter(a => a.actionType === 'reaction').length },
    { id: 'limited', label: 'Limitées', count: limitedActions.length },
  ]
  
  const filteredActions = useMemo(() => {
    switch (activeTab) {
      case 'weapons': return weaponActions
      case 'actions': return otherActions.filter(a => a.actionType === 'action')
      case 'bonus': return otherActions.filter(a => a.actionType === 'bonus')
      case 'reactions': return otherActions.filter(a => a.actionType === 'reaction')
      case 'limited': return limitedActions
      default: return actions
    }
  }, [activeTab, weaponActions, otherActions, limitedActions, actions])
  
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold font-cinzel flex items-center gap-2">
        <FireIcon className="w-5 h-5 text-destructive" />
        Actions de Combat
      </h2>
      
      {/* Sous-navigation */}
      <SectionTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
      />
      
      {/* Liste des actions */}
      <div className={activeTab === 'weapons' ? 'grid grid-cols-2 gap-3' : 'space-y-3'}>
        {isCalculating ? (
          <div className="card p-6 text-center text-muted-foreground">
            <ArrowPathIcon className="w-6 h-6 mx-auto mb-2 animate-spin" />
            Calcul des actions...
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            <p>Aucune action disponible</p>
            <p className="text-xs mt-1">Équipez une arme ou vérifiez votre classe</p>
          </div>
        ) : (
          filteredActions.map(action => (
            <CombatActionCard 
              key={action.id} 
              action={action}
              actionsUsedThisTurn={actionsUsedThisTurn}
              onUse={() => onUseAction(action)}
            />
          ))
        )}
      </div>
    </section>
  )
}

function parseDamageDice(dice: string): { count: number; sides: number; modifier: number } {
  const match = dice.match(/^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?$/)
  if (!match) return { count: 1, sides: 6, modifier: 0 }
  const count = parseInt(match[1], 10)
  const sides = parseInt(match[2], 10)
  const sign = match[3] === '-' ? -1 : 1
  const mod = match[4] ? parseInt(match[4], 10) * sign : 0
  return { count, sides, modifier: mod }
}

function CombatActionCard({ action, onUse, actionsUsedThisTurn }: { action: ResolvedAction; onUse: () => void; actionsUsedThisTurn: { action: boolean; bonus: boolean; reaction: boolean } }) {
  const color = getActionColor(action.actionType)
  const hasResource = action.resource && action.resource.max > 0
  const actionTypeUsed = action.actionType === 'action' || action.actionType === 'bonus' || action.actionType === 'reaction'
    ? actionsUsedThisTurn[action.actionType]
    : false
  const canUse = (!hasResource || (action.resource!.current > 0)) && !actionTypeUsed
  const [expanded, setExpanded] = useState(false)
  
  return (
    <div 
      className="card overflow-hidden hover:shadow-lg transition-shadow"
      style={{ borderLeft: `4px solid ${color}` }}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-bold text-base">{action.name}</h3>
            <p className="text-[11px] text-muted-foreground">
              {action.source.name} • {getActionTypeLabel(action.actionType)}
            </p>
          </div>
          {hasResource && (
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="flex gap-[2px] h-2">
                {Array.from({ length: Math.min(action.resource!.max >= 999 ? 8 : action.resource!.max, 8) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2.5 h-full rounded-full transition-all ${
                      i < action.resource!.current
                        ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.4)]'
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-cinzel font-bold tabular-nums text-primary">
                {action.resource!.current}
              </span>
              <span className="text-[10px] text-muted-foreground">/{formatResourceMax(action.resource!.max)}</span>
            </div>
          )}
        </div>
        
        {/* Stats sur une ligne */}
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          {action.attack && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Toucher</span>
              <span className="text-lg font-bold" style={{ color }}>
                {formatAttackBonus(action.attack.bonus)}
              </span>
              <DiceRollButton
                label={`${action.name} — Toucher`}
                count={1}
                sides={20}
                modifier={action.attack.bonus}
                size="sm"
              />
            </div>
          )}

          {action.damage && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wide">Dégâts</span>
              <span className="text-lg font-bold">{action.damage.dice}</span>
              <span className="text-[10px] text-muted-foreground">({Math.floor(action.damage.average)})</span>
              <DiceRollButton
                label={`${action.name} — Dégâts`}
                {...parseDamageDice(action.damage.dice)}
                size="sm"
              />
            </div>
          )}

          {action.range && (
            <div className="text-xs text-muted-foreground ml-auto shrink-0">
              {action.range.normal}m
            </div>
          )}
        </div>
        
        {/* Tags */}
        {action.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {action.tags.map(tag => (
              <span
                key={tag}
                className="text-[11px] px-1.5 py-0.5 rounded-full bg-muted font-medium"
              >
                {formatTagLabel(tag)}
              </span>
            ))}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-border/50">
          <button
            onClick={onUse}
            disabled={!canUse}
            className={`btn btn-sm flex-1 ${canUse ? 'btn-primary' : 'btn-disabled'}`}
          >
            {canUse ? 'Utiliser' : 'Indisponible'}
          </button>
          <button 
            onClick={() => setExpanded(!expanded)}
            className="btn btn-ghost btn-sm px-3"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
        
        {/* Détails expansibles */}
        {expanded && (
          <div className="mt-2 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">{action.description}</p>
            {action.attack && (
              <div className="mt-2 text-[10px] text-muted-foreground">
                <p>Caractéristique: {action.attack.breakdown.baseAbility.label} ({action.attack.breakdown.baseAbility.modifier >= 0 ? '+' : ''}{action.attack.breakdown.baseAbility.modifier})</p>
                {action.attack.breakdown.proficiency.has && (
                  <p>Maîtrise: +{action.attack.breakdown.proficiency.bonus}</p>
                )}
                {action.attack.breakdown.magicBonus.total > 0 && (
                  <p>Bonus magique: +{action.attack.breakdown.magicBonus.total}</p>
                )}
                {action.attack.breakdown.featBonus.total > 0 && (
                  <p>Bonus dons: +{action.attack.breakdown.featBonus.total}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

interface OrganizedFeatures {
  actions: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  bonus: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  reactions: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  passives: Array<{ name: string; description: string; level: number; uses?: ClassAction }>
  traits: Array<{ name: string; description: string; source: string }>
  feats: Array<{ name: string; description: string; prerequisite?: string }>
}

function FeaturesSection({
  features,
  category,
  onCategoryChange,
  trackedResources,
  onUseResource,
  spellSlotSummary,
}: {
  features: OrganizedFeatures
  category: FeatureCategory
  onCategoryChange: (c: FeatureCategory) => void
  trackedResources: Record<string, any>
  onUseResource: (id: string, amount?: number) => boolean
  spellSlotSummary: Array<{ level: number; available: number; max: number }>
}) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  const toggleExpanded = (id: string) => {
    const newSet = new Set(expandedItems)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setExpandedItems(newSet)
  }
  
  const categoryTabs = [
    { id: 'all', label: 'Tout' },
    { id: 'actions', label: 'Actions', count: features.actions.length },
    { id: 'bonus', label: 'Bonus', count: features.bonus.length },
    { id: 'reactions', label: 'Réactions', count: features.reactions.length },
    { id: 'passives', label: 'Passives', count: features.passives.length },
    { id: 'traits', label: 'Traits', count: features.traits.length },
    { id: 'feats', label: 'Dons', count: features.feats.length },
  ]
  
  const filteredFeatures = useMemo(() => {
    if (category === 'all') {
      return [
        ...features.actions.map((f: OrganizedFeatures['actions'][0]) => ({ ...f, type: 'action' as const, id: `action-${f.name}` })),
        ...features.bonus.map((f: OrganizedFeatures['bonus'][0]) => ({ ...f, type: 'bonus' as const, id: `bonus-${f.name}` })),
        ...features.reactions.map((f: OrganizedFeatures['reactions'][0]) => ({ ...f, type: 'reaction' as const, id: `reaction-${f.name}` })),
        ...features.passives.map((f: OrganizedFeatures['passives'][0]) => ({ ...f, type: 'passive' as const, id: `passive-${f.name}` })),
        ...features.traits.map((f: OrganizedFeatures['traits'][0]) => ({ ...f, type: 'trait' as const, id: `trait-${f.name}` })),
        ...features.feats.map((f: OrganizedFeatures['feats'][0]) => ({ ...f, type: 'feat' as const, id: `feat-${f.name}` })),
      ]
    }
    
    const mapping: Record<string, keyof OrganizedFeatures> = {
      'actions': 'actions',
      'bonus': 'bonus',
      'reactions': 'reactions',
      'passives': 'passives',
      'traits': 'traits',
      'feats': 'feats'
    }
    
    return (features[mapping[category]] as any[]).map((f) => ({ 
      ...f, 
      type: category === 'actions' ? 'action' as const : category === 'bonus' ? 'bonus' as const : category === 'reactions' ? 'reaction' as const : category === 'passives' ? 'passive' as const : category === 'traits' ? 'trait' as const : 'feat' as const,
      id: `${category}-${f.name}`
    }))
  }, [features, category])
  
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold font-cinzel flex items-center gap-2">
        <SparklesIcon className="w-5 h-5 text-magic" />
        Capacités & Traits
      </h2>
      
      {/* Sous-navigation */}
      <SectionTabs
        tabs={categoryTabs}
        activeTab={category}
        onChange={(id) => onCategoryChange(id as FeatureCategory)}
      />
      
      {/* Liste des capacités */}
      <div className="space-y-2">
        {filteredFeatures.length === 0 ? (
          <div className="card p-6 text-center text-muted-foreground">
            <p>Aucune capacité dans cette catégorie</p>
          </div>
        ) : (
          filteredFeatures.map((feature: any) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isExpanded={expandedItems.has(feature.id)}
              onToggle={() => toggleExpanded(feature.id)}
              trackedResources={trackedResources}
              onUseResource={onUseResource}
              spellSlotSummary={spellSlotSummary}
            />
          ))
        )}
      </div>
    </section>
  )
}

function FeatureCard({
  feature,
  isExpanded,
  onToggle,
  trackedResources,
  onUseResource,
  spellSlotSummary,
}: {
  feature: any
  isExpanded: boolean
  onToggle: () => void
  trackedResources: Record<string, any>
  onUseResource: (id: string, amount?: number) => boolean
  spellSlotSummary: Array<{ level: number; available: number; max: number }>
}) {
  const color = getFeatureColor(feature.type)
  const hasUses = feature.uses || feature.resource
  
  // Trouver la ressource trackée si applicable
  const resourceKey = feature.uses?.key || feature.resource?.id
  const trackedResource = resourceKey ? trackedResources[resourceKey] : null
  const currentUses = trackedResource?.current ?? feature.uses?.current ?? 0
  const maxUses = trackedResource?.max ?? feature.uses?.max ?? 0
  const restoreOn = trackedResource?.resetOn ?? feature.uses?.restoreOn ?? 'long'
  
  return (
    <div 
      className="card overflow-hidden"
      style={{ borderLeft: `3px solid ${color}` }}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          {/* Pastille niveau — style sort */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-cinzel font-bold text-sm shrink-0"
            style={{ background: color + '20', color }}
          >
            {feature.level ?? '•'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold">{feature.name}</h3>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ backgroundColor: color + '20', color }}
              >
                {getFeatureTypeLabel(feature.type)}
              </span>
              {hasUses && (
                <span className="text-[10px] text-muted-foreground">
                  {restoreOn === 'short' ? 'Repos court' : 'Repos long'}
                </span>
              )}
            </div>

            {/* Châtiment divin — affiche les emplacements de sort disponibles */}
            {feature.name === 'Châtiment divin' && spellSlotSummary.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {spellSlotSummary.map((slot) => (
                  <div
                    key={slot.level}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                      slot.available === 0 ? 'bg-muted text-muted-foreground/40' : 'bg-magic/10 text-magic'
                    }`}
                    title={`Niveau ${slot.level} : ${slot.available}/${slot.max} restant${slot.available > 1 ? 's' : ''}`}
                  >
                    <span className="font-bold">{slot.level}</span>
                    <span>{slot.available}/{slot.max}</span>
                  </div>
                ))}
                <span className="text-[10px] text-muted-foreground">Emplacements de sort</span>
              </div>
            )}

            {/* Utilisations — style sort */}
            {hasUses && maxUses > 0 && feature.name !== 'Châtiment divin' && (
              <div className="flex items-center gap-2 mt-2">
                {maxUses <= 10 ? (
                  <div className="flex gap-[3px]">
                    {Array.from({ length: maxUses }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (i >= currentUses) onUseResource(resourceKey, 1)
                        }}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          i < currentUses
                            ? 'bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]'
                            : 'bg-muted hover:bg-primary/30'
                        }`}
                        title={i < currentUses ? 'Disponible' : 'Utilisé'}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_4px_hsl(var(--primary)/0.5)]" />
                    <span className="text-xs font-cinzel font-bold text-primary tabular-nums">
                      {currentUses}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/ {maxUses === 999 ? '∞' : maxUses}</span>
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground">
                  {restoreOn === 'short' ? 'Repos court' : 'Repos long'}
                </span>
              </div>
            )}
          </div>
          
          <button
            onClick={onToggle}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <ChevronDownIcon 
              className={`w-4 h-4 text-muted-foreground transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`} 
            />
          </button>
        </div>
        
        {/* Description étendue */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              {feature.description}
            </p>
            {feature.prerequisite && (
              <p className="text-xs text-muted-foreground mt-2">
                Prérequis: {feature.prerequisite}
              </p>
            )}
            {feature.source && (
              <p className="text-xs text-muted-foreground mt-1">
                Source: {feature.source}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// HELPERS
// ============================================================================

function collectClassFeatures(character: any, classId: string | undefined, auroraFeatures: any[], auroraSubclassFeatures: any[] = []) {
  const features: Array<{ name: string; description: string; level: number; uses?: ClassAction; source?: string }> = []

  if (!classId || !character) return features

  const classActions = getClassActions(classId, character.level)

  // Capacités de classe de base (Aurora)
  auroraFeatures.forEach(f => {
    const existingAction = classActions.find(a => a.name === f.name)
    features.push({
      name: f.name,
      description: f.description,
      level: f.level,
      uses: existingAction,
      source: 'Classe'
    })
  })

  // Capacités de sous-classe (Aurora)
  auroraSubclassFeatures.forEach(f => {
    if (!features.some(existing => existing.name === f.name)) {
      features.push({
        name: f.name,
        description: f.description,
        level: f.level,
        source: 'Sous-classe'
      })
    }
  })

  // Capacités actionnables de l'ancien système
  classActions.forEach(action => {
    if (!features.some(f => f.name === action.name)) {
      const levelForAction = auroraFeatures.find(f => f.name === action.name)?.level || 1
      features.push({
        name: action.name,
        description: action.description,
        level: levelForAction,
        uses: action,
        source: 'Classe'
      })
    }
  })

  return features.sort((a, b) => a.level - b.level)
}

function collectRacialTraits(character: any, _raceId: string | undefined, auroraTraits: any[]) {
  const traits: Array<{ name: string; description: string; source: string }> = []
  
  if (!character?.race) return traits
  
  // Add aurora traits
  auroraTraits.forEach(t => {
    traits.push({
      name: t.name,
      description: t.description,
      source: character.race.name
    })
  })
  
  // Add traits from character
  if (character.race.traits) {
    character.race.traits.forEach((traitName: string) => {
      if (!traits.some(t => t.name === traitName)) {
        const details = character.race?.traitDetails?.[traitName] || racialTraitDetails[traitName]
        if (details) {
          traits.push({
            name: typeof details === 'string' ? traitName : details.name,
            description: typeof details === 'string' ? details : details.description,
            source: character.race.name
          })
        }
      }
    })
  }
  
  return traits
}

function getActionColor(type: string): string {
  const colors: Record<string, string> = {
    'action': '#ef4444',
    'bonus': '#f59e0b',
    'reaction': '#3b82f6',
    'free': '#10b981',
    'limited': '#8b5cf6'
  }
  return colors[type] || '#6b7280'
}

function getFeatureColor(type: string): string {
  const colors: Record<string, string> = {
    'action': '#ef4444',
    'bonus': '#f59e0b',
    'reaction': '#3b82f6',
    'passive': '#10b981',
    'trait': '#8b5cf6',
    'feat': '#ec4899'
  }
  return colors[type] || '#6b7280'
}

function getActionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'action': 'Action',
    'bonus': 'Bonus',
    'reaction': 'Réaction',
    'free': 'Libre',
    'limited': 'Limité'
  }
  return labels[type] || type
}

function getFeatureTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'action': 'Action',
    'bonus': 'Action Bonus',
    'reaction': 'Réaction',
    'passive': 'Passive',
    'trait': 'Trait',
    'feat': 'Don'
  }
  return labels[type] || type
}

function formatTagLabel(tag: string): string {
  const labels: Record<string, string> = {
    'finesse': 'Finesse',
    'heavy': 'Lourde',
    'light': 'Légère',
    'two-handed': '2M',
    'versatile': 'Polyvalente',
    'melee': 'Mêlée',
    'ranged': 'Distance',
    'magic': 'Magique',
    'concentration': 'Conc.'
  }
  return labels[tag] || tag
}

function handleUseAction(
  action: ResolvedAction,
  consumeResource: (id: string, amount?: number) => boolean,
  consumeActionType: (type: 'action' | 'bonus' | 'reaction') => boolean
) {
  console.log('Using action:', action.name)

  // Consommer l'action/bonus/réaction du tour si applicable
  if (action.actionType === 'action' || action.actionType === 'bonus' || action.actionType === 'reaction') {
    const success = consumeActionType(action.actionType)
    if (!success) {
      alert(`Vous avez déjà utilisé votre ${action.actionType === 'action' ? 'action' : action.actionType === 'bonus' ? 'action bonus' : 'réaction'} ce tour!`)
      return
    }
  }

  if (action.resource) {
    const success = consumeResource(action.id, 1)
    if (!success) {
      alert('Pas assez de ressources!')
    }
  }
}

