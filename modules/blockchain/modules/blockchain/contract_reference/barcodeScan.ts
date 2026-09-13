// contracts/barcodeScan.ts
// New module: Barcode / QR / PDF417 scanning
// Objective: extract and decode any barcode printed on the document (common on
// driving licenses, national IDs, visas) and cross-check it against OCR-extracted
// fields for consistency.

import type { ImageInput } from "./common";

// INPUT
export interface BarcodeScanInput extends ImageInput {}

export type BarcodeType = "qr_code" | "pdf417" | "code128" | "aztec" | "data_matrix" | "unknown";

export interface BarcodeScanOutput {
  barcodeDetected: boolean;
  barcodeType: BarcodeType | null;
  decodedData: string | null;        // raw decoded string/payload
  parsedFields?: Record<string, string>; // structured fields if the barcode encodes them (e.g. PDF417 on a driving license)
  matchesOcrData: boolean | null;    // null when there's nothing to cross-check against (no OCR field overlap)
  confidence: number;                // 0.0 – 1.0, decode confidence
}

/*
Example:
{
  "barcodeDetected": true,
  "barcodeType": "pdf417",
  "decodedData": "ANSI 636014090002DL...",
  "parsedFields": { "documentId": "Z1234567", "dateOfBirth": "1990-05-15" },
  "matchesOcrData": true,
  "confidence": 0.96
}
*/
