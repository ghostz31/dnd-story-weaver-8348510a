import { useEffect, useState } from 'react'

export interface AppSettings {
    beginnerMode: boolean
    tutorialCompleted: boolean
    tutorialStep: number
    accentHue: number
}

const DEFAULT_SETTINGS: AppSettings = {
    beginnerMode: false,
    tutorialCompleted: false,
    tutorialStep: 0,
    accentHue: 18,
}

const STORAGE_KEY = 'besace-settings'

export function useSettings() {
    const [settings, setSettings] = useState<AppSettings>(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) {
                return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
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

    return {
        settings,
        updateSetting,
        toggleBeginnerMode,
        completeTutorial,
        setTutorialStep,
        setAccentColor,
    }
}
