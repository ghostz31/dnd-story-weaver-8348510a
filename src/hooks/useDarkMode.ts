import { useEffect, useState } from 'react'

export function useDarkMode() {
    const [dark, setDark] = useState(() => {
        const stored = localStorage.getItem('besace-dark-mode')
        if (stored !== null) return stored === 'true'
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem('besace-dark-mode', String(dark))
    }, [dark])

    const toggle = () => setDark(prev => !prev)

    return { dark, toggle }
}