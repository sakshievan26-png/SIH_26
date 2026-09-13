// src/adapters/documentValidation.adapter.ts

import type { DocumentValidationOutput, DocumentIdStatus, DobStatus } from "../contracts/documentValidation";

export interface ValidationViewModel {
  documentIdStatus: DocumentIdStatus;
  documentId: string | null;
  dobStatus: DobStatus;
  dobStatusLabel: string;
  isDobMatch: boolean;
  documentDob: string | null;
  referenceDob: string | null;
  barcodeConsistent: boolean | null;
  checks: { rule: string; label: string; passed: boolean; detail?: string }[];
  overallPassed: boolean;
}

const RULE_LABELS: Record<string, string> = {
  expiry_date_valid:          "Document Not Expired",
  passport_number_format:     "Passport Number Format",
  nationality_code_valid:     "Nationality Code (ISO 3166)",
  mrz_checksum:               "MRZ Checksum",
  dob_format:                 "Date of Birth Format",
  blacklist_check:            "Not on Watchlist",
  issuing_country_recognized: "Issuing Country Recognised",
  reference_db_lookup:        "Trusted Reference DB Record",
  dob_cross_verification:     "DOB Cross-Check Against Record",
  barcode_consistency:        "Barcode vs OCR Consistency",
};

const DOB_STATUS_LABELS: Record<DobStatus, string> = {
  DOB_MATCH: "DOB Match Confirmed",
  DOB_MISMATCH: "DOB Mismatch (Possible Alteration)",
  NO_DOB: "DOB Not Found",
  UNKNOWN_DOCUMENT: "Unknown Document (No Ref Record)",
};

export function mapValidationResponse(raw: DocumentValidationOutput): ValidationViewModel {
  return {
    documentIdStatus: raw.documentIdStatus,
    documentId: raw.documentId,
    dobStatus: raw.dobStatus,
    dobStatusLabel: DOB_STATUS_LABELS[raw.dobStatus] ?? raw.dobStatus.replace(/_/g, " "),
    isDobMatch: raw.dobStatus === "DOB_MATCH",
    documentDob: raw.documentDob,
    referenceDob: raw.referenceDob,
    barcodeConsistent: raw.barcodeConsistent,
    overallPassed: raw.overallPassed,
    checks: (raw.checks || []).map((c) => ({
      rule: c.rule,
      label: RULE_LABELS[c.rule] ?? c.rule.replace(/_/g, " "),
      passed: c.passed,
      detail: c.detail,
    })),
  };
}
