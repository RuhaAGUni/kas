from io import BytesIO
from pathlib import Path
from typing import Any

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

SAFETY_DISCLAIMER = (
    "AI model output for prototype support only. Not a medical diagnosis. "
    "Dermatologist review required."
)
MODEL_PATH = Path(__file__).resolve().parent.parent / "model" / "extracted" / "best.pt"
INDICATOR_CONFIDENCE_THRESHOLD = 25

app = FastAPI(title="SkinTrack AI Backend", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_model: Any | None = None
_model_error: str | None = None
_model_load_attempted = False


def get_model() -> tuple[Any | None, str | None]:
    global _model, _model_error, _model_load_attempted

    if _model_load_attempted:
        return _model, _model_error

    _model_load_attempted = True

    if not MODEL_PATH.exists():
        _model_error = f"Model file not found at {MODEL_PATH}"
        return None, _model_error

    try:
        from ultralytics import YOLO

        _model = YOLO(str(MODEL_PATH))
        return _model, None
    except Exception as exc:  # pragma: no cover - depends on local ML runtime.
        _model_error = f"Failed to load YOLO model: {exc}"
        return None, _model_error


@app.post("/analyze-skin-image")
async def analyze_skin_image(file: UploadFile = File(...)) -> dict[str, Any]:
    model, model_error = get_model()

    if model is None:
        return unavailable_response(model_error or "YOLO model is unavailable")

    try:
        image_bytes = await file.read()
        image = Image.open(BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        return unavailable_response(f"Uploaded image could not be read: {exc}")

    try:
        results = model.predict(source=image, verbose=False)
        result = results[0] if results else None
        markers = extract_markers(result, image.width, image.height)
        return build_analysis_response(markers, result, image)
    except Exception as exc:  # pragma: no cover - depends on local ML runtime.
        return unavailable_response(f"YOLO prediction failed: {exc}")


def extract_markers(result: Any, image_width: int, image_height: int) -> list[dict[str, Any]]:
    if result is None or getattr(result, "boxes", None) is None:
        return []

    names = getattr(result, "names", {}) or {}
    markers: list[dict[str, Any]] = []

    for box in result.boxes:
        xyxy = box.xyxy[0].detach().cpu().tolist()
        confidence = float(box.conf[0].detach().cpu().item()) if box.conf is not None else 0.0
        class_id = int(box.cls[0].detach().cpu().item()) if box.cls is not None else -1
        class_name = names.get(class_id, f"class-{class_id}")
        x1, y1, x2, y2 = xyxy
        width = max(0.0, x2 - x1)
        height = max(0.0, y2 - y1)

        markers.append(
            {
                "x": clamp((x1 / image_width) * 100, 0, 100),
                "y": clamp((y1 / image_height) * 100, 0, 100),
                "width": clamp((width / image_width) * 100, 0, 100),
                "height": clamp((height / image_height) * 100, 0, 100),
                "type": str(class_name),
                "confidence": round(confidence * 100),
                "classId": class_id,
                "className": str(class_name),
            }
        )

    return markers


def build_analysis_response(
    markers: list[dict[str, Any]], result: Any, image: Image.Image
) -> dict[str, Any]:
    lesion_count = len(markers)

    if lesion_count == 0:
        indicator_status = empty_indicator_status("No YOLO detections returned.")

        return {
            "source": "real-yolo-model",
            "modelLoaded": True,
            "severityScore": 8,
            "severityLevel": "mild",
            "confidence": 0,
            "lesionCount": 0,
            "predictedLabel": "none",
            "detectedIndicators": [],
            "indicatorStatus": indicator_status,
            "suggestedNextStep": (
                "No model detections were returned. Continue routine tracking and "
                "route the image for dermatologist review if symptoms are changing."
            ),
            "markers": [],
            "safetyDisclaimer": SAFETY_DISCLAIMER,
        }

    average_confidence = sum(marker["confidence"] for marker in markers) / lesion_count
    total_area_percentage = sum(marker["width"] * marker["height"] for marker in markers)
    severity_score = round(
        min(
            100,
            lesion_count * 12
            + average_confidence * 0.25
            + min(30, total_area_percentage * 1.8),
        )
    )
    severity_level = get_severity_level(severity_score)
    predicted_label = get_predicted_label(markers)
    indicator_status = derive_indicator_status(markers, image)
    detected_indicators = get_detected_indicators(markers, indicator_status)

    return {
        "source": "real-yolo-model",
        "modelLoaded": True,
        "severityScore": severity_score,
        "severityLevel": severity_level,
        "confidence": round(average_confidence),
        "lesionCount": lesion_count,
        "predictedLabel": predicted_label,
        "detectedIndicators": detected_indicators,
        "indicatorStatus": indicator_status,
        "suggestedNextStep": get_suggested_next_step(indicator_status),
        "markers": markers,
        "safetyDisclaimer": SAFETY_DISCLAIMER,
        "modelNames": getattr(result, "names", {}) if result is not None else {},
    }


def unavailable_response(message: str) -> dict[str, Any]:
    return {
        "source": "real-yolo-model",
        "modelLoaded": False,
        "error": message,
        "severityScore": 0,
        "severityLevel": "mild",
        "confidence": 0,
        "lesionCount": 0,
        "predictedLabel": "model unavailable",
        "detectedIndicators": [],
        "indicatorStatus": empty_indicator_status("Model unavailable."),
        "suggestedNextStep": (
            "The YOLO model is unavailable. Use prototype fallback analysis and "
            "require dermatologist review."
        ),
        "markers": [],
        "safetyDisclaimer": SAFETY_DISCLAIMER,
    }


def get_severity_level(severity_score: int) -> str:
    if severity_score > 70:
        return "severe"
    if severity_score > 35:
        return "moderate"
    return "mild"


def get_predicted_label(markers: list[dict[str, Any]]) -> str:
    label_counts: dict[str, int] = {}

    for marker in markers:
        label = marker["type"]
        label_counts[label] = label_counts.get(label, 0) + 1

    return max(label_counts, key=label_counts.get)


def derive_indicator_status(
    markers: list[dict[str, Any]], image: Image.Image
) -> dict[str, dict[str, Any]]:
    status = empty_indicator_status("No supporting YOLO evidence.")

    indicator_rules = {
        "scarringRisk": {
            "keywords": [
                "post",
                "scar",
                "scarred",
                "pigmentation",
                "hyperpigmentation",
                "mark",
            ],
            "label": "post-acne marks",
        },
        "redness": {
            "keywords": ["red", "redness", "erythema"],
            "label": "redness",
        },
        "inflamedLesions": {
            "keywords": [
                "inflamed",
                "inflammatory",
                "papule",
                "pustule",
            ],
            "label": "inflamed lesions",
        },
        "comedones": {
            "keywords": [
                "comedone",
                "blackhead",
                "whitehead",
                "open comedo",
                "closed comedo",
            ],
            "label": "comedones",
        },
    }

    for marker in markers:
        confidence = marker["confidence"]

        if confidence < INDICATOR_CONFIDENCE_THRESHOLD:
            continue

        label = str(marker.get("className") or marker.get("type") or "").lower()

        for indicator_key, rule in indicator_rules.items():
            if any(keyword in label for keyword in rule["keywords"]):
                promote_indicator(
                    status,
                    indicator_key,
                    confidence,
                    f"Model detected: {marker.get('className') or marker.get('type')}",
                )

        if any(keyword in label for keyword in ["acne", "pimple", "lesion"]):
            marker["indicatorHint"] = "acne lesions"

    if status["redness"]["status"] == "not prominent":
        redness_score = calculate_redness_score(image, markers)
        evidence = f"Redness score inside detections: {redness_score['label']}"

        if redness_score["score"] >= 22:
            promote_indicator(
                status,
                "redness",
                redness_score["confidence"],
                evidence,
            )
        else:
            status["redness"]["confidence"] = redness_score["confidence"]
            status["redness"]["evidence"] = evidence

    return status


def empty_indicator_status(evidence: str) -> dict[str, dict[str, Any]]:
    return {
        "redness": {
            "status": "not prominent",
            "confidence": 0,
            "evidence": evidence,
        },
        "inflamedLesions": {
            "status": "not prominent",
            "confidence": 0,
            "evidence": evidence,
        },
        "comedones": {
            "status": "not prominent",
            "confidence": 0,
            "evidence": evidence,
        },
        "scarringRisk": {
            "status": "not prominent",
            "confidence": 0,
            "evidence": evidence,
        },
    }


def promote_indicator(
    status: dict[str, dict[str, Any]],
    indicator_key: str,
    confidence: int,
    evidence: str,
) -> None:
    if confidence <= status[indicator_key]["confidence"]:
        return

    status[indicator_key] = {
        "status": "prominent",
        "confidence": confidence,
        "evidence": evidence,
    }


def calculate_redness_score(image: Image.Image, markers: list[dict[str, Any]]) -> dict[str, Any]:
    if not markers:
        return {"confidence": 0, "label": "not assessed", "score": 0}

    width, height = image.size
    pixels = image.load()
    candidate_pixels = 0
    sampled_pixels = 0
    red_score_total = 0.0

    for marker in markers:
        x1 = int((marker["x"] / 100) * width)
        y1 = int((marker["y"] / 100) * height)
        x2 = int(((marker["x"] + marker["width"]) / 100) * width)
        y2 = int(((marker["y"] + marker["height"]) / 100) * height)
        x1 = max(0, min(width - 1, x1))
        y1 = max(0, min(height - 1, y1))
        x2 = max(x1 + 1, min(width, x2))
        y2 = max(y1 + 1, min(height, y2))
        step = max(1, int(max(x2 - x1, y2 - y1) / 28))

        for y in range(y1, y2, step):
            for x in range(x1, x2, step):
                r, g, b = pixels[x, y]
                brightness = (r + g + b) / 3
                red_score = r - max(g, b)
                saturation = max(r, g, b) - min(r, g, b)
                sampled_pixels += 1

                if (
                    red_score > 35
                    and saturation > 30
                    and r > 90
                    and 50 < brightness < 230
                ):
                    candidate_pixels += 1
                    red_score_total += red_score + saturation * 0.25

    if sampled_pixels == 0:
        return {"confidence": 0, "label": "not assessed", "score": 0}

    candidate_ratio = candidate_pixels / sampled_pixels
    average_red_score = red_score_total / candidate_pixels if candidate_pixels else 0
    score = candidate_ratio * 100 + average_red_score * 0.28
    confidence = round(min(100, max(0, score * 2.2)))
    label = "high" if score >= 22 else "low"

    return {"confidence": confidence, "label": label, "score": score}


def get_detected_indicators(
    markers: list[dict[str, Any]], indicator_status: dict[str, dict[str, Any]]
) -> list[str]:
    indicators: list[str] = []

    if any(marker.get("indicatorHint") == "acne lesions" for marker in markers):
        indicators.append("acne lesions")

    indicator_labels = {
        "redness": "redness",
        "inflamedLesions": "inflamed lesions",
        "comedones": "comedones",
        "scarringRisk": "post-acne marks",
    }

    for indicator_key, label in indicator_labels.items():
        if indicator_status[indicator_key]["status"] == "prominent":
            indicators.append(label)

    return indicators


def get_suggested_next_step(indicator_status: dict[str, dict[str, Any]]) -> str:
    if indicator_status["scarringRisk"]["status"] == "prominent":
        return (
            "Dermatologist review recommended to assess post-acne marks and "
            "treatment response."
        )
    if indicator_status["inflamedLesions"]["status"] == "prominent":
        return (
            "Dermatologist review recommended because inflamed lesions were "
            "detected."
        )
    return (
        "Continue weekly monitoring and request dermatologist review if symptoms "
        "worsen."
    )


def clamp(value: float, minimum: float, maximum: float) -> float:
    return round(min(maximum, max(minimum, value)), 2)
