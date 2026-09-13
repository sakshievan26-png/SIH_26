// src/adapters/riskScore.adapter.ts

import type { RiskScoreOutput } from "../contracts/riskScore";
import type { RiskDecision } from "../contracts/common";

export interface RiskViewModel {
  score: number;
  decision: RiskDecision;
  summary: string;
  breakdown: { label: string; value: number; max: number }[];
}

export function mapRiskResponse(raw: RiskScoreOutput): RiskViewModel {
  return {
    score: raw.score,
    decision: raw.decision,
    summary: raw.summary,
    breakdown: [
      { label: "OCR Confidence",          value: raw.breakdown.ocr,        max: 20 },
      { label: "Document Validation",     value: raw.breakdown.validation,  max: 20 },
      { label: "Tampering Detection",     value: raw.breakdown.tampering,   max: 20 },
      { label: "Face Verification",       value: raw.breakdown.face,        max: 20 },
      { label: "Barcode Consistency",     value: raw.breakdown.barcode,     max: 10 },
      { label: "Watermark Verification",  value: raw.breakdown.watermark,   max: 10 },
    ],
  };
}
