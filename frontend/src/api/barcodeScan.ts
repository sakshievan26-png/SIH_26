import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { BarcodeScanInput, BarcodeScanOutput } from "../contracts/barcodeScan";

export async function fetchBarcodeScan(
  input: BarcodeScanInput,
  scenario?: string
): Promise<ApiResponse<BarcodeScanOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.barcodeScan}/scan`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Barcode Scan API error: ${res.status}`);
  return res.json();
}
