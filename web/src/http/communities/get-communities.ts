import { z } from "zod"
import { api } from "../api-client"

export const CommunitySchema = z.object({
  id: z.number(),
  size: z.number(),
  total_tx: z.number(),
  high_fanin_pct: z.number(),
  avg_risk: z.number(),
  status: z.string(),
})

export type Community = z.infer<typeof CommunitySchema>

export async function getCommunities(): Promise<Community[]> {
  const res = await api.get("communities").json()
  return z.array(CommunitySchema).parse(res)
}