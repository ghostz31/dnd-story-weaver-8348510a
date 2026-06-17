import { NavLink } from 'react-router-dom'
import {
    HomeIcon,
    UserCircleIcon,
    SparklesIcon,
    ArchiveBoxIcon,
    BoltIcon,
    SunIcon,
    MoonIcon,
    CubeIcon,
    Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    SparklesIcon as SparklesIconSolid,
    ArchiveBoxIcon as ArchiveBoxIconSolid,
    BoltIcon as BoltIconSolid,
    CubeIcon as CubeIconSolid,
    Cog6ToothIcon as Cog6ToothIconSolid,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'
import { useDarkMode } from '../hooks/useDarkMode'

export function DesktopSidebar() {
    const { character } = useCharacter()
    const { dark, toggle } = useDarkMode()

    const navItems = [
        { to: '/', icon: HomeIcon, iconActive: HomeIconSolid, label: 'Accueil' },
        { to: character ? `/character/${character.id}` : '/', icon: UserCircleIcon, iconActive: UserCircleIconSolid, label: 'Personnage' },
        { to: '/combat-features', icon: BoltIcon, iconActive: BoltIconSolid, label: 'Combat' },
        { to: '/spells', icon: SparklesIcon, iconActive: SparklesIconSolid, label: 'Sorts' },
        { to: '/inventory', icon: ArchiveBoxIcon, iconActive: ArchiveBoxIconSolid, label: 'Inventaire' },
        { to: '/dice', icon: CubeIcon, iconActive: CubeIconSolid, label: 'Dés' },
        { to: '/settings', icon: Cog6ToothIcon, iconActive: Cog6ToothIconSolid, label: 'Paramètres' },
    ]

    return (
        <aside className="hidden lg:flex flex-col w-56 h-screen sticky top-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))]">
            {/* App title */}
            <div className="px-5 py-5 border-b border-[hsl(var(--border-subtle))]">
                <h1 className="font-cinzel text-lg font-bold text-[hsl(var(--primary))] tracking-wide">
                    Besace
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">Gestionnaire D&D 5e</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto" aria-label="Navigation principale">
                {navItems.map(({ to, icon: Icon, iconActive: IconActive, label }) => (
                    <NavLink
                        key={label}
                        to={to}
                        end={to === '/'}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors interactive-tap ${
                                isActive
                                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted))]'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {isActive ? (
                                    <IconActive className="w-5 h-5 shrink-0" />
                                ) : (
                                    <Icon className="w-5 h-5 shrink-0" />
                                )}
                                <span className="truncate">{label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Dark mode toggle */}
            <div className="px-3 py-2 border-t border-[hsl(var(--border-subtle))]">
                <button
                    onClick={toggle}
                    className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-[hsl(var(--muted))] transition-colors interactive-tap"
                    aria-label={dark ? 'Mode clair' : 'Mode sombre'}
                >
                    {dark ? (
                        <SunIcon className="w-5 h-5 shrink-0" />
                    ) : (
                        <MoonIcon className="w-5 h-5 shrink-0" />
                    )}
                    <span className="truncate">{dark ? 'Mode clair' : 'Mode sombre'}</span>
                </button>
            </div>
        </aside>
    )
}
