import { z } from "zod"
import { api } from "../api-client"

export const RiskTransactionsSchema = z.object({
  date: z.string(),
  transactions: z.number(),
  suspicious: z.number(),
  avg_risk: z.number(),
})

type RiskTransactions = z.infer<typeof RiskTransactionsSchema>

export async function getRiskTransactions() {
  const res = await api.get("metrics/risk-transactions").json<RiskTransactions[]>()

  return res
}