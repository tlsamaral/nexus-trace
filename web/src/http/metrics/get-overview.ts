import ky from "ky";
import { api } from "../api-client";

export interface MetricsOverview {
  transacoes_hoje: number
  suspeitas_hoje: number
  fraudes_confirmadas: number
  avg_score_24h: number
  avg_amount: number
  max_amount: number
}

export async function getMetricsOverview(): Promise<MetricsOverview> {
  const result = await api.get("metrics/overview").json<MetricsOverview>();
  return result
}