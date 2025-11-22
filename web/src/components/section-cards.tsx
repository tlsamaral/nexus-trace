import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { RiskMetricCard } from "@/app/(app)/dashboard/risk-card"
import { Activity, ShieldAlert } from "lucide-react"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <RiskMetricCard
        title="Transações Hoje"
        value="1.250"
        subtitle="Fluxo total do dia"
        trend="+12.5%"
        trendPositive
        icon={<Activity className="w-4 h-4" />}
      />

      <RiskMetricCard
        title="Suspeitas"
        value="87"
        subtitle="Detectadas nas últimas 24h"
        trend="+8%"
        trendPositive={false}
        icon={<ShieldAlert className="w-4 h-4" />}
      />

      <RiskMetricCard
        title="Fraudes Confirmadas"
        value="14"
        subtitle="Casos validados pelo time"
        trend="+3%"
        trendPositive
      />

      <RiskMetricCard
        title="Score Médio"
        value="42.5"
        subtitle="Últimas 24 horas"
      />
    </div>
  )
}
