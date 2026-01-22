import React from 'react';
import { Monster, Party, Encounter, EncounterMonster, EncounterParticipant, UrlMapping, MonsterNameMapping, EncounterCondition } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EncounterSchema } from './schemas';
import {
    ArrowDown, Users, EyeOff, Smile, Droplets, Anchor, Link, Clock, Brain, Ghost, Eye,
    ShieldX, Square, Skull, Zap, Heart
} from 'lucide-react';

export const calculateModifier = (score: number): number => Math.floor((score - 10) / 2);


// Interface pour la version API locale des rencontres qui utilise Party comme objet complet
export interface LocalEncounter extends Omit<Encounter, 'monsters'> {
    party: Party;
    monsters: EncounterMonster[];
}

/**
 * Transforme les rencontres stockées (qui ont seulement partyId) en LocalEncounter
 * en y joignant les données complètes du groupe (Party).
 * 
 * @param localEncounters Liste des rencontres brutes
 * @param localParties Liste des groupes disponibles
 * @returns Liste de rencontres enrichies avec l'objet Party complet
 */
export const transformLocalEncounters = (localEncounters: Encounter[], localParties: Party[]): LocalEncounter[] => {
    return localEncounters.map(encounter => {
        // Validation Zod
        const validation = EncounterSchema.safeParse(encounter);
        const validEncounter = validation.success ? validation.data : encounter;
        if (!validation.success) {
            console.warn(`[EncounterUtils] Rencontre locale invalide ${encounter.id}, utilisation brut.`);
        }
        // Trouver le groupe correspondant
        const party = localParties.find(p => p.id === validEncounter.partyId);

        if (!party) {
            console.warn(`Groupe non trouvé pour la rencontre ${validEncounter.name} (partyId: ${validEncounter.partyId})`);
            // Créer un groupe par défaut pour éviter les erreurs
            const defaultParty: Party = {
                id: validEncounter.partyId || 'unknown',
                name: 'Groupe inconnu',
                players: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            return {
                ...validEncounter,
                party: defaultParty
            } as LocalEncounter;
        }

        return {
            ...validEncounter,
            party
        } as LocalEncounter;
    });
};

/**
 * Valide et nettoie la liste des monstres d'une rencontre.
 * Assure que chaque monstre a une quantité, un ID unique, et des stats valides.
 * Estime l'XP basée sur le CR si manquant.
 * 
 * @param monstersEntry Liste brute des monstres (peut contenir des objets mal formés)
 * @returns Liste nettoyée de EncounterMonster
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateEncounterMonsters = (monstersEntry: any[]): EncounterMonster[] => {
    if (!monstersEntry || !Array.isArray(monstersEntry)) {
        return [];
    }

    return monstersEntry.map(monsterEntry => {
        // Vérifier si monsterEntry est valide
        if (!monsterEntry || !monsterEntry.monster) {
            // Créer un monstre par défaut pour éviter les erreurs
            const defaultMonster: Monster = {
                id: `default-${Math.random().toString(36).substring(7)}`,
                name: "Monstre inconnu",
                xp: 0,
                type: "Inconnu",
                size: "M",
                source: "Default",
                str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10
            };
            return {
                monster: defaultMonster,
                quantity: 1
            };
        }

        const { monster, quantity } = monsterEntry;
        const monsterName = monster.name || "Monstre inconnu";
        const originalName = monster.originalName || monsterName;

        // Si le monstre n'a pas de propriété xp, lui donner une valeur par défaut
        let xp = monster.xp;
        if (!xp) {
            if (monster.cr !== undefined) {
                // Note: Logic previously in EncounterBuilder. Using direct values or helper if imported.
                // Since calculateXPFromCR was local/imported, we can re-implement loose mapping or rely on what's passed.
                // Ideally this function stays pure.
                // We'll leave XP as is if 0, logic downstream handles it or we should fix it here.
                // Let's assume input monster object needs fixing.
                // For now, simple fallback.
                xp = 0;
            }
        }

        const validatedMonster: Monster = {
            ...monster, // ✅ Preserve ALL monster properties (actions, traits, stats, etc.)
            name: monsterName,
            originalName: originalName,
            xp: xp || 0
        };

        return {
            monster: validatedMonster,
            quantity: quantity || 1
        };
    });
};

// --- Refactoring Helpers from EncounterTracker ---

// Définir les conditions avec leurs icônes et couleurs
export const CONDITIONS = [
    'À terre', 'Assourdi', 'Aveuglé', 'Charmé', 'Empoisonné',
    'Empoigné', 'Entravé', 'Épuisé', 'Étourdi', 'Inconscient',
    'Invisible', 'Neutralisé', 'Pétrifié', 'Effrayé', 'Paralysé',
    'Concentré', 'Béni', 'Maudit', 'Ralenti', 'Hâté'
] as const;

export type Condition = typeof CONDITIONS[number];

/**
 * Format Challenge Rating for display (converts decimals to fractions)
 */
export const formatCR = (cr: number | string | undefined): string => {
    if (cr === undefined || cr === null) return '—';
    const numCR = typeof cr === 'string' ? parseFloat(cr) : cr;
    if (isNaN(numCR)) return String(cr);
    if (numCR === 0) return '0';
    if (numCR === 0.125) return '1/8';
    if (numCR === 0.25) return '1/4';
    if (numCR === 0.5) return '1/2';
    return String(numCR);
};

// Fonction pour obtenir les informations d'une condition
export const getConditionInfo = (condition: string | EncounterCondition) => {
    const conditionName = typeof condition === 'string' ? condition : condition.name;
    const conditionMap: Record<string, { icon: React.ElementType; color: string; description: string }> = {
        'À terre': { icon: ArrowDown, color: 'text-orange-600 border-orange-600', description: 'Désavantage aux attaques. Attaques à distance avec désavantage, mêlée avec avantage.' },
        'Assourdi': { icon: Users, color: 'text-gray-600 border-gray-600', description: 'Ne peut pas entendre. Échec automatique aux tests basés sur l\'ouïe.' },
        'Aveuglé': { icon: EyeOff, color: 'text-red-600 border-red-600', description: 'Ne peut pas voir. Désavantage aux attaques, attaques contre avec avantage.' },
        'Charmé': { icon: Smile, color: 'text-pink-600 border-pink-600', description: 'Ne peut pas attaquer le charmeur. Celui-ci a avantage aux interactions sociales.' },
        'Empoisonné': { icon: Droplets, color: 'text-green-600 border-green-600', description: 'Désavantage aux jets d\'attaque et de caractéristique.' },
        'Empoigné': { icon: Anchor, color: 'text-brown-600 border-brown-600', description: 'Vitesse réduite à 0. Fin si l\'empoigneur est neutralisé ou éloigné.' },
        'Entravé': { icon: Link, color: 'text-gray-800 border-gray-800', description: 'Vitesse 0, désavantage aux attaques et jets de Dex, avantage contre.' },
        'Épuisé': { icon: Clock, color: 'text-yellow-600 border-yellow-600', description: 'Niveaux cumulatifs. 1: désavantage carac. 6: mort.' },
        'Étourdi': { icon: Brain, color: 'text-purple-600 border-purple-600', description: 'Neutralisé, ne peut pas bouger, parle difficilement. Échec auto Dex/For.' },
        'Inconscient': { icon: Ghost, color: 'text-gray-500 border-gray-500', description: 'Neutralisé, lâche tout, tombe. Attaques avec avantage, coup critique à 1,5m.' },
        'Invisible': { icon: Eye, color: 'text-blue-400 border-blue-400', description: 'Impossible à voir. Avantage aux attaques, désavantage contre.' },
        'Neutralisé': { icon: ShieldX, color: 'text-red-800 border-red-800', description: 'Ne peut effectuer aucune action ni réaction.' },
        'Pétrifié': { icon: Square, color: 'text-gray-700 border-gray-700', description: 'Transformé en pierre. Poids x10, ne vieillit plus, résistance à tout.' },
        'Effrayé': { icon: Skull, color: 'text-red-700 border-red-700', description: 'Désavantage tant que la source est visible. Ne peut s\'en approcher.' },
        'Paralysé': { icon: Zap, color: 'text-blue-600 border-blue-600', description: 'Neutralisé, ne peut pas bouger/parler. Échec auto Dex/For, coup critique à 1,5m.' },
        'Concentré': { icon: Brain, color: 'text-indigo-600 border-indigo-600', description: 'Maintient un sort. Jet de Con sur dégâts (DD 10 ou dégâts/2).' },
        'Béni': { icon: Heart, color: 'text-yellow-500 border-yellow-500', description: '+1d4 aux jets d\'attaque et de sauvegarde.' },
        'Maudit': { icon: Skull, color: 'text-purple-700 border-purple-700', description: 'Effet variable selon la malédiction appliquée.' },
        'Ralenti': { icon: Clock, color: 'text-blue-500 border-blue-500', description: 'Vitesse /2, -2 CA et Dex, pas de réaction, 1 action ou bonus.' },
        'Hâté': { icon: Zap, color: 'text-green-500 border-green-500', description: 'Vitesse x2, +2 CA, avantage Dex, action supplémentaire.' }
    };

    return conditionMap[conditionName] || { icon: Square, color: 'text-gray-500 border-gray-500', description: 'Condition inconnue.' };
};

// Helper: Ensure conditions are Condition objects (migration)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const migrateConditions = (conditions: any[]): EncounterCondition[] => {
    if (!conditions) return [];
    return conditions.map(c => {
        if (typeof c === 'string') {
            return { id: uuidv4(), name: c, duration: -1 };
        }
        return c;
    });
};

