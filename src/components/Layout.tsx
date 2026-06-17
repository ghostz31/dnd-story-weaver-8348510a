import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { DesktopSidebar } from './DesktopSidebar'
import { TutorialOverlay } from './TutorialOverlay'
import { Toaster } from './ui/Toaster'
import { useSettings } from '../hooks/useSettings'

interface LayoutProps {
    children: ReactNode
}

export function Layout({ children }: LayoutProps) {
    const { settings, completeTutorial, setTutorialStep } = useSettings()

    const showTutorial = !settings.tutorialCompleted && settings.tutorialStep < 5

    return (
        <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-[auto_1fr]" style={{ background: 'hsl(var(--background))' }}>
            {/* Desktop sidebar */}
            <DesktopSidebar />

            {/* Main content area with safe padding */}
            <main
                className="flex-1 overflow-y-auto px-4 pt-4 lg:pt-6 lg:px-8 lg:pb-6"
                style={{ paddingBottom: 'calc(80px + var(--safe-bottom))' }}
            >
                {children}
            </main>

            {/* Bottom navigation — mobile only */}
            <div className="lg:hidden">
                <BottomNav />
            </div>

            {/* Toast notifications */}
            <Toaster />

            {/* Tutorial */}
            <TutorialOverlay
                isOpen={showTutorial}
                currentStep={settings.tutorialStep}
                onNext={() => setTutorialStep(settings.tutorialStep + 1)}
                onPrev={() => setTutorialStep(Math.max(0, settings.tutorialStep - 1))}
                onClose={completeTutorial}
            />
        </div>
    )
}
