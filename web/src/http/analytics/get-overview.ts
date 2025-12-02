import { api } from "../api-client";

export type AnalyticsOverview = {
  risk_today: number;
  transactions_today: number;
  suspicions_today: number;
  communities: number;
};

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  return api.get("analytics/overview").json<AnalyticsOverview>();
}