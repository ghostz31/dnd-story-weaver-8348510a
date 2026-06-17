import { Link } from 'react-router-dom'
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline'

interface Crumb {
    label: string
    to?: string
}

interface BreadcrumbProps {
    items: Crumb[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav aria-label="Fil d'Ariane" className="hidden lg:flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link to="/" className="hover:text-foreground transition-colors" aria-label="Accueil">
                <HomeIcon className="w-4 h-4" />
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-2">
                    <ChevronRightIcon className="w-3 h-3" />
                    {item.to ? (
                        <Link to={item.to} className="hover:text-foreground transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-foreground font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}
