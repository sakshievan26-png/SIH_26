// contracts/blockchainAudit.ts
// Owner: Member 5 (Blockchain & Cybersecurity)
// Objective: create an immutable digital trail of each screening decision
// for investigation/intelligence analysis.

import type { RiskScoreOutput } from "./riskScore";

// INPUT — the final decision record gets logged
export interface AuditLogInput {
  documentId: string;       // internal reference, e.g. hash of the document image
  checkpointId: string;
  timestamp: string;        // ISO 8601
  riskResult: RiskScoreOutput;
}

// OUTPUT — confirmation that the entry was committed on-chain
export interface AuditLogOutput {
  txHash: string;           // blockchain transaction hash
  blockNumber: number;
  timestamp: string;        // ISO 8601 — when it was mined
  logged: boolean;
  ledger: string;           // e.g. "Hyperledger Fabric — ChannelSIH26"
}

/*
Example:
{
  "txHash": "0x8f3a1c9e...b21c",
  "blockNumber": 104822,
  "timestamp": "2026-09-03T10:15:00Z",
  "logged": true,
  "ledger": "Hyperledger Fabric — ChannelSIH26"
}
*/
