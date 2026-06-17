import { Monster, UrlMapping, MonsterNameMapping } from './types';
import { MANUAL_IMAGE_SLUGS } from './monsterMappings';

// Fonction utilitaire pour générer des identifiants uniques
export const generateUniqueId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Normalise le nom d'un monstre pour la recherche AideDD (correction des accents)
 */
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

/**
 * Génère un slug URL compatible avec AideDD à partir du nom d'un monstre.
 * Fusionne les logiques précédemment dispersées dans EncounterUtils, api.ts, utils.ts, etc.
 */
export function getAideDDMonsterSlug(name: string, urlMap: UrlMapping = {}): string {
    // 1. Chercher d'abord dans le dictionnaire d'URL personnalisé
    if (urlMap[name]) {
        return urlMap[name];
    }

    // 2. Essayer avec le nom corrigé des accents
    const nameWithCorrectAccents = getAideDDMonsterName(name, {});
    if (urlMap[nameWithCorrectAccents]) {
        return urlMap[nameWithCorrectAccents];
    }

    // 3. Cas spéciaux connus (fusion de toutes les sources)
    const specialCases: Record<string, string> = {
        'dragon d\'ombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
        'dragon d\'ombre rouge, jeune': 'dragon-d-ombre-rouge-jeune',
        'dragon d\'ombre rouge': 'dragon-d-ombre-rouge-jeune',
        'dragon dombre rouge jeune': 'dragon-d-ombre-rouge-jeune',
        'dragon d\'ombre': 'dragon-d-ombre',
        'dragon d\'airain ancien': 'dragon-d-airain-ancien',
        'dragon d\'or ancien': 'dragon-d-or-ancien',
        'béhir': 'behir',
        'behir': 'behir',
        'arbre éveillé': 'arbre-eveille',
        'balor': 'balor',
        'allosaure': 'allosaure',
        'allosaurus': 'allosaure',
        'androsphinx': 'androsphinx',
        'ankheg': 'ankheg',
        'élémentaire du feu': 'elementaire-du-feu',
        'élémentaire de l\'air': 'elementaire-de-l-air',
        'élémentaire de l\'eau': 'elementaire-de-l-eau',
        'élémentaire de la terre': 'elementaire-de-la-terre',
    };

    const normalizedName = nameWithCorrectAccents.toLowerCase().trim();
    if (specialCases[normalizedName]) {
        return specialCases[normalizedName];
    }

    // 4. Si tout échoue, convertir manuellement en slug
    // IMPORTANT: apostrophes deviennent des tirets (pas suppression)
    let slug = normalizedName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, ''); // Enlever les accents

    // Correction spéciale pour les apostrophes: 'd'ombre' devient 'd-ombre'
    slug = slug.replace(/'(\w)/g, '-$1');

    // Traitement spécial pour les apostrophes entre lettres
    slug = slug.replace(/([a-z])'([a-z])/g, '$1-$2');

    // Remplacer les espaces par des tirets
    slug = slug.replace(/ /g, '-');

    // Supprimer les caractères non alphanumériques (sauf les tirets)
    slug = slug.replace(/[^a-z0-9-]/g, '');

    // Éviter les tirets consécutifs
    slug = slug.replace(/-+/g, '-');

    // Supprimer les tirets au début/fin
    slug = slug.replace(/^-|-$/g, '');

    return slug;
}

// Fonction pour obtenir l'URL de l'image du monstre
// Retourne undefined si aucune image n'est connue
export const getMonsterImageUrl = (monster: Monster): string | undefined => {
    // 1. Priorité absolue : Mapping manuel connu
    const mappedSlug = MANUAL_IMAGE_SLUGS[monster.name];
    if (mappedSlug) {
        return `https://www.aidedd.org/dnd/images/${mappedSlug}.jpg`;
    }

    // 2. Image définie dans l'objet monstre (champ image ou imageUrl)
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

    // 3. Fallback sur le originalName si présent
    if (monster.originalName) {
        const originalSlug = getAideDDMonsterSlug(monster.originalName);
        return `https://www.aidedd.org/dnd/images/${originalSlug}.jpg`;
    }

    // 4. Génération automatique basée sur le nom (Stratégie locale systématique)
    const slug = getAideDDMonsterSlug(monster.name);
    return `/data/aidedd-complete/images/${slug}.jpg`;
};

// Fonction pour formater le Challenge Rating (CR)
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
