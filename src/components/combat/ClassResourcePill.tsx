import { MinusIcon, PlusIcon } from '@heroicons/react/24/solid'
import { formatResourceMax } from '../../utils/feature-helpers'

interface ClassResourcePillProps {
    resource: {
        id: string
        name: string
        current: number
        max: number
        resetOn: string
    }
    onUse: () => void
    onRestore: () => void
}

export function ClassResourcePill({ resource, onUse, onRestore }: ClassResourcePillProps) {
    const isDepleted = resource.current <= 0
    const isUnlimited = resource.max >= 999
    const isFull = isUnlimited || resource.current >= resource.max

    const resetLabel = resource.resetOn === 'short'
        ? 'Repos court'
        : resource.resetOn === 'long'
            ? 'Repos long'
            : 'Aube'

    return (
        <div className={`resource-card ${isDepleted ? 'depleted' : ''}`}>
            <div className="resource-card-header">
                <span className="resource-card-name" title={resource.name}>{resource.name}</span>
                <span className="resource-card-count">
                    {resource.current}<span className="text-muted-foreground/50 text-sm mx-0.5">/</span>{formatResourceMax(resource.max)}
                </span>
            </div>

            <div className="resource-card-bar">
                <button
                    onClick={onUse}
                    disabled={isDepleted}
                    className="resource-btn"
                    aria-label="Utiliser"
                >
                    <MinusIcon className="w-3.5 h-3.5" />
                </button>

                <div className="resource-segments">
                    {Array.from({ length: Math.min(isUnlimited ? 8 : resource.max, 8) }).map((_, i) => (
                        <div
                            key={i}
                            className={`resource-segment ${i < resource.current ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <button
                    onClick={onRestore}
                    disabled={isFull}
                    className="resource-btn"
                    aria-label="Restaurer"
                >
                    <PlusIcon className="w-3.5 h-3.5" />
                </button>
            </div>

            <div className="resource-card-reset">{resetLabel}</div>
        </div>
    )
}
