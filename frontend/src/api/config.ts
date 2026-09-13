// src/api/config.ts
// ─────────────────────────────────────────────────────────────
// SINGLE CHANGE POINT per module.
// To swap any module from mock → real backend, replace its URL here.
// All API fetchers import from this file, so no component ever needs changing.
// ─────────────────────────────────────────────────────────────

export const MODULE_BASE_URLS = {
  ocr:                   "/api/ocr",
  documentValidation:    "/api/document-validation",
  tamperingDetection:    "/api/tampering-detection",
  barcodeScan:           "/api/barcode-scan",
  watermarkVerification: "/api/watermark-verification",
  faceVerification:      "/api/face-verification",
  riskScore:             "/api/risk-score",
  blockchainAudit:       "/api/blockchain-audit",
} as const;
