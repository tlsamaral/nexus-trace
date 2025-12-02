import { api } from "../api-client";

export interface FraudTestResult {
  risk: number;
  fraud: boolean;
  explain: string[];
}

export async function sendFraudTestTransaction(input: {
  origin_id: number;
  dest_id: number;
  amount: number;
  threshold: number;
}): Promise<FraudTestResult> {
  return api
    .post("tests/transaction", {
      json: input,
    })
    .json<FraudTestResult>();
}