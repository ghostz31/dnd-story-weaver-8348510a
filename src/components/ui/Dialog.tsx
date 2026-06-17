import * as RadixDialog from '@radix-ui/react-dialog'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { cn } from '../../lib/utils'
import type { ReactNode } from 'react'

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title?: string
    description?: string
    children: ReactNode
    variant?: 'default' | 'destructive'
    className?: string
}

export function Dialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    variant = 'default',
    className,
}: DialogProps) {
    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="modal-overlay" />
                <RadixDialog.Content
                    className={cn(
                        'modal-content',
                        variant === 'destructive' && 'border-[hsl(var(--destructive))]',
                        className
                    )}
                    aria-describedby={description ? 'dialog-description' : undefined}
                >
                    {title && (
                        <RadixDialog.Title className="font-cinzel text-lg font-bold mb-2">
                            {title}
                        </RadixDialog.Title>
                    )}
                    {description && (
                        <RadixDialog.Description id="dialog-description" className="text-ink-muted text-sm mb-6">
                            {description}
                        </RadixDialog.Description>
                    )}
                    <RadixDialog.Close asChild>
                        <button
                            className="absolute top-3 right-3 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                            aria-label="Fermer"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </RadixDialog.Close>
                    {children}
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    )
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
    return (
        <div className={cn('flex gap-3 mt-6', className)}>
            {children}
        </div>
    )
}
