import { api } from "../api-client"

export type AccountPrediction = {
  risk: number
  horizon_hours: number
  updated_at: string
}

export async function getAccountPrediction(
  accountId: string,
): Promise<AccountPrediction> {
  return api
    .get(`account/${accountId}/prediction`)
    .json<AccountPrediction>()
}