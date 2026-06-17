import { useCharacter, type StoredCharacter } from '../../contexts/CharacterContext'
import { getAvailableToggles } from '../../utils/feat-effects'

interface FeatTogglesBarProps {
    character: StoredCharacter
    featToggles?: Record<string, boolean>
}

export function FeatTogglesBar({ character, featToggles = {} }: FeatTogglesBarProps) {
    const { updateFeatToggle } = useCharacter()
    const toggles = getAvailableToggles(character, featToggles)

    if (toggles.length === 0) return null

    return (
        <div className="mt-3 flex flex-wrap gap-2">
            {toggles.map(toggle => (
                <button
                    key={`${toggle.featId}:${toggle.key}`}
                    onClick={() => updateFeatToggle(`${toggle.featId}:${toggle.key}`, !toggle.active)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                        toggle.active
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    title={toggle.description}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${toggle.active ? 'bg-primary-foreground' : 'bg-muted-foreground/50'}`} />
                    {toggle.label}
                </button>
            ))}
        </div>
    )
}
