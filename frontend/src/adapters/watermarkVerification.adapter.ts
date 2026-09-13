// src/adapters/watermarkVerification.adapter.ts

import type { WatermarkVerificationOutput, WatermarkStatus } from "../contracts/watermarkVerification";

export interface WatermarkViewModel {
  status: WatermarkStatus;
  statusLabel: string;
  isAuthentic: boolean;
  watermarkDetected: boolean;
  watermarkType: string | null;
  watermarkTypeLabel: string;
  confidencePct: number;
  detail: string;
}

const STATUS_LABELS: Record<WatermarkStatus, string> = {
  authentic: "Security Watermark Verified",
  suspicious: "Watermark Suspicious / Anomaly",
  not_detected: "No Watermark Detected",
};

const TYPE_LABELS: Record<string, string> = {
  visible_pattern: "Overt Geometric Security Pattern",
  digital_watermark: "Cryptographic Steganographic Watermark",
  uv_reactive: "UV-Reactive Fluorophore Pattern",
  uv_reactive_pattern: "UV-Reactive Micro-Printed Seal",
  holographic: "Diffractive Hologram Overlay",
};

export function mapWatermarkResponse(raw: WatermarkVerificationOutput): WatermarkViewModel {
  return {
    status: raw.status,
    statusLabel: STATUS_LABELS[raw.status] ?? raw.status,
    isAuthentic: raw.status === "authentic",
    watermarkDetected: raw.watermarkDetected,
    watermarkType: raw.watermarkType,
    watermarkTypeLabel: raw.watermarkType ? (TYPE_LABELS[raw.watermarkType] ?? raw.watermarkType.replace(/_/g, " ")) : "N/A",
    confidencePct: Math.round(raw.confidence * 100),
    detail: raw.detail,
  };
}
