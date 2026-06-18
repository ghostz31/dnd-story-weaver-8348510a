// ============================================================================
// SOUS-COMPOSANTS — QuickStat
// ============================================================================

export function QuickStat({ icon: Icon, label, value, color }: { 
  icon: any
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="card p-2 flex flex-col items-center">
      <Icon className={`w-4 h-4 ${color} mb-1`} />
      <span className="text-lg font-bold font-cinzel">{value}</span>
      <span className="stat-label text-[10px] text-muted-foreground uppercase">{label}</span>
    </div>
  )
}
