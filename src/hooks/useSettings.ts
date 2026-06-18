import { useEffect, useState } from 'react'
import {
  type EffectsSettings,
  DEFAULT_EFFECTS,
  EFFECTS_FLAGS,
  EFFECTS_FLAG_CLASS,
} from '@trame-besace/shared-types/use-effects'

export interface AppSettings {
    beginnerMode: boolean
    tutorialCompleted: boolean
    tutorialStep: number
    accentHue: number
    effects: EffectsSettings
}

const DEFAULT_SETTINGS: AppSettings = {
    beginnerMode: false,
    tutorialCompleted: false,
    tutorialStep: 0,
    accentHue: 18,
    effects: DEFAULT_EFFECTS,
}

const STORAGE_KEY = 'besace-settings'

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
            // ignore parse errors
        }
        return DEFAULT_SETTINGS
    })

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
        // Appliquer la couleur d'accent
        const isDark = document.documentElement.classList.contains('dark')
        const sat = isDark ? '85%' : '70%'
        const light = isDark ? '56%' : '42%'
        document.documentElement.style.setProperty('--primary', `${settings.accentHue} ${sat} ${light}`)

        // Applique les classes globales d'effets sur <html>
        const root = document.documentElement
        for (const flag of EFFECTS_FLAGS) {
          root.classList.toggle(EFFECTS_FLAG_CLASS[flag], settings.effects[flag])
        }
    }, [settings])

    const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const toggleBeginnerMode = () => {
        setSettings(prev => ({ ...prev, beginnerMode: !prev.beginnerMode }))
    }

    const completeTutorial = () => {
        setSettings(prev => ({ ...prev, tutorialCompleted: true, tutorialStep: 0 }))
    }

    const setTutorialStep = (step: number) => {
        setSettings(prev => ({ ...prev, tutorialStep: step }))
    }

    const setAccentColor = (hue: number) => {
        setSettings(prev => ({ ...prev, accentHue: hue }))
    }

    const updateEffect = <K extends keyof EffectsSettings>(key: K, value: boolean) => {
        setSettings(prev => ({ ...prev, effects: { ...prev.effects, [key]: value } }))
    }

    const toggleEffect = (key: keyof EffectsSettings) => {
        setSettings(prev => ({ ...prev, effects: { ...prev.effects, [key]: !prev.effects[key] } }))
    }

    const resetEffects = () => {
        setSettings(prev => ({ ...prev, effects: DEFAULT_EFFECTS }))
    }

    return {
        settings,
        updateSetting,
        toggleBeginnerMode,
        completeTutorial,
        setTutorialStep,
        setAccentColor,
        updateEffect,
        toggleEffect,
        resetEffects,
    }
}
