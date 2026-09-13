import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { TamperingDetectionInput, TamperingDetectionOutput } from "../contracts/tamperingDetection";

export async function fetchTamperingDetection(
  input: TamperingDetectionInput,
  scenario?: string
): Promise<ApiResponse<TamperingDetectionOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.tamperingDetection}/analyse`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Tampering Detection API error: ${res.status}`);
  return res.json();
}
