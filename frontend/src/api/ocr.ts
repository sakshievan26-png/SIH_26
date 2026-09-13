import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { OcrInput, OcrOutput } from "../contracts/ocr";

export async function fetchOcr(
  input: OcrInput,
  scenario?: string
): Promise<ApiResponse<OcrOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.ocr}/extract`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`OCR API error: ${res.status}`);
  return res.json();
}
