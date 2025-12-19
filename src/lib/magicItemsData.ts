import { MagicItem } from './types';
import { v4 as uuidv4 } from 'uuid';

export const MAGIC_ITEMS: MagicItem[] = [
    {
        id: uuidv4(),
        name: "Potion de Guérison",
        type: "Potion",
        rarity: "Commun",
        attunement: false,
        description: "Vous récupérez 2d4 + 2 points de vie.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Sac sans Fond",
        type: "Objet merveilleux",
        rarity: "Peu commun",
        attunement: false,
        description: "Ce sac possède un espace intérieur plus grand que son extérieur.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Épée Longue +1",
        type: "Arme",
        rarity: "Peu commun",
        attunement: false,
        description: "Vous bénéficiez d'un bonus de +1 aux jets d'attaque et de dégâts effectués avec cette arme magique.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Anneau de Protection",
        type: "Anneau",
        rarity: "Rare",
        attunement: true,
        description: "Vous bénéficiez d'un bonus de +1 à la CA et aux jets de sauvegarde.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Bottes de Vol",
        type: "Objet merveilleux",
        rarity: "Peu commun",
        attunement: true,
        description: "Tant que vous portez ces bottes, vous avez une vitesse de vol égale à votre vitesse de marche.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Cape d'Elfe",
        type: "Objet merveilleux",
        rarity: "Peu commun",
        attunement: true,
        description: "Les jets de Sagesse (Perception) pour vous voir sont faits avec désavantage.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Baguette de Boules de Feu",
        type: "Baguette",
        rarity: "Rare",
        attunement: true,
        description: "Cette baguette a 7 charges. Dépensez 1 charge pour lancer boule de feu (niveau 3).",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Armure de Plaques +1",
        type: "Armure",
        rarity: "Rare",
        attunement: false,
        description: "Vous avez un bonus de +1 à la CA tant que vous portez cette armure.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Amulette de Santé",
        type: "Objet merveilleux",
        rarity: "Rare",
        attunement: true,
        description: "Votre valeur de Constitution passe à 19 tant que vous portez cette amulette.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Ceinturon de Force de Géant des Collines",
        type: "Objet merveilleux",
        rarity: "Rare",
        attunement: true,
        description: "Votre valeur de Force passe à 21 tant que vous portez ce ceinturon.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Pierre Ioun de Protection",
        type: "Objet merveilleux",
        rarity: "Rare",
        attunement: true,
        description: "Vous gagnez +1 à la CA tant que cette pierre orbite autour de votre tête.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Parchemin de Sort (Niveau 1)",
        type: "Parchemin",
        rarity: "Commun",
        attunement: false,
        description: "Contient un sort de niveau 1.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Bâton de Pouvoir",
        type: "Bâton",
        rarity: "Très Rare",
        attunement: true,
        description: "Un puissant bâton accordant +2 à la CA, jets d'attaque et dégâts de sorts.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Dague Venimeuse",
        type: "Arme",
        rarity: "Rare",
        attunement: false,
        description: "Vous pouvez utiliser une action pour enduire la lame de poison.",
        source: "DMG"
    },
    {
        id: uuidv4(),
        name: "Potion d'Héroïsme",
        type: "Potion",
        rarity: "Rare",
        attunement: false,
        description: "Vous gagnez 10 points de vie temporaires et êtes sous l'effet du sort bénédiction.",
        source: "DMG"
    }
];
