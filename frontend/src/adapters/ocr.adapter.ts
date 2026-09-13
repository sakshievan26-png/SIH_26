// src/adapters/ocr.adapter.ts
// If Member 2's real response shape differs from the contract (e.g. "dob" vs "dateOfBirth"),
// ONLY edit this file - no component changes needed.

import type { OcrOutput } from "../contracts/ocr";

export interface OcrViewModel {
  documentType: string;
  fields: { label: string; value: string }[];
  confidence: number;
  mrz?: string;
}

export function mapOcrResponse(raw: OcrOutput): OcrViewModel {
  const f = raw.fields;

  if ("passportNumber" in f) {
    return {
      documentType: raw.documentType,
      confidence: raw.confidence,
      mrz: f.mrz,
      fields: [
        { label: "Full Name",      value: f.name },
        { label: "Passport No.",   value: f.passportNumber },
        { label: "Nationality",    value: f.nationality },
        { label: "Date of Birth",  value: f.dateOfBirth },
        { label: "Date of Expiry", value: f.dateOfExpiry },
        { label: "Gender",         value: f.gender },
      ],
    };
  }

  // Visa format fields
  return {
    documentType: raw.documentType,
    confidence: raw.confidence,
    fields: [
      { label: "Visa Number",      value: f.visaNumber },
      { label: "Visa Type",        value: f.visaType },
      { label: "Entry Validation", value: f.entryValidation },
      { label: "Stay Duration",    value: f.stayDuration },
    ],
  };
}
