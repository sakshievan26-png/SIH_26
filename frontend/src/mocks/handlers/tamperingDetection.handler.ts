// src/mocks/handlers/tamperingDetection.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const tamperingDetectionHandler = http.post(
  `${MODULE_BASE_URLS.tamperingDetection}/analyse`,
  async ({ request }) => {
    await delay(1400);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    if (scenario === "tampered") {
      return HttpResponse.json({
        success: true,
        requestId: "mock-req-tamper-tampered",
        data: {
          tampered: true,
          confidence: 0.94,
          methods: ["error_level_analysis", "cnn_classifier", "stamp_pattern_match"],
          ela: {
            averageScore: 12.85,  // Anomaly (> 5.0 indicates heavy compression disparity)
            maxDifference: 89.0,  // Max peak indicates pasted boundary
          },
          flaggedRegions: [
            {
              label: "photo_replacement_boundary",
              boundingBox: { x: 0.06, y: 0.12, w: 0.32, h: 0.44 },
              confidence: 0.94,
            },
            {
              label: "dob_field_alteration",
              boundingBox: { x: 0.38, y: 0.46, w: 0.28, h: 0.08 },
              confidence: 0.91,
            },
            {
              label: "stamp_perimeter_break",
              boundingBox: { x: 0.65, y: 0.58, w: 0.22, h: 0.24 },
              confidence: 0.88,
            },
          ],
        },
      });
    }

    // Default / genuine / mismatch
    return HttpResponse.json({
      success: true,
      requestId: "mock-req-tamper-001",
      data: {
        tampered: false,
        confidence: 0.96,
        methods: ["error_level_analysis", "metadata_analysis", "cnn_classifier", "stamp_pattern_match"],
        ela: {
          averageScore: 1.42,  // Clean ELA score (< 2.0 is clean)
          maxDifference: 14.0, // Normal JPEG compression artifacts
        },
        flaggedRegions: [],
      },
    });
  }
);
