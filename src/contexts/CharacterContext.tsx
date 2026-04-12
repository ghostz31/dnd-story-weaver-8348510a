import { createContext, useContext, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../lib/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import type { Race, CharacterClass, AbilityScores } from '../types/character'
import type { InventoryItem, Currency, CharacterInventory } from '../types/inventory'
import type { Attack } from '../types/combat'
import type { LevelUpChoices, LevelUpInfo } from '../types/levelup'
import { getProficiencyBonus, hasASIAtLevel, getAverageHpGain, subclassLevels } from '../types/levelup'
import { classes } from '../data/classes'
import { races } from '../data/races'
import type { AsiChoice } from '../types/character'
import { getFeatById } from '../data/feats'

// Type complet du personnage stocké en Firestore
export interface StoredCharacter {
    id: string
    name: string
    race: Race | null
    subrace: string | null
    characterClass: CharacterClass | null
    abilityScores: AbilityScores
    background: string | null
    skillProficiencies: string[]
    alignment: string
    personalityTraits: string
    ideals: string
    bonds: string
    flaws: string
    hp: number
    currentHp?: number
    ac: number
    level: number
    userId: string
    createdAt: unknown
    updatedAt: unknown
    // Inventaire
    inventory?: CharacterInventory
    // Emplacements de sorts utilisés (par niveau: index 0 = niveau 1)
    spellSlotsUsed?: number[]
    // Attaques configurées
    attacks?: Attack[]
    // Sous-classe et Sorts
    subclass?: string
    knownSpells?: string[]
    preparedSpells?: string[]
    // Feats et Choix ASI
    feats?: string[]
    asiChoices?: Record<number, AsiChoice>
}

interface CharacterContextType {
    character: StoredCharacter | null
    loading: boolean
    error: string | null
    loadCharacter: (characterId: string) => Promise<void>
    updateCurrentHp: (newHp: number) => Promise<void>
    getModifier: (ability: keyof AbilityScores) => number
    getTotalScore: (ability: keyof AbilityScores) => number
    getSavingThrowBonus: (ability: keyof AbilityScores) => number
    getSkillBonus: (skillAbility: keyof AbilityScores, isProficient: boolean) => number
    proficiencyBonus: number
    // Inventaire
    addItem: (item: Omit<InventoryItem, 'id'>) => Promise<void>
    removeItem: (itemId: string) => Promise<void>
    toggleEquipped: (itemId: string) => Promise<void>
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>
    updateCurrency: (currency: Currency) => Promise<void>
    // Emplacements de sorts
    useSpellSlot: (level: number) => Promise<void>
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
    getCalculatedAC: () => number
    getAttunedCount: () => number
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined)

export function CharacterProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const [character, setCharacter] = useState<StoredCharacter | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Bonus de maîtrise par niveau
    const proficiencyBonus = character ? Math.ceil(1 + character.level / 4) : 2

    const loadCharacter = async (characterId: string) => {
        if (!user) {
            setError('Utilisateur non connecté')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const docRef = doc(db, 'users', user.uid, 'characters', characterId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                const data = docSnap.data()

                // Réhydrater les objets race et class depuis les données complètes
                // Les données Firestore peuvent contenir raceId/classId ou des objets simplifiés
                let raceData: Race | null = null
                let classData: CharacterClass | null = null

                // Réhydrater la race depuis raceId ou depuis l'objet stocké
                const raceId = data.raceId || data.race?.id
                if (raceId) {
                    raceData = races.find(r => r.id === raceId) || null
                }

                // Réhydrater la classe depuis classId ou depuis l'objet stocké
                const classId = data.classId || data.characterClass?.id
                if (classId) {
                    classData = classes.find(c => c.id === classId) || null
                }

                setCharacter({
                    id: docSnap.id,
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
                    feats: data.feats || [],
                    asiChoices: data.asiChoices || {},
                })
            } else {
                setError('Personnage introuvable')
            }
        } catch (err) {
            console.error('Error loading character:', err)
            setError('Erreur lors du chargement du personnage')
        } finally {
            setLoading(false)
        }
    }

    const updateCurrentHp = async (newHp: number) => {
        if (!user || !character) return

        const clampedHp = Math.max(0, Math.min(newHp, character.hp))

        try {
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
                currentHp: clampedHp,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, currentHp: clampedHp } : null)
        } catch (err) {
            console.error('Error updating HP:', err)
        }
    }

    // Calcul des bonus raciaux
    const getRacialBonus = (ability: keyof AbilityScores): number => {
        if (!character?.race) return 0
        const raceBonus = character.race.abilityBonuses?.[ability] || 0

        // Bonus de sous-race
        const subrace = character.race.subraces?.find(s => s.id === character.subrace)
        const subraceBonus = subrace?.abilityBonuses?.[ability] || 0

        return raceBonus + subraceBonus
    }

    const getTotalScore = (ability: keyof AbilityScores): number => {
        if (!character) return 10
        return (character.abilityScores[ability] || 10) + getRacialBonus(ability)
    }

    const getModifier = (ability: keyof AbilityScores): number => {
        return Math.floor((getTotalScore(ability) - 10) / 2)
    }

    const getSavingThrowBonus = (ability: keyof AbilityScores): number => {
        const mod = getModifier(ability)
        const isProficient = character?.characterClass?.savingThrows?.includes(ability) || false
        return mod + (isProficient ? proficiencyBonus : 0)
    }

    const getSkillBonus = (skillAbility: keyof AbilityScores, isProficient: boolean): number => {
        const mod = getModifier(skillAbility)
        return mod + (isProficient ? proficiencyBonus : 0)
    }

    // === FONCTIONS INVENTAIRE ===

    const getInventory = (): CharacterInventory => {
        return character?.inventory || {
            items: [],
            currency: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }
        }
    }

    const saveInventory = async (inventory: CharacterInventory) => {
        if (!user || !character) return

        try {
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
                inventory,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, inventory } : null)
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
        const updatedInventory = {
            ...inventory,
            items: inventory.items.map(item =>
                item.id === itemId ? { ...item, equipped: !item.equipped } : item
            )
        }
        await saveInventory(updatedInventory)
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

    // === FONCTIONS ÉQUIPEMENT (ATTUNEMENT & CA) ===

    const toggleAttunement = async (itemId: string) => {
        const inventory = getInventory()
        const item = inventory.items.find(i => i.id === itemId)

        if (!item) return

        // Vérifier la limite de 3 objets harmonisés
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

    const getCalculatedAC = (): number => {
        if (!character) return 10

        const dexMod = getModifier('dex')
        const inventory = getInventory()
        const equippedItems = inventory.items.filter(i => i.equipped)

        // Chercher une armure équipée (pas bouclier)
        const armor = equippedItems.find(i =>
            i.type === 'armor' && i.armorCategory && i.armorCategory !== 'shield'
        )

        // Chercher un bouclier équipé
        const shield = equippedItems.find(i =>
            i.armorCategory === 'shield'
        )

        let baseAC = 10 + dexMod // CA de base sans armure

        if (armor && armor.armorClass) {
            if (armor.addDex) {
                const maxDex = armor.maxDex ?? Infinity
                baseAC = armor.armorClass + Math.min(dexMod, maxDex)
            } else {
                baseAC = armor.armorClass
            }
        }

        // Ajouter le bouclier
        if (shield && shield.armorClass) {
            baseAC += shield.armorClass
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
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
                spellSlotsUsed,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, spellSlotsUsed } : null)
        } catch (err) {
            console.error('Error updating spell slots:', err)
        }
    }

    const useSpellSlot = async (level: number) => {
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
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
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
            newCantripsCount,
            newSpellsCount,
            newSpellSlotLevel,
        }
    }

    const applyLevelUp = async (choices: LevelUpChoices) => {
        if (!user || !character) return

        const updates: Partial<StoredCharacter> = {
            level: choices.newLevel,
            hp: character.hp + choices.hpGained,
            currentHp: (character.currentHp ?? character.hp) + choices.hpGained,
        }

        if (choices.subclassId) {
            updates.subclass = choices.subclassId
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
            // Sauvegarder le choix dans l'historique
            updates.asiChoices = {
                ...(character.asiChoices || {}),
                [choices.newLevel]: choices.asiChoice
            }

            if (choices.asiChoice.type === 'stats' && choices.asiChoice.stats) {
                // Application des bonus de caractéristiques (+2 ou +1/+1)
                const newScores = { ...character.abilityScores }
                Object.entries(choices.asiChoice.stats).forEach(([stat, bonus]) => {
                    const key = stat as keyof AbilityScores
                    // Cap à 20
                    newScores[key] = Math.min(20, (newScores[key] || 0) + (bonus || 0))
                })
                updates.abilityScores = newScores
            } else if (choices.asiChoice.type === 'feat' && choices.asiChoice.featId) {
                // Ajout du don
                const currentFeats = character.feats || []
                updates.feats = [...currentFeats, choices.asiChoice.featId]

                // Appliquer les bonus de caractéristiques du don (Half-Feat)
                const feat = getFeatById(choices.asiChoice.featId)
                if (feat?.abilityScoreIncrease) {
                    const newScores = { ...(updates.abilityScores || character.abilityScores) }
                    Object.entries(feat.abilityScoreIncrease).forEach(([stat, bonus]) => {
                        const key = stat as keyof AbilityScores
                        newScores[key] = Math.min(20, (newScores[key] || 0) + (bonus || 0))
                    })
                    updates.abilityScores = newScores
                }
            }
        }

        try {
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
                ...updates,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, ...updates } : null)
        } catch (err) {
            console.error('Error applying level up:', err)
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
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
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
            const docRef = doc(db, 'users', user.uid, 'characters', character.id)
            await updateDoc(docRef, {
                knownSpells: newKnown,
                updatedAt: serverTimestamp(),
            })
            setCharacter(prev => prev ? { ...prev, knownSpells: newKnown } : null)
        } catch (err) {
            console.error('Error toggling known spell:', err)
        }
    }

    return (
        <CharacterContext.Provider
            value={{
                character,
                loading,
                error,
                loadCharacter,
                updateCurrentHp,
                getModifier,
                getTotalScore,
                getSavingThrowBonus,
                getSkillBonus,
                proficiencyBonus,
                addItem,
                removeItem,
                toggleEquipped,
                updateItemQuantity,
                updateCurrency,
                useSpellSlot,
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
                getCalculatedAC,
                getAttunedCount,
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
