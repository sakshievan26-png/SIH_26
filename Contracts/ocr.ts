// contracts/ocr.ts
// Owner: Member 2 (OCR/Document AI)
// Objective: automatically extract all relevant fields from an identity/travel document.

import { ImageInput, DocumentType } from "./common";

// INPUT — what the OCR module receives
export interface OcrInput extends ImageInput {}
// (documentType tells the module which field set to expect/extract)

// OUTPUT — passport-type documents
export interface PassportFields {
  name: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;   // ISO format "YYYY-MM-DD"
  dateOfExpiry: string;  // ISO format "YYYY-MM-DD"
  gender: string;
}

// OUTPUT — visa-type documents
export interface VisaFields {
  visaNumber: string;
  visaType: string;
  entryValidation: string;
  stayDuration: string;
}

export interface OcrOutput {
  documentType: DocumentType;
  confidence: number;        // 0-1, overall OCR confidence
  fields: PassportFields | VisaFields;
  rawText?: string;          // optional: full raw OCR text dump, useful for debugging
}

/*
Example (passport):
{
  "documentType": "passport",
  "confidence": 0.94,
  "fields": {
    "name": "JOHN DOE",
    "passportNumber": "P1234567",
    "nationality": "INDIAN",
    "dateOfBirth": "1998-03-14",
    "dateOfExpiry": "2030-03-13",
    "gender": "M"
  }
}
*/
