import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { AuditLogInput, AuditLogOutput } from "../contracts/blockchainAudit";

export async function fetchBlockchainAudit(
  input: AuditLogInput,
  scenario?: string
): Promise<ApiResponse<AuditLogOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.blockchainAudit}/log`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Blockchain Audit API error: ${res.status}`);
  return res.json();
}
