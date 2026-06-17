import * as RadixDialog from '@radix-ui/react-dialog'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface SheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    children: ReactNode
    side?: 'right' | 'left'
    className?: string
}

export function Sheet({
    open,
    onOpenChange,
    title,
    description,
    children,
    side = 'right',
    className,
}: SheetProps) {
    const sideClasses = side === 'right'
        ? 'right-0 top-0 h-full w-full max-w-md border-l animate-slide-up'
        : 'left-0 top-0 h-full w-full max-w-md border-r animate-slide-up'

    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange} modal={false}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
                <RadixDialog.Content
                    className={cn(
                        'fixed z-50 bg-[hsl(var(--background))] shadow-lg overflow-y-auto p-6',
                        sideClasses,
                        className
                    )}
                    aria-describedby={description ? 'sheet-description' : undefined}
                    onOpenAutoFocus={(e) => e.preventDefault()}
                >
                    <div className="flex items-center justify-between mb-6">
                        {title && (
                            <RadixDialog.Title className="font-cinzel text-lg font-bold">
                                {title}
                            </RadixDialog.Title>
                        )}
                        <RadixDialog.Close asChild>
                            <button
                                className="rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                aria-label="Fermer"
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>
                        </RadixDialog.Close>
                    </div>
                    {description && (
                        <RadixDialog.Description id="sheet-description" className="text-ink-muted text-sm mb-4">
                            {description}
                        </RadixDialog.Description>
                    )}
                    {children}
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    )
}
