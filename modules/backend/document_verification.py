
import os
import re
import json
import cv2
import numpy as np
import streamlit as st
from rapidocr import RapidOCR
2.REFERENCE_FILE = "/content/document_verification_deployment/reference_database.json"

def load_reference_database():
    try:
        with open(REFERENCE_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}

reference_data = load_reference_database()
3.def get_reference_record(document_id):
    """Return the trusted reference record for a document ID."""

    if not document_id:
        return None

    normalized_id = str(document_id).strip().upper()

    if not normalized_id:
        return None

    if normalized_id in reference_data:
        return reference_data.get(normalized_id)

    for key, record in reference_data.items():
        normalized_key = normalize_document_id(str(key))

        if normalized_key == normalized_id:
            return record

    return None
4.def get_reference_record(document_id):
    """Return the trusted reference record for a document ID."""

    if not document_id:
        return None

    normalized_id = str(document_id).strip().upper()

    if not normalized_id:
        return None

    if normalized_id in reference_data:
        return reference_data.get(normalized_id)

    for key, record in reference_data.items():
        normalized_key = normalize_document_id(str(key))

        if normalized_key == normalized_id:
            return record

    return None
5.ocr_engine = RapidOCR()

def perform_ocr(image):

    try:
        if image is None:
            return {
                "success": False,
                "text": "",
                "confidence": 0.0,
                "elements": 0,
                "message": "No image provided."
            }

        gray = cv2.cvtColor(
            image,
            cv2.COLOR_BGR2GRAY
        )

        gray = cv2.resize(
            gray,
            None,
            fx=2,
            fy=2,
            interpolation=cv2.INTER_CUBIC
        )

        gray = cv2.GaussianBlur(
            gray,
            (3, 3),
            0
        )

        processed = cv2.cvtColor(
            gray,
            cv2.COLOR_GRAY2BGR
        )

        result = ocr_engine(processed)

        if result is None or not hasattr(result, "txts") or not result.txts:
            return {
                "success": True,
                "text": "",
                "confidence": 0.0,
                "elements": 0
            }

        texts = list(result.txts)

        texts = [
            str(t).strip()
            for t in texts
            if t is not None and str(t).strip()
        ]

        text = "\n".join(texts)

        confidence = 0.0

        if hasattr(result, "scores") and result.scores:

            scores = [
                float(s)
                for s in result.scores
                if s is not None
            ]

            if scores:
                confidence = sum(scores) / len(scores)

        return {
            "success": True,
            "text": text,
            "confidence": confidence,
            "elements": len(texts)
        }

    except Exception as e:

        return {
            "success": False,
            "text": "",
            "confidence": 0.0,
            "elements": 0,
            "message": str(e)
        }
6.def extract_dob_from_text(text):

    if not text:
        return None

    text = text.upper()

    patterns = [
        r"\b(?:0?[1-9]|[12][0-9]|3[01])[/\-.](?:0?[1-9]|1[0-2])[/\-.](?:19|20)\d{2}\b",

        r"\b(?:0?[1-9]|[12][0-9]|3[01])\s+(?:0?[1-9]|1[0-2])\s+(?:19|20)\d{2}\b",
    ]

    for pattern in patterns:

        match = re.search(pattern, text)

        if match:
            value = match.group(0)

            value = re.sub(
                r"[\s\-.]+",
                "/",
                value
            )

            parts = value.split("/")

            if len(parts) == 3:
                return (
                    f"{int(parts[0]):02d}/"
                    f"{int(parts[1]):02d}/"
                    f"{parts[2]}"
                )

    return None
7.def normalize_document_id(value):

    if not value:
        return None

    value = value.upper().strip()

    compact = re.sub(
        r"[^A-Z0-9]",
        "",
        value
    )

    match = re.fullmatch(
        r"DL(\d{4,12})",
        compact
    )

    if match:
        return "DL" + match.group(1)

    if re.fullmatch(
        r"[A-Z]{1,4}\d{4,12}",
        compact
    ):
        return compact

    if re.fullmatch(
        r"\d{6,12}",
        compact
    ):
        return compact

    return None
8.def extract_document_id_from_text(text):

    if not text:
        return None

    text = text.upper()

    trusted_ids = {}

    try:
        for key in reference_data.keys():

            normalized_key = normalize_document_id(
                str(key)
            )

            if normalized_key:
                trusted_ids[normalized_key] = str(key)

    except Exception:
        pass

    dl_matches = re.findall(
        r"\bDL[\s\-_]*\d{4,12}\b",
        text
    )

    for match in dl_matches:

        normalized = normalize_document_id(match)

        if normalized:

            if normalized in trusted_ids:
                return normalized

    tokens = re.findall(
        r"[A-Z0-9]+",
        text
    )

    for i in range(len(tokens)):

        combined = ""

        for j in range(
            i,
            min(i + 4, len(tokens))
        ):

            token = tokens[j]

            if not token.isdigit():
                break

            combined += token

            if 6 <= len(combined) <= 12:

                if combined in trusted_ids:
                    return combined

            if len(combined) > 12:
                break

    numeric_matches = re.findall(
        r"\b\d{6,12}\b",
        text
    )

    for candidate in numeric_matches:

        normalized = normalize_document_id(
            candidate
        )

        if normalized and normalized in trusted_ids:
            return normalized

    alpha_numeric_matches = re.findall(
        r"\b[A-Z]\d{6,10}\b",
        text
    )

    for candidate in alpha_numeric_matches:

        normalized = normalize_document_id(
            candidate
        )

        if normalized and normalized in trusted_ids:
            return normalized

    if alpha_numeric_matches:
        return normalize_document_id(
            alpha_numeric_matches[0]
        )

    return None