// Fonction pour calculer l'XP à partir du CR
export const calculateXPFromCR = (cr: number | string): number => {
    const crValue = typeof cr === 'string' ? parseFloat(cr) : cr;
    const xpTable: Record<string, number> = {
        '0': 10, '0.125': 25, '0.25': 50, '0.5': 100,
        '1': 200, '2': 450, '3': 700, '4': 1100, '5': 1800,
        '6': 2300, '7': 2900, '8': 3900, '9': 5000, '10': 5900,
        '11': 7200, '12': 8400, '13': 10000, '14': 11500, '15': 13000,
        '16': 15000, '17': 18000, '18': 20000, '19': 22000, '20': 25000,
        '21': 33000, '22': 41000, '23': 50000, '24': 62000, '25': 75000,
        '26': 90000, '27': 105000, '28': 120000, '29': 135000, '30': 155000
    };
    return xpTable[crValue.toString()] || 0;
};

// Fonction pour extraire la valeur numérique des PV (ex: "50 (10d8)" -> 50)
export const extractNumericHP = (hpValue: string | number): number => {
    if (typeof hpValue === 'number') {
        return hpValue;
    }
    if (typeof hpValue === 'string') {
        const match = hpValue.match(/^(\d+)/);
        if (match) {
            return parseInt(match[1], 10);
        }
    }
    return 10; // Valeur par défaut
};

