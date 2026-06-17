import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { dataStore } from '../lib/dataStore'
import { serverTimestamp } from 'firebase/firestore'
import { publishCombatState, generateShareCode, unpublishCombatState, subscribeToTrameCommands, clearTrameCommands } from '../lib/combatSync'
import type { Character, Race, CharacterClass, AbilityScores, SessionNote, StoredCharacter, DeathSaves, BonusSource, BonusBreakdown } from '../types/character'
import type { InventoryItem, Currency, CharacterInventory } from '../types/inventory'
import type { Attack } from '../types/combat'
import type { LevelUpChoices, LevelUpInfo } from '../types/levelup'
import { getProficiencyBonus, hasASIAtLevel, getAverageHpGain, subclassLevels } from '../types/levelup'
import { classes } from '../data/classes'

import { races } from '../data/races'
import type { AsiChoice } from '../types/character'
import { getFeatById, getFeatSavingThrowProficiencies } from '../data/feats'
import { computeFeatEffects } from '../utils/feat-effects'
import { normalizeClassId, normalizeRaceId } from '../utils/feature-helpers'
import { getClassFeaturesAtLevel } from '../data/classFeatures'

// Re-export pour compatibilité des imports existants
export type { StoredCharacter, DeathSaves, BonusSource, BonusBreakdown }

const SELECTED_CHAR_KEY = 'besace-selected-character'

