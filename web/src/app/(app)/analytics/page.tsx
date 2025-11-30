import { Separator } from "@/components/ui/separator"
import { AnalyticsHeaderCards } from "./analytics-header-card"
import { ChannelUsagePie } from "./channel-usage-pie"
import { CommunityDistributionPie } from "./community-distribuition"
import { FanInOutChart } from "./fan-in-out-chart"
import { RiskTrendChart } from "./risk-trend-chart"
import { ScoreDistributionChart } from "./score-distribuition-chart"
import { TopSuspiciousTable } from "./top-suspicious-table"
import { getAnalytics } from "@/http/analytics/get-analytics"

// ========= MOCK DATA ========= //
const riskTrend = [
  { day: "Seg", risk: 34 },
  { day: "Ter", risk: 42 },
  { day: "Qua", risk: 51 },
  { day: "Qui", risk: 63 },
  { day: "Sex", risk: 74 },
  { day: "Sab", risk: 49 },
  { day: "Dom", risk: 58 },
]

const scoreDistribution = [
  { range: "0–20", count: 120 },
  { range: "21–40", count: 300 },
  { range: "41–60", count: 180 },
  { range: "61–80", count: 95 },
  { range: "81–100", count: 22 },
]

const channelUse = [
  { channel: "PIX", value: 63 },
  { channel: "TED", value: 18 },
  { channel: "Boleto", value: 11 },
  { channel: "Interno", value: 8 },
]

const COLORS = ["#2563eb", "#16a34a", "#fbbf24", "#ef4444"]

const fanInOut = [
  { account: "101", fanin: 45, fanout: 12 },
  { account: "202", fanin: 12, fanout: 32 },
  { account: "330", fanin: 88, fanout: 41 },
  { account: "887", fanin: 40, fanout: 10 },
]

const communityPie = [
  { name: "Comunidade 12", value: 28 },
  { name: "Comunidade 8", value: 22 },
  { name: "Comunidade 3", value: 18 },
  { name: "Comunidade 1", value: 14 },
  { name: "Outras", value: 18 },
]

const topSuspicious = [
  { id: 101, risk: 92, fanin: 88, community: 12 },
  { id: 330, risk: 87, fanin: 45, community: 8 },
  { id: 887, risk: 76, fanin: 35, community: 3 },
  { id: 444, risk: 74, fanin: 30, community: 1 },
]

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