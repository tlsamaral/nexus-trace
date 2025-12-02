import { Separator } from "@/components/ui/separator"
import { AnalyticsHeaderCards } from "./analytics-header-card"
import { ChannelUsagePie } from "./channel-usage-pie"
import { CommunityDistributionPie } from "./community-distribuition"
import { FanInOutChart } from "./fan-in-out-chart"
import { RiskTrendChart } from "./risk-trend-chart"
import { ScoreDistributionChart } from "./score-distribuition-chart"
import { TopSuspiciousTable } from "./top-suspicious-table"
import { getAnalytics } from "@/http/analytics/get-analytics"

const COLORS = ["#2563eb", "#16a34a", "#fbbf24", "#ef4444", "#f59e0b"]

export default async function AnalyticsPage() {
  const { channel_usage, community_distribution, fan_in_out, risk_trend, score_distribution, top_suspicious } = await getAnalytics()
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights e padrões das transações detectadas pelo motor de grafos.</p>
      </div>

      <AnalyticsHeaderCards />

      <Separator />

      <RiskTrendChart data={risk_trend} />

      <ScoreDistributionChart data={score_distribution} />

      <ChannelUsagePie data={channel_usage} colors={COLORS} />

      <FanInOutChart data={fan_in_out} />

      <CommunityDistributionPie data={community_distribution} colors={COLORS} />
      
      <TopSuspiciousTable data={top_suspicious} />
    </div>
  )
}