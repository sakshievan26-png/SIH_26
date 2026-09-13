// src/mocks/handlers/faceVerification.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const faceVerificationHandler = http.post(
  `${MODULE_BASE_URLS.faceVerification}/verify`,
  async ({ request }) => {
    await delay(1300);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "mismatch") {
      // Demo 2 requirement: similarityScore 0.028 specifically, matched: false
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-face-mismatch",
        data: {
          matched: false,
          similarityScore: 0.028,
          liveness: true,
          detail:
            "CRITICAL FACE MISMATCH: 1:1 facial biometric cosine similarity is 0.028 (threshold 0.400). Traveler does not match the document photograph.",
        },
      });
    }

    if (scenario === "tampered") {
      // Demo 3 requirement: compounding issue, mismatched face + altered photo
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-face-tampered",
        data: {
          matched: false,
          similarityScore: 0.019,
          liveness: false,
          detail:
            "Biometric failure: Similarity is 0.019. Liveness anti-spoofing algorithm flagged suspicious print / screen reflection artifacts.",
        },
      });
    }

    // Demo 1: Genuine
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-face-001",
      data: {
        matched: true,
        similarityScore: 0.93,
        liveness: true,
        detail:
          "Biometric confirmation: Face matched with 93.0% similarity (threshold 0.400). Anti-spoofing liveness check passed.",
      },
    });
  }
);
