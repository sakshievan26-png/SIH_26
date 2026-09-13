// src/mocks/handlers/ocr.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const ocrHandler = http.post(
  `${MODULE_BASE_URLS.ocr}/extract`,
  async ({ request }) => {
    await delay(1000);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-ocr-tampered",
        data: {
          documentType: "passport",
          fields: {
            name: "AMIT KUMAR SHARMA",
            passportNumber: "Z1234567",
            nationality: "INDIAN",
            dateOfBirth: "1990-05-15", // Altered on face of document
            dateOfExpiry: "2030-05-14",
            gender: "M",
            mrz: "P<INDSHARM<<AMIT<KUMAR<<<<<<<<<<<<<<<<<<<<\nZ1234567<6IND9005153M3005144<<<<<<<<<<<<<<<4",
          },
          confidence: 0.78, // Noticeably lower due to patch artifacts
        },
      });
    }

    // Default / genuine / mismatch
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-ocr-001",
      data: {
        documentType: "passport",
        fields: {
          name: "AMIT KUMAR SHARMA",
          passportNumber: "Z1234567",
          nationality: "INDIAN",
          dateOfBirth: "1990-05-15",
          dateOfExpiry: "2030-05-14",
          gender: "M",
          mrz: "P<INDSHARM<<AMIT<KUMAR<<<<<<<<<<<<<<<<<<<<\nZ1234567<6IND9005153M3005144<<<<<<<<<<<<<<<4",
        },
        confidence: 0.97,
      },
    });
  }
);
