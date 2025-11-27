import { z } from "zod"
import { api } from "../api-client"

export const RiskPointSchema = z.object({
  ts: z.string(),
  risk: z.number(),
})

export const FaninDistributionSchema = z.object({
  labels: z.array(z.string()),
  values: z.array(z.number()),
})

export const TopAccountSchema = z.object({
  id: z.number(),
  fanin: z.number(),
  fanout: z.number(),
  risk_score: z.number(),
})

export const FlowPointSchema = z.object({
  ts: z.string(),
  volume: z.number(),
})

export const CommunityDetailsSchema = z.object({
  id: z.number(),
  size: z.number(),
  total_tx: z.number(),
  high_fanin_pct: z.number(),
  avg_risk: z.number(),
  risk_history: z.array(RiskPointSchema),
  fanin_distribution: FaninDistributionSchema,
  top_accounts: z.array(TopAccountSchema),
  flow_history: z.array(FlowPointSchema),
})

export type CommunityDetails = z.infer<typeof CommunityDetailsSchema>


export async function getCommunityDetails(id: string) {
  const res = await api.get(`communities/${id}/details`).json<CommunityDetails>()

  return res
}