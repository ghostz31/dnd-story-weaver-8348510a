import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

interface LayoutProps {
    children: ReactNode
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
            {/* Main content area with safe padding */}
            <main
                className="flex-1 overflow-y-auto px-4 pt-4"
                style={{ paddingBottom: 'calc(80px + var(--safe-bottom))' }}
            >
                {children}
            </main>

            {/* Bottom navigation */}
            <BottomNav />
        </div>
    )
}
