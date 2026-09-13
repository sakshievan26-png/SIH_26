# Tampering Detection Module (Member 1)
## 📌 Description
This module detects whether a document image is tampered or not using a CNN model trained on ELA (Error Level Analysis) images.

---

## Input
- Base64 Image
- Document Type

## Output
- tamperingScore
- isTampered
- flaggedRegions

## How to Run
1. Load model
2. Call predict_from_base64()

## Dependencies
- torch
- numpy
- pillow




**Input**
```json
{
  "imageBase64": "string",
  "documentType": "passport | aadhaar | pan | other"
}
```
**Output**
```json
{
  "tamperingScore": number,
  "isTampered": boolean,
  "method": "error_level_analysis",
  "flaggedRegions": [
    {
      "label": "suspicious_region",
      "boundingBox": { "x": number, "y": number, "w": number, "h": number },
      "confidence": number
    }
  ]
}
```
