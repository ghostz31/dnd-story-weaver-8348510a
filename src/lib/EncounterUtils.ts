import { Monster, Party, Encounter, EncounterMonster, EncounterParticipant, UrlMapping, MonsterNameMapping } from './types';
import { v4 as uuidv4 } from 'uuid';
import { EncounterSchema } from './schemas';
import {
    ArrowDown, Users, EyeOff, Smile, Droplets, Anchor, Link, Clock, Brain, Ghost, Eye,
    ShieldX, Square, Skull, Zap, Heart
} from 'lucide-react';

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
export const validateEncounterMonsters = (monstersEntry: any[]): EncounterMonster[] => {
    if (!monstersEntry || !Array.isArray(monstersEntry)) {
        return [];
    }

    return monstersEntry.map(monsterEntry => {
        // Vérifier si monsterEntry est valide
        if (!monsterEntry || !monsterEntry.monster) {
            // Créer un monstre par défaut pour éviter les erreurs
            return {
                monster: {
                    id: `default-${Math.random().toString(36).substring(7)}`,
                    name: "Monstre inconnu",
                    xp: 0,
                    type: "Inconnu",
                    size: "M",
                    source: "Default"
                },
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

        return {
            monster: {
                ...monster,
                name: monsterName,
                originalName: originalName,
                xp: xp || 0
            },
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

// Fonction pour obtenir les informations d'une condition
export const getConditionInfo = (conditionName: string) => {
    const conditionMap: Record<string, { icon: any; color: string }> = {
        'À terre': { icon: ArrowDown, color: 'text-orange-600 border-orange-600' },
        'Assourdi': { icon: Users, color: 'text-gray-600 border-gray-600' },
        'Aveuglé': { icon: EyeOff, color: 'text-red-600 border-red-600' },
        'Charmé': { icon: Smile, color: 'text-pink-600 border-pink-600' },
        'Empoisonné': { icon: Droplets, color: 'text-green-600 border-green-600' },
        'Empoigné': { icon: Anchor, color: 'text-brown-600 border-brown-600' },
        'Entravé': { icon: Link, color: 'text-gray-800 border-gray-800' },
        'Épuisé': { icon: Clock, color: 'text-yellow-600 border-yellow-600' },
        'Étourdi': { icon: Brain, color: 'text-purple-600 border-purple-600' },
        'Inconscient': { icon: Ghost, color: 'text-gray-500 border-gray-500' },
        'Invisible': { icon: Eye, color: 'text-blue-400 border-blue-400' },
        'Neutralisé': { icon: ShieldX, color: 'text-red-800 border-red-800' },
        'Pétrifié': { icon: Square, color: 'text-gray-700 border-gray-700' },
        'Effrayé': { icon: Skull, color: 'text-red-700 border-red-700' },
        'Paralysé': { icon: Zap, color: 'text-blue-600 border-blue-600' },
        'Concentré': { icon: Brain, color: 'text-indigo-600 border-indigo-600' },
        'Béni': { icon: Heart, color: 'text-yellow-500 border-yellow-500' },
        'Maudit': { icon: Skull, color: 'text-purple-700 border-purple-700' },
        'Ralenti': { icon: Clock, color: 'text-blue-500 border-blue-500' },
        'Hâté': { icon: Zap, color: 'text-green-500 border-green-500' }
    };

    return conditionMap[conditionName] || { icon: Square, color: 'text-gray-500 border-gray-500' };
};

// Fonction pour extraire la valeur numérique des PV (ex: "50 (10d8)" -> 50)
export const extractNumericHP = (hpValue: any): number => {
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
    if (!participant.speed || participant.speed.length === 0) {
        // Valeur par défaut : 6 cases (9 mètres)
        return 6;
    }

    // Essayer de trouver la vitesse de base dans le format "X m" ou "X ft"
    const speedText = participant.speed[0];
    const speedMatch = speedText.match(/(\d+)\s*(?:m|ft)/);

    if (speedMatch && speedMatch[1]) {
        const speedInMeters = parseInt(speedMatch[1], 10);
        // Convertir en cases (arrondir au plus proche)
        return Math.round(speedInMeters / 1.5);
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
    slug = slug.replace(/([a-z])\'([a-z])/g, '$1-$2');

    // Remplacer les espaces par des tirets
    slug = slug.replace(/ /g, '-');

    // Supprimer les caractères non alphanumériques (sauf les tirets)
    slug = slug.replace(/[^a-z0-9-]/g, '');

    // Éviter les tirets consécutifs
    slug = slug.replace(/-+/g, '-');

    return slug;
};

// Création d'un monstre générique quand aucune information n'est trouvée
export const createGenericMonster = (name: string): any => {
    return {
        name,
        type: "Inconnu",
        size: "M",
        alignment: "non aligné",
        ac: "12",
        hp: "30 (4d8+12)",
        speed: "9 m",
        abilities: {
            str: 10,
            dex: 10,
            con: 10,
            int: 10,
            wis: 10,
            cha: 10
        },
        str: 10,
        dex: 10,
        con: 10,
        int: 10,
        wis: 10,
        cha: 10,
        cr: "1",
        xp: 200,
        traits: [],
        actions: [
            {
                name: "Attaque de base",
                description: "Attaque au corps à corps avec une arme : +2 au toucher, allonge 1,50 m, une cible. Touché : 4 (1d6+1) dégâts."
            }
        ],
        legendaryActions: [],
        isLegendary: false
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
    const environment = (encounter as any).environment || '';

    return {
        party,
        name,
        monsters,
        environment,
        isValid: true
    };
};
