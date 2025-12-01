"use client"

import {
  IconUsers,
  IconAlertTriangle,
  IconTrendingUp,
  IconTrendingDown,
  IconCash,
  IconClock,
} from "@tabler/icons-react"

interface AccountSummaryCardProps {
  data: {
    id: number
    community: number | null
    avgRisk24h: string
    fanIn: string
    fanOut: string
    volume24h: string
    lastTransaction: string
  }
}

export function AccountSummaryCard({ data }: AccountSummaryCardProps) {
  return (
    <section className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <MetricCard
          label="Comunidade"
          value={data.community}
          icon={<IconUsers size={22} className="text-blue-600" />}
        />

        <MetricCard
          label="Risco médio (24h)"
          value={`${data.avgRisk24h}%`}
          icon={<IconAlertTriangle size={22} className="text-red-600" />}
        />

        <MetricCard
          label="Fan-In (24h)"
          value={data.fanIn}
          icon={<IconTrendingUp size={22} className="text-green-600" />}
        />

        <MetricCard
          label="Fan-Out (24h)"
          value={data.fanOut}
          icon={<IconTrendingDown size={22} className="text-red-600" />}
        />

        <MetricCard
          label="Volume 24h"
          value={`R$ ${data.volume24h.toLocaleString()}`}
          icon={<IconCash size={22} className="text-emerald-600" />}
        />

        <MetricCard
          label="Última transação"
          value={data.lastTransaction}
          icon={<IconClock size={22} className="text-gray-600" />}
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