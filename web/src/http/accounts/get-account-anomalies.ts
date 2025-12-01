import ky from "ky";
import { api } from "../api-client";

// Tipagem para o componente
export type Anomaly = {
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
};

export async function getAccountAnomalies(accountId: string): Promise<Anomaly[]> {
  return await api
    .get(`account/${accountId}/anomalies`)
    .json<Anomaly[]>();
}