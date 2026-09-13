// src/adapters/blockchainAudit.adapter.ts

import type { AuditLogOutput } from "../contracts/blockchainAudit";

export interface AuditViewModel {
  txHash: string;
  blockNumber: number;
  timestamp: string;
  logged: boolean;
  ledger: string;
}

export function mapAuditResponse(raw: AuditLogOutput): AuditViewModel {
  return {
    txHash: raw.txHash,
    blockNumber: raw.blockNumber,
    timestamp: new Date(raw.timestamp).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "long",
    }),
    logged: raw.logged,
    ledger: raw.ledger,
  };
}
