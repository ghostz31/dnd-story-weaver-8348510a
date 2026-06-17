import { useState } from 'react'
import { HeartIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'

interface HPBlockProps {
  current: number
  max: number
  temp: number
  onHeal: (amount: number) => void
  onDamage: (amount: number) => void
  onSetTempHP: (amount: number) => void
}

export function HPBlock({ current, max, temp, onHeal, onDamage, onSetTempHP }: HPBlockProps) {
  const [inputValue, setInputValue] = useState('')
  const [editingTemp, setEditingTemp] = useState(false)
  const [tempEditValue, setTempEditValue] = useState('')
  const hpPercent = (current / max) * 100

  const getHpStatus = () => {
    if (hpPercent <= 25) return 'crit'
    if (hpPercent <= 50) return 'low'
    if (hpPercent <= 75) return 'med'
    return 'high'
  }

  const getHpColor = () => {
    const status = getHpStatus()
    const colors: Record<string, string> = {
      crit: 'hsl(var(--color-hp-crit))',
      low: 'hsl(var(--color-hp-low))',
      med: 'hsl(var(--color-hp-med))',
      high: 'hsl(var(--color-hp-high))',
    }
    return colors[status]
  }

  const handleQuickHeal = () => {
    const val = parseInt(inputValue)
    if (!isNaN(val) && val > 0) {
      onHeal(val)
      setInputValue('')
    }
  }

  const handleQuickDamage = () => {
    const val = parseInt(inputValue)
    if (!isNaN(val) && val > 0) {
      onDamage(val)
      setInputValue('')
    }
  }

  const startTempEdit = () => {
    setEditingTemp(true)
    setTempEditValue(temp.toString())
  }

  const commitTempEdit = () => {
    const val = parseInt(tempEditValue)
    if (!isNaN(val) && val >= 0) {
      onSetTempHP(val)
    }
    setEditingTemp(false)
    setTempEditValue('')
  }

  const handleTempKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitTempEdit()
    } else if (e.key === 'Escape') {
      setEditingTemp(false)
      setTempEditValue('')
    }
  }

  const color = getHpColor()

  return (
    <div className="card p-3 space-y-3">
      {/* Ligne 1 — Valeurs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HeartIcon className="w-4 h-4" style={{ color }} />
          <span className="text-sm font-semibold">PV</span>
          {temp > 0 && (
            <span className="text-[10px] font-medium text-ac bg-ac/10 px-1.5 py-0.5 rounded">
              +{temp}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-xl font-bold font-cinzel" style={{ color }}>
            {current}
          </span>
          <span className="text-sm text-muted-foreground">/ {max}</span>
        </div>
      </div>

      {/* Barre */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(hpPercent, 100)}%`, backgroundColor: color }}
        />
      </div>

      {/* Ligne 2 — Soin / Dégâts */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleQuickDamage}
          disabled={!inputValue}
          className="w-10 h-9 rounded-lg bg-hp-crit/15 text-destructive font-bold text-lg hover:bg-hp-crit/25 transition-colors disabled:opacity-30 shrink-0"
        >
          −
        </button>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="input flex-1 text-center text-sm h-9"
        />
        <button
          onClick={handleQuickHeal}
          disabled={!inputValue}
          className="w-10 h-9 rounded-lg bg-hp-high/15 text-hp-high font-bold text-lg hover:bg-hp-high/25 transition-colors disabled:opacity-30 shrink-0"
        >
          +
        </button>
      </div>

      {/* Ligne 3 — PV temporaires centrés et éditables */}
      <div className="flex items-center justify-center gap-2">
        <ShieldCheckIcon className="w-4 h-4 text-ac shrink-0" />
        <button
          onClick={() => onSetTempHP(Math.max(0, temp - 1))}
          className="w-8 h-8 rounded bg-ac/10 text-ac font-bold hover:bg-ac/20 transition-colors"
        >
          −
        </button>

        {editingTemp ? (
          <input
            type="number"
            autoFocus
            value={tempEditValue}
            onChange={(e) => setTempEditValue(e.target.value)}
            onBlur={commitTempEdit}
            onKeyDown={handleTempKeyDown}
            className="input w-16 text-center text-sm font-bold text-ac h-8 px-1"
            style={{
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
            }}
          />
        ) : (
          <button
            onClick={startTempEdit}
            className="text-sm font-bold text-ac w-8 h-8 text-center hover:bg-ac/10 rounded transition-colors"
          >
            {temp}
          </button>
        )}

        <button
          onClick={() => onSetTempHP(temp + 1)}
          className="w-8 h-8 rounded bg-ac/10 text-ac font-bold hover:bg-ac/20 transition-colors"
        >
          +
        </button>
        {temp > 0 && (
          <button
            onClick={() => onSetTempHP(0)}
            className="w-8 h-8 rounded bg-muted text-muted-foreground font-bold hover:bg-muted/80 transition-colors"
            title="Retirer"
          >
            ×
          </button>
        )}
      </div>
    </div>
  )
}
