// contracts/riskScore.ts
// Owner: Member 4 (Backend & AI Logic)
// Objective: aggregate every module's output into one final risk score + decision.
// This is the endpoint your frontend dashboard ultimately renders.

import { OcrOutput } from "./ocr";
import { DocumentValidationOutput } from "./documentValidation";
import { TamperingDetectionOutput } from "./tamperingDetection";
import { FaceVerificationOutput } from "./faceVerification";
import { RiskDecision } from "./common";

// INPUT — the aggregator takes every module's output
export interface RiskScoreInput {
  ocrResult: OcrOutput;
  validationResult: DocumentValidationOutput;
  tamperingResult: TamperingDetectionOutput;
  faceResult: FaceVerificationOutput;
}

export interface RiskScoreBreakdown {
  validationWeight: number;
  tamperingWeight: number;
  faceWeight: number;
}

// OUTPUT — this is what your dashboard actually displays
export interface RiskScoreOutput {
  riskScore: number;          // 0-100
  decision: RiskDecision;
  breakdown: RiskScoreBreakdown;
  summary: string;             // one-line human-readable explanation for the officer
}

/*
Example:
{
  "riskScore": 78,
  "decision": "flag",
  "breakdown": { "validationWeight": 0.3, "tamperingWeight": 0.5, "faceWeight": 0.2 },
  "summary": "High tampering probability detected on stamp region; recommend manual review."
}
*/
