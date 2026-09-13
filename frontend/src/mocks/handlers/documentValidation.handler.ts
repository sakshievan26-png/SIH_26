// src/mocks/handlers/documentValidation.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const documentValidationHandler = http.post(
  `${MODULE_BASE_URLS.documentValidation}/validate`,
  async ({ request }) => {
    await delay(1200);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-validation-tampered",
        data: {
          documentIdStatus: "TRUSTED",
          documentId: "Z1234567",
          dobStatus: "DOB_MISMATCH",
          documentDob: "1990-05-15",
          referenceDob: "1984-08-22", // Reference record shows true DOB is 1984
          barcodeConsistent: false,
          checks: [
            { rule: "passport_number_format", passed: true, detail: "Passport number format Z1234567 matches standard." },
            { rule: "expiry_date_valid", passed: true, detail: "Document date 2030-05-14 is mathematically unexpired." },
            { rule: "reference_db_lookup", passed: true, detail: "Record found in National Security Document Database." },
            { rule: "dob_cross_verification", passed: false, detail: "CRITICAL: Scanned DOB (1990-05-15) does NOT match reference database record (1984-08-22)!" },
            { rule: "barcode_consistency", passed: false, detail: "Encoded 2D barcode payload does not match altered biographical text." },
            { rule: "blacklist_check", passed: false, detail: "Subject flagged in border cross-reference anomaly register." },
          ],
          overallPassed: false,
        },
      });
    }

    // Genuine & Mismatch (in Mismatch, doc is genuine, but live face fails)
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-validation-001",
      data: {
        documentIdStatus: "TRUSTED",
        documentId: "Z1234567",
        dobStatus: "DOB_MATCH",
        documentDob: "1990-05-15",
        referenceDob: "1990-05-15",
        barcodeConsistent: true,
        checks: [
          { rule: "expiry_date_valid", passed: true, detail: "Document expires 2030-05-14, active and valid." },
          { rule: "passport_number_format", passed: true, detail: "Format Z1234567 matches ICAO standard." },
          { rule: "nationality_code_valid", passed: true, detail: "IND is a recognised ISO 3166-1 alpha-3 code." },
          { rule: "mrz_checksum", passed: true, detail: "All MRZ check digits verified." },
          { rule: "reference_db_lookup", passed: true, detail: "Document ID Z1234567 verified in Trusted Immigration Database." },
          { rule: "dob_cross_verification", passed: true, detail: "Document DOB 1990-05-15 matches trusted database record exactly." },
          { rule: "blacklist_check", passed: true, detail: "Clean security status. Not on INTERPOL or national watchlists." },
          { rule: "barcode_consistency", passed: true, detail: "Encoded PDF417 data matches printed identity fields." },
        ],
        overallPassed: true,
      },
    });
  }
);
