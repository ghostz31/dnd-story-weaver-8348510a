import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Transforme un nom de monstre en un slug compatible avec les URLs d'AideDD
 * @param name Nom du monstre
 * @returns Slug formaté pour AideDD
 */
export function getAideDDMonsterSlug(name: string): string {
  if (!name) return '';
  
  // Mappings spéciaux pour des cas problématiques
  const specialMappings: Record<string, string> = {
    "dragon d'ombre rouge, jeune": "dragon-d-ombre-rouge-jeune",
    "dragon d'ombre": "dragon-d-ombre",
    "élémentaire du feu": "elementaire-du-feu",
    "élémentaire de l'air": "elementaire-de-l-air",
    "élémentaire de l'eau": "elementaire-de-l-eau",
    "élémentaire de la terre": "elementaire-de-la-terre",
  };
  
  // Vérifier si on a un mapping spécial pour ce monstre
  const normalizedName = name.toLowerCase().trim();
  if (specialMappings[normalizedName]) {
    return specialMappings[normalizedName];
  }
  
  // Transformation standard pour les autres monstres
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprimer les accents
    .replace(/[œŒ]/g, "oe")
    .replace(/[^a-z0-9]+/g, "-") // Remplacer les caractères non alphanumériques par des tirets
    .replace(/^-+|-+$/g, "") // Supprimer les tirets au début et à la fin
    .replace(/-+/g, "-"); // Remplacer les séquences de tirets par un seul tiret
}
