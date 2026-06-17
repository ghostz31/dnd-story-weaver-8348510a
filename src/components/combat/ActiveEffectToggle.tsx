interface ActiveEffectToggleProps {
    label: string
    active: boolean
    onToggle: () => void
    color: string
}

export function ActiveEffectToggle({ label, active, onToggle, color }: ActiveEffectToggleProps) {
    return (
        <button
            onClick={onToggle}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                active
                    ? `${color} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
        >
            <span className={`w-2 h-2 rounded-full ${active ? 'bg-white' : 'bg-muted-foreground/50'}`} />
            {label}
        </button>
    )
}
