import { Monster } from './types';
import { MANUAL_IMAGE_SLUGS } from './monsterMappings';

// Fonction utilitaire pour générer des identifiants uniques
export const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Fonction utilitaire pour générer des slugs AideDD corrects
export const getAideDDMonsterSlug = (name: string): string => {
    return name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/['\s]/g, '-')          // Remplacer espaces et apostrophes par des tirets
        .replace(/[^a-z0-9-]/g, '')      // Supprimer les autres caractères spéciaux
        .replace(/-+/g, '-')             // Éviter les tirets multiples
        .replace(/^-|-$/g, '');          // Supprimer les tirets au début/fin
};

// Fonction pour obtenir l'URL de l'image du monstre
// Retourne undefined si aucune image n'est connue
export const getMonsterImageUrl = (monster: Monster): string | undefined => {
    // 1. Priorité absolue : l'image définie dans l'objet monstre (champ image ou imageUrl)
    const imageField = monster.image || (monster as any).imageUrl;
    if (imageField && imageField.trim() !== '' && imageField !== 'null') {
        const img = imageField.trim();
        // Si c'est une URL absolue (http, https) ou une Data URI (data:, blob:)
        if (img.match(/^(http|https|data|blob|file):/i)) {
            return img;
        }
        // Si c'est un fichier image local (exporté par dnd-researcher)
        if (img.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
            return `/data/aidedd-complete/images/${img}`;
        }
        // Sinon, on assume que c'est un nom de fichier sur AideDD (Sauf si c'est déjà une extension)
        return `https://www.aidedd.org/dnd/images/${img}`;
    }

    // 2. Génération automatique basée sur le nom (Stratégie locale systématique)
    const slug = getAideDDMonsterSlug(monster.name);
    return `/data/aidedd-complete/images/${slug}.jpg`;
};

// Fonction pour formater le Challenge Rating (CR)
export const formatCR = (cr: number | string): string => {
    const numCr = typeof cr === 'string' ? parseFloat(cr) : cr;

    if (isNaN(numCr)) return String(cr);

    // Cas spécifiques pour les fractions courantes
    if (numCr === 0.125) return "1/8";
    if (numCr === 0.25) return "1/4";
    if (numCr === 0.5) return "1/2";

    // Pour tous les autres cas (0, 1, 2, etc.), on affiche le nombre tel quel
    return String(numCr);
};
