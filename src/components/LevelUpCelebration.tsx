import { useEffect, useState } from 'react'
import { SparklesIcon, HeartIcon, BookOpenIcon, StarIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

interface CelebrationProps {
  newLevel: number
  hpGained: number
  subclassName?: string
  newSpells: string[]
  newCantrips: string[]
  asiLabel?: string
  onDone: () => void
}

export function LevelUpCelebration({
  newLevel,
  hpGained,
  subclassName,
  newSpells,
  newCantrips,
  asiLabel,
  onDone,
}: CelebrationProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50)
    const t2 = setTimeout(() => onDone(), 3500)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  const allSpells = [...newCantrips, ...newSpells]

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Confetti pieces */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-10%`,
              width: `${6 + Math.random() * 8}px`,
              height: `${6 + Math.random() * 8}px`,
              backgroundColor: ['hsl(var(--primary))', 'hsl(var(--color-gold))', 'hsl(var(--color-hp-high))', 'hsl(var(--secondary))', 'hsl(var(--color-xp))'][i % 5],
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className={`relative text-center transition-transform duration-700 ${visible ? 'scale-100' : 'scale-50'}`}>
        <div className="mb-4">
          <SparklesIcon className="w-16 h-16 text-primary mx-auto animate-bounce" />
        </div>

        <h2 className="font-cinzel text-5xl md:text-7xl font-bold text-white mb-2 drop-shadow-lg">
          Niveau {newLevel}
        </h2>
        <p className="text-xl text-primary font-bold mb-8">Atteint !</p>

        <div className="bg-card/90 backdrop-blur rounded-2xl p-6 max-w-sm mx-auto space-y-3 text-left shadow-2xl border border-primary/20">
          <div className="flex items-center gap-3">
            <HeartIcon className="w-5 h-5 text-hp-high shrink-0" />
            <span className="text-foreground font-bold">+{hpGained} PV</span>
          </div>
          {subclassName && (
            <div className="flex items-center gap-3">
              <StarIcon className="w-5 h-5 text-gold shrink-0" />
              <span className="text-foreground font-bold">Spécialisation : {subclassName}</span>
            </div>
          )}
          {asiLabel && (
            <div className="flex items-center gap-3">
              <ArrowUpIcon className="w-5 h-5 text-primary shrink-0" />
              <span className="text-foreground font-bold">{asiLabel}</span>
            </div>
          )}
          {allSpells.length > 0 && (
            <div className="flex items-start gap-3">
              <BookOpenIcon className="w-5 h-5 text-magic shrink-0 mt-0.5" />
              <div className="flex flex-wrap gap-1">
                {allSpells.map(s => (
                  <span key={s} className="text-xs bg-magic/10 text-magic px-2 py-0.5 rounded font-medium">{s}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
