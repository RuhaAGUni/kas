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
        return build_analysis_response(markers, result)
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


def build_analysis_response(markers: list[dict[str, Any]], result: Any) -> dict[str, Any]:
    lesion_count = len(markers)

    if lesion_count == 0:
        return {
            "source": "real-yolo-model",
            "modelLoaded": True,
            "severityScore": 8,
            "severityLevel": "mild",
            "confidence": 0,
            "lesionCount": 0,
            "predictedLabel": "none",
            "detectedIndicators": [],
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
    detected_indicators = get_detected_indicators(markers, severity_score)

    return {
        "source": "real-yolo-model",
        "modelLoaded": True,
        "severityScore": severity_score,
        "severityLevel": severity_level,
        "confidence": round(average_confidence),
        "lesionCount": lesion_count,
        "predictedLabel": predicted_label,
        "detectedIndicators": detected_indicators,
        "suggestedNextStep": get_suggested_next_step(severity_level),
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


def get_detected_indicators(markers: list[dict[str, Any]], severity_score: int) -> list[str]:
    labels = " ".join(marker["type"].lower() for marker in markers)
    indicators: list[str] = []

    if any(term in labels for term in ["acne", "pimple", "lesion", "spot", "blemish"]):
        indicators.append("model detections")

    if any(marker["confidence"] >= 75 for marker in markers):
        indicators.append("high-confidence detections")

    if severity_score > 70:
        indicators.append("scarring risk")

    return indicators


def get_suggested_next_step(severity_level: str) -> str:
    if severity_level == "severe":
        return (
            "Prioritize dermatologist review of the YOLO detections before any "
            "clinical decision or treatment change."
        )
    if severity_level == "moderate":
        return (
            "Dermatologist should compare detections with prior images and review "
            "adherence, irritation, and symptom changes."
        )
    return (
        "Continue monitoring and route the model output for dermatologist review "
        "as part of the prototype workflow."
    )


def clamp(value: float, minimum: float, maximum: float) -> float:
    return round(min(maximum, max(minimum, value)), 2)
