import { z } from "zod"
import { api } from "../api-client"

export const ChannelEnum = z.enum(['pix','ted','card','web','mobile','internal'])

export const TransactionSchema = z.object({
  id: z.string(),
  src: z.number(),
  dst: z.number(),
  amount: z.number(),
  ts: z.string(),
  channel: ChannelEnum,
  risk: z.number(),
  suspicious: z.boolean(),
  community_src: z.number().nullable(),
  community_dst: z.number().nullable(),
})

export const TransactionListSchema = z.array(TransactionSchema)

export type Transaction = z.infer<typeof TransactionSchema>

export async function getAllTransactions() {
  const res = await api.get("transactions").json()

  return TransactionListSchema.parse(res)
}