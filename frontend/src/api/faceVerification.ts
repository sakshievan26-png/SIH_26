import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { FaceVerificationInput, FaceVerificationOutput } from "../contracts/faceVerification";

export async function fetchFaceVerification(
  input: FaceVerificationInput,
  scenario?: string
): Promise<ApiResponse<FaceVerificationOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.faceVerification}/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Face Verification API error: ${res.status}`);
  return res.json();
}
