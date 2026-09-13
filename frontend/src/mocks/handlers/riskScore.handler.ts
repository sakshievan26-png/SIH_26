// src/mocks/handlers/riskScore.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const riskScoreHandler = http.post(
  `${MODULE_BASE_URLS.riskScore}/compute`,
  async ({ request }) => {
    await delay(900);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "mismatch") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-risk-mismatch",
        data: {
          score: 74,
          decision: "reject",
          summary:
            "BIOMETRIC IDENTITY MISMATCH: While printed document credentials and reference database checks pass, the presenter facial biometrics produced a similarity score of 0.028 against the passport photo (threshold 0.400). Detain traveler for impersonation investigation.",
          breakdown: {
            ocr: 2,
            validation: 1,
            tampering: 1,
            face: 19,
            barcode: 1,
            watermark: 1,
          },
        },
      });
    }

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-risk-tampered",
        data: {
          score: 96,
          decision: "reject",
          summary:
            "CRITICAL SECURITY ALERT: High-confidence multi-vector document forgery. ELA noise anomaly 12.85, altered photo boundary, DOB mismatch against national reference database, and facial mismatch. Document seized and entry denied.",
          breakdown: {
            ocr: 16,
            validation: 18,
            tampering: 20,
            face: 20,
            barcode: 9,
            watermark: 9,
          },
        },
      });
    }

    // Demo 1: Genuine
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-risk-001",
      data: {
        score: 8,
        decision: "accept",
        summary:
          "DOCUMENT VERIFICATION PASSED: All screening modules verified authentic. OCR parsed cleanly, reference DB confirmed trusted identity with exact DOB match, ELA analysis clean, security watermark verified, and face matched at 93.0% similarity.",
        breakdown: {
          ocr: 2,
          validation: 1,
          tampering: 1,
          face: 2,
          barcode: 1,
          watermark: 1,
        },
      },
    });
  }
);
