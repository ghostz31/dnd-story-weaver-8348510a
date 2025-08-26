import { z } from 'zod';

// Schéma pour un joueur
export const playerSchema = z.object({
  id: z.string().min(1, "L'ID du joueur est requis"),
  name: z.string().min(1, "Le nom du joueur est requis").max(50, "Le nom ne peut pas dépasser 50 caractères"),
  level: z.number().int().min(1, "Le niveau doit être au moins 1").max(20, "Le niveau ne peut pas dépasser 20"),
  characterClass: z.string().min(1, "La classe de personnage est requise"),
  race: z.string().optional(),
  ac: z.number().int().min(1).max(30).optional(),
  currentHp: z.number().int().min(0).optional(),
  maxHp: z.number().int().min(1).optional(),
});

// Schéma pour un groupe d'aventuriers
export const partySchema = z.object({
  id: z.string().min(1, "L'ID du groupe est requis"),
  name: z.string().min(1, "Le nom du groupe est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  players: z.array(playerSchema).min(1, "Un groupe doit avoir au moins un joueur").max(8, "Un groupe ne peut pas avoir plus de 8 joueurs"),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schéma pour un monstre
export const monsterSchema = z.object({
  id: z.string().min(1, "L'ID du monstre est requis"),
  name: z.string().min(1, "Le nom du monstre est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  originalName: z.string().optional(),
  cr: z.number().min(0, "Le CR ne peut pas être négatif").max(30, "Le CR ne peut pas dépasser 30").optional(),
  challengeRating: z.number().min(0).max(30).optional(),
  xp: z.number().int().min(0, "L'XP ne peut pas être négatif"),
  type: z.string().min(1, "Le type de monstre est requis"),
  size: z.string().min(1, "La taille du monstre est requise"),
  source: z.string().min(1, "La source du monstre est requise"),
  custom: z.boolean().optional(),
  image: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
  alignment: z.string().optional(),
  environment: z.array(z.string()).optional(),
  legendary: z.boolean().optional(),
  ac: z.number().int().min(1).max(50).optional(),
  hp: z.number().int().min(1).max(1000).optional(),
  speed: z.object({
    walk: z.number().int().min(0).optional(),
    fly: z.number().int().min(0).optional(),
    swim: z.number().int().min(0).optional(),
    climb: z.number().int().min(0).optional(),
  }).optional(),
  str: z.number().int().min(1).max(30).optional(),
  dex: z.number().int().min(1).max(30).optional(),
  con: z.number().int().min(1).max(30).optional(),
  int: z.number().int().min(1).max(30).optional(),
  wis: z.number().int().min(1).max(30).optional(),
  cha: z.number().int().min(1).max(30).optional(),
});

// Schéma pour un monstre dans une rencontre
export const encounterMonsterSchema = z.object({
  monster: monsterSchema,
  quantity: z.number().int().min(1, "La quantité doit être au moins 1").max(20, "La quantité ne peut pas dépasser 20"),
});

// Schéma pour une rencontre
export const encounterSchema = z.object({
  id: z.string().min(1, "L'ID de la rencontre est requis"),
  name: z.string().min(1, "Le nom de la rencontre est requis").max(100, "Le nom ne peut pas dépasser 100 caractères"),
  description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional(),
  environment: z.string().optional(),
  monsters: z.array(encounterMonsterSchema).min(1, "Une rencontre doit avoir au moins un monstre"),
  party: partySchema.optional(),
  partyId: z.string().optional(),
  partyLevel: z.number().int().min(1).max(20).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'deadly'], {
    errorMap: () => ({ message: "La difficulté doit être 'easy', 'medium', 'hard' ou 'deadly'" })
  }),
  totalXP: z.number().int().min(0).optional(),
  adjustedXP: z.number().int().min(0).optional(),
  status: z.enum(['draft', 'active', 'completed'], {
    errorMap: () => ({ message: "Le statut doit être 'draft', 'active' ou 'completed'" })
  }).optional(),
  round: z.number().int().min(1).optional(),
  currentTurn: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Schéma pour les données d'authentification
export const loginSchema = z.object({
  email: z.string().email("L'email doit être valide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const registerSchema = z.object({
  email: z.string().email("L'email doit être valide"),
  password: z.string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre"),
  confirmPassword: z.string(),
  displayName: z.string().min(2, "Le nom d'affichage doit contenir au moins 2 caractères").max(50, "Le nom d'affichage ne peut pas dépasser 50 caractères").optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// Schéma pour la réinitialisation de mot de passe
export const resetPasswordSchema = z.object({
  email: z.string().email("L'email doit être valide"),
});

// Types TypeScript dérivés des schémas
export type Player = z.infer<typeof playerSchema>;
export type Party = z.infer<typeof partySchema>;
export type Monster = z.infer<typeof monsterSchema>;
export type EncounterMonster = z.infer<typeof encounterMonsterSchema>;
export type Encounter = z.infer<typeof encounterSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// Fonctions utilitaires pour la validation
export const validatePlayer = (data: unknown) => {
  try {
    return { success: true, data: playerSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: "Erreur de validation inconnue" }] };
  }
};

export const validateParty = (data: unknown) => {
  try {
    return { success: true, data: partySchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: "Erreur de validation inconnue" }] };
  }
};

export const validateEncounter = (data: unknown) => {
  try {
    return { success: true, data: encounterSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: "Erreur de validation inconnue" }] };
  }
};

export const validateLogin = (data: unknown) => {
  try {
    return { success: true, data: loginSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: "Erreur de validation inconnue" }] };
  }
};

export const validateRegister = (data: unknown) => {
  try {
    return { success: true, data: registerSchema.parse(data), errors: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, data: null, errors: error.errors };
    }
    return { success: false, data: null, errors: [{ message: "Erreur de validation inconnue" }] };
  }
}; 