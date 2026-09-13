import { MODULE_BASE_URLS } from "./config";
import type { ApiResponse } from "../contracts/common";
import type { DocumentValidationInput, DocumentValidationOutput } from "../contracts/documentValidation";

export async function fetchDocumentValidation(
  input: DocumentValidationInput,
  scenario?: string
): Promise<ApiResponse<DocumentValidationOutput>> {
  const res = await fetch(`${MODULE_BASE_URLS.documentValidation}/validate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(scenario ? { "X-Demo-Scenario": scenario } : {}),
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Document Validation API error: ${res.status}`);
  return res.json();
}
