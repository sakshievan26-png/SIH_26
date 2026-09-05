// contracts/common.ts
// Shared types used across every module's contract.
// Every module's real response and every mock response must conform to these.

export type DocumentType =
  | "passport"
  | "visa"
  | "national_id"
  | "driving_license"
  | "permit";

export type RiskDecision = "accept" | "flag" | "reject";

// Every image-based input carries the raw base64 image plus document type hint.
export interface ImageInput {
  imageBase64: string;
  documentType: DocumentType;
}

// Every API response follows this envelope so the frontend can handle
// success/error uniformly, regardless of which module answered.
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  requestId: string;
}
