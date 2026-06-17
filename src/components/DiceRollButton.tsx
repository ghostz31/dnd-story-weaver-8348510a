import { useState, useCallback, useRef } from 'react'
import { CubeIcon } from '@heroicons/react/24/solid'
import { useDiceStore } from '../stores/diceStore'

interface DiceRollButtonProps {
  label: string
  count: number
  sides: number
  modifier?: number
  advantage?: boolean
  disadvantage?: boolean
  className?: string
  size?: 'sm' | 'md'
}

export function DiceRollButton({
  label,
  count,
  sides,
  modifier = 0,
  advantage = false,
  disadvantage = false,
  className = '',
  size = 'sm',
}: DiceRollButtonProps) {
  const { roll, isRolling } = useDiceStore()
  const [result, setResult] = useState<string | null>(null)
  const [rolling, setRolling] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleRoll = useCallback(() => {
    if (rolling) return
    setRolling(true)

    // Animation delay
    setTimeout(() => {
      const entry = roll({
        label,
        count,
        sides,
        modifier,
        advantage,
        disadvantage,
      })

      const dicePart = entry.results.join(', ')
      const modStr = modifier !== 0 ? ` ${modifier > 0 ? '+' : ''}${modifier}` : ''
      const droppedStr = entry.dropped.length > 0 ? ` (drop: ${entry.dropped.join(', ')})` : ''
      setResult(`[${dicePart}]${modStr}${droppedStr} = ${entry.total}`)
      setRolling(false)

      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setResult(null), 4000)
    }, 200)
  }, [rolling, roll, label, count, sides, modifier, advantage, disadvantage])

  const sizeClasses = size === 'sm'
    ? 'w-6 h-6 text-[10px]'
    : 'w-8 h-8 text-xs'

  return (
    <div className={`relative inline-flex items-center gap-1 ${className}`}>
      <button
        onClick={handleRoll}
        disabled={rolling || isRolling}
        className={`inline-flex items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 active:scale-95 transition-all ${sizeClasses} ${rolling ? 'animate-spin' : ''}`}
        title={`Lancer ${label} (${count}d${sides}${modifier ? (modifier > 0 ? `+${modifier}` : modifier) : ''})`}
      >
        <CubeIcon className={`${size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'}`} />
      </button>
      {result && (
        <span className="absolute left-full ml-1.5 top-1/2 -translate-y-1/2 whitespace-nowrap bg-card border border-border shadow-sm rounded-md px-2 py-1 text-xs font-bold text-primary z-10 animate-fade-in">
          {result}
        </span>
      )}
    </div>
  )
}
