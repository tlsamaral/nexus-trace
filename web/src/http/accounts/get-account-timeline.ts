import { api } from "../api-client";

export type Timeline = {
  ts: string;
  type: "alert" | "info" | "tx";
  text: string
}

export async function getAccountTimeline(accountId: string) {
  return await api
    .get(`account/${accountId}/timeline`)
    .json<Timeline[]>();
}