interface CharacterContextType {
    character: StoredCharacter | null
    loading: boolean
    error: string | null
    loadCharacter: (characterId: string) => Promise<void>
    clearSelectedCharacter: () => void
    updateCurrentHp: (newHp: number) => Promise<void>
    getModifier: (ability: keyof AbilityScores) => number
    getTotalScore: (ability: keyof AbilityScores) => number
    getSavingThrowBonus: (ability: keyof AbilityScores) => number
    getSavingThrowBreakdown: (ability: keyof AbilityScores) => BonusBreakdown
    getSkillBonus: (skillAbility: keyof AbilityScores, isProficient: boolean) => number
    getSkillBreakdown: (skillName: string, skillAbility: keyof AbilityScores, isProficient: boolean) => BonusBreakdown
    getInitiativeBreakdown: () => BonusBreakdown
    getACBreakdown: () => BonusBreakdown
    proficiencyBonus: number
    // Inventaire
    addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    toggleEquipped: (itemId: string) => Promise<void>
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>
    updateCurrency: (currency: Currency) => Promise<void>
    // Emplacements de sorts
    consumeSpellSlot: (level: number) => Promise<void>
    restoreSpellSlot: (level: number) => Promise<void>
    resetAllSpellSlots: () => Promise<void>
    getSpellSlotsForLevel: (level: number) => { used: number; max: number }
    // Combat
    addAttack: (attack: Omit<Attack, 'id'>) => Promise<void>
    removeAttack: (attackId: string) => Promise<void>
    getAttackBonus: (attack: Attack) => number
    getDamageBonus: (attack: Attack) => number
    // Level-Up
    getLevelUpInfo: () => LevelUpInfo | null
    applyLevelUp: (choices: LevelUpChoices) => Promise<void>
    toggleSpellPreparation: (spellId: string) => Promise<void>
    toggleKnownSpell: (spellName: string) => Promise<void>
    // Equipment
    toggleAttunement: (itemId: string) => Promise<void>
    updateItemCharges: (itemId: string, charges: number) => Promise<void>
    getCalculatedAC: () => number
    getAttunedCount: () => number
    // Feat effects
    getFeatHpBonus: () => number
    getSpeed: () => number
    updateFeatToggle: (featId: string, active: boolean) => Promise<void>
    // Avatar
    updateAvatar: (avatarUrl: string) => Promise<void>
    // Death saves
    updateDeathSaves: (deathSaves: DeathSaves) => Promise<void>
    // Hit dice
    spendHitDie: () => Promise<void>
    getMaxHitDice: () => number
    getHitDieSize: () => number
    // Rests
    shortRest: () => Promise<void>
    longRest: () => Promise<void>
    // Conditions
    updateConditions: (conditions: string[]) => Promise<void>
    // Temp HP
    updateTempHp: (tempHp: number) => Promise<void>
    // Damage with temp HP absorption (PHB p.198)
    takeDamage: (damage: number) => Promise<void>
    // Exhaustion level
    updateExhaustionLevel: (level: number) => Promise<void>
    // Class resources
    updateClassResourceUsed: (key: string, used: number) => Promise<void>
    // Metamagic
    updateMetamagicChoices: (ids: string[]) => Promise<void>
    // Combat sync (Trame)
    enableSharing: () => Promise<string>
    disableSharing: () => Promise<void>
    syncCombatState: () => Promise<void>
    // Equipment bonuses
    getEquipmentAbilityBonus: (ability: keyof AbilityScores) => number
    getEquipmentAbilitySetTo: (ability: keyof AbilityScores) => number | null
    getEquipmentSaveBonus: () => number
    getEquipmentACBonus: () => number
    getEquipmentSpellAttackBonus: () => number
    getEquipmentSpellSaveDCBonus: () => number
    getEquipmentSpeedBonus: () => number
    getEquipmentAttackBonus: () => number
    getEquipmentDamageBonus: () => number
    // Notes de session
    sessionNotes: SessionNote[]
    addSessionNote: (note: Omit<SessionNote, 'id'>) => Promise<void>
    updateSessionNote: (id: string, updates: Partial<Omit<SessionNote, 'id'>>) => Promise<void>
    deleteSessionNote: (id: string) => Promise<void>
    // Personnalité RP
    updatePersonality: (fields: Partial<Pick<Character, 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'>>) => Promise<void>
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export function CharacterProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [character, setCharacter] = useState<StoredCharacter | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Bonus de maîtrise par niveau
    const proficiencyBonus = character ? Math.ceil(1 + character.level / 4) : 2

    // Auto-charger le dernier personnage sélectionné au montage
    useEffect(() => {
        if (!user) return
        const savedId = localStorage.getItem(SELECTED_CHAR_KEY)
        if (savedId) {
            loadCharacter(savedId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user])

    const loadCharacter = async (characterId: string) => {
        console.log('[CharacterContext] loadCharacter appelé:', { characterId, userUid: user?.uid })
        if (!user) {
            setError('Utilisateur non connecté')
            console.warn('[CharacterContext] loadCharacter annulé: utilisateur non connecté')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const data = await dataStore.getCharacter(user.uid, characterId)

            if (data) {

                // Réhydrater les objets race et class depuis les données complètes
                // Les données Firestore peuvent contenir raceId/classId ou des objets simplifiés
                let raceData: Race | null = null
                let classData: CharacterClass | null = null

                // Réhydrater la race depuis raceId ou depuis l'objet stocké
                const rawRaceId = data.raceId || data.race?.id
                const normalizedRaceId = rawRaceId ? normalizeRaceId(rawRaceId) : undefined
                if (normalizedRaceId) {
                    raceData = races.find(r => r.id === normalizedRaceId) || null
                }

                // Réhydrater la classe depuis classId ou depuis l'objet stocké
                const rawClassId = data.classId || data.characterClass?.id
                const normalizedClassId = rawClassId ? normalizeClassId(rawClassId) : undefined
                if (normalizedClassId) {
                    classData = classes.find(c => c.id === normalizedClassId) || null
                }

                // Migration : s'assurer que les dons dans asiChoices sont aussi dans feats
                let feats = data.feats || []
                if (data.asiChoices) {
                    Object.values(data.asiChoices).forEach((choice: any) => {
                        if (choice.type === 'feat' && choice.featId && !feats.includes(choice.featId)) {
                            feats.push(choice.featId)
                        }
                    })
                }

                setCharacter({
                    id: characterId,
                    name: data.name,
                    race: raceData,
                    subrace: data.subraceId || data.subrace,
                    characterClass: classData,
                    abilityScores: data.abilityScores,
                    background: data.background,
                    skillProficiencies: data.skillProficiencies || [],
                    alignment: data.alignment || '',
                    personalityTraits: data.personalityTraits || '',
                    ideals: data.ideals || '',
                    bonds: data.bonds || '',
                    flaws: data.flaws || '',
                    hp: data.hp,
                    currentHp: data.currentHp ?? data.hp,
                    ac: data.ac,
                    level: data.level,
                    userId: data.userId,
                    createdAt: data.createdAt,
                    updatedAt: data.updatedAt,
                    subclass: data.subclass,
                    knownSpells: data.knownSpells || [],
                    preparedSpells: data.preparedSpells || [],
                    feats,
                    asiChoices: data.asiChoices || {},
                    avatarUrl: data.avatarUrl || undefined,
                    deathSaves: data.deathSaves || { successes: 0, failures: 0 },
                    hitDiceUsed: data.hitDiceUsed || 0,
                    activeConditions: data.activeConditions || [],
                    shareCode: data.shareCode || undefined,
                    exhaustionLevel: data.exhaustionLevel || 0,
                    classResourcesUsed: data.classResourcesUsed || {},
                    featToggles: data.featToggles || {},
                    metamagicChoices: data.metamagicChoices || [],
                    classOptions: data.classOptions || {},
                    inventory: data.inventory || { items: [], currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 } },
                    attacks: data.attacks || [],
                    spellSlotsUsed: data.spellSlotsUsed || [],
                    tempHp: data.tempHp ?? 0,
                })
                localStorage.setItem(SELECTED_CHAR_KEY, characterId)
            } else {
                setError('Personnage introuvable')
                console.error('[CharacterContext] Personnage introuvable dans Firestore:', characterId)
                // Nettoyer le localStorage pour éviter de retenter indéfiniment
                localStorage.removeItem(SELECTED_CHAR_KEY)
            }
        } catch (err) {
            console.error('[CharacterContext] Erreur chargement personnage:', err)
            setError('Erreur lors du chargement du personnage')
            localStorage.removeItem(SELECTED_CHAR_KEY)
        } finally {
            setLoading(false)
        }
    }

    const clearSelectedCharacter = useCallback(() => {
        localStorage.removeItem(SELECTED_CHAR_KEY)
        setCharacter(null)
    }, [])

    // Helper — sauvegarde vers Firestore ou localStorage selon le mode
    const saveToStore = async (updates: Record<string, unknown>) => {
        if (!user || !character) return
        await dataStore.updateCharacter(user.uid, character.id, {
            ...updates,
            updatedAt: serverTimestamp(),
        })
    }

    const updateCurrentHp = async (newHp: number) => {
        if (!user || !character) return

        const clampedHp = Math.max(0, Math.min(newHp, character.hp))

        try {
            await saveToStore({ currentHp: clampedHp })
            setCharacter(prev => prev ? { ...prev, currentHp: clampedHp } : null)
        } catch (err) {
            console.error('Error updating HP:', err)
        }
    }

    const getTotalScore = (ability: keyof AbilityScores): number => {
        if (!character) return 10
        let score = character.abilityScores[ability] || 10

        // Ajouter les bonus ASI manquants des anciens personnages
        // (avant le fix, applyLevelUp ne sauvegardait pas les bonus des dons avec asiChoices)
        if (character.asiChoices) {
            Object.values(character.asiChoices).forEach(choice => {
                if (choice.applied === true) return
                if (choice.type === 'feat' && choice.featId && choice.stats) {
                    const feat = getFeatById(choice.featId)
                    if (feat?.asiChoices && feat.asiChoices.length > 0) {
                        Object.entries(choice.stats).forEach(([stat, bonus]) => {
                            if (stat === ability) score += bonus || 0
                        })
                    }
                }
            })
        }

        score += getEquipmentAbilityBonus(ability)
        const setTo = getEquipmentAbilitySetTo(ability)
        return setTo !== null ? Math.max(score, setTo) : Math.min(20, score)
    }

    const getModifier = (ability: keyof AbilityScores): number => {
        return Math.floor((getTotalScore(ability) - 10) / 2)
    }

    const getSavingThrowBreakdown = (ability: keyof AbilityScores): BonusBreakdown => {
        const sources: BonusSource[] = []
        const mod = getModifier(ability)
        sources.push({ label: `Mod. ${ability.toUpperCase()}`, value: mod })

        const isClassProficient = character?.characterClass?.savingThrows?.includes(ability) || false
        if (isClassProficient) {
            sources.push({ label: 'Maîtrise (classe)', value: proficiencyBonus })
        }

        const featProficiencies = character?.feats ? getFeatSavingThrowProficiencies(character.feats, character.asiChoices) : []
        const isFeatProficient = featProficiencies.includes(ability)
        if (isFeatProficient && !isClassProficient) {
            sources.push({ label: 'Maîtrise (don)', value: proficiencyBonus })
        }

        const equipBonus = getEquipmentSaveBonus()
        if (equipBonus !== 0) {
            sources.push({ label: 'Équipement', value: equipBonus })
        }

        const total = sources.reduce((sum, s) => sum + s.value, 0)
        return { total, sources }
    }

    const getSavingThrowBonus = (ability: keyof AbilityScores): number => {
        return getSavingThrowBreakdown(ability).total
    }

    const getSkillBreakdown = (_skillName: string, skillAbility: keyof AbilityScores, isProficient: boolean): BonusBreakdown => {
        const sources: BonusSource[] = []
        const mod = getModifier(skillAbility)
        sources.push({ label: `Mod. ${skillAbility.toUpperCase()}`, value: mod })

        // Maîtrise de classe / fond / don
        if (isProficient) {
            sources.push({ label: 'Maîtrise', value: proficiencyBonus })
        }

        // Expertise : uniquement via les compétences explicitement marquées comme expertise
        const isExpert = character?.expertiseSkills?.includes(_skillName) || false

        if (isExpert) {
            sources.push({ label: 'Expertise', value: proficiencyBonus })
        }

        const total = sources.reduce((sum, s) => sum + s.value, 0)
        return { total, sources }
    }

    const getSkillBonus = (skillAbility: keyof AbilityScores, isProficient: boolean): number => {
        return getSkillBreakdown('', skillAbility, isProficient).total
    }

    const getInitiativeBreakdown = (): BonusBreakdown => {
        const sources: BonusSource[] = []
        const mod = getModifier('dex')
        sources.push({ label: 'Mod. DEX', value: mod })

        const featEffects = getFeatEffectSummary()
        if (featEffects?.initiativeBonus) {
            sources.push({ label: 'Dons', value: featEffects.initiativeBonus })
        }

        const total = sources.reduce((sum, s) => sum + s.value, 0)
        return { total, sources }
    }

    const getACBreakdown = (): BonusBreakdown => {
        const sources: BonusSource[] = []
        if (!character) return { total: 10, sources }

        const dexMod = getModifier('dex')
        const inventory = getInventory()
        const equippedItems = inventory.items.filter(i => {
            if (!i.equipped) return false
            if (i.attunement && !i.attuned) return false
            return true
        })

        const armor = equippedItems.find(i =>
            i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
        )
        const shield = equippedItems.find(i => i.armorCategory === 'shield')
        const classId = character.characterClass?.id
        const hasUnarmoredDefense = classId === 'barbarian' || classId === 'monk'

        let baseAC = 10

        if (!armor && hasUnarmoredDefense) {
            if (classId === 'barbarian') {
                sources.push({ label: 'Défense sans armure (CON)', value: 10 + dexMod + getModifier('con') })
                baseAC = 10 + dexMod + getModifier('con')
            } else if (classId === 'monk') {
                sources.push({ label: 'Défense sans armure (SAG)', value: 10 + dexMod + getModifier('wis') })
                baseAC = 10 + dexMod + getModifier('wis')
            }
        } else if (armor && armor.armorClass) {
            const armorBase = armor.armorClass
            sources.push({ label: `Armure (${armor.name})`, value: armorBase })
            if (armor.addDex) {
                const maxDex = armor.maxDex ?? Infinity
                const appliedDex = Math.min(dexMod, maxDex)
                if (appliedDex !== 0) {
                    sources.push({ label: 'Mod. DEX', value: appliedDex })
                }
                baseAC = armorBase + appliedDex
            } else {
                baseAC = armorBase
            }
        } else {
            sources.push({ label: 'Base', value: 10 })
            if (dexMod !== 0) {
                sources.push({ label: 'Mod. DEX', value: dexMod })
            }
            baseAC = 10 + dexMod
        }

        if (shield && shield.armorClass) {
            sources.push({ label: `Bouclier (${shield.name})`, value: shield.armorClass })
            baseAC += shield.armorClass
        }

        const equipBonus = getEquipmentACBonus()
        if (equipBonus !== 0) {
            sources.push({ label: 'Équipement magique', value: equipBonus })
        }

        const featEffects = getFeatEffectSummary()
        if (featEffects?.acBonus) {
            sources.push({ label: 'Dons', value: featEffects.acBonus })
        }

        const fightingStyle = character.classOptions?.fightingStyle?.toLowerCase() || ''
        const hasDefenseStyle = fightingStyle.includes('defense') || fightingStyle === 'id_fighting_style_defense'
        if (hasDefenseStyle && armor) {
            sources.push({ label: 'Style de combat (Défense)', value: 1 })
        }

        const total = sources.reduce((sum, s) => sum + s.value, 0)
        return { total, sources }
    }

    const getFeatEffectSummary = () => {
        if (!character) return null
        return computeFeatEffects(character, character.featToggles || {})
    }

    const getFeatHpBonus = (): number => {
        const effects = getFeatEffectSummary()
        return effects?.hpBonus || 0
    }

    const getSpeed = (): number => {
        if (!character?.race) return 9
        const base = character.race.speed || 9
        const effects = getFeatEffectSummary()
        const featBonus = effects?.speedBonus || 0
        const equipBonus = getEquipmentSpeedBonus()
        let speed = base + featBonus + equipBonus
        const exhaustionLevel = character.exhaustionLevel ?? 0
        if (exhaustionLevel >= 5) return 0
        if (exhaustionLevel >= 2) speed = Math.floor(speed / 2)
        return speed
    }

    const updateFeatToggle = async (featId: string, active: boolean) => {
        if (!user || !character) return
        const newToggles = { ...(character.featToggles || {}), [featId]: active }
        try {
            await saveToStore({
                featToggles: newToggles,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, featToggles: newToggles } : null)
        } catch (err) {
            console.error('Error updating feat toggle:', err)
        }
    }

    // === FONCTIONS INVENTAIRE ===

    const getInventory = (): CharacterInventory => {
        return character?.inventory || {
            items: [],
            currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
        }
    }

    // Nettoyer les undefined avant envoi Firestore
    const stripUndefined = (obj: unknown): unknown => {
        if (Array.isArray(obj)) return obj.map(stripUndefined)
        if (obj && typeof obj === 'object') {
            const cleaned: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
                if (value !== undefined) {
                    cleaned[key] = stripUndefined(value)
                }
            }
            return cleaned
        }
        return obj
    }

    const saveInventory = async (inventory: CharacterInventory) => {
        if (!user || !character) return

        try {
            const cleanedInventory = stripUndefined(inventory) as CharacterInventory
            await dataStore.updateCharacter(user.uid, character.id, {
                inventory: cleanedInventory,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, inventory: cleanedInventory } : null)
        } catch (err) {
            console.error('Error updating inventory:', err)
        }
    }

    const addItem = async (item: Omit<InventoryItem, 'id'>) => {
        const inventory = getInventory()
        const newItem: InventoryItem = {
            ...item,
            id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        const updatedInventory = {
            ...inventory,
            items: [...inventory.items, newItem]
        }
        await saveInventory(updatedInventory)
    }

    const removeItem = async (itemId: string) => {
        const inventory = getInventory()
        const updatedInventory = {
            ...inventory,
            items: inventory.items.filter(item => item.id !== itemId)
        }
        await saveInventory(updatedInventory)
    }

    const toggleEquipped = async (itemId: string) => {
        const inventory = getInventory()
        const item = inventory.items.find(i => i.id === itemId)
        if (!item) return

        if (!item.equipped) {
            // Equipping: unequip conflicting items first
            let items = inventory.items.map(i =>
                i.id === itemId ? { ...i, equipped: true } : i
            )

            // Only one weapon with damage at a time — unequip other weapons
            if (item.damage && item.type === 'weapon') {
                items = items.map(i =>
                    i.id !== itemId && i.damage && i.type === 'weapon' && i.equipped
                        ? { ...i, equipped: false }
                        : i
                )
            }

            // Only one armor at a time
            if (item.armorCategory && item.armorCategory !== 'shield' && item.armorClass) {
                items = items.map(i =>
                    i.id !== itemId && i.armorCategory && i.armorCategory !== 'shield' && i.armorClass && i.equipped
                        ? { ...i, equipped: false }
                        : i
                )
            }

            // Only one shield at a time
            if (item.armorCategory === 'shield') {
                items = items.map(i =>
                    i.id !== itemId && i.armorCategory === 'shield' && i.equipped
                        ? { ...i, equipped: false }
                        : i
                )
            }

            await saveInventory({ ...inventory, items })
        } else {
            // Unequipping: just toggle off
            const updatedInventory = {
                ...inventory,
                items: inventory.items.map(i =>
                    i.id === itemId ? { ...i, equipped: false, attuned: false } : i
                )
            }
            await saveInventory(updatedInventory)
        }
    }

    const updateItemQuantity = async (itemId: string, quantity: number) => {
        const inventory = getInventory()
        if (quantity <= 0) {
            await removeItem(itemId)
            return
        }
        const updatedInventory = {
            ...inventory,
            items: inventory.items.map(item =>
                item.id === itemId ? { ...item, quantity } : item
            )
        }
        await saveInventory(updatedInventory)
    }

    const updateCurrency = async (currency: Currency) => {
        const inventory = getInventory()
        const updatedInventory = {
            ...inventory,
            currency
        }
        await saveInventory(updatedInventory)
    }

    // === HELPERS BONUS ÉQUIPEMENT ===

    const getActiveEquipmentBonuses = (): InventoryItem[] => {
        const inventory = getInventory()
        return inventory.items.filter(i => {
            if (!i.equipped) return false
            if (i.attunement && !i.attuned) return false
            return true
        })
    }

    const getEquipmentAbilityBonus = (ability: keyof AbilityScores): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => {
            return total + (item.abilityBonus?.[ability] || 0)
        }, 0)
    }

