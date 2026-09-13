// Additive Member 5 response types. Root contracts remain authoritative.
import type { ApiResponse } from "../../contracts/common";
import type { AuditLogInput, AuditLogOutput } from "../../contracts/blockchainAudit";
export type { AuditLogInput, AuditLogOutput };

// Proposed async storage acknowledgement, separate from confirmed AuditLogOutput.
export interface AuditPendingAck {
  eventId: string;
  sequence: number;
  eventHash: string;
  auditStored: true;
  status: "pending";
  logged: false;
  warnings: string[];
}
export type AuditResponse = ApiResponse<AuditLogOutput | AuditPendingAck>;
