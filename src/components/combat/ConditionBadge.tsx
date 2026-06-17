import { getConditionIcon, getConditionColor } from '../../utils/conditions-engine'

interface ConditionBadgeProps {
    condition: string
    onRemove: () => void
}

export function ConditionBadge({ condition, onRemove }: ConditionBadgeProps) {
    const icon = getConditionIcon(condition)
    const color = getConditionColor(condition)
    const label = condition.charAt(0).toUpperCase() + condition.slice(1)

    return (
        <div
            className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium"
            style={{ backgroundColor: color + '20', color }}
        >
            <span>{icon}</span>
            <span>{label}</span>
            <button
                onClick={onRemove}
                className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
                aria-label={`Retirer ${label}`}
            >
                ×
            </button>
        </div>
    )
}
