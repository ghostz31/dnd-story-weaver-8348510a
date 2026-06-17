import { useState, useMemo } from 'react'
import { ChevronDownIcon, ChevronUpIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { VirtualList } from '../ui/VirtualList'
import { spellSchoolColors } from '../../types/spell'
import type { Spell } from '../../types/spell'

type SortKey = 'name' | 'level' | 'school' | 'castingTime' | 'range'

interface SpellsTableProps {
    spells: Spell[]
    expandedSpell: string | null
    onToggleExpand: (name: string | null) => void
    renderActions?: (spell: Spell) => React.ReactNode
    emptyMessage?: string
}

function getLevelLabel(level: number): string {
    if (level === 0) return 'Cantrip'
    return `N. ${level}`
}

export function SpellsTable({
    spells,
    expandedSpell,
    onToggleExpand,
    renderActions,
    emptyMessage = 'Aucun sort trouvé.',
}: SpellsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('level')
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
    const [search, setSearch] = useState('')

    const sorted = useMemo(() => {
        const filtered = search
            ? spells.filter(s =>
                s.name.toLowerCase().includes(search.toLowerCase()) ||
                s.school.toLowerCase().includes(search.toLowerCase()) ||
                s.level.toString().includes(search)
            )
            : spells

        return [...filtered].sort((a, b) => {
            let cmp = 0
            switch (sortKey) {
                case 'name':
                    cmp = a.name.localeCompare(b.name)
                    break
                case 'level':
                    cmp = a.level - b.level
                    break
                case 'school':
                    cmp = a.school.localeCompare(b.school)
                    break
                case 'castingTime':
                    cmp = a.castingTime.localeCompare(b.castingTime)
                    break
                case 'range':
                    cmp = a.range.localeCompare(b.range)
                    break
            }
            return sortDir === 'asc' ? cmp : -cmp
        })
    }, [spells, search, sortKey, sortDir])

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc')
        } else {
            setSortKey(key)
            setSortDir('asc')
        }
    }

    const SortIcon = ({ column }: { column: SortKey }) => {
        if (sortKey !== column) return <ChevronDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-30" />
        return sortDir === 'asc'
            ? <ChevronUpIcon className="w-3 h-3" />
            : <ChevronDownIcon className="w-3 h-3" />
    }

    const headerClass = 'px-3 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-left cursor-pointer hover:text-foreground select-none group'

    // Colonnes : Nom (flexible) | Niv | École | Incantation | Portée | Actions
    const gridCols = 'grid-cols-[1fr_60px_120px_140px_110px_110px]'

    return (
        <div className="card overflow-hidden">
            {/* Search */}
            <div className="px-4 py-3 border-b border-border">
                <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher un sort…"
                        className="input pl-9 py-2"
                        spellCheck={false}
                    />
                </div>
            </div>

            {/* Header */}
            <div className={`hidden xl:grid ${gridCols} gap-0 bg-muted/30 border-b border-border`}>
                <button onClick={() => handleSort('name')} className={headerClass}>Sort <SortIcon column="name" /></button>
                <button onClick={() => handleSort('level')} className={headerClass}>Niv. <SortIcon column="level" /></button>
                <button onClick={() => handleSort('school')} className={headerClass}>École <SortIcon column="school" /></button>
                <button onClick={() => handleSort('castingTime')} className={headerClass}>Incantation <SortIcon column="castingTime" /></button>
                <button onClick={() => handleSort('range')} className={headerClass}>Portée <SortIcon column="range" /></button>
                <div className={headerClass + ' cursor-default hover:text-muted-foreground'}>Actions</div>
            </div>

            {/* Body — virtualized */}
            {sorted.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">
                    {emptyMessage}
                </div>
            ) : (
                <VirtualList
                    items={sorted}
                    estimateSize={48}
                    overscan={15}
                    className="h-[60vh] overflow-y-auto"
                    renderItem={(spell) => (
                        <div className="border-b border-border/50">
                            <button
                                onClick={() => onToggleExpand(expandedSpell === spell.name ? null : spell.name)}
                                className="w-full text-left"
                            >
                                <div className={`hidden xl:grid ${gridCols} gap-0 hover:bg-muted/30 transition-colors`}>
                                    <div className="px-3 py-3 flex items-center gap-2.5 min-w-0">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: spellSchoolColors[spell.school] || '#6B7280' }} />
                                        <span className="font-medium text-sm truncate">{spell.name}</span>
                                        {spell.ritual && <span className="text-[10px] text-magic font-bold shrink-0">R</span>}
                                    </div>
                                    <div className="px-3 py-3 text-sm tabular-nums">{getLevelLabel(spell.level)}</div>
                                    <div className="px-3 py-3 text-sm text-muted-foreground truncate">{spell.school}</div>
                                    <div className="px-3 py-3 text-sm text-muted-foreground truncate">{spell.castingTime}</div>
                                    <div className="px-3 py-3 text-sm text-muted-foreground truncate">{spell.range}</div>
                                    <div className="px-3 py-3 min-w-0">
                                        {renderActions?.(spell)}
                                    </div>
                                </div>
                            </button>

                            {/* Expanded details */}
                            {expandedSpell === spell.name && (
                                <div className="px-4 py-3 bg-muted/20 border-t border-border/50 animate-fade-in">
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                                        <div><span className="text-muted-foreground">Temps :</span> {spell.castingTime}</div>
                                        <div><span className="text-muted-foreground">Portée :</span> {spell.range}</div>
                                        <div><span className="text-muted-foreground">Composantes :</span> {spell.components}</div>
                                        <div><span className="text-muted-foreground">Durée :</span> {spell.duration}</div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{spell.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                />
            )}
        </div>
    )
}
