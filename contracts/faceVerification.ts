// contracts/faceVerification.ts
// Owner: Member 3 (Computer Vision)
// Objective: ensure the document owner matches the presented individual.

// INPUT — two images: the photo on the document, and a live/captured photo
export interface FaceVerificationInput {
  documentPhotoBase64: string;
  livePhotoBase64: string;
}

// OUTPUT
export interface FaceVerificationOutput {
  matched: boolean;
  similarityScore: number;   // 0.0 – 1.0
  liveness: boolean;         // true if live photo passed liveness check
  detail: string;            // human-readable summary
}

/*
Example:
{
  "matched": true,
  "similarityScore": 0.91,
  "liveness": true,
  "detail": "Face match confirmed with high confidence; liveness check passed."
}
*/
