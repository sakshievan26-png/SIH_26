// src/mocks/handlers/index.ts
import { ocrHandler } from "./ocr.handler";
import { documentValidationHandler } from "./documentValidation.handler";
import { tamperingDetectionHandler } from "./tamperingDetection.handler";
import { barcodeScanHandler } from "./barcodeScan.handler";
import { watermarkVerificationHandler } from "./watermarkVerification.handler";
import { faceVerificationHandler } from "./faceVerification.handler";
import { riskScoreHandler } from "./riskScore.handler";
import { blockchainAuditHandler } from "./blockchainAudit.handler";

export const handlers = [
  ocrHandler,
  documentValidationHandler,
  tamperingDetectionHandler,
  barcodeScanHandler,
  watermarkVerificationHandler,
  faceVerificationHandler,
  riskScoreHandler,
  blockchainAuditHandler,
];
