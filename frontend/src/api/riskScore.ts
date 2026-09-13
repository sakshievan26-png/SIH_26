import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { RiskScoreInput, RiskScoreOutput } from "../contracts/riskScore";

export async function fetchRiskScore(
  input: RiskScoreInput,
  scenario?: string
): Promise<ApiResponse<RiskScoreOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.riskScore}/compute`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Risk Score API error: ${res.status}`);
  return res.json();
}
