// src/mocks/handlers/watermarkVerification.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const watermarkVerificationHandler = http.post(
  `${MODULE_BASE_URLS.watermarkVerification}/verify`,
  async ({ request }) => {
    await delay(1200);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-watermark-tampered",
        data: {
          status: "suspicious",
          watermarkDetected: false,
          watermarkType: null,
          confidence: 0.89,
          detail:
            "CRITICAL: Security watermark pattern interrupted along photo replacement boundary. Hologram diffraction pattern missing in portrait quadrant.",
        },
      });
    }

    // Genuine & Mismatch
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-watermark-001",
      data: {
        status: "authentic",
        watermarkDetected: true,
        watermarkType: "uv_reactive_pattern",
        confidence: 0.94,
        detail:
          "Official passport authority UV watermark pattern detected and verified against national template specifications.",
      },
    });
  }
);
