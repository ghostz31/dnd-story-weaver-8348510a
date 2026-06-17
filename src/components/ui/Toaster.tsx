import { Toaster as SonnerToaster } from 'sonner'
import { useDarkMode } from '../../hooks/useDarkMode'

export function Toaster() {
    const { dark } = useDarkMode()

    return (
        <SonnerToaster
            theme={dark ? 'dark' : 'light'}
            position="top-right"
            toastOptions={{
                className: 'font-inter',
                style: {
                    borderRadius: 'var(--radius)',
                    border: '1px solid hsl(var(--border))',
                },
            }}
            closeButton
            richColors
        />
    )
}
