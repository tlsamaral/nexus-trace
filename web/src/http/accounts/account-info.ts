import { z } from "zod"
import { api } from "../api-client"
import { ChannelEnum } from "../transactions/get-transactions"

export const AccountSummarySchema = z.object({
  id: z.number(),
  community: z.number().nullable(),
  risk_avg: z.number(),
  fanin: z.number(),
  fanout: z.number(),
  volume24h: z.number(),
  lastActivity: z.string().nullable(),
})

export const RiskPointSchema = z.object({
  ts: z.string(),
  risk: z.number()
})

export const GraphNodeSchema = z.object({
  id: z.number(),
  community: z.number().nullable(),
  risk: z.number().nullable()
})

export const GraphLinkSchema = z.object({
  source: z.number(),
  target: z.number(),
  amount: z.number(),
  channel: ChannelEnum,
})

export const GraphResponseSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  links: z.array(GraphLinkSchema),
})

export const TransactionSchema = z.object({
  id: z.number().optional(),
  amount: z.number(),
  ts: z.string(),
  dst: z.number(),
  channel: z.string().optional(),
  risk: z.number().optional(),
})

export type AccountSummary = z.infer<typeof AccountSummarySchema>
export type RiskPoint = z.infer<typeof RiskPointSchema>
export type GraphResponse = z.infer<typeof GraphResponseSchema>
export type Transaction = z.infer<typeof TransactionSchema>


export async function getAccountSummary(id: string) {
  const res = await api.get(`account/${id}/summary`).json()
  return AccountSummarySchema.parse(res)
}

export async function getAccountRiskHistory(id: string) {
  const res = await api.get(`account/${id}/risk-history`).json()
  return z.array(RiskPointSchema).parse(res)
}

export async function getAccountGraph(id: string) {
  const res = await api.get(`account/${id}/graph`).json()
  return GraphResponseSchema.parse(res)
}

export async function getAccountTransactions(id: string) {
  const res = await api.get(`account/${id}/transactions`).json()
  return z.array(TransactionSchema).parse(res)
}