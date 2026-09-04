// contracts/common.ts
// Shared types used across every module's contract.
// Every module's real response and every mock response must conform to these.

export type DocumentType = "passport" | "visa" | "national_id" | "driving_license" | "permit";

export type RiskDecision = "accept" | "flag" | "reject";

// Every API response follows this envelope so the frontend can handle
// success/error uniformly, regardless of which module answered.
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// A generic image input used by OCR, Tampering Detection, and Face Verification.
export interface ImageInput {
  imageBase64: string;   // base64-encoded image, no data-URI prefix
  documentType: DocumentType;
}
