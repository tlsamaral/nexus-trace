import { api } from "../api-client"

export type TransactionDetails = {
  id: string
  src: number
  dst: number
  amount: number
  ts: string
  channel: string
  community_src: number
  community_dst: number
  suspicious: boolean
  risk_score: number
  fanin: number
  dst_risk: number
}

export async function getTransactionDetails(id: string) {
  return api.get(`transactions/${id}`).json<TransactionDetails>()
}