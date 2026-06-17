import { useSettings } from '../hooks/useSettings'

const ACCENT_PRESETS = [
  { hue: 0,   name: 'Rouge',    color: 'hsl(0 70% 45%)' },
  { hue: 18,  name: 'Corail',   color: 'hsl(18 85% 56%)' },
  { hue: 45,  name: 'Or',       color: 'hsl(45 90% 50%)' },
  { hue: 142, name: 'Vert',     color: 'hsl(142 70% 45%)' },
  { hue: 190, name: 'Cyan',     color: 'hsl(190 80% 45%)' },
  { hue: 217, name: 'Bleu',     color: 'hsl(217 85% 55%)' },
  { hue: 270, name: 'Violet',   color: 'hsl(270 70% 55%)' },
  { hue: 330, name: 'Rose',     color: 'hsl(330 80% 55%)' },
]

export function ThemePicker() {
  const { settings, setAccentColor } = useSettings()
  const currentHue = settings.accentHue

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-foreground">Couleur d'accentuation</p>
      <div className="flex flex-wrap gap-3">
        {ACCENT_PRESETS.map((preset) => (
          <button
            key={preset.hue}
            onClick={() => setAccentColor(preset.hue)}
            className={`group relative w-10 h-10 rounded-full border-2 transition-all ${
              currentHue === preset.hue
                ? 'border-foreground scale-110 shadow-lg'
                : 'border-transparent hover:scale-105'
            }`}
            style={{ backgroundColor: preset.color }}
            title={preset.name}
          >
            {currentHue === preset.hue && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg className="w-5 h-5 text-white drop-shadow" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
