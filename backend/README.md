# SkinTrack AI Backend

FastAPI service for prototype YOLO image analysis.

## Model path

The backend expects the PyTorch YOLO model at:

```text
../model/extracted/best.pt
```

from the `backend` directory.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The React app calls:

```text
POST http://localhost:8000/analyze-skin-image
```

If the model or `ultralytics` cannot be loaded, the API still starts and returns
`modelLoaded: false` with a clear error message.

All outputs include:

```text
AI model output for prototype support only. Not a medical diagnosis. Dermatologist review required.
```
