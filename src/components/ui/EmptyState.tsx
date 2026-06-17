import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface EmptyStateProps {
    icon?: ReactNode
    title: string
    description?: string
    action?: {
        label: string
        onClick: () => void
    }
    linkAction?: {
        label: string
        to: string
    }
}

export function EmptyState({ icon, title, description, action, linkAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="w-16 h-16 mb-4 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    {icon}
                </div>
            )}
            <h3 className="font-cinzel text-lg font-bold mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-muted-foreground max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <button onClick={action.onClick} className="btn btn-primary">
                    {action.label}
                </button>
            )}
            {linkAction && (
                <Link to={linkAction.to} className="btn btn-primary">
                    {linkAction.label}
                </Link>
            )}
        </div>
    )
}
