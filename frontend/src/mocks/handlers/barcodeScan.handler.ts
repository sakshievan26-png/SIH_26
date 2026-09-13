// src/mocks/handlers/barcodeScan.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const barcodeScanHandler = http.post(
  `${MODULE_BASE_URLS.barcodeScan}/scan`,
  async ({ request }) => {
    await delay(1100);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-barcode-tampered",
        data: {
          barcodeDetected: true,
          barcodeType: "pdf417",
          decodedData: "ANSI 636014090002DLZ1234567IND19840822VIKRAM<SINGH<<<<<<<<",
          parsedFields: {
            documentId: "Z1234567",
            dateOfBirth: "1984-08-22", // Different from printed 1990-05-15
            holderName: "VIKRAM SINGH",
          },
          matchesOcrData: false,
          confidence: 0.92,
        },
      });
    }

    // Genuine & Mismatch
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-barcode-001",
      data: {
        barcodeDetected: true,
        barcodeType: "pdf417",
        decodedData: "ANSI 636014090002DLZ1234567IND19900515AMIT<KUMAR<SHARMA<<<<<",
        parsedFields: {
          documentId: "Z1234567",
          dateOfBirth: "1990-05-15",
          holderName: "AMIT KUMAR SHARMA",
          issuingAuthority: "MEA-IND",
        },
        matchesOcrData: true,
        confidence: 0.98,
      },
    });
  }
);
