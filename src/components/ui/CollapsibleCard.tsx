import { useState, type ReactNode } from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'

interface CollapsibleCardProps {
    title: string
    children: ReactNode
    defaultOpen?: boolean
    badge?: string | number
}

export function CollapsibleCard({
    title,
    children,
    defaultOpen = false,
    badge,
}: CollapsibleCardProps) {
    const [open, setOpen] = useState(defaultOpen)

    return (
        <div className="card p-3">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between"
            >
                <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                        {title}
                    </h3>
                    {badge !== undefined && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {badge}
                        </span>
                    )}
                </div>
                {open ? (
                    <ChevronUpIcon className="w-4 h-4 text-muted-foreground" />
                ) : (
                    <ChevronDownIcon className="w-4 h-4 text-muted-foreground" />
                )}
            </button>
            {open && <div className="mt-3">{children}</div>}
        </div>
    )
}
