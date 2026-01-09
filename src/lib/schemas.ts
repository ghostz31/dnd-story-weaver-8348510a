import { z } from 'zod';

// --- Schemas de Base ---

export const UserSchema = z.object({
    uid: z.string(),
    email: z.string().email(),
    displayName: z.string().optional(),
    photoURL: z.string().optional(),
    subscriptionPlan: z.enum(['free', 'premium']),
    createdAt: z.string(),
    lastLogin: z.string(),
});

export const MonsterSchema = z.object({
    // Base fields
    id: z.string(),
    name: z.string().min(1, "Le nom est requis"),
    originalName: z.string().optional(),
    cr: z.number().optional(),
    challengeRating: z.number().optional(),
    xp: z.number().default(0),
    type: z.string().default("Inconnu"),
    size: z.string().default("M"),
    source: z.string().default("Custom"),
    custom: z.boolean().optional(),
    image: z.string().optional(),
    alignment: z.string().optional(),
    environment: z.array(z.string()).optional(),
    legendary: z.boolean().optional(),
    ac: z.number().optional(),
    hp: z.number().optional(),
    speed: z.object({
        walk: z.number().optional(),
        fly: z.number().optional(),
        swim: z.number().optional(),
        climb: z.number().optional(),
    }).optional(),
    // Ability Scores
    str: z.number().optional(),
    dex: z.number().optional(),
    con: z.number().optional(),
    int: z.number().optional(),
    wis: z.number().optional(),
    cha: z.number().optional(),
    // Details
    savingThrows: z.string().optional(),
    skills: z.string().optional(),
    senses: z.string().optional(),
    languages: z.string().optional(),
    damageResistances: z.string().optional(),
    damageImmunities: z.string().optional(),
    conditionImmunities: z.string().optional(),
    damageVulnerabilities: z.string().optional(),
    // Deep structures
    traits: z.array(z.object({
        name: z.string(),
        desc: z.string()
    })).optional(),
    actions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        attack_bonus: z.number().optional(),
        damage_dice: z.string().optional(),
        damage_bonus: z.number().optional()
    })).optional(),
    reactions: z.array(z.object({
        name: z.string(),
        desc: z.string()
    })).optional(),
    legendaryActions: z.array(z.object({
        name: z.string(),
        desc: z.string()
    })).optional(),
});

export const PlayerSchema = z.object({
    id: z.string(),
    name: z.string(),
    level: z.number().min(1).max(20),
    characterClass: z.string(),
    race: z.string().optional(),
    ac: z.number().optional(),
    currentHp: z.number().optional(),
    maxHp: z.number().optional(),
    // Stats
    str: z.number().optional(),
    dex: z.number().optional(),
    con: z.number().optional(),
    int: z.number().optional(),
    wis: z.number().optional(),
    cha: z.number().optional(),
    speed: z.array(z.string()).optional(),
    initiative: z.number().optional(),
    dndBeyondId: z.string().optional(),
});

export const PartySchema = z.object({
    id: z.string(),
    name: z.string(),
    players: z.array(PlayerSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export const EncounterMonsterSchema = z.object({
    monster: MonsterSchema,
    quantity: z.number().min(1).default(1),
});

export const EncounterParticipantSchema = z.object({
    id: z.string(),
    name: z.string(),
    initiative: z.number().default(0),
    initiativeModifier: z.number().default(0),
    maxHp: z.number().default(10),
    currentHp: z.number().default(10),
    ac: z.number().default(10),
    type: z.string().optional(), // 'Monstre', 'Humain', etc.
    isPC: z.boolean().default(false),
    monsterId: z.string().optional(), // Si c'est un monstre
    playerId: z.string().optional(), // Si c'est un joueur
    originalName: z.string().optional(), // Pour le lien vers AideDD

    // Stats optionnelles pour la gestion plus fine (pour la gamification/calculs)
    str: z.number().optional(),
    dex: z.number().optional(),
    con: z.number().optional(),
    int: z.number().optional(),
    wis: z.number().optional(),
    cha: z.number().optional(),

    // États et Notes
    conditions: z.array(z.string()).optional(), // 'aveuglé', 'charmé', etc.
    notes: z.string().optional(),

    // D&D Beyond
    dndBeyondId: z.string().optional(),

    // Action Légendaires
    legendaryActions: z.object({
        current: z.number(),
        max: z.number()
    }).optional(),

    // Données complètes du monstre pour l'affichage (StatBlock)
    actions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        description: z.string().optional(),
        attack_bonus: z.number().optional(),
        damage_dice: z.string().optional(),
        damage_bonus: z.number().optional()
    })).optional(),
    traits: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        description: z.string().optional()
    })).optional(),
    reactions: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        description: z.string().optional()
    })).optional(),
    legendaryActionsList: z.array(z.object({
        name: z.string(),
        desc: z.string(),
        description: z.string().optional()
    })).optional(),

    // Stats étendues
    image: z.string().optional(),
    xp: z.number().optional(),
    cr: z.union([z.string(), z.number()]).optional(),
    savingThrows: z.string().optional(),
    skills: z.string().optional(),
    damageVulnerabilities: z.string().optional(),
    damageResistances: z.string().optional(),
    damageImmunities: z.string().optional(),
    conditionImmunities: z.string().optional(),
    senses: z.string().optional(),
    languages: z.string().optional(),
    challengeRating: z.number().optional(),
});

export const EncounterSchema = z.object({
    id: z.string(),
    name: z.string().default("Nouvelle Rencontre"),
    description: z.string().optional(),
    environment: z.string().optional(),
    monsters: z.array(EncounterMonsterSchema).default([]),
    participants: z.array(EncounterParticipantSchema).optional(),
    party: PartySchema.optional(),
    partyId: z.string().optional(),
    partyLevel: z.number().optional(),
    difficulty: z.enum(['easy', 'medium', 'hard', 'deadly']).default('medium'),
    totalXP: z.number().optional(),
    adjustedXP: z.number().optional(),
    status: z.enum(['draft', 'active', 'completed']).default('draft'),
    round: z.number().default(1),
    currentTurn: z.number().default(0),
    isActive: z.boolean().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Types inférés (optionnel, pour vérification croisée)
export type MonsterZod = z.infer<typeof MonsterSchema>;
export type EncounterZod = z.infer<typeof EncounterSchema>;
