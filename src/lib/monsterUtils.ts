import { Monster } from './types';
import { MANUAL_IMAGE_SLUGS } from './monsterMappings';

// Fonction utilitaire pour générer des identifiants uniques
export const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Fonction utilitaire pour générer des slugs AideDD corrects
export const getAideDDMonsterSlug = (name: string): string => {
    // Convertir le nom en slug
    return name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/ /g, '-')              // Remplacer les espaces par des tirets
        .replace(/[^a-z0-9-]/g, '');     // Supprimer les caractères non alphanumériques
};

// Fonction pour obtenir l'URL de l'image du monstre
export const getMonsterImageUrl = (monster: Monster): string => {
    // 1. Essayer le mapping manuel
    if (MANUAL_IMAGE_SLUGS[monster.name]) {
        return `https://www.aidedd.org/dnd/images/${MANUAL_IMAGE_SLUGS[monster.name]}.jpg`;
    }

    // 2. Essayer monster.image (nom de fichier explicite)
    if (monster.image) {
        return `https://www.aidedd.org/dnd/images/${monster.image}`;
    }

    // 3. Essayer avec originalName si différent du nom
    if (monster.originalName && monster.originalName !== monster.name) {
        return `https://www.aidedd.org/dnd/images/${getAideDDMonsterSlug(monster.originalName)}.jpg`;
    }

    // 4. Fallback sur le nom (slugifié)
    return `https://www.aidedd.org/dnd/images/${getAideDDMonsterSlug(monster.name)}.jpg`;
};
