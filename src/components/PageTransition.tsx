import { useEffect, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { useSettings } from '../hooks/useSettings'

// Applique la classe `page-enter` sur <main> à chaque changement de route
// pour déclencher l'animation définie dans effects.css (.page-enter).
// Désactivé si settings.effects.pageTransition est false.
export function PageTransition({ children }: { children: ReactNode }) {
    const location = useLocation()
    const { settings } = useSettings()

    useEffect(() => {
        if (!settings.effects.pageTransition) return
        const main = document.querySelector('main')
        if (main) {
            main.classList.remove('page-enter')
            // Force le reflow pour pouvoir rejouer l'animation
            void main.offsetWidth
            main.classList.add('page-enter')
        }
    }, [location.pathname, settings.effects.pageTransition])

    return <>{children}</>
}
