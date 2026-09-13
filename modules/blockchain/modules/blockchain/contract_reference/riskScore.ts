// contracts/riskScore.ts
// Owner: Member 4 (Backend & AI Logic)
// Objective: aggregate every module's output into one final risk score + decision.
// This is the endpoint your frontend dashboard ultimately renders.
// Updated to fold in barcode scan and watermark verification as additional signals.

import type { OcrOutput } from "./ocr";
import type { DocumentValidationOutput } from "./documentValidation";
import type { TamperingDetectionOutput } from "./tamperingDetection";
import type { FaceVerificationOutput } from "./faceVerification";
import type { BarcodeScanOutput } from "./barcodeScan";
import type { WatermarkVerificationOutput } from "./watermarkVerification";
import type { RiskDecision } from "./common";

// INPUT — the aggregator takes every module's output.
// barcode/watermark are optional since older/simpler documents may not have them.
export interface RiskScoreInput {
  ocrResult: OcrOutput;
  validationResult: DocumentValidationOutput;
  tamperingResult: TamperingDetectionOutput;
  faceResult: FaceVerificationOutput;
  barcodeResult?: BarcodeScanOutput;
  watermarkResult?: WatermarkVerificationOutput;
}

export interface RiskScoreBreakdown {
  ocr: number;          // contribution from OCR confidence (0–20)
  validation: number;   // contribution from document validation (0–20)
  tampering: number;    // contribution from tampering detection (0–20)
  face: number;          // contribution from face verification (0–20)
  barcode: number;       // contribution from barcode consistency (0–10)
  watermark: number;     // contribution from watermark verification (0–10)
}

// OUTPUT
export interface RiskScoreOutput {
  score: number;                  // 0–100 — higher means riskier
  decision: RiskDecision;         // "accept" | "flag" | "reject"
  summary: string;                // human-readable summary for the officer
  breakdown: RiskScoreBreakdown;  // per-module contributions
}

/*
Example:
{
  "score": 78,
  "decision": "flag",
  "summary": "High tampering probability detected on stamp region; recommend manual review.",
  "breakdown": { "ocr": 18, "validation": 12, "tampering": 6, "face": 16, "barcode": 8, "watermark": 4 }
}
*/
