// src/hooks/useScreeningFlow.ts
// Orchestrating hook - runs all 8 API modules in sequence,
// updating progress state after each step so cards appear one by one.

import { useState, useCallback } from "react";
import type { DocumentType } from "../contracts/common";

import { fetchOcr } from "../api/ocr";
import { fetchDocumentValidation } from "../api/documentValidation";
import { fetchTamperingDetection } from "../api/tamperingDetection";
import { fetchBarcodeScan } from "../api/barcodeScan";
import { fetchWatermarkVerification } from "../api/watermarkVerification";
import { fetchFaceVerification } from "../api/faceVerification";
import { fetchRiskScore } from "../api/riskScore";
import { fetchBlockchainAudit } from "../api/blockchainAudit";

import { mapOcrResponse, type OcrViewModel } from "../adapters/ocr.adapter";
import { mapValidationResponse, type ValidationViewModel } from "../adapters/documentValidation.adapter";
import { mapTamperingResponse, type TamperingViewModel } from "../adapters/tamperingDetection.adapter";
import { mapBarcodeResponse, type BarcodeViewModel } from "../adapters/barcodeScan.adapter";
import { mapWatermarkResponse, type WatermarkViewModel } from "../adapters/watermarkVerification.adapter";
import { mapFaceResponse, type FaceViewModel } from "../adapters/faceVerification.adapter";
import { mapRiskResponse, type RiskViewModel } from "../adapters/riskScore.adapter";
import { mapAuditResponse, type AuditViewModel } from "../adapters/blockchainAudit.adapter";

export type DemoScenario = "genuine" | "mismatch" | "tampered";

export interface ScreeningInput {
  documentImageBase64: string;
  livePhotoBase64: string;
  documentType: DocumentType;
  scenario?: DemoScenario;
}

export type ScreeningStep =
  | "idle"
  | "ocr"
  | "validation"
  | "tampering"
  | "barcode"
  | "watermark"
  | "face"
  | "risk"
  | "audit"
  | "done"
  | "error";

export interface ScreeningProgress {
  step: ScreeningStep;
  ocr?: OcrViewModel;
  validation?: ValidationViewModel;
  tampering?: TamperingViewModel;
  barcode?: BarcodeViewModel;
  watermark?: WatermarkViewModel;
  face?: FaceViewModel;
  risk?: RiskViewModel;
  audit?: AuditViewModel;
  error?: string;
}

export function useScreeningFlow() {
  const [progress, setProgress] = useState<ScreeningProgress>({ step: "idle" });

  const start = useCallback(async (input: ScreeningInput) => {
    const sc = input.scenario;
    try {
      // ── Step 1: OCR ───────────────────────────────────────────────
      setProgress({ step: "ocr" });
      const ocrRes = await fetchOcr({
        imageBase64: input.documentImageBase64,
        documentType: input.documentType,
      }, sc);
      if (!ocrRes.success) throw new Error(ocrRes.error ?? "OCR failed");
      const ocr = mapOcrResponse(ocrRes.data);

      // ── Step 2: Document Validation ───────────────────────────────
      setProgress((p) => ({ ...p, step: "validation", ocr }));
      const valRes = await fetchDocumentValidation({ ocrResult: ocrRes.data }, sc);
      if (!valRes.success) throw new Error(valRes.error ?? "Validation failed");
      const validation = mapValidationResponse(valRes.data);

      // ── Step 3: Tampering Detection ───────────────────────────────
      setProgress((p) => ({ ...p, step: "tampering", validation }));
      const tampRes = await fetchTamperingDetection({
        imageBase64: input.documentImageBase64,
        documentType: input.documentType,
      }, sc);
      if (!tampRes.success) throw new Error(tampRes.error ?? "Tampering detection failed");
      const tampering = mapTamperingResponse(tampRes.data);

      // ── Step 4: Barcode Scan (New Module) ─────────────────────────
      setProgress((p) => ({ ...p, step: "barcode", tampering }));
      const barRes = await fetchBarcodeScan({
        imageBase64: input.documentImageBase64,
        documentType: input.documentType,
      }, sc);
      if (!barRes.success) throw new Error(barRes.error ?? "Barcode scan failed");
      const barcode = mapBarcodeResponse(barRes.data);

      // ── Step 5: Watermark Verification (New Module) ───────────────
      setProgress((p) => ({ ...p, step: "watermark", barcode }));
      const watRes = await fetchWatermarkVerification({
        imageBase64: input.documentImageBase64,
        documentType: input.documentType,
      }, sc);
      if (!watRes.success) throw new Error(watRes.error ?? "Watermark verification failed");
      const watermark = mapWatermarkResponse(watRes.data);

      // ── Step 6: Face Verification ─────────────────────────────────
      setProgress((p) => ({ ...p, step: "face", watermark }));
      const faceRes = await fetchFaceVerification({
        documentPhotoBase64: input.documentImageBase64,
        livePhotoBase64: input.livePhotoBase64,
      }, sc);
      if (!faceRes.success) throw new Error(faceRes.error ?? "Face verification failed");
      const face = mapFaceResponse(faceRes.data);

      // ── Step 7: Risk Score Aggregator ─────────────────────────────
      setProgress((p) => ({ ...p, step: "risk", face }));
      const riskRes = await fetchRiskScore({
        ocrResult: ocrRes.data,
        validationResult: valRes.data,
        tamperingResult: tampRes.data,
        faceResult: faceRes.data,
        barcodeResult: barRes.data,
        watermarkResult: watRes.data,
      }, sc);
      if (!riskRes.success) throw new Error(riskRes.error ?? "Risk score failed");
      const risk = mapRiskResponse(riskRes.data);

      // ── Step 8: Blockchain Audit Log ──────────────────────────────
      setProgress((p) => ({ ...p, step: "audit", risk }));
      const auditRes = await fetchBlockchainAudit({
        documentId: valRes.data.documentId || crypto.randomUUID(),
        checkpointId: "CP-SIH26-001",
        timestamp: new Date().toISOString(),
        riskResult: riskRes.data,
      }, sc);
      if (!auditRes.success) throw new Error(auditRes.error ?? "Audit logging failed");
      const audit = mapAuditResponse(auditRes.data);

      setProgress((p) => ({ ...p, step: "done", audit }));
    } catch (err) {
      setProgress((p) => ({
        ...p,
        step: "error",
        error: err instanceof Error ? err.message : String(err),
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({ step: "idle" });
  }, []);

  return { progress, start, reset };
}
