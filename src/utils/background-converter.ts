/**
 * Convertisseur BackgroundV2 (Aurora) → format V1 utilisé par le wizard
 */

import type { BackgroundV2 } from '../types/aurora-v2'

const SKILL_NAME_MAP: Record<string, string> = {
  ID_SKILL_ACROBATICS: 'Acrobaties',
  ID_SKILL_ANIMAL_HANDLING: 'Dressage',
  ID_SKILL_ARCANA: 'Arcanes',
  ID_SKILL_ATHLETICS: 'Athlétisme',
  ID_SKILL_DECEPTION: 'Tromperie',
  ID_SKILL_HISTORY: 'Histoire',
  ID_SKILL_INSIGHT: 'Perspicacité',
  ID_SKILL_INTIMIDATION: 'Intimidation',
  ID_SKILL_INVESTIGATION: 'Investigation',
  ID_SKILL_MEDICINE: 'Médecine',
  ID_SKILL_NATURE: 'Nature',
  ID_SKILL_PERCEPTION: 'Perception',
  ID_SKILL_PERFORMANCE: 'Représentation',
  ID_SKILL_PERSUASION: 'Persuasion',
  ID_SKILL_RELIGION: 'Religion',
  ID_SKILL_SLEIGHT_OF_HAND: 'Escamotage',
  ID_SKILL_STEALTH: 'Discrétion',
  ID_SKILL_SURVIVAL: 'Survie',
}

const TOOL_NAME_MAP: Record<string, string> = {
  ID_TOOL_DISGUISE_KIT: 'Kit de déguisement',
  ID_TOOL_FORGERY_KIT: 'Kit de faussaire',
  ID_TOOL_THIEVES_TOOLS: 'Outils de voleur',
  ID_TOOL_GAMING_SET: 'Jeu',
  ID_TOOL_HERBALISM_KIT: "Kit d'herboriste",
  ID_TOOL_MUSICAL_INSTRUMENT: 'Instrument de musique',
  ID_TOOL_ARTISAN_TOOLS: 'Outils d\'artisan',
  ID_TOOL_NAVIGATOR_TOOLS: 'Outils de navigateur',
  ID_TOOL_POISONER_KIT: 'Kit de poison',
}

export interface ConvertedBackground {
  id: string
  name: string
  nameEn: string
  skillProficiencies: string[]
  toolProficiencies: string[]
  languageCount: number
  featureName: string
  featureDescription: string
  description: string
}

export function convertAuroraBackground(bg: BackgroundV2): ConvertedBackground {
  return {
    id: bg.id,
    name: bg.name,
    nameEn: bg.nameEn,
    skillProficiencies: bg.skillProficiencies
      .map(id => SKILL_NAME_MAP[id] || id)
      .filter(Boolean),
    toolProficiencies: (bg.toolProficiencies || [])
      .map(id => TOOL_NAME_MAP[id] || id.replace(/ID_TOOL_/g, '').replace(/_/g, ' '))
      .filter(Boolean),
    languageCount: bg.languageCount || 0,
    featureName: bg.feature?.name || '',
    featureDescription: typeof bg.feature?.description === 'string'
      ? bg.feature.description
      : '',
    description: typeof bg.description === 'string' ? bg.description : '',
  }
}

export function loadAuroraBackgrounds(): Promise<ConvertedBackground[]> {
  return fetch('/data/aurora/backgrounds.json')
    .then(res => res.json())
    .then((data: { backgrounds?: BackgroundV2[] }) => {
      return (data.backgrounds || []).map(convertAuroraBackground)
    })
    .catch(err => {
      console.error('Error loading Aurora backgrounds:', err)
      return []
    })
}
