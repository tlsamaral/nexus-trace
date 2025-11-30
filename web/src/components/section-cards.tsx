import { Activity, ShieldAlert } from "lucide-react"
import { RiskMetricCard } from "@/app/(app)/dashboard/risk-card"
import { getMetricsOverview } from "@/http/metrics/get-overview"

export async function SectionCards() {
  const data = await  getMetricsOverview()

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

      <RiskMetricCard
        title="Transações Hoje"
        value={data.transacoes_hoje}
        subtitle="Fluxo total do dia"
        trend="+12%"
        trendPositive
        icon={<Activity className="w-4 h-4" />}
      />

      <RiskMetricCard
        title="Suspeitas"
        value={data.suspeitas_hoje}
        subtitle="Detectadas nas últimas 24h"
        trend="-3%"
        trendPositive={false}
        icon={<ShieldAlert className="w-4 h-4" />}
      />

      <RiskMetricCard
        title="Fraudes Confirmadas"
        value={data.fraudes_confirmadas}
        subtitle="Casos validados"
        trend="+2%"
        trendPositive
      />

      <RiskMetricCard
        title="Score Médio"
        value={data.avg_score_24h ?? 0}
        subtitle="Últimas 24h"
      />
    </div>
  )
}