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
  matchScore: number;    // 0-1, similarity score
  isMatch: boolean;       // matchScore above the module's own threshold
  model: string;          // e.g. "arcface", "facenet"
}

/*
Example:
{
  "matchScore": 0.91,
  "isMatch": true,
  "model": "arcface"
}
*/