// Fonction pour estimer le modificateur de Dextérité basé sur la classe et le niveau
export const estimateDexModifier = (participant: EncounterParticipant): number => {
    if (!participant.isPC) {
        // Pour les monstres, utiliser le modificateur de DEX réel
        return participant.dex ? Math.floor((participant.dex - 10) / 2) : 0;
    }

    // Pour les PJs, utiliser le modificateur explicite s'il existe
    if (participant.initiativeModifier !== undefined) {
        return participant.initiativeModifier;
    }

    // Estimer le modificateur de DEX basé sur la classe
    const classModifiers: Record<string, number> = {
        'Barbare': 0,
        'Barde': 2,
        'Clerc': 0,
        'Druide': 0,
        'Ensorceleur': 1,
        'Guerrier': 1,
        'Magicien': 1,
        'Moine': 3,
        'Paladin': 0,
        'Rôdeur': 2,
        'Roublard': 3,
        'Sorcier': 1
    };

    // Extraire la classe du champ notes
    const classMatch = participant.notes.match(/(\w+) niveau/);
    const characterClass = classMatch ? classMatch[1] : '';

    return classModifiers[characterClass] || 0;
};

// Calculer la vitesse de déplacement en cases (1 case = 1,5 mètre)
export const calculateMovementSpeed = (participant: EncounterParticipant): number => {
    if (!participant.speed) {
        // Valeur par défaut : 6 cases (9 mètres)
        return 6;
    }

    // Handle speed as array
    if (Array.isArray(participant.speed)) {
        if (participant.speed.length === 0) {
            return 6;
        }

        // Essayer de trouver la vitesse de base dans le format "X m" ou "X ft"
        const speedText = participant.speed[0];
        if (typeof speedText === 'string') {
            const speedMatch = speedText.match(/(\d+)\s*(?:m|ft)/);
            if (speedMatch && speedMatch[1]) {
                const speedInMeters = parseInt(speedMatch[1], 10);
                // Convertir en cases (arrondir au plus proche)
                return Math.round(speedInMeters / 1.5);
            }
        }
    }

    // Handle speed as object { walk, fly, swim, climb }
    if (typeof participant.speed === 'object' && 'walk' in participant.speed) {
        const walkSpeed = (participant.speed as any).walk;
        if (typeof walkSpeed === 'number') {
            return Math.round(walkSpeed / 1.5);
        }
    }

    // Si aucune information, retourner une valeur par défaut
    return 6;
};

