// contracts/riskScore.ts
// Owner: Member 4 (Backend & AI Logic)
// Objective: aggregate every module's output into one final risk score + decision.
// This is the endpoint your frontend dashboard ultimately renders.

import type { OcrOutput } from "./ocr";
import type { DocumentValidationOutput } from "./documentValidation";
import type { TamperingDetectionOutput } from "./tamperingDetection";
import type { FaceVerificationOutput } from "./faceVerification";
import type { RiskDecision } from "./common";

// INPUT — the aggregator takes every module's output
export interface RiskScoreInput {
  ocrResult: OcrOutput;
  validationResult: DocumentValidationOutput;
  tamperingResult: TamperingDetectionOutput;
  faceResult: FaceVerificationOutput;
}

export interface RiskScoreBreakdown {
  ocr: number;         // contribution from OCR confidence (0–25)
  validation: number;  // contribution from document validation (0–25)
  tampering: number;   // contribution from tampering detection (0–25)
  face: number;         // contribution from face verification (0–25)
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
  "breakdown": { "ocr": 22, "validation": 15, "tampering": 8, "face": 20 }
}
*/
