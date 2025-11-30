import { z } from "zod"
import { api } from "../api-client"

export const RiskTrendPointSchema = z.object({
  day: z.string(),
  risk: z.number(),
})

export const ScoreBucketSchema = z.object({
  range: z.string(),
  count: z.number(),
})

export const ChannelUsageSchema = z.object({
  channel: z.string(),
  value: z.number(),
})

export const FanInOutSchema = z.object({
  account: z.string(),
  fanin: z.number(),
  fanout: z.number(),
})

export const CommunityDistributionSchema = z.object({
  name: z.string(),
  value: z.number(),
})

export const TopSuspiciousSchema = z.object({
  id: z.number(),
  risk: z.number(),
  fanin: z.number(),
  community: z.number().nullable(),
})

export const AnalyticsResponseSchema = z.object({
  risk_trend: z.array(RiskTrendPointSchema),
  score_distribution: z.array(ScoreBucketSchema),
  channel_usage: z.array(ChannelUsageSchema),
  fan_in_out: z.array(FanInOutSchema),
  community_distribution: z.array(CommunityDistributionSchema),
  top_suspicious: z.array(TopSuspiciousSchema),
})

export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>


export async function getAnalytics(): Promise<AnalyticsResponse> {
  const res = await api.get("analytics/").json<AnalyticsResponse>()
  return res
}