    const getEquipmentAbilitySetTo = (ability: keyof AbilityScores): number | null => {
        let maxSetTo: number | null = null
        for (const item of getActiveEquipmentBonuses()) {
            const setVal = item.abilitySetTo?.[ability]
            if (setVal !== undefined && setVal !== null && (maxSetTo === null || setVal > maxSetTo)) {
                maxSetTo = setVal
            }
        }
        return maxSetTo
    }

    const getEquipmentSaveBonus = (): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => total + (item.saveBonus || 0), 0)
    }

    const getEquipmentACBonus = (): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => total + (item.acBonus || 0), 0)
    }

    const getEquipmentSpellAttackBonus = (): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => total + (item.spellAttackBonus || 0), 0)
    }

    const getEquipmentSpellSaveDCBonus = (): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => total + (item.spellSaveDCBonus || 0), 0)
    }

    const getEquipmentSpeedBonus = (): number => {
        return getActiveEquipmentBonuses().reduce((total, item) => total + (item.speedBonus || 0), 0)
    }

    const getEquipmentAttackBonus = (): number => {
        return getActiveEquipmentBonuses().filter(i => i.type === 'weapon').reduce((total, item) => total + (item.attackBonus || 0), 0)
    }

    const getEquipmentDamageBonus = (): number => {
        return getActiveEquipmentBonuses().filter(i => i.type === 'weapon').reduce((total, item) => total + (item.damageBonus || 0), 0)
    }

    const toggleAttunement = async (itemId: string) => {
        const inventory = getInventory()
        const item = inventory.items.find(i => i.id === itemId)

        if (!item) return
        if (!item.attunement) return

        const currentAttuned = inventory.items.filter(i => i.attuned).length
        const isCurrentlyAttuned = item.attuned

        if (!isCurrentlyAttuned && currentAttuned >= 3) {
            console.warn('Maximum 3 objets harmonisés atteint')
            return
        }

        const updatedInventory = {
            ...inventory,
            items: inventory.items.map(i =>
                i.id === itemId ? { ...i, attuned: !i.attuned } : i
            )
        }
        await saveInventory(updatedInventory)
    }

    const getAttunedCount = (): number => {
        const inventory = getInventory()
        return inventory.items.filter(i => i.attuned).length
    }

    const updateItemCharges = async (itemId: string, charges: number) => {
        const inventory = getInventory()
        const maxCharges = inventory.items.find(i => i.id === itemId)?.maxCharges
        const updatedInventory = {
            ...inventory,
            items: inventory.items.map(i =>
                i.id === itemId ? { ...i, charges: Math.max(0, Math.min(charges, maxCharges ?? charges)) } : i
            ),
        }
        await saveInventory(updatedInventory)
    }

    const getCalculatedAC = (): number => {
        if (!character) return 10

        const dexMod = getModifier('dex')
        const inventory = getInventory()
        const equippedItems = inventory.items.filter(i => {
            if (!i.equipped) return false
            if (i.attunement && !i.attuned) return false
            return true
        })

        const armor = equippedItems.find(i =>
            i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
        )

        const shield = equippedItems.find(i =>
            i.armorCategory === 'shield'
        )

        const classId = character.characterClass?.id
        const hasUnarmoredDefense = classId === 'barbarian' || classId === 'monk'

        let baseAC = 10 + dexMod

        if (!armor && hasUnarmoredDefense) {
            if (classId === 'barbarian') {
                baseAC = 10 + dexMod + getModifier('con')
            } else if (classId === 'monk') {
                baseAC = 10 + dexMod + getModifier('wis')
            }
        } else if (armor && armor.armorClass) {
            if (armor.addDex) {
                const maxDex = armor.maxDex ?? Infinity
                baseAC = armor.armorClass + Math.min(dexMod, maxDex)
            } else {
                baseAC = armor.armorClass
            }
        }

        if (shield && shield.armorClass) {
            baseAC += shield.armorClass
        }

        baseAC += getEquipmentACBonus()

        // Bonus de CA des dons (ex: Combat à deux armes +1)
        const featEffects = getFeatEffectSummary()
        if (featEffects?.acBonus) {
            baseAC += featEffects.acBonus
        }

        // Bonus de CA du style de combat Défense
        const fightingStyle = character.classOptions?.fightingStyle?.toLowerCase() || ''
        const hasDefenseStyle = fightingStyle.includes('defense') || fightingStyle === 'id_fighting_style_defense'
        if (hasDefenseStyle && armor) {
            baseAC += 1
        }

        return baseAC
    }

    // === FONCTIONS EMPLACEMENTS DE SORTS ===

    const getMaxSpellSlots = (level: number): number => {
        if (!character?.characterClass?.spellcasting) return 0
        const spellSlots = character.characterClass.spellcasting.spellSlots
        const characterLevel = character.level
        if (characterLevel < 1 || characterLevel > spellSlots.length) return 0
        const slotsAtLevel = spellSlots[characterLevel - 1]
        return slotsAtLevel[level - 1] || 0
    }

    const getSpellSlotsForLevel = (level: number): { used: number; max: number } => {
        const max = getMaxSpellSlots(level)
        const used = character?.spellSlotsUsed?.[level - 1] || 0
        return { used: Math.min(used, max), max }
    }

    const saveSpellSlots = async (spellSlotsUsed: number[]) => {
        if (!user || !character) return

        try {
            await saveToStore({
                spellSlotsUsed,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, spellSlotsUsed } : null)
        } catch (err) {
            console.error('Error updating spell slots:', err)
        }
    }

    const consumeSpellSlot = async (level: number) => {
        if (level < 1 || level > 9) return
        const { used, max } = getSpellSlotsForLevel(level)
        if (used >= max) return // Plus d'emplacements disponibles

        const currentSlots = character?.spellSlotsUsed || [0, 0, 0, 0, 0, 0, 0, 0, 0]
        const newSlots = [...currentSlots]
        newSlots[level - 1] = (newSlots[level - 1] || 0) + 1
        await saveSpellSlots(newSlots)
    }

    const restoreSpellSlot = async (level: number) => {
        if (level < 1 || level > 9) return
        const { used } = getSpellSlotsForLevel(level)
        if (used <= 0) return // Rien à restaurer

        const currentSlots = character?.spellSlotsUsed || [0, 0, 0, 0, 0, 0, 0, 0, 0]
        const newSlots = [...currentSlots]
        newSlots[level - 1] = Math.max(0, (newSlots[level - 1] || 0) - 1)
        await saveSpellSlots(newSlots)
    }

    const resetAllSpellSlots = async () => {
        await saveSpellSlots([0, 0, 0, 0, 0, 0, 0, 0, 0])
    }

    // === FONCTIONS COMBAT ===

    const getAttackBonus = (attack: Attack): number => {
        const abilityMod = getModifier(attack.ability)
        const profBonus = attack.isProficient ? proficiencyBonus : 0
        return abilityMod + profBonus
    }

    const getDamageBonus = (attack: Attack): number => {
        const abilityMod = getModifier(attack.ability)
        return abilityMod + (attack.bonusDamage || 0)
    }

    const saveAttacks = async (attacks: Attack[]) => {
        if (!user || !character) return

        try {
            await saveToStore({
                attacks,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, attacks } : null)
        } catch (err) {
            console.error('Error updating attacks:', err)
        }
    }

    const addAttack = async (attack: Omit<Attack, 'id'>) => {
        const currentAttacks = character?.attacks || []
        const newAttack: Attack = {
            ...attack,
            id: `attack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }
        await saveAttacks([...currentAttacks, newAttack])
    }

    const removeAttack = async (attackId: string) => {
        const currentAttacks = character?.attacks || []
        await saveAttacks(currentAttacks.filter(a => a.id !== attackId))
    }

    // === FONCTIONS LEVEL-UP ===

    const getLevelUpInfo = (): LevelUpInfo | null => {
        if (!character || !character.characterClass) return null

        const currentLevel = character.level
        const newLevel = currentLevel + 1
        const hitDie = character.characterClass.hitDie
        const conMod = getModifier('con')

        // Calcul des nouveaux cantrips et sorts
        const spellcasting = character.characterClass.spellcasting
        let newCantripsCount = 0
        let newSpellsCount = 0
        let newSpellSlotLevel: number | undefined

        if (spellcasting) {
            const currentCantrips = spellcasting.cantripsKnown?.[currentLevel - 1] || 0
            const targetCantrips = spellcasting.cantripsKnown?.[newLevel - 1] || 0
            newCantripsCount = Math.max(0, targetCantrips - currentCantrips)

            if (spellcasting.spellsKnown) {
                const currentSpells = spellcasting.spellsKnown[currentLevel - 1] || 0
                const targetSpells = spellcasting.spellsKnown[newLevel - 1] || 0
                newSpellsCount = Math.max(0, targetSpells - currentSpells)
            }

            // Vérifier si on débloque un nouveau niveau de sort
            const currentSlots = spellcasting.spellSlots?.[currentLevel - 1] || []
            const newSlots = spellcasting.spellSlots?.[newLevel - 1] || []
            if (newSlots.length > currentSlots.length) {
                newSpellSlotLevel = newSlots.length
            }
        }

        // Détecter si ce niveau donne un style de combat
        const newFeatures = getClassFeaturesAtLevel(character.characterClass.id, newLevel)
        const hasFightingStyleFeature = newFeatures.some(f =>
            f.name.toLowerCase().includes('style de combat')
        )
        const needsFightingStyleChoice = hasFightingStyleFeature && !character.classOptions?.fightingStyle

        return {
            currentLevel,
            newLevel,
            hitDie,
            conModifier: conMod,
            averageHp: getAverageHpGain(hitDie),
            proficiencyBonusCurrent: getProficiencyBonus(currentLevel),
            proficiencyBonusNew: getProficiencyBonus(newLevel),
            hasASI: hasASIAtLevel(character.characterClass.id, newLevel),
            hasSubclassChoice: subclassLevels[character.characterClass.id] === newLevel && !character.subclass,
            needsFightingStyleChoice,
            newCantripsCount,
            newSpellsCount,
            newSpellSlotLevel,
        }
    }

    const applyLevelUp = async (choices: LevelUpChoices) => {
        if (!user || !character) return

        console.log('[applyLevelUp] Début, choices:', JSON.stringify(choices))
        console.log('[applyLevelUp] character.feats actuel:', character.feats)

        const updates: Partial<StoredCharacter> = {
            level: choices.newLevel,
            hp: character.hp + choices.hpGained,
            currentHp: (character.currentHp ?? character.hp) + choices.hpGained,
        }

        if (choices.subclassId) {
            updates.subclass = choices.subclassId
        }

        if (choices.fightingStyleId) {
            updates.classOptions = {
                ...(character.classOptions || {}),
                fightingStyle: choices.fightingStyleId
            }
        }

        if (choices.newSpellsSelected || choices.newCantripsSelected) {
            const currentKnown = character.knownSpells || []
            const currentPrepared = character.preparedSpells || []
            const newlyLearned = [
                ...(choices.newSpellsSelected || []),
                ...(choices.newCantripsSelected || [])
            ]

            const newKnown = [...currentKnown, ...newlyLearned]
            const newPrepared = [...currentPrepared, ...newlyLearned]

            updates.knownSpells = [...new Set(newKnown)] // Éviter les doublons
            updates.preparedSpells = [...new Set(newPrepared)]
        }

        // Appliquer ASI si choisi
        // Appliquer ASI si choisi
        if (choices.asiChoice) {
            // Appliquer les bonus de caractéristiques
            const newScores = { ...character.abilityScores }
            if (choices.asiChoice.type === 'stats' && choices.asiChoice.stats) {
                Object.entries(choices.asiChoice.stats).forEach(([stat, bonus]) => {
                    const key = stat as keyof AbilityScores
                    newScores[key] = Math.min(20, (newScores[key] || 0) + (bonus || 0))
                })
            } else if (choices.asiChoice.type === 'feat' && choices.asiChoice.featId) {
                const currentFeats = character.feats || []
                updates.feats = [...currentFeats, choices.asiChoice.featId]

                if (choices.asiChoice.stats) {
                    // Don avec choix utilisateur (ex: Athlète → FOR ou DEX +1)
                    Object.entries(choices.asiChoice.stats).forEach(([stat, bonus]) => {
                        const key = stat as keyof AbilityScores
                        newScores[key] = Math.min(20, (newScores[key] || 0) + (bonus || 0))
                    })
                } else {
                    // Don avec bonus fixe (ex: Acteur → CHA +1)
                    const feat = getFeatById(choices.asiChoice.featId)
                    if (feat?.abilityScoreIncrease) {
                        Object.entries(feat.abilityScoreIncrease).forEach(([stat, bonus]) => {
                            const key = stat as keyof AbilityScores
                            newScores[key] = Math.min(20, (newScores[key] || 0) + (bonus || 0))
                        })
                    }
                }
            }
            updates.abilityScores = newScores

            // Sauvegarder le choix dans l'historique (marqué comme appliqué)
            updates.asiChoices = {
                ...(character.asiChoices || {}),
                [choices.newLevel]: { ...choices.asiChoice, applied: true }
            }
        }

        try {
            const cleanedUpdates = stripUndefined(updates) as Partial<StoredCharacter>
            console.log('[applyLevelUp] updates nettoyés envoyés:', JSON.stringify(cleanedUpdates))
            await dataStore.updateCharacter(user.uid, character.id, {
                ...cleanedUpdates,
                updatedAt: serverTimestamp(),
            })
            console.log('[applyLevelUp] update réussi')
            setCharacter(prev => prev ? { ...prev, ...cleanedUpdates } : null)
            console.log('[applyLevelUp] State local mis à jour')
        } catch (err) {
            console.error('[applyLevelUp] Error applying level up:', err)
            throw err
        }
    }

    const toggleSpellPreparation = async (spellId: string) => {
        if (!user || !character) return

        const currentPrepared = character.preparedSpells || []
        const isPrepared = currentPrepared.includes(spellId)

        const newPrepared = isPrepared
            ? currentPrepared.filter(id => id !== spellId)
            : [...currentPrepared, spellId]

        try {
            await saveToStore({
                preparedSpells: newPrepared,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, preparedSpells: newPrepared } : null)
        } catch (err) {
            console.error('Error toggling spell preparation:', err)
        }
    }

    const toggleKnownSpell = async (spellName: string) => {
        if (!user || !character) return

        const currentKnown = character.knownSpells || []
        const isKnown = currentKnown.includes(spellName)

        const newKnown = isKnown
            ? currentKnown.filter(name => name !== spellName)
            : [...currentKnown, spellName]

        try {
            await saveToStore({
                knownSpells: newKnown,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, knownSpells: newKnown } : null)
        } catch (err) {
            console.error('Error toggling known spell:', err)
        }
    }

    const updateAvatar = async (avatarUrl: string) => {
        if (!user || !character) return

        try {
            await saveToStore({
                avatarUrl,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, avatarUrl } : null)
        } catch (err) {
            console.error('Error updating avatar:', err)
        }
    }

    const updateDeathSaves = async (deathSaves: DeathSaves) => {
        if (!user || !character) return

        try {
            await saveToStore({
                deathSaves,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, deathSaves } : null)
        } catch (err) {
            console.error('Error updating death saves:', err)
        }
    }

    const spendHitDie = async () => {
        if (!user || !character) return
        const maxDice = getMaxHitDice()
        const currentUsed = character.hitDiceUsed || 0
        if (currentUsed >= maxDice) return

        const dieSize = getHitDieSize()
        const conMod = getModifier('con')
        const hpGain = Math.max(1, Math.floor(dieSize / 2) + conMod)
        const newHp = Math.min(character.hp, (character.currentHp ?? character.hp) + hpGain)
        const newUsed = currentUsed + 1

        try {
            await saveToStore({
                hitDiceUsed: newUsed,
                currentHp: newHp,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, hitDiceUsed: newUsed, currentHp: newHp } : null)
        } catch (err) {
            console.error('Error using hit die:', err)
        }
    }

    const getMaxHitDice = (): number => {
        if (!character) return 0
        return character.level
    }

    const getHitDieSize = (): number => {
        if (!character?.characterClass) return 8
        return character.characterClass.hitDie
    }

    const shortRest = async () => {
        if (!user || !character) return
        try {
            const deathSaves = { successes: 0, failures: 0 }
            // Short rest: reset Ki, Channel Divinity, Bardic Inspiration, Second Wind, Action Surge
            const resourceResets: Record<string, number> = {}
            const classResources = character.classResourcesUsed || {}
            const classId = character.characterClass?.id
            if (classId === 'monk') resourceResets['ki'] = 0
            if (classId === 'cleric') resourceResets['channelDivinity'] = 0
            if (classId === 'bard') resourceResets['bardicInspiration'] = 0
            if (classId === 'fighter') { resourceResets['secondWind'] = 0; resourceResets['actionSurge'] = 0 }
            const newClassResourcesUsed = { ...classResources, ...resourceResets }

            // Recover charges on short rest items
            const inventory = getInventory()
            const updatedItems = inventory.items.map(item => {
                if (item.chargesRecovery === 'short' && item.maxCharges) {
                    return { ...item, charges: item.maxCharges }
                }
                return item
            })
            const updatedInventory = { ...inventory, items: updatedItems }

            const updates: Record<string, unknown> = {
                deathSaves,
                classResourcesUsed: newClassResourcesUsed,
                inventory: updatedInventory,
                updatedAt: serverTimestamp(),
            }
            await dataStore.updateCharacter(user.uid, character.id, updates)
            setCharacter(prev => prev ? {
                ...prev,
                deathSaves,
                classResourcesUsed: newClassResourcesUsed,
                inventory: updatedInventory,
            } : null)
        } catch (err) {
            console.error('Error short resting:', err)
        }
    }

    const longRest = async () => {
        if (!user || !character) return
        try {
            const exhaustionLevel = character.exhaustionLevel ?? 0
            const newExhaustionLevel = Math.max(0, exhaustionLevel - 1)

            // Recover charges on long rest items
            const inventory = getInventory()
            const updatedItems = inventory.items.map(item => {
                if ((item.chargesRecovery === 'long' || item.chargesRecovery === 'short') && item.maxCharges) {
                    return { ...item, charges: item.maxCharges }
                }
                return item
            })
            const updatedInventory = { ...inventory, items: updatedItems }

            const updates: Record<string, unknown> = {
                currentHp: character.hp,
                hitDiceUsed: Math.max(0, (character.hitDiceUsed || 0) - Math.floor(character.level / 2)),
                spellSlotsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0],
                deathSaves: { successes: 0, failures: 0 },
                exhaustionLevel: newExhaustionLevel,
                classResourcesUsed: {},
                inventory: updatedInventory,
                updatedAt: serverTimestamp(),
            }
            await dataStore.updateCharacter(user.uid, character.id, updates)
            setCharacter(prev => prev ? {
                ...prev,
                currentHp: prev.hp,
                hitDiceUsed: updates.hitDiceUsed as number,
                spellSlotsUsed: updates.spellSlotsUsed as number[],
                deathSaves: updates.deathSaves as DeathSaves,
                exhaustionLevel: newExhaustionLevel,
                classResourcesUsed: {},
                inventory: updatedInventory,
            } : null)
        } catch (err) {
            console.error('Error long resting:', err)
        }
    }

    const updateConditions = async (conditions: string[]) => {
        if (!user || !character) return
        try {
            await saveToStore({
                activeConditions: conditions,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, activeConditions: conditions } : null)
        } catch (err) {
            console.error('Error updating conditions:', err)
        }
    }

    const updateTempHp = async (tempHp: number) => {
        if (!user || !character) return
        try {
            await saveToStore({
                tempHp,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, tempHp } : null)
        } catch (err) {
            console.error('Error updating temp HP:', err)
        }
    }

    const takeDamage = async (damage: number) => {
        if (!user || !character || damage <= 0) return

        const currentTempHp = character.tempHp ?? 0
        const currentHp = character.currentHp ?? character.hp

        let newTempHp = currentTempHp
        let newHp = currentHp

        if (currentTempHp > 0) {
            if (damage <= currentTempHp) {
                newTempHp = currentTempHp - damage
            } else {
                const remainingDamage = damage - currentTempHp
                newTempHp = 0
                newHp = Math.max(0, currentHp - remainingDamage)
            }
        } else {
            newHp = Math.max(0, currentHp - damage)
        }

        try {
            await saveToStore({
                currentHp: newHp,
                tempHp: newTempHp,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, currentHp: newHp, tempHp: newTempHp } : null)
        } catch (err) {
            console.error('Error applying damage:', err)
        }
    }

    const updateExhaustionLevel = async (level: number) => {
        if (!user || !character) return
        const newLevel = Math.max(0, Math.min(6, level))
        try {
            await saveToStore({
                exhaustionLevel: newLevel,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, exhaustionLevel: newLevel } : null)
        } catch (err) {
            console.error('Error updating exhaustion level:', err)
        }
    }

    const updateClassResourceUsed = async (key: string, used: number) => {
        if (!user || !character) return
        const currentResources = character.classResourcesUsed || {}
        const newResources = { ...currentResources, [key]: used }
        try {
            await saveToStore({
                classResourcesUsed: newResources,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, classResourcesUsed: newResources } : null)
        } catch (err) {
            console.error('Error updating class resource:', err)
        }
    }

    const updateMetamagicChoices = async (ids: string[]) => {
        if (!user || !character) return
        try {
            await saveToStore({
                metamagicChoices: ids,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, metamagicChoices: ids } : null)
        } catch (err) {
            console.error('Error updating metamagic choices:', err)
        }
    }

    const enableSharing = async (): Promise<string> => {
        if (!user || !character) throw new Error('No character')
        const shareCode = character.shareCode || generateShareCode()
        try {
            await saveToStore({ shareCode, updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, shareCode } : null)
            await publishCombatState(shareCode, {
                characterId: character.id,
                characterName: character.name,
                race: character.race?.name || '',
                className: character.characterClass?.name || '',
                level: character.level,
                currentHp: character.currentHp ?? character.hp,
                maxHp: character.hp + getFeatHpBonus(),
                tempHp: character.tempHp ?? 0,
                ac: getCalculatedAC(),
                conditions: character.activeConditions || [],
                deathSaves: character.deathSaves || { successes: 0, failures: 0 },
                hitDiceUsed: character.hitDiceUsed || 0,
                hitDiceMax: character.level,
                hitDieSize: character.characterClass?.hitDie || 8,
                spellSlotsUsed: character.spellSlotsUsed || [],
                spellSlotsMax: character.characterClass?.spellcasting?.spellSlots?.[(character.level - 1)] || [],
                avatarUrl: character.avatarUrl || '',
                abilityScores: {
                    str: getTotalScore('str'),
                    dex: getTotalScore('dex'),
                    con: getTotalScore('con'),
                    int: getTotalScore('int'),
                    wis: getTotalScore('wis'),
                    cha: getTotalScore('cha'),
                },
                abilityModifiers: {
                    str: getModifier('str'),
                    dex: getModifier('dex'),
                    con: getModifier('con'),
                    int: getModifier('int'),
                    wis: getModifier('wis'),
                    cha: getModifier('cha'),
                },
                proficiencyBonus,
                speed: getSpeed(),
                savingThrows: character.characterClass?.savingThrows || [],
                equipmentSummary: getInventory().items
                    .filter(i => i.equipped || i.attuned)
                    .map(i => ({
                        name: i.name,
                        type: i.type,
                        equipped: i.equipped,
                        attuned: i.attuned || false,
                        rarity: i.rarity,
                        acBonus: i.acBonus,
                        attackBonus: i.attackBonus,
                        damageBonus: i.damageBonus,
                        abilityBonus: i.abilityBonus,
                        saveBonus: i.saveBonus,
                    })),
            })
        } catch (err) {
            console.error('Error enabling sharing:', err)
            throw err
        }
        return shareCode
    }

    const disableSharing = async () => {
        if (!user || !character) return
        const shareCode = character.shareCode
        if (!shareCode) return
        try {
            await unpublishCombatState(shareCode)
            await saveToStore({ shareCode: '', updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, shareCode: undefined } : null)
        } catch (err) {
            console.error('Error disabling sharing:', err)
        }
    }

    const addSessionNote = async (note: Omit<SessionNote, 'id'>) => {
        if (!user || !character) return
        const newNote: SessionNote = {
            ...note,
            id: crypto.randomUUID(),
        }
        const updatedNotes = [...(character.sessionNotes || []), newNote]
        try {
            await saveToStore({ sessionNotes: updatedNotes, updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, sessionNotes: updatedNotes } : null)
        } catch (err) {
            console.error('Error adding session note:', err)
        }
    }

    const updateSessionNote = async (id: string, updates: Partial<Omit<SessionNote, 'id'>>) => {
        if (!user || !character) return
        const updatedNotes = (character.sessionNotes || []).map(n =>
            n.id === id ? { ...n, ...updates } : n
        )
        try {
            await saveToStore({ sessionNotes: updatedNotes, updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, sessionNotes: updatedNotes } : null)
        } catch (err) {
            console.error('Error updating session note:', err)
        }
    }

    const deleteSessionNote = async (id: string) => {
        if (!user || !character) return
        const updatedNotes = (character.sessionNotes || []).filter(n => n.id !== id)
        try {
            await saveToStore({ sessionNotes: updatedNotes, updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, sessionNotes: updatedNotes } : null)
        } catch (err) {
            console.error('Error deleting session note:', err)
        }
    }

    const updatePersonality = async (fields: Partial<Pick<Character, 'personalityTraits' | 'ideals' | 'bonds' | 'flaws'>>) => {
        if (!user || !character) return
        try {
            await saveToStore({ ...fields, updatedAt: serverTimestamp() })
            setCharacter(prev => prev ? { ...prev, ...fields } : null)
        } catch (err) {
            console.error('Error updating personality:', err)
        }
    }

    const syncCombatState = useCallback(async () => {
        if (!user || !character) return
        const shareCode = character.shareCode
        if (!shareCode) return
        try {
            await publishCombatState(shareCode, {
                characterId: character.id,
                characterName: character.name,
                race: character.race?.name || '',
                className: character.characterClass?.name || '',
                level: character.level,
                currentHp: character.currentHp ?? character.hp,
                maxHp: character.hp + getFeatHpBonus(),
                tempHp: character.tempHp ?? 0,
                ac: getCalculatedAC(),
                conditions: character.activeConditions || [],
                deathSaves: character.deathSaves || { successes: 0, failures: 0 },
                hitDiceUsed: character.hitDiceUsed || 0,
                hitDiceMax: character.level,
                hitDieSize: character.characterClass?.hitDie || 8,
                spellSlotsUsed: character.spellSlotsUsed || [],
                spellSlotsMax: character.characterClass?.spellcasting?.spellSlots?.[(character.level - 1)] || [],
                avatarUrl: character.avatarUrl || '',
                abilityScores: {
                    str: getTotalScore('str'),
                    dex: getTotalScore('dex'),
                    con: getTotalScore('con'),
                    int: getTotalScore('int'),
                    wis: getTotalScore('wis'),
                    cha: getTotalScore('cha'),
                },
                abilityModifiers: {
                    str: getModifier('str'),
                    dex: getModifier('dex'),
                    con: getModifier('con'),
                    int: getModifier('int'),
                    wis: getModifier('wis'),
                    cha: getModifier('cha'),
                },
                proficiencyBonus,
                speed: getSpeed(),
                savingThrows: character.characterClass?.savingThrows || [],
                equipmentSummary: getInventory().items
                    .filter(i => i.equipped || i.attuned)
                    .map(i => ({
                        name: i.name,
                        type: i.type,
                        equipped: i.equipped,
                        attuned: i.attuned || false,
                        rarity: i.rarity,
                        acBonus: i.acBonus,
                        attackBonus: i.attackBonus,
                        damageBonus: i.damageBonus,
                        abilityBonus: i.abilityBonus,
                        saveBonus: i.saveBonus,
                    })),
            })
        } catch (err) {
            console.error('Error syncing combat state:', err)
        }
    }, [user, character])

    useEffect(() => {
        if (character?.shareCode) {
            const timeout = setTimeout(() => {
                syncCombatState()
            }, 1000)
            return () => clearTimeout(timeout)
        }
    }, [
        character?.shareCode,
        character?.currentHp,
        character?.tempHp,
        character?.activeConditions,
        character?.deathSaves,
        character?.hitDiceUsed,
        character?.spellSlotsUsed,
        character?.inventory?.items?.filter(i => i.equipped || i.attuned).map(i => i.id).join(','),
    ])

    // Ref pour éviter le stale closure dans la callback Trame
    const characterRef = useRef(character)
    characterRef.current = character

    useEffect(() => {
        if (!character?.shareCode) return
        const unsubscribe = subscribeToTrameCommands(character.shareCode, async (commands) => {
            const currentCharacter = characterRef.current
            if (commands.length === 0 || !currentCharacter) return
            const processedIds: string[] = []
            for (const cmd of commands) {
                switch (cmd.type) {
                    case 'updateTempHp': {
                        const tempHp = cmd.payload.tempHp as number
                        await updateTempHp(tempHp)
                        break
                    }
                    case 'addCondition': {
                        const condition = cmd.payload.condition as string
                        if (currentCharacter.activeConditions && !currentCharacter.activeConditions.includes(condition)) {
                            await updateConditions([...currentCharacter.activeConditions, condition])
                        }
                        break
                    }
                    case 'removeCondition': {
                        const condition = cmd.payload.condition as string
                        if (currentCharacter.activeConditions) {
                            await updateConditions(currentCharacter.activeConditions.filter(c => c !== condition))
                        }
                        break
                    }
                    case 'updateHp': {
                        const hp = cmd.payload.hp as number
                        await updateCurrentHp(hp)
                        break
                    }
                    case 'updateLevel': {
                        console.log('Trame: Level change requested - requires manual level-up in Besace')
                        break
                    }
                }
                processedIds.push(cmd.id)
            }
            if (processedIds.length > 0) {
                await clearTrameCommands(currentCharacter.shareCode!, processedIds)
            }
        })
        return () => unsubscribe()
    }, [character?.shareCode])

    return (
        <CharacterContext.Provider
            value={{
                character,
                loading,
                error,
                loadCharacter,
                clearSelectedCharacter,
                updateCurrentHp,
                getModifier,
                getTotalScore,
                getSavingThrowBonus,
                getSavingThrowBreakdown,
                getSkillBonus,
                getSkillBreakdown,
                getInitiativeBreakdown,
                getACBreakdown,
                proficiencyBonus,
                addItem,
                removeItem,
                toggleEquipped,
                updateItemQuantity,
                updateCurrency,
                consumeSpellSlot,
                restoreSpellSlot,
                resetAllSpellSlots,
                getSpellSlotsForLevel,
                addAttack,
                removeAttack,
                getAttackBonus,
                getDamageBonus,
                getLevelUpInfo,
                applyLevelUp,
                toggleSpellPreparation,
                toggleKnownSpell,
                toggleAttunement,
                updateItemCharges,
                getCalculatedAC,
                getAttunedCount,
                getFeatHpBonus,
                getSpeed,
                updateFeatToggle,
                updateAvatar,
                updateDeathSaves,
                spendHitDie,
                getMaxHitDice,
                getHitDieSize,
                shortRest,
                longRest,
                updateConditions,
                updateTempHp,
                takeDamage,
                updateExhaustionLevel,
                updateClassResourceUsed,
                updateMetamagicChoices,
                enableSharing,
                disableSharing,
                syncCombatState,
                getEquipmentAbilityBonus,
                getEquipmentAbilitySetTo,
                getEquipmentSaveBonus,
                getEquipmentACBonus,
                getEquipmentSpellAttackBonus,
                getEquipmentSpellSaveDCBonus,
                getEquipmentSpeedBonus,
                getEquipmentAttackBonus,
                getEquipmentDamageBonus,
                sessionNotes: character?.sessionNotes || [],
                addSessionNote,
                updateSessionNote,
                deleteSessionNote,
                updatePersonality,
            }}
        >
            {children}
        </CharacterContext.Provider>
    )
}

export function useCharacter() {
    const context = useContext(CharacterContext)
    if (context === undefined) {
        throw new Error('useCharacter must be used within a CharacterProvider')
    }
    return context
}
