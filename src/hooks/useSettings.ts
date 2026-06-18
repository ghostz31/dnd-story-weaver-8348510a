import { useEffect, useState } from 'react'
import {
  type EffectsSettings,
  DEFAULT_EFFECTS,
  EFFECTS_FLAGS,
  EFFECTS_FLAG_CLASS,
} from '@trame-besace/shared-types/use-effects'

export interface AppSettings {
  effects: EffectsSettings
}

const DEFAULT_SETTINGS: AppSettings = {
  effects: DEFAULT_EFFECTS,
}

const STORAGE_KEY = 'trame-settings'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          effects: { ...DEFAULT_EFFECTS, ...(parsed.effects ?? {}) },
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    const root = document.documentElement
    for (const flag of EFFECTS_FLAGS) {
      root.classList.toggle(EFFECTS_FLAG_CLASS[flag], settings.effects[flag])
    }
  }, [settings])

  const updateEffect = <K extends keyof EffectsSettings>(key: K, value: boolean) => {
    setSettings(prev => ({ ...prev, effects: { ...prev.effects, [key]: value } }))
  }

  const toggleEffect = (key: keyof EffectsSettings) => {
    setSettings(prev => ({ ...prev, effects: { ...prev.effects, [key]: !prev.effects[key] } }))
  }

  const resetEffects = () => {
    setSettings(prev => ({ ...prev, effects: DEFAULT_EFFECTS }))
  }

  return { settings, updateEffect, toggleEffect, resetEffects }
}
