// contracts/tamperingDetection.ts
// Owner: Member 1 (AI/ML Lead)
// Objective: detect digitally or physically altered documents
// (photo replacement, text manipulation, stamp forgery, metadata inconsistency).

import { ImageInput } from "./common";

// INPUT
export interface TamperingDetectionInput extends ImageInput {}

export type TamperingMethod =
  | "error_level_analysis"
  | "metadata_analysis"
  | "cnn_classifier"
  | "stamp_pattern_match"
  | "other";

export interface FlaggedRegion {
  label: string;         // e.g. "photo_boundary", "stamp_area", "dob_field"
  boundingBox?: [number, number, number, number]; // [x, y, width, height], optional
}

// OUTPUT
export interface TamperingDetectionOutput {
  tamperingScore: number;      // 0-1, probability the document is tampered
  isTampered: boolean;         // tamperingScore above the module's own threshold
  method: TamperingMethod;
  flaggedRegions: FlaggedRegion[];
}

/*
Example:
{
  "tamperingScore": 0.87,
  "isTampered": true,
  "method": "error_level_analysis",
  "flaggedRegions": [
    { "label": "photo_boundary" },
    { "label": "stamp_area" }
  ]
}
*/
