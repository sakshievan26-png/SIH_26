// src/mocks/handlers/blockchainAudit.handler.ts

import { http, HttpResponse, delay } from "msw";
import { MODULE_BASE_URLS } from "../../api/config";

export const blockchainAuditHandler = http.post(
  `${MODULE_BASE_URLS.blockchainAudit}/log`,
  async ({ request }) => {
    await delay(800);
    const scenario = request.headers.get("X-Demo-Scenario") || "genuine";

    const hashSuffix =
      scenario === "tampered" ? "9c4d2e0f" : scenario === "mismatch" ? "7b1c4e2f" : "3a9f2b1c";

    return HttpResponse.json({
      success: true,
      requestId: `mock-req-audit-${scenario}`,
      data: {
        txHash: `0x${hashSuffix}8d4e5f6a7b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a`,
        blockNumber: 4827163 + (scenario === "tampered" ? 2 : scenario === "mismatch" ? 1 : 0),
        timestamp: new Date().toISOString(),
        logged: true,
        ledger: "Hyperledger Fabric - ChannelSIH26",
      },
    });
  }
);
