// Conditions D&D 5e - toutes les conditions avec descriptions FR

export type ConditionKey = 
    | 'blinded' 
    | 'charmed' 
    | 'deafened' 
    | 'frightened' 
    | 'grappled' 
    | 'incapacitated' 
    | 'invisible' 
    | 'paralyzed' 
    | 'petrified' 
    | 'poisoned' 
    | 'prone' 
    | 'restrained' 
    | 'stunned' 
    | 'unconscious' 
    | 'exhaustion' 
    | 'concentration'

export interface Condition {
    key: ConditionKey
    name: string
    description: string
    icon: string
    color: string
}

export const conditions: Condition[] = [
    {
        key: 'blinded',
        name: 'Aveuglé',
        description: 'Un aveuglé ne peut pas voir et rate automatiquement tout test de Dextérité (Perception visuelle). Les attaques contre lui ont avantage, et ses attaques ont désavantage.',
        icon: '👁️',
        color: '#6B7280',
    },
    {
        key: 'charmed',
        name: 'Charmé',
        description: 'Un charmé ne peut pas attaquer sa source de charme ou la ciblant d\'actions hostiles. La source de charme a avantage sur ses jets de Charisme.',
        icon: '💕',
        color: '#EC4899',
    },
    {
        key: 'deafened',
        name: 'Sourd',
        description: 'Un sourd ne peut pas entendre et rate automatiquement tout test de Sagesse (Perception auditive).',
        icon: '👂',
        color: '#6B7280',
    },
    {
        key: 'frightened',
        name: 'Terrifié',
        description: 'Un terrorisé a désavantage sur ses tests et jets de sauvegarde tant qu\'il est dans la ligne de vue de sa source de peur. Il ne peut pas se déplacer volontairement vers cette source.',
        icon: '😱',
        color: '#F59E0B',
    },
    {
        key: 'grappled',
        name: 'Agrippé',
        description: 'La vitesse d\'un agrippé devient 0. Il peut se libérer en utilisant une action et en réussissant un test d\'Athlétisme (DD déterminée par l\'agrippant).',
        icon: '🫳',
        color: '#8B5CF6',
    },
    {
        key: 'incapacitated',
        name: 'Incapacité',
        description: 'Un incapacitated ne peut pas effectuer d\'actions ni de réactions.',
        icon: '⏸️',
        color: '#6B7280',
    },
    {
        key: 'invisible',
        name: 'Invisible',
        description: 'Un invisible est impossible à\'voir visuellement. Il est considéré comme à l\'abri des attaques. Ses attaques ont avantage, les attaques contre lui ont désavantage.',
        icon: '👻',
        color: '#60A5FA',
    },
    {
        key: 'paralyzed',
        name: 'Paralysé',
        description: 'Un paralisé est incapacitated, ne peut pas se déplacer ni parler. Il rate automatiquement les jets de Force et Dextérité. Les attaques contre lui ont avantage. Les attaques à portée au corps à corps ont critique automatique sur 20.',
        icon: '🪨',
        color: '#9CA3AF',
    },
    {
        key: 'petrified',
        name: 'Pétrifié',
        description: 'Un pétrifié est transformé en statue inerte (poids x10). Il est incapacitated, ne peut pas percevoir ni se déplacer. Il est inconscient. Ses attaques ont avantage, les siennes ont désavantage.',
        icon: '🗿',
        color: '#78716C',
    },
    {
        key: 'poisoned',
        name: 'Empoisonné',
        description: 'Un empoisonné a désavantage sur ses jets d\'attaque et ses tests de caractéristique.',
        icon: '🤢',
        color: '#84CC16',
    },
    {
        key: 'prone',
        name: 'À terre',
        description: 'Un individu à terre ne peut se déplacer qu\'en rampant. Désavantage sur les attaques. Les attaques au corps à corps ont avantage, les attaques à distance ont désavantage.',
        icon: '🔻',
        color: '#F97316',
    },
    {
        key: 'restrained',
        name: 'Entravé',
        description: 'La vitesse d\'un entravé devient 0. Les attaques contre lui ont avantage, ses attaques ont désavantage. Les jets de Dextérité ont désavantage.',
        icon: '⛓️',
        color: '#6366F1',
    },
    {
        key: 'stunned',
        name: 'Étourdi',
        description: 'Un étourdi est incapacitated, ne peut pas se déplacer et parle de manière bredouillante. Il rate automatiquement les jets de Force et Dextérité. Les attaques contre lui ont avantage.',
        icon: '💫',
        color: '#FBBF24',
    },
    {
        key: 'unconscious',
        name: 'Inconscient',
        description: 'Un inconscient est incapacitated, ne peut pas se déplacer ni parler, et est inconscient. Il ne perçoit pas son environnement. Il chute à terre. Ses attaques ont avantage, les attaques contre lui ont avantage (critique sur 20).',
        icon: '😵',
        color: '#4B5563',
    },
    {
        key: 'exhaustion',
        name: 'Épuisement',
        description: 'L\'épuisement se cumule de 1 à 6. Chaque niveau apporte des pénalités cumulatives. À 6, le personnage meurt.',
        icon: '🔋',
        color: '#EF4444',
    },
    {
        key: 'concentration',
        name: 'Concentration',
        description: 'Le personnage maintient un sort nécessitant concentration. Si il reçoit des dégâts, jet de sauvegarde de Constitution (DD = 10 ou half damage).',
        icon: '🎯',
        color: '#8B5CF6',
    },
]

export const getConditionByKey = (key: ConditionKey): Condition | undefined => {
    return conditions.find(c => c.key === key)
}

// Effets de l'épuisement par niveau
export const exhaustionEffects: Record<number, string> = {
    1: 'Désavantage sur les tests de caractéristique',
    2: 'Vitesse réduite de moitié',
    3: 'Désavantage sur les jets d\'attaque et jets de sauvegarde',
    4: 'PV max réduit de la moitié',
    5: 'Vitesse réduite à 0',
    6: 'Mort',
}