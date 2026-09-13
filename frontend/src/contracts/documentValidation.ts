// contracts/documentValidation.ts
// Owner: Member 4 (Backend & AI Logic)
// Objective: verify whether extracted OCR information follows official document
// standards and matches the trusted reference database (document ID lookup + DOB check).
// Updated to reflect the actual backend logic (reference-database lookups) and to
// fold in the barcode cross-check now that barcode scanning exists as a module.

import type { OcrOutput } from "./ocr";
import type { BarcodeScanOutput } from "./barcodeScan";

// INPUT - takes OCR output, and barcode output when available
export interface DocumentValidationInput {
  ocrResult: OcrOutput;
  barcodeResult?: BarcodeScanOutput;
}

export type DocumentIdStatus = "TRUSTED" | "UNKNOWN" | "NOT_DETECTED";
export type DobStatus = "DOB_MATCH" | "DOB_MISMATCH" | "NO_DOB" | "UNKNOWN_DOCUMENT";

// Kept for backwards compatibility / any generic rule-based checks
// (format checks, checksum validation, etc.) alongside the reference-database checks below.
export interface ValidationCheck {
  rule: string;     // e.g. "passport_number_format", "checksum_valid"
  passed: boolean;
  detail?: string;
}

export interface DocumentValidationOutput {
  documentIdStatus: DocumentIdStatus;
  documentId: string | null;
  dobStatus: DobStatus;
  documentDob: string | null;
  referenceDob: string | null;
  barcodeConsistent: boolean | null;  // null if no barcode was scanned/available
  checks: ValidationCheck[];
  overallPassed: boolean;
}

/*
Example:
{
  "documentIdStatus": "TRUSTED",
  "documentId": "Z1234567",
  "dobStatus": "DOB_MATCH",
  "documentDob": "1990-05-15",
  "referenceDob": "1990-05-15",
  "barcodeConsistent": true,
  "checks": [
    { "rule": "passport_number_format", "passed": true }
  ],
  "overallPassed": true
}
*/
