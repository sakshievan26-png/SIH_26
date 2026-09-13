// contracts/tamperingDetection.ts
// Owner: Member 1 (AI/ML Lead)
// Objective: detect digitally or physically altered documents
// (photo replacement, text manipulation, stamp forgery, metadata inconsistency).
// Updated to include the actual ELA (Error Level Analysis) scoring used by the
// backend prototype, alongside the richer region-based model output for the UI.

import type { ImageInput } from "./common";

// INPUT
export interface TamperingDetectionInput extends ImageInput {}

export type TamperingMethod =
  | "error_level_analysis"
  | "metadata_analysis"
  | "cnn_classifier"
  | "stamp_pattern_match"
  | "other";

export interface FlaggedRegion {
  label: string;          // e.g. "photo_boundary", "stamp_area", "dob_field"
  boundingBox: {
    x: number;            // top-left x, normalised 0-1
    y: number;            // top-left y, normalised 0-1
    w: number;            // width, normalised 0-1
    h: number;            // height, normalised 0-1
  };
  confidence: number;     // 0.0 – 1.0 how confident the model is in this region
}

// Raw ELA numbers as produced by the backend (average pixel difference score
// and the maximum pixel difference found after JPEG recompression).
export interface ElaScore {
  averageScore: number;
  maxDifference: number;
}

export interface TamperingDetectionOutput {
  tampered: boolean;
  methods: TamperingMethod[];       // which detection methods fired
  flaggedRegions: FlaggedRegion[];  // empty when tampered === false
  confidence: number;               // overall model confidence 0.0 – 1.0
  ela?: ElaScore;                   // raw ELA numbers, included when ELA was the method used
}

/*
Example:
{
  "tampered": true,
  "methods": ["error_level_analysis", "stamp_pattern_match"],
  "flaggedRegions": [
    { "label": "photo_boundary", "boundingBox": { "x": 0.05, "y": 0.1, "w": 0.3, "h": 0.35 }, "confidence": 0.88 }
  ],
  "confidence": 0.87,
  "ela": { "averageScore": 6.42, "maxDifference": 58.0 }
}
*/
