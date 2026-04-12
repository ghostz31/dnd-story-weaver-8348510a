import { NavLink } from 'react-router-dom'
import {
    HomeIcon,
    UserCircleIcon,
    SparklesIcon,
    ArchiveBoxIcon,
    BookOpenIcon,
} from '@heroicons/react/24/outline'
import {
    HomeIcon as HomeIconSolid,
    UserCircleIcon as UserCircleIconSolid,
    SparklesIcon as SparklesIconSolid,
    ArchiveBoxIcon as ArchiveBoxIconSolid,
    BookOpenIcon as BookOpenIconSolid,
} from '@heroicons/react/24/solid'
import { useCharacter } from '../contexts/CharacterContext'

export function BottomNav() {
    const { character } = useCharacter()

    const navItems = [
        { to: '/', icon: HomeIcon, iconActive: HomeIconSolid, label: 'Accueil' },
        { to: character ? `/character/${character.id}` : '/', icon: UserCircleIcon, iconActive: UserCircleIconSolid, label: 'Perso' },
        { to: '/spells', icon: SparklesIcon, iconActive: SparklesIconSolid, label: 'Sorts' },
        { to: '/inventory', icon: ArchiveBoxIcon, iconActive: ArchiveBoxIconSolid, label: 'Sac' },
        { to: '/notes', icon: BookOpenIcon, iconActive: BookOpenIconSolid, label: 'Notes' },
    ]

    return (
        <nav className="bottom-nav-safe" aria-label="Navigation principale">
            {navItems.map(({ to, icon: Icon, iconActive: IconActive, label }) => (
                <NavLink
                    key={label}
                    to={to}
                    end={to === '/'}
                    className={({ isActive }) =>
                        `relative touch-target flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg interactive-tap ${isActive ? 'text-[hsl(var(--primary))]' : 'text-ink-muted'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {/* Active indicator bar */}
                            {isActive && (
                                <span className="nav-indicator" />
                            )}
                            {isActive ? (
                                <IconActive className="w-6 h-6" />
                            ) : (
                                <Icon className="w-6 h-6" />
                            )}
                            <span className="text-[10px] font-medium">{label}</span>
                        </>
                    )}
                </NavLink>
            ))}
        </nav>
    )
}
