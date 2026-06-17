import { EyeIcon, MagnifyingGlassIcon, LightBulbIcon } from '@heroicons/react/24/outline'

interface SensesDisplayProps {
  perception: number
  investigation: number
  insight: number
}

export function SensesDisplay({ perception, investigation, insight }: SensesDisplayProps) {
  const senses = [
    { icon: EyeIcon, label: 'Perception passive', value: perception },
    { icon: MagnifyingGlassIcon, label: 'Investigation passive', value: investigation },
    { icon: LightBulbIcon, label: 'Perspicacité passive', value: insight },
  ]

  return (
    <div className="card p-3">
      <h3 className="text-xs font-bold uppercase text-muted-foreground mb-3 tracking-wider">
        Sens
      </h3>
      <div className="space-y-2">
        {senses.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{label}</span>
            </div>
            <span className="text-lg font-bold font-cinzel text-primary">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
