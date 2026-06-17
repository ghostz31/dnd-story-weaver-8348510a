import { cn } from '../../lib/utils'
import type { ReactNode, ButtonHTMLAttributes } from 'react'

interface SpinnerButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    loading?: boolean
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
    size?: 'sm' | 'md'
}

const variantClasses: Record<string, string> = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    ghost: 'btn btn-ghost',
    destructive: 'btn bg-destructive text-destructive-foreground hover:bg-destructive/90',
}

export function SpinnerButton({
    loading = false,
    children,
    variant = 'primary',
    size = 'md',
    className,
    disabled,
    ...props
}: SpinnerButtonProps) {
    return (
        <button
            className={cn(
                variantClasses[variant],
                size === 'sm' && 'text-sm py-1.5 px-3',
                'flex items-center justify-center gap-2 relative',
                loading && 'opacity-80 cursor-wait',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            )}
            {children}
        </button>
    )
}
