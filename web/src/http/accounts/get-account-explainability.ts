import { api } from "../api-client";

export type Explainability = {
  total: number
  fanin: number
  amount: number
  community: number
}

export async function getAccountExplainability(accountId: string) {
  return await api
    .get(`account/${accountId}/explainability`)
    .json<Explainability>();
}