9.def verify_dob(document_dob, document_id=None):

    if not document_dob:
        return {
            "status": "NO DOB",
            "document_dob": None,
            "reference_dob": None,
            "message": "DOB could not be extracted from the document."
        }

    record = get_reference_record(document_id)

    if record is None:
        return {
            "status": "UNKNOWN DOCUMENT",
            "document_dob": document_dob,
            "reference_dob": None,
            "message": "No trusted reference record was found."
        }

    reference_dob = record.get("dob")

    if document_dob == reference_dob:
        return {
            "status": "DOB MATCH",
            "document_dob": document_dob,
            "reference_dob": reference_dob,
            "message": "DOB matches the trusted reference record."
        }

    return {
        "status": "DOB MISMATCH",
        "document_dob": document_dob,
        "reference_dob": reference_dob,
        "message": "Possible DOB tampering detected."
    }
10.def calculate_ela_score(image):

    try:

        if image is None:
            return 0.0, 0.0

        encode_param = [
            int(cv2.IMWRITE_JPEG_QUALITY),
            90
        ]

        success, encoded = cv2.imencode(
            ".jpg",
            image,
            encode_param
        )

        if not success:
            return 0.0, 0.0

        recompressed = cv2.imdecode(
            encoded,
            cv2.IMREAD_COLOR
        )

        difference = cv2.absdiff(
            image.astype(np.uint8),
            recompressed.astype(np.uint8)
        )

        gray_difference = cv2.cvtColor(
            difference,
            cv2.COLOR_BGR2GRAY
        )

        average_score = float(
            np.mean(gray_difference)
        )

        maximum_difference = float(
            np.max(gray_difference)
        )

        return average_score, maximum_difference

    except Exception:
        return 0.0, 0.0
11.@st.cache_resource
def load_face_model():

    try:

        from insightface.app import FaceAnalysis

        model = FaceAnalysis(
            name="buffalo_l",
            providers=["CPUExecutionProvider"]
        )

        model.prepare(
            ctx_id=0,
            det_size=(640, 640)
        )

        return model

    except Exception as e:
        return None
12.def cosine_similarity(a, b):

    a = np.asarray(
        a,
        dtype=np.float32
    )

    b = np.asarray(
        b,
        dtype=np.float32
    )

    denominator = (
        np.linalg.norm(a) *
        np.linalg.norm(b)
    )

    if denominator == 0:
        return 0.0

    return float(
        np.dot(a, b) / denominator
    )
13.def verify_faces(document_image, person_image):

    try:

        model = load_face_model()

        if model is None:
            return {
                "status": "FACE ERROR",
                "similarity": None,
                "message": "Face model could not be loaded."
            }

        document_faces = model.get(
            document_image
        )

        person_faces = model.get(
            person_image
        )

        if len(document_faces) == 0:
            return {
                "status": "NO DOCUMENT FACE",
                "similarity": None,
                "message": "No face detected in the document."
            }

        if len(person_faces) == 0:
            return {
                "status": "NO PERSON FACE",
                "similarity": None,
                "message": "No face detected in the supplied photograph."
            }

        document_face = max(
            document_faces,
            key=lambda f:
                (f.bbox[2] - f.bbox[0]) *
                (f.bbox[3] - f.bbox[1])
        )

        person_face = max(
            person_faces,
            key=lambda f:
                (f.bbox[2] - f.bbox[0]) *
                (f.bbox[3] - f.bbox[1])
        )

        similarity = cosine_similarity(
            document_face.embedding,
            person_face.embedding
        )

        threshold = 0.40

        if similarity >= threshold:
            status = "FACE MATCH"
        else:
            status = "FACE MISMATCH"

        return {
            "status": status,
            "similarity": similarity,
            "message": "Face comparison completed."
        }

    except Exception as e:

        return {
            "status": "FACE ERROR",
            "similarity": None,
            "message": str(e)
        }
14.document_bytes = np.asarray(
    bytearray(document_file.read()),
    dtype=np.uint8
)

document_image = cv2.imdecode(
    document_bytes,
    cv2.IMREAD_COLOR
)
15.if (
    dob_result["status"] == "DOB MISMATCH"
    or face_result["status"] == "FACE MISMATCH"
):

    st.error(
        "🔴 POSSIBLE DOCUMENT TAMPERING DETECTED"
    )

elif (
    dob_result["status"] == "DOB MATCH"
    and face_result["status"] == "FACE MATCH"
):

    st.success(
        "🟢 DOCUMENT VERIFICATION PASSED"
    )

else:

    st.warning(
        "🟡 VERIFICATION INCONCLUSIVE"
    )
