
import ky from "ky"
import { api } from "../api-client"

export interface Account {
  id: number
  community: number
  risk_24h: number
  fanin: number
  fanout: number
  volume24h: number
  lastActivity: string
}

export async function getAccounts(): Promise<Account[]> {
  return api.get("account").json<Account[]>()
}