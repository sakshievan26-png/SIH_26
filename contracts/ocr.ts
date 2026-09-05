// contracts/ocr.ts
// Owner: Member 2 (OCR/Document AI)
// Objective: automatically extract all relevant fields from an identity/travel document.

import type { ImageInput, DocumentType } from "./common";

// INPUT — what the OCR module receives
export interface OcrInput extends ImageInput {}

// OUTPUT — passport-type documents
export interface PassportFields {
  name: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;   // ISO format "YYYY-MM-DD"
  dateOfExpiry: string;  // ISO format "YYYY-MM-DD"
  gender: string;
  mrz?: string;          // Machine-Readable Zone raw string (two lines)
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
  fields: PassportFields | VisaFields;
  confidence: number;   // 0.0 – 1.0
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
    "gender": "M",
    "mrz": "P<INDDOE<<JOHN<<<<<<<<<<<<<<<<<<<<<<<<<<<<\nP1234567IND9803141M3003137<<<<<<<<<<<<<<02"
  }
}
*/
