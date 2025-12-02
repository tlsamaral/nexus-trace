import { api } from "../api-client";

export interface FraudTestScenario {
  origin: {
    id: number;
    community: number;
    risk: number;
  };
  dest: {
    id: number;
    community: number;
    risk: number;
  };
  threshold: number;
  explain: string;
}

export async function getFraudTestScenario(): Promise<FraudTestScenario> {
  return api.get("tests/data").json<FraudTestScenario>();
}