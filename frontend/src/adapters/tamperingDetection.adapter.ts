// src/adapters/tamperingDetection.adapter.ts

import type { TamperingDetectionOutput, ElaScore } from "../contracts/tamperingDetection";

export interface TamperingViewModel {
  tampered: boolean;
  confidence: number;
  methods: string[];
  flaggedRegions: {
    label: string;
    confidencePct: number;
    bbox?: { x: number; y: number; w: number; h: number };
  }[];
  ela?: ElaScore;
}

const METHOD_LABELS: Record<string, string> = {
  error_level_analysis: "Error Level Analysis (ELA)",
  metadata_analysis:    "EXIF Metadata Analysis",
  cnn_classifier:       "CNN Forgery Classifier",
  stamp_pattern_match:  "Stamp Pattern Matching",
  other:                "Other Method",
};

export function mapTamperingResponse(raw: TamperingDetectionOutput): TamperingViewModel {
  return {
    tampered: raw.tampered,
    confidence: raw.confidence,
    methods: raw.methods.map((m) => METHOD_LABELS[m] ?? m),
    flaggedRegions: raw.flaggedRegions.map((r) => ({
      label: r.label.replace(/_/g, " "),
      confidencePct: Math.round(r.confidence * 100),
      bbox: r.boundingBox,
    })),
    ela: raw.ela,
  };
}
