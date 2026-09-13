// src/adapters/barcodeScan.adapter.ts

import type { BarcodeScanOutput, BarcodeType } from "../contracts/barcodeScan";

export interface BarcodeViewModel {
  barcodeDetected: boolean;
  barcodeType: BarcodeType | null;
  barcodeTypeLabel: string;
  decodedData: string | null;
  parsedFields: { key: string; label: string; value: string }[];
  matchesOcrData: boolean | null;
  confidencePct: number;
}

const BARCODE_LABELS: Record<BarcodeType, string> = {
  qr_code: "QR Code (2D)",
  pdf417: "PDF417 2D Barcode (ICAO / AAMVA)",
  code128: "Code 128 (1D Linear)",
  aztec: "Aztec Code",
  data_matrix: "Data Matrix",
  unknown: "Unknown Format",
};

export function mapBarcodeResponse(raw: BarcodeScanOutput): BarcodeViewModel {
  const parsedFieldsList: { key: string; label: string; value: string }[] = [];
  if (raw.parsedFields) {
    for (const [key, value] of Object.entries(raw.parsedFields)) {
      parsedFieldsList.push({
        key,
        label: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
        value,
      });
    }
  }

  return {
    barcodeDetected: raw.barcodeDetected,
    barcodeType: raw.barcodeType,
    barcodeTypeLabel: raw.barcodeType ? (BARCODE_LABELS[raw.barcodeType] ?? raw.barcodeType) : "None",
    decodedData: raw.decodedData,
    parsedFields: parsedFieldsList,
    matchesOcrData: raw.matchesOcrData,
    confidencePct: Math.round(raw.confidence * 100),
  };
}
