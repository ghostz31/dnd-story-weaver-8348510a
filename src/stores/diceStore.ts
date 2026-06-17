import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface RollResult {
  id: string
  label: string
  dice: string
  results: number[]
  dropped: number[]
  modifier: number
  total: number
  timestamp: number
}

interface DiceState {
  history: RollResult[]
  isRolling: boolean
  lastRoll: RollResult | null
}

interface DiceActions {
  roll: (params: {
    label: string
    count: number
    sides: number
    modifier?: number
    advantage?: boolean
    disadvantage?: boolean
    keep?: 'highest' | 'lowest' | 'all'
  }) => RollResult
  clearHistory: () => void
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}

function rollDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

export const useDiceStore = create<DiceState & DiceActions>()(
  persist(
    (set, get) => ({
      history: [],
      isRolling: false,
      lastRoll: null,

      roll: ({
        label,
        count,
        sides,
        modifier = 0,
        advantage = false,
        disadvantage = false,
        keep = 'all',
      }) => {
        set({ isRolling: true })

        let results: number[] = []
        let dropped: number[] = []

        if (advantage || disadvantage) {
          const r1 = rollDie(sides)
          const r2 = rollDie(sides)
          results = advantage ? [Math.max(r1, r2)] : [Math.min(r1, r2)]
          dropped = advantage ? [Math.min(r1, r2)] : [Math.max(r1, r2)]
        } else {
          for (let i = 0; i < count; i++) {
            results.push(rollDie(sides))
          }
          if (keep === 'highest' && results.length > 1) {
            const maxVal = Math.max(...results)
            dropped = results.filter((r, i) => r !== maxVal || i !== results.indexOf(maxVal))
            results = [maxVal]
          } else if (keep === 'lowest' && results.length > 1) {
            const minVal = Math.min(...results)
            dropped = results.filter((r, i) => r !== minVal || i !== results.indexOf(minVal))
            results = [minVal]
          }
        }

        const total = results.reduce((a, b) => a + b, 0) + modifier

        const entry: RollResult = {
          id: generateId(),
          label,
          dice: `${count}d${sides}`,
          results,
          dropped,
          modifier,
          total,
          timestamp: Date.now(),
        }

        set({
          lastRoll: entry,
          history: [entry, ...get().history].slice(0, 100),
          isRolling: false,
        })

        return entry
      },

      clearHistory: () => set({ history: [], lastRoll: null }),
    }),
    {
      name: 'besace-dice-history',
      partialize: (state) => ({ history: state.history }),
    }
  )
)
