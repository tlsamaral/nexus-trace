"use client"

import { useEffect, useState } from "react"
import { AnalyticsMetricCard } from "./analytics-metric-card"
import { getAnalyticsOverview } from "@/http/analytics/get-overview"
import {
  IconActivity,
  IconGauge,
  IconAlertTriangle,
  IconTopologyStar3,
} from "@tabler/icons-react"

export function AnalyticsHeaderCards() {
  const [data, setData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const overview = await getAnalyticsOverview()
      setData(overview)
    }
    load().finally(() => setLoading(false))
  }, [])

  if (!data) {
    return <div className="text-muted-foreground py-6">Carregando…</div>
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <AnalyticsMetricCard
        title="Risco médio (hoje)"
        value={data.risk_today.toFixed(2)}
        subtitle="Média ponderada das transações do dia"
        trend="+4.2%"
        trendPositive={true}
        icon={<IconGauge size={18} />}
        chartData={[{ value: data.risk_today }]}
        isLoading={loading}
      />

      <AnalyticsMetricCard
        title="Total de transações"
        value={data.transactions_today.toLocaleString()}
        subtitle="Volume total processado hoje"
        trend="+12%"
        trendPositive={true}
        icon={<IconActivity size={18} />}
        chartData={[{ value: data.transactions_today }]}
        isLoading={loading}
      />

      <AnalyticsMetricCard
        title="Suspeitas"
        value={data.suspicions_today}
        subtitle="Transações com risco ≥ 80"
        trend="+3%"
        trendPositive={false}
        icon={<IconAlertTriangle size={18} />}
        chartData={[{ value: data.suspicions_today }]}
        isLoading={loading}
      />

      <AnalyticsMetricCard
        title="Comunidades"
        value={data.communities}
        subtitle="Agrupamentos detectados via GDS"
        trend="+1"
        trendPositive={true}
        icon={<IconTopologyStar3 size={18} />}
        chartData={[{ value: data.communities }]}
        isLoading={loading}
      />
    </div>
  )
}