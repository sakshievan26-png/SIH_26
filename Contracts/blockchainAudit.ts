// contracts/blockchainAudit.ts
// Owner: Member 5 (Blockchain & Cybersecurity)
// Objective: create an immutable digital trail of each screening decision
// for investigation/intelligence analysis.

import { RiskScoreOutput } from "./riskScore";

// INPUT — the final decision record gets logged
export interface AuditLogInput {
  documentId: string;         // internal reference, e.g. hash of the document image
  checkpointId: string;
  timestamp: string;          // ISO 8601
  riskResult: RiskScoreOutput;
}

// OUTPUT
export interface AuditLogOutput {
  entryHash: string;          // hash/tx id representing this immutable log entry
  ledgerReference?: string;    // e.g. block number or chain tx id, if applicable
  loggedAt: string;            // ISO 8601, when the entry was committed
}

/*
Example:
{
  "entryHash": "0x8f3a...c21",
  "ledgerReference": "block-104822",
  "loggedAt": "2026-09-03T10:15:00Z"
}
*/
