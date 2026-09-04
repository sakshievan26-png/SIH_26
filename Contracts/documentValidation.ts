// contracts/documentValidation.ts
// Owner: Member 4 (Backend & AI Logic)
// Objective: verify whether extracted OCR information follows official document
// standards / passes rule and database checks (format, expiry, blacklist, etc.)

import { OcrOutput } from "./ocr";

// INPUT — takes the OCR module's output directly
export interface DocumentValidationInput {
  ocrResult: OcrOutput;
}

export interface ValidationCheck {
  rule: string;        // e.g. "expiry_date_valid", "passport_number_format", "blacklist_check"
  passed: boolean;
  detail?: string;      // short explanation if failed
}

export interface DocumentValidationOutput {
  isValid: boolean;
  checks: ValidationCheck[];
}

/*
Example:
{
  "isValid": false,
  "checks": [
    { "rule": "passport_number_format", "passed": true },
    { "rule": "expiry_date_valid", "passed": true },
    { "rule": "blacklist_check", "passed": false, "detail": "Passport number found on blacklist registry" }
  ]
}
*/
