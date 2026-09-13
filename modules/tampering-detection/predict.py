import torch
import numpy as np
import base64
import io
from PIL import Image, ImageChops, ImageEnhance

device = torch.device("cpu")  # safer for integration

def convert_to_ela_image_from_pil(image, quality=90):
    temp = io.BytesIO()
    image.save(temp, 'JPEG', quality=quality)
    temp.seek(0)
    compressed = Image.open(temp)

    ela = ImageChops.difference(image, compressed)
    extrema = ela.getextrema()

    max_diff = max([ex[1] for ex in extrema])
    scale = 255.0 / max_diff if max_diff != 0 else 1

    ela = ImageEnhance.Brightness(ela).enhance(scale)
    return ela


def predict_from_base64(model, image_base64, document_type):
    model.eval()

    image_bytes = base64.b64decode(image_base64)
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    ela_img = convert_to_ela_image_from_pil(image)
    ela_img = ela_img.resize((128, 128))

    img_array = np.array(ela_img) / 255.0
    img_array = np.transpose(img_array, (2, 0, 1))

    img_tensor = torch.tensor(img_array, dtype=torch.float32).unsqueeze(0).to(device)

    with torch.no_grad():
        output = model(img_tensor)
        prob = torch.softmax(output, dim=1)[0][1].item()

    threshold = 0.82
    is_tampered = prob < threshold
    confidence = abs(prob - threshold)

    regions = [{
        "label": "suspicious_region",
        "boundingBox": {"x": 0.3, "y": 0.3, "w": 0.4, "h": 0.4},
        "confidence": float(confidence)
    }] if is_tampered else []

    return {
        "tamperingScore": float(confidence),
        "isTampered": is_tampered,
        "method": "error_level_analysis",
        "flaggedRegions": regions
    }
