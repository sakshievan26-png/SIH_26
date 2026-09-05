// contracts/tamperingDetection.ts
// Owner: Member 1 (AI/ML Lead)
// Objective: detect digitally or physically altered documents
// (photo replacement, text manipulation, stamp forgery, metadata inconsistency).

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

export interface TamperingDetectionOutput {
  tampered: boolean;
  methods: TamperingMethod[];       // which detection methods fired
  flaggedRegions: FlaggedRegion[];  // empty when tampered === false
  confidence: number;               // overall model confidence 0.0 – 1.0
}

/*
Example:
{
  "tampered": true,
  "methods": ["error_level_analysis", "stamp_pattern_match"],
  "flaggedRegions": [
    { "label": "photo_boundary", "boundingBox": { "x": 0.05, "y": 0.1, "w": 0.3, "h": 0.35 }, "confidence": 0.88 },
    { "label": "stamp_area", "boundingBox": { "x": 0.6, "y": 0.7, "w": 0.15, "h": 0.1 }, "confidence": 0.79 }
  ],
  "confidence": 0.87
}
*/
