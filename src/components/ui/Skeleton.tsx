import type { CSSProperties } from 'react'
import { cn } from '../../lib/utils'

interface SkeletonProps {
    className?: string
    style?: CSSProperties
}

export function Skeleton({ className, style }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded-md bg-muted/60',
                className
            )}
            style={style}
        />
    )
}

export function SkeletonCard({ className }: SkeletonProps) {
    return (
        <div className={cn('card p-4 space-y-3', className)}>
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}

export function SkeletonRow({ className }: SkeletonProps) {
    return (
        <div className={cn('flex items-center gap-3 py-3', className)}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        </div>
    )
}

export function SkeletonHex({ className }: SkeletonProps) {
    return (
        <Skeleton
            className={cn(
                'w-16 h-16',
                className
            )}
            style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            }}
        />
    )
}
