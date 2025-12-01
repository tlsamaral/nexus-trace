import { api } from "../api-client"
import { z } from "zod"

export const RecentSuspicionSchema = z.object({
  account: z.number(),
  community: z.number().nullable(),
  fanin: z.number(),
  amount: z.number(),
  channel: z.string(),
  risk: z.number(),
  reason: z.string(),
  ts: z.string(),
})

export type RecentSuspicion = z.infer<typeof RecentSuspicionSchema>

export async function getRecentSuspicions() {
  const res = await api.get("metrics/recent-suspicions").json()
  return z.array(RecentSuspicionSchema).parse(res)
}