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

export function BottomNav() {
    const { character } = useCharacter()
    const { dark, toggle } = useDarkMode()

    const navItems = [
        { to: '/', icon: HomeIcon, iconActive: HomeIconSolid, label: 'Accueil' },
        { to: character ? `/character/${character.id}` : '/', icon: UserCircleIcon, iconActive: UserCircleIconSolid, label: 'Perso' },
        { to: '/combat-features', icon: BoltIcon, iconActive: BoltIconSolid, label: 'Combat' },
        { to: '/spells', icon: SparklesIcon, iconActive: SparklesIconSolid, label: 'Sorts' },
        { to: '/inventory', icon: ArchiveBoxIcon, iconActive: ArchiveBoxIconSolid, label: 'Sac' },
        { to: '/dice', icon: CubeIcon, iconActive: CubeIconSolid, label: 'Dés' },
        { to: '/settings', icon: Cog6ToothIcon, iconActive: Cog6ToothIconSolid, label: 'Paramètres' },
    ]

    return (
        <nav className="bottom-nav-safe" aria-label="Navigation principale">
            {navItems.map(({ to, icon: Icon, iconActive: IconActive, label }) => (
                <NavLink
                    key={label}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                        `relative touch-target flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg interactive-tap ${isActive ? 'text-[hsl(var(--primary))]' : 'text-muted-foreground'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <span className="nav-indicator" />
                            )}
                            {isActive ? (
                                <IconActive className="w-5 h-5 md:w-6 md:h-6" />
                            ) : (
                                <Icon className="w-5 h-5 md:w-6 md:h-6" />
                            )}
                            <span className="text-[11px] md:text-xs font-medium">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
            <button
                onClick={toggle}
                className="relative touch-target flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg interactive-tap text-muted-foreground hover:text-foreground transition-colors"
                aria-label={dark ? 'Mode clair' : 'Mode sombre'}
            >
                {dark ? (
                    <SunIcon className="w-5 h-5 md:w-6 md:h-6" />
                ) : (
                    <MoonIcon className="w-5 h-5 md:w-6 md:h-6" />
                )}
                <span className="text-[11px] md:text-xs font-medium">{dark ? 'Clair' : 'Sombre'}</span>
            </button>
        </nav>
    )
}