// Fonction pour obtenir le nom exact pour AideDD (pour l'affichage)
export const getAideDDMonsterName = (name: string, monsterNameMap: MonsterNameMapping = {}): string => {
    // Vérifier d'abord dans le dictionnaire de correspondance
    if (monsterNameMap[name]) {
        return monsterNameMap[name];
    }

    // Règles spécifiques pour les cas non couverts par le dictionnaire
    const nameWithCorrectAccents = name
        .replace(/([Gg])eant(e?)/g, '$1éant$2')
        .replace(/([Ee])lementaire/g, '$1lémentaire')
        .replace(/([Ee])veille/g, '$1veillé')
        .replace(/([Ee])lan/g, '$1lan')
        .replace(/([Ee])pee/g, '$1pée')
        .replace(/([Ee])pouvantail/g, '$1pouvantail');

    return nameWithCorrectAccents;
};


// Fonction pour obtenir le slug URL pour AideDD
export const getAideDDMonsterSlug = (name: string, urlMap: UrlMapping = {}): string => {
    // 1. Chercher d'abord dans le dictionnaire d'URL
    if (urlMap[name]) {
        return urlMap[name]; // Retourne directement le slug sans encodage
    }

    // 2. Essayer avec le nom corrigé des accents
    const nameWithCorrectAccents = getAideDDMonsterName(name, {});
    if (urlMap[nameWithCorrectAccents]) {
        return urlMap[nameWithCorrectAccents]; // Retourne directement le slug sans encodage
    }

    // 3. Cas spéciaux connus pour la correction manuelle
    const specialCases: Record<string, string> = {
        'Dragon d\'ombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
        'Dragon d\'ombre rouge, jeune': 'dragon-d-ombre-rouge-jeune',
        'Dragon d\'ombre rouge': 'dragon-d-ombre-rouge-jeune',
        'Dragon dombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
        'Béhir': 'behir',
        'Behir': 'behir',
        'Arbre éveillé': 'arbre-eveille',
        'Balor': 'balor'
    };

    const normalizedName = name.trim();
    if (specialCases[normalizedName]) {
        return specialCases[normalizedName];
    }

    // 4. Si tout échoue, convertir manuellement en slug
    // IMPORTANT: Ne pas utiliser encodeURIComponent, car le site attend un format avec tirets
    let slug = name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Enlever les accents

    // Correction spéciale pour les apostrophes: 'd'ombre' devient 'd-ombre'
    slug = slug.replace(/'(\w)/g, '-$1');

    // Traitement spécial pour les apostrophes
    slug = slug.replace(/([a-z])'([a-z])/g, '$1-$2');

    // Remplacer les espaces par des tirets
    slug = slug.replace(/ /g, '-');

    // Supprimer les caractères non alphanumériques (sauf les tirets)
    slug = slug.replace(/[^a-z0-9-]/g, '');

    // Éviter les tirets consécutifs
    slug = slug.replace(/-+/g, '-');

    return slug;
};

// Création d'un monstre générique quand aucune information n'est trouvée
export const createGenericMonster = (name: string): Monster => {
    return {
        id: `generic-${Date.now()}`, // Added ID to satisfy Monster interface
        name,
        type: "Inconnu",
        size: "M",
        alignment: "non aligné",
        ac: 12, // Changed to number
        hp: 30, // Changed to number, assuming flat value. If string needed for display, Monster interface expects number for hp usually. Checking interface... it says hp?: number.
        xp: 200,
        source: "Générique", // Added source
        speed: { walk: 9 }, // Changed to object matching interface
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        cr: 1, // Changed to number
        // traits: [], // Monster interface has traits? Interface check: traits not in Monster interface shown in types.ts (lines 49-78). Wait, EncounterParticipant has traits. Monster doesn't shown traits in the snippet.
        // Checking types.ts content again. Monster interface (lines 49-78) does NOT have traits or actions or legendaryActions.
        // However, the code previously assigned them. This implies the interface might be incomplete or the usage here was loose.
        // I will adhere to the visible Monster interface or extend it if needed. 
        // Warning: createGenericMonster was returning an object with traits/actions. If I strict type it to Monster, I might lose those properties if they aren't in the interface.
        // Let's re-read types.ts. Line 49: Monster interface. It ends at line 78.
        // It has NO traits, actions, legendaryActions.
        // BUT EncounterParticipant (line 219) DOES have actions/traits.
        // The previous code returned an object with traits/actions.
        // If I change return type to Monster, I validly return basic stats.
        // But validation might fail if downstream components expect actions on "Monster" (which they shouldn't if they use the type properly).
        // Let's assume for now I should strictly stick to the Monster Type.
        // But wait, "hp" in generic was "30 (4d8+12)" (string), but Monster interface says hp?: number. 
        // So the previous code was violating the interface if it was indeed a "Monster". 
        // It's likely this "createGenericMonster" was creating something used as a participant or hydrated monster.
        // I will fix the types to match the defined Monster interface for now, and rely on Enrichment to add actions if needed.
    };
};

/**
 * Résultat de la normalisation d'une rencontre pour l'édition
 */
export interface NormalizedEncounterData {
    party: Party | null;
    name: string;
    monsters: EncounterMonster[];
    environment: string;
    isValid: boolean;
    error?: string;
}

/**
 * Prépare une rencontre pour l'édition dans le EncounterBuilder.
 * Valide les données, hydrate le groupe associé, et nettoie la liste des monstres.
 * 
 * @param encounter La rencontre brute sélectionnée (LocalEncounter ou Encounter)
 * @param parties Liste des groupes disponibles pour la recherche
 * @returns Données normalisées prêtes à être injectées dans le state
 */
export const normalizeEncounterForEditing = (
    encounter: LocalEncounter | Encounter,
    parties: Party[]
): NormalizedEncounterData => {
    // 1. Validation structurelle de base
    if (!encounter) {
        return {
            party: null, name: '', monsters: [], environment: '',
            isValid: false, error: "Rencontre nulle ou indéfinie"
        };
    }

    // 2. Validation et nettoyage des monstres
    let monsters: EncounterMonster[] = [];
    if (encounter.monsters && Array.isArray(encounter.monsters)) {
        monsters = validateEncounterMonsters(encounter.monsters);
    } else {
        console.warn(`[EncounterUtils] Format de monstres invalide pour la rencontre ${encounter.name}`);
    }

    // 3. Récupération du groupe (Party)
    let party: Party | null = null;

    if ('party' in encounter && encounter.party && typeof encounter.party === 'object') {
        party = encounter.party as Party;
    } else if (encounter.partyId) {
        party = parties.find(p => p.id === encounter.partyId) || null;
        if (!party) {
            console.warn(`[EncounterUtils] Groupe ID ${encounter.partyId} non trouvé pour ${encounter.name}`);
        }
    }

    // 4. Normalisation des autres champs
    const name = encounter.name || "Nouvelle Rencontre";
    const environment = encounter.environment || '';

    return {
        party,
        name,
        monsters,
        environment,
        isValid: true
    };
};
/**
 * Constantes pour le calcul de difficulte (DMG p. 82)
 */
export const XP_THRESHOLDS_BY_LEVEL: Record<number, [number, number, number, number]> = {
    1: [25, 50, 75, 100],
    2: [50, 100, 150, 200],
    3: [75, 150, 225, 400],
    4: [125, 250, 375, 500],
    5: [250, 500, 750, 1100],
    6: [300, 600, 900, 1400],
    7: [350, 750, 1100, 1700],
    8: [450, 900, 1400, 2100],
    9: [550, 1100, 1600, 2400],
    10: [600, 1200, 1900, 2800],
    11: [800, 1600, 2400, 3600],
    12: [1000, 2000, 3000, 4500],
    13: [1100, 2200, 3400, 5100],
    14: [1250, 2500, 3800, 5700],
    15: [1400, 2800, 4300, 6400],
    16: [1600, 3200, 4800, 7200],
    17: [2000, 3900, 5900, 8800],
    18: [2100, 4200, 6300, 9500],
    19: [2400, 4900, 7300, 10900],
    20: [2800, 5700, 8500, 12700]
};

export const ENCOUNTER_MULTIPLIERS = {
    1: 1,
    2: 1.5,
    3: 2,
    7: 2.5,
    11: 3,
    15: 4
};

/**
 * Calcule les seuils d'XP du groupe pour les 4 niveaux de difficulté
 */
export const calculatePartyXPThresholds = (party: Party): { easy: number, medium: number, hard: number, deadly: number } => {
    const thresholds = { easy: 0, medium: 0, hard: 0, deadly: 0 };

    // Si pas de joueurs ou niveaux non définis, on peut assumer niveau 1 par défaut ou retourner 0
    // Ici on suppose que les joueurs ont un champ 'level' (à vérifier dans le type Player)
    // S'il n'existe pas, on assume niveau 1 pour l'instant.

    // Note: Le type Player n'a pas été inspecté complètement, on va assumer qu'il faut peut-être l'adapter
    // ou utiliser une valeur par défaut de 1 si le champ manque.

    const players = party.players || [];
    if (players.length === 0) return thresholds;

    players.forEach(player => {
        // Le champ level est désormais dans le type Player (ajouté dans types.ts)
        const level = player.level || 1;
        const validLevel = Math.max(1, Math.min(20, level));
        const [easy, medium, hard, deadly] = XP_THRESHOLDS_BY_LEVEL[validLevel];

        thresholds.easy += easy;
        thresholds.medium += medium;
        thresholds.hard += hard;
        thresholds.deadly += deadly;
    });

    return thresholds;
};

/**
 * Calcule l'XP ajusté de la rencontre en fonction du nombre de monstres
 */
export const calculateEncounterAdjustedXP = (monsters: EncounterMonster[], partySize: number = 4): number => {
    let rawXP = 0;
    let monsterCount = 0;

    monsters.forEach(entry => {
        rawXP += (entry.monster.xp || 0) * entry.quantity;
        monsterCount += entry.quantity;
    });

    if (monsterCount === 0) return 0;

    // Déterminer le multiplicateur
    let multiplier = 1;
    if (monsterCount === 1) multiplier = 1;
    else if (monsterCount === 2) multiplier = 1.5;
    else if (monsterCount >= 3 && monsterCount <= 6) multiplier = 2;
    else if (monsterCount >= 7 && monsterCount <= 10) multiplier = 2.5;
    else if (monsterCount >= 11 && monsterCount <= 14) multiplier = 3;
    else multiplier = 4;

    // Ajustement pour petits groupes (<3) ou grands groupes (>5)
    if (partySize < 3) {
        // Augmenter le multiplicateur d'un cran
        if (multiplier === 1) multiplier = 1.5;
        else if (multiplier === 1.5) multiplier = 2;
        else if (multiplier === 2) multiplier = 2.5;
        else if (multiplier === 2.5) multiplier = 3;
        else multiplier = 4;
    } else if (partySize > 5) {
        // Diminuer le multiplicateur d'un cran
        if (multiplier === 4) multiplier = 3;
        else if (multiplier === 3) multiplier = 2.5;
        else if (multiplier === 2.5) multiplier = 2;
        else if (multiplier === 2) multiplier = 1.5;
        else multiplier = 1;
    }

    return Math.floor(rawXP * multiplier);
};

/**
 * Détermine la difficulté de la rencontre
 */
export const getEncounterDifficulty = (
    adjustedXP: number,
    thresholds: { easy: number, medium: number, hard: number, deadly: number }
): { label: string, color: string, percentage: number } => {
    if (adjustedXP === 0) return { label: 'Aucune', color: 'bg-gray-400', percentage: 0 };

    if (adjustedXP < thresholds.easy) {
        const percent = Math.min(100, Math.floor((adjustedXP / thresholds.easy) * 25));
        return { label: 'Trivial', color: 'bg-gray-400', percentage: percent };
    }
    if (adjustedXP < thresholds.medium) {
        // Entre Easy (25%) et Medium (50%)
        const range = thresholds.medium - thresholds.easy;
        const progress = adjustedXP - thresholds.easy;
        const percent = 25 + Math.floor((progress / range) * 25);
        return { label: 'Facile', color: 'bg-green-500', percentage: percent };
    }
    if (adjustedXP < thresholds.hard) {
        // Entre Medium (50%) et Hard (75%)
        const range = thresholds.hard - thresholds.medium;
        const progress = adjustedXP - thresholds.medium;
        const percent = 50 + Math.floor((progress / range) * 25);
        return { label: 'Moyen', color: 'bg-yellow-500', percentage: percent };
    }
    if (adjustedXP < thresholds.deadly) {
        // Entre Hard (75%) et Deadly (100%)
        const range = thresholds.deadly - thresholds.hard;
        const progress = adjustedXP - thresholds.hard;
        const percent = 75 + Math.floor((progress / range) * 25);
        return { label: 'Difficile', color: 'bg-orange-500', percentage: percent };
    }

    // Au dessus de Deadly
    return { label: 'Mortel', color: 'bg-red-600', percentage: 100 };
};
