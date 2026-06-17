import type { ReactNode } from 'react'

interface SectionTabsProps {
  tabs: { id: string; label: string; icon?: ReactNode; badge?: number }[]
  activeTab: string
  onChange: (id: string) => void
}

export function SectionTabs({ tabs, activeTab, onChange }: SectionTabsProps) {
  return (
    <div className="flex border-b-2 border-border gap-1 overflow-x-auto scrollbar-hide">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap border-b-2 -mb-[2px] transition-colors ${
            activeTab === tab.id
              ? 'text-primary border-primary'
              : 'text-muted-foreground border-transparent hover:text-foreground'
          }`}
        >
          {tab.icon && <span className="w-4 h-4">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-primary/15 text-primary">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
