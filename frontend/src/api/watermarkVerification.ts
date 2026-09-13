import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { WatermarkVerificationInput, WatermarkVerificationOutput } from "../contracts/watermarkVerification";

export async function fetchWatermarkVerification(
  input: WatermarkVerificationInput,
  scenario?: string
): Promise<ApiResponse<WatermarkVerificationOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.watermarkVerification}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Watermark Verification API error: ${res.status}`);
  return res.json();
}
