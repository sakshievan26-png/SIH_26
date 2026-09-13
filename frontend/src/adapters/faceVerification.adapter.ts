// src/adapters/faceVerification.adapter.ts

import type { FaceVerificationOutput } from "../contracts/faceVerification";

export interface FaceViewModel {
  matched: boolean;
  similarityScore: number;       // e.g. 0.028 or 0.930
  similarityPct: number;         // e.g. 2.8 or 93.0
  threshold: number;             // 0.40 (from backend prototype)
  liveness: boolean;
  detail: string;
}

export function mapFaceResponse(raw: FaceVerificationOutput): FaceViewModel {
  return {
    matched: raw.matched,
    similarityScore: raw.similarityScore,
    similarityPct: Number((raw.similarityScore * 100).toFixed(1)),
    threshold: 0.40,
    liveness: raw.liveness,
    detail: raw.detail,
  };
}
