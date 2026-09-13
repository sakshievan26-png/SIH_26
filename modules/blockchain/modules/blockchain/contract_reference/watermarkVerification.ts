// contracts/watermarkVerification.ts
// New module: Watermark / security-feature verification
// Objective: detect and assess the document's embedded security watermark
// (visible pattern, digital watermark, or hologram-adjacent print feature)
// as an additional forgery-resistance signal alongside ELA tampering analysis.

import type { ImageInput } from "./common";

// INPUT
export interface WatermarkVerificationInput extends ImageInput {}

export type WatermarkStatus = "authentic" | "suspicious" | "not_detected";

export interface WatermarkVerificationOutput {
  status: WatermarkStatus;
  watermarkDetected: boolean;
  watermarkType: string | null;   // e.g. "visible_pattern", "digital_watermark", "uv_reactive"
  confidence: number;             // 0.0 – 1.0
  detail: string;                 // human-readable summary for the officer
}

/*
Example:
{
  "status": "authentic",
  "watermarkDetected": true,
  "watermarkType": "visible_pattern",
  "confidence": 0.89,
  "detail": "Security watermark pattern detected and consistent with expected document template."
}
*/
