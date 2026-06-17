/**
 * Données de référence de la Voie du Géant — extraites de Bigby Presents: Glory of the Giants
 *
 * Chaque feature est vérifiée avec des assertions de mots-clés et forbidden
 * pour garantir que les mécaniques D&D 5e sont correctement implémentées.
 */
import type { SubclassEntry } from '../reference-types'

export const geantRef: SubclassEntry = {
    id: 'giant',
    name: 'Voie du Géant',
    source: 'Bigby',
    features: {
        3: {
            name: 'Puissance du géant', type: 'passive',
            keywords: ['géant', 'langue', 'druidisme', 'thaumaturgie', 'tour de magie', 'sagesse'],
            forbidden: ['outil', 'artisan'],
        },
        3.1: {
            name: 'Dévastation géante', type: 'passive',
            keywords: ['jet écrasant', 'lancer', 'force', 'rage', 'dégâts', 'allonge', '1,50', 'taille', 'grand'],
            forbidden: ['pousser', '3 mètres', 'porter', 'soulever'],
        },
        6: {
            name: 'Fendoir élémentaire', type: 'action',
            keywords: ['arme', 'infusée', 'acide', 'froid', 'feu', 'tonnerre', 'foudre', '1d6', 'lancer', '6/18', 'action bonus', 'changer', 'type'],
            forbidden: ['1 minute', 'une seule arme'],
        },
        10: {
            name: 'Projection puissante', type: 'bonus',
            keywords: ['action bonus', 'créature', 'taille', 'M', 'déplacer', '9 mètres', 'jet de sauvegarde', 'force', 'DD', 'tombe', 'à terre'],
            forbidden: ['G', 'inférieure', '1d6', 'surface dure'],
        },
        14: {
            name: 'Colosse démiurgique', type: 'passive',
            keywords: ['allonge', '3 mètres', 'taille', 'très grande', 'projection puissante', '2d6', 'fendoir élémentaire'],
            forbidden: ['porter', 'soulever', 'tirer', 'pousser'],
        },
    },
}
