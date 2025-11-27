"use client"

import {
  IconUsers,
  IconArrowsShuffle,
  IconTrendingUp,
  IconAlertTriangle,
} from "@tabler/icons-react"

interface CommunitySummaryProps {
  size: number
  total_tx: number
  high_fanin_pct: number
  avg_risk: number
}

export function CommunitySummary({ size, total_tx, high_fanin_pct, avg_risk }: CommunitySummaryProps) {
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        
        <MetricCard
          label="Contas"
          value={size}
          icon={<IconUsers size={22} className="text-blue-600" />}
        />

        <MetricCard
          label="Transações"
          value={total_tx}
          icon={<IconArrowsShuffle size={22} className="text-emerald-600" />}
        />

        <MetricCard
          label="Fan-in Alto"
          value={`${high_fanin_pct.toFixed(1)}%`}
          icon={<IconTrendingUp size={22} className="text-orange-500" />}
        />

        <MetricCard
          label="Risco Médio"
          value={avg_risk.toFixed(2)}
          icon={<IconAlertTriangle size={22} className="text-red-600" />}
        />

      </div>
    </section>
  )
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string
  value: any
  icon: React.ReactNode
}) {
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm flex items-center gap-3 hover:shadow-md transition">
      <div className="p-2 rounded-md bg-muted flex items-center justify-center">
        {icon}
      </div>

      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold leading-tight">{value}</p>
      </div>
    </div>
